/*

Reading Status System - Server-side Handler
Marks a file (book) with a reading status: 'reading', 'finished', or 'to-read'.
Storage is a flat map: filePath -> { status, updated }.

*/

const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

const STATUS_FILE = path.join(__dirname, '../static/reading_status.yaml');
const VALID_STATUSES = ['reading', 'finished', 'to-read'];

function loadAll() {
    try {
        if (fs.existsSync(STATUS_FILE)) {
            const data = yaml.load(fs.readFileSync(STATUS_FILE, 'utf8'));
            return (data && data.statuses) || {};
        }
    } catch (err) {
        console.error('Error loading reading statuses:', err);
    }
    return {};
}

function saveAll(all) {
    try {
        const yamlStr = yaml.dump({ statuses: all }, { indent: 2, lineWidth: -1, noRefs: true });
        fs.writeFileSync(STATUS_FILE, yamlStr, 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving reading statuses:', err);
        return false;
    }
}

function setupReadingStatusHandlers(io) {
    io.on('connection', function(socket) {

        socket.on('get_reading_statuses', function() {
            try {
                const all = loadAll();
                socket.emit('reading_statuses_loaded', JSON.stringify(all));
            } catch (err) {
                console.error('Error sending reading statuses:', err);
                socket.emit('reading_status_error', 'Failed to load statuses');
            }
        });

        socket.on('set_reading_status', function(payload) {
            try {
                const data = JSON.parse(payload);
                const filePath = data.filePath;
                const status = data.status;
                if (!filePath || typeof filePath !== 'string') return;

                const all = loadAll();

                if (status === null || status === '' || status === undefined) {
                    delete all[filePath];
                } else {
                    if (VALID_STATUSES.indexOf(status) === -1) {
                        socket.emit('reading_status_error', 'Invalid status: ' + status);
                        return;
                    }
                    all[filePath] = {
                        status: status,
                        updated: new Date().toISOString()
                    };
                }

                if (saveAll(all)) {
                    io.emit('reading_status_updated', JSON.stringify({
                        filePath: filePath,
                        status: status || null
                    }));
                } else {
                    socket.emit('reading_status_error', 'Failed to save status');
                }
            } catch (err) {
                console.error('Error setting reading status:', err);
                socket.emit('reading_status_error', 'Failed to set status: ' + err.message);
            }
        });
    });
}

module.exports = {
    setupReadingStatusHandlers: setupReadingStatusHandlers
};
