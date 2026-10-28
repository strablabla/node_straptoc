/*

Offline copies of documents kept on the NAS.

A laptop that leaves home loses the NAS, and with it every book served from
/mnt/sdata. The reader can mark a book "offline": the server copies it into
OFFLINE_DIR under its own URL path (/Litt/Voyage/x.epub ->
offline/Litt/Voyage/x.epub). OFFLINE_DIR is the last static root, so while the
NAS answers its own copy wins, and once it is gone the local copy answers the
very same URL. Bookmarks, last page and annotations are keyed by that URL, so
they follow without being told.

The other half is not touching the NAS at all when it is away. Its share is a
hard NFS automount: a stat under it blocks the caller until the mount gives up
(up to 45 s here), and every static root is tried for every request, CSS and
icons included. So the network mounts are read from fstab, their hosts probed
in the background, and a root sitting on a host that does not answer is
skipped without a syscall.

*/

const fs = require('fs');
const net = require('net');
const path = require('path');
const yaml = require('js-yaml');

const CONFIG_FILE = 'static/config.yaml';
const PROBE_EVERY_MS = 20000;
const PROBE_TIMEOUT_MS = 1000;
// STRAPTOC_NAS_AWAY=1 plays the laptop away from home: every network mount is
// taken as gone, to check before leaving that the copies are all there.
const PRETEND_AWAY = !!process.env.STRAPTOC_NAS_AWAY;
const PORTS = { nfs: 2049, nfs4: 2049, cifs: 445, smb3: 445, 'fuse.sshfs': 22 };

function read_config() {
    try { return yaml.load(fs.readFileSync(CONFIG_FILE, 'utf8')) || {} }
    catch (e) { return {} }
}

const OFFLINE_DIR = path.resolve(read_config().offline_dir || 'offline');

//--------------  network mounts and their hosts

function host_of(source) {
    var m = /^\/\/([^/]+)\//.exec(source)       // //host/share (cifs)
         || /^(?:[^@]*@)?([^:/]+):/.exec(source); // host:/export, user@host:dir (nfs, sshfs)
    return m ? m[1] : null;
}

function read_network_mounts() {
    var mounts = [];
    ['/etc/fstab', '/proc/mounts'].forEach(function(file) {
        var text = '';
        try { text = fs.readFileSync(file, 'utf8') } catch (e) { return }
        text.split('\n').forEach(function(line) {
            if (/^\s*#/.test(line)) return;
            var f = line.trim().split(/\s+/);
            if (f.length < 3 || !(f[2] in PORTS)) return;
            var host = host_of(f[0]);
            if (!host) return;
            var point = path.resolve(f[1].replace(/\\040/g, ' '));
            if (mounts.some(function(m) { return m.point === point })) return;
            mounts.push({ point: point, host: host, port: PORTS[f[2]] });
        });
    });
    // deepest mount point first, so a share mounted inside another wins
    return mounts.sort(function(a, b) { return b.point.length - a.point.length });
}

const mounts = read_network_mounts();
const host_up = {};   // 'host:port' -> boolean, false until a probe says otherwise

function mount_of(dir) {
    var abs = path.resolve(dir);
    return mounts.find(function(m) {
        return abs === m.point || abs.startsWith(m.point + path.sep);
    }) || null;
}

function probe(m) {
    var key = m.host + ':' + m.port;
    var sock = net.connect({ host: m.host, port: m.port });
    var done = function(up) {
        sock.destroy();
        if (host_up[key] !== up) console.log('[offline] ' + key + (up ? ' answers' : ' does not answer'));
        host_up[key] = up;
    };
    sock.setTimeout(PROBE_TIMEOUT_MS);
    sock.once('connect', function() { done(true) });
    sock.once('timeout', function() { done(false) });
    sock.once('error', function() { done(false) });
}

function probe_all() { mounts.forEach(probe) }

if (mounts.length) {
    console.log('[offline] network mounts: ' + mounts.map(function(m) {
        return m.point + ' (' + m.host + ')' }).join(', '));
    if (PRETEND_AWAY) console.log('[offline] STRAPTOC_NAS_AWAY: acting as if they were all away');
    else {
        probe_all();
        setInterval(probe_all, PROBE_EVERY_MS).unref();
    }
}

// True when looking into dir cannot hang: a local folder, or a share whose
// host answered its last probe.
function reachable(dir) {
    var m = mount_of(dir);
    return !m || host_up[m.host + ':' + m.port] === true;
}

//--------------  static roots

// The roots the documents are served from, as config.yaml lists them.
function config_roots() {
    return (read_config().addresses || [])
        .map(function(a) { return (typeof a === 'string') ? a : Object.keys(a || {})[0] })
        .filter(Boolean)
        .map(function(a) { return path.resolve(a) });
}

// express.static for root, unless root is on a share that is away.
function guarded_static(express, root, opts) {
    var serve = express.static(root, opts);
    return function(req, res, next) {
        if (!reachable(root)) return next();
        serve(req, res, next);
    };
}

//--------------  offline copies

// URL path of a document -> its path relative to a root, or null.
// Mirrors what the browser sends and express.static resolves.
function web_rel(web_path) {
    if (!web_path || typeof web_path !== 'string') return null;
    if (/^[a-z][a-z0-9+.-]*:/i.test(web_path)) return null;   // http:, blob:...
    var clean = web_path.split(/[?#]/)[0];
    try { clean = decodeURIComponent(clean) } catch (e) { /* keep it raw */ }
    if (clean.indexOf('\0') !== -1) return null;
    var rel = path.posix.normalize('/' + clean.replace(/\\/g, '/')).replace(/^\/+/, '');
    return rel || null;
}

function under(root, candidate) {
    var rel = path.relative(root, candidate);
    return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

async function is_file(p) {
    try { return (await fs.promises.stat(p)).isFile() } catch (e) { return false }
}

// The file a URL is served from, looking only where it is safe to look.
async function find_source(rel) {
    var roots = config_roots().filter(function(r) { return r !== OFFLINE_DIR && reachable(r) });
    for (var root of roots) {
        var candidate = path.resolve(root, rel);
        if (under(root, candidate) && await is_file(candidate)) return candidate;
    }
    return null;
}

function offline_path(rel) {
    var p = path.resolve(OFFLINE_DIR, rel);
    return under(OFFLINE_DIR, p) ? p : null;
}

async function list_copies(dir, prefix, out) {
    var entries = [];
    try { entries = await fs.promises.readdir(dir, { withFileTypes: true }) } catch (e) { return out }
    for (var e of entries) {
        var rel = prefix ? prefix + '/' + e.name : e.name;
        if (e.isDirectory()) await list_copies(path.join(dir, e.name), rel, out);
        else if (!e.name.endsWith('.part')) out.push(rel);
    }
    return out;
}

// Remove the folders a deleted copy leaves empty, up to OFFLINE_DIR.
async function prune(dir) {
    while (under(OFFLINE_DIR, dir)) {
        try { await fs.promises.rmdir(dir) } catch (e) { return }
        dir = path.dirname(dir);
    }
}

const copying = new Set();

async function add_copy(rel) {
    var dest = offline_path(rel);
    if (!dest) throw new Error('chemin refusé');
    var src = await find_source(rel);
    if (!src) throw new Error('introuvable sur les dossiers accessibles (NAS absent ?)');
    await fs.promises.mkdir(path.dirname(dest), { recursive: true });
    // through a .part, so a copy cut short by a lost NAS never passes for a book
    await fs.promises.copyFile(src, dest + '.part');
    await fs.promises.rename(dest + '.part', dest);
    console.log('[offline] copied ' + src + ' -> ' + dest);
}

async function remove_copy(rel) {
    var dest = offline_path(rel);
    if (!dest) throw new Error('chemin refusé');
    await fs.promises.rm(dest, { force: true });
    await prune(path.dirname(dest));
    console.log('[offline] removed ' + dest);
}

function setupOfflineHandlers(io) {
    io.on('connection', function(socket) {

        socket.on('offline_list', async function() {
            socket.emit('offline_list', JSON.stringify(await list_copies(OFFLINE_DIR, '', [])));
        });

        socket.on('offline_add', async function(web_path) {
            var rel = web_rel(web_path);
            if (!rel || copying.has(rel)) return;
            copying.add(rel);
            io.emit('offline_updated', JSON.stringify({ path: rel, state: 'copying' }));
            try {
                await add_copy(rel);
                io.emit('offline_updated', JSON.stringify({ path: rel, state: 'available' }));
            } catch (e) {
                console.error('[offline] copy of ' + rel + ' failed: ' + e.message);
                try { await fs.promises.rm(offline_path(rel) + '.part', { force: true }) } catch (e2) {}
                io.emit('offline_updated', JSON.stringify({ path: rel, state: 'error', message: e.message }));
            } finally {
                copying.delete(rel);
            }
        });

        socket.on('offline_remove', async function(web_path) {
            var rel = web_rel(web_path);
            if (!rel || copying.has(rel)) return;
            try {
                await remove_copy(rel);
                io.emit('offline_updated', JSON.stringify({ path: rel, state: 'absent' }));
            } catch (e) {
                console.error('[offline] removal of ' + rel + ' failed: ' + e.message);
                io.emit('offline_updated', JSON.stringify({ path: rel, state: 'error', message: e.message }));
            }
        });
    });
}

module.exports = {
    OFFLINE_DIR: OFFLINE_DIR,
    reachable: reachable,
    guarded_static: guarded_static,
    web_rel: web_rel,
    setupOfflineHandlers: setupOfflineHandlers
};
