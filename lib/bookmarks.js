/*

Bookmarks System - Server-side Handler
- Auto-resume: remembers the last page viewed for each PDF
- Named bookmarks: user-created named markers with page numbers

*/

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const BOOKMARKS_FILE = path.join(__dirname, '../static/bookmarks.yaml');

function loadAll() {
    try {
        if (fs.existsSync(BOOKMARKS_FILE)) {
            const data = yaml.load(fs.readFileSync(BOOKMARKS_FILE, 'utf8'));
            return (data && data.bookmarks) || {};
        }
    } catch (err) {
        console.error('Error loading bookmarks:', err);
    }
    return {};
}

function saveAll(all) {
    try {
        const yamlStr = yaml.dump({ bookmarks: all }, { indent: 2, lineWidth: -1, noRefs: true });
        fs.writeFileSync(BOOKMARKS_FILE, yamlStr, 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving bookmarks:', err);
        return false;
    }
}

function normalizePath(filePath) {
    if (!filePath || filePath === '/' || filePath === '') return 'page-root';
    return filePath;
}

function genId() {
    return 'bm-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function getEntry(all, filePath) {
    if (!all[filePath]) all[filePath] = { lastPage: 1, named: [] };
    if (typeof all[filePath].lastPage !== 'number') all[filePath].lastPage = 1;
    if (!Array.isArray(all[filePath].named)) all[filePath].named = [];
    return all[filePath];
}

function setupBookmarkHandlers(io) {
    io.on('connection', function(socket) {

        socket.on('get_bookmarks', function(filePath) {
            try {
                const key = normalizePath(filePath);
                const all = loadAll();
                const entry = all[key] || { lastPage: 1, named: [] };
                socket.emit('bookmarks_loaded', JSON.stringify({
                    filePath: key,
                    lastPage: entry.lastPage || 1,
                    named: entry.named || []
                }));
            } catch (err) {
                console.error('Error getting bookmarks:', err);
                socket.emit('bookmark_error', 'Failed to load bookmarks');
            }
        });

        socket.on('save_last_page', function(payload) {
            try {
                const data = JSON.parse(payload);
                const key = normalizePath(data.filePath);
                const page = parseInt(data.page, 10);
                if (!Number.isFinite(page) || page < 1) return;
                const all = loadAll();
                const entry = getEntry(all, key);
                if (entry.lastPage === page) return;  // no-op write avoidance
                entry.lastPage = page;
                saveAll(all);
            } catch (err) {
                console.error('Error saving last page:', err);
            }
        });

        socket.on('save_named_bookmark', function(payload) {
            try {
                const data = JSON.parse(payload);
                const key = normalizePath(data.filePath);
                const bm = data.bookmark || {};
                if (!bm.name || !Number.isFinite(bm.page)) {
                    socket.emit('bookmark_error', 'Bookmark needs a name and a page');
                    return;
                }
                if (!bm.id) bm.id = genId();
                if (!bm.timestamp) bm.timestamp = new Date().toISOString();

                const all = loadAll();
                const entry = getEntry(all, key);
                const idx = entry.named.findIndex(b => b.id === bm.id);
                if (idx >= 0) entry.named[idx] = bm;
                else entry.named.push(bm);

                if (saveAll(all)) {
                    socket.emit('named_bookmark_saved', JSON.stringify({
                        filePath: key,
                        bookmark: bm,
                        named: entry.named
                    }));
                } else {
                    socket.emit('bookmark_error', 'Failed to save bookmark');
                }
            } catch (err) {
                console.error('Error saving bookmark:', err);
                socket.emit('bookmark_error', 'Failed to save bookmark: ' + err.message);
            }
        });

        socket.on('delete_named_bookmark', function(payload) {
            try {
                const data = JSON.parse(payload);
                const key = normalizePath(data.filePath);
                const bookmarkId = data.bookmarkId;

                const all = loadAll();
                const entry = getEntry(all, key);
                entry.named = entry.named.filter(b => b.id !== bookmarkId);

                if (saveAll(all)) {
                    socket.emit('named_bookmark_deleted', JSON.stringify({
                        filePath: key,
                        bookmarkId: bookmarkId,
                        named: entry.named
                    }));
                } else {
                    socket.emit('bookmark_error', 'Failed to delete bookmark');
                }
            } catch (err) {
                console.error('Error deleting bookmark:', err);
                socket.emit('bookmark_error', 'Failed to delete bookmark: ' + err.message);
            }
        });
    });
}

module.exports = {
    setupBookmarkHandlers: setupBookmarkHandlers
};
