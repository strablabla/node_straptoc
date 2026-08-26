/*

CBZ support.

A .cbz is a plain zip of images, one image per page, ordered by entry name —
no manifest, no metadata, nothing else to read. Pages are served one at a time
(/cbz/page) so a 200 MB album never travels over the wire whole and the browser
gets to cache and decode each page on its own.

*/

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var AdmZip = require('adm-zip');

//--------------  web path -> file on disk

/*

The client only ever knows the URL a book is served under (/bouquins/x.cbz),
the one express.static resolves. We resolve against those very roots, so /cbz
can never read a file that was not already downloadable by its own URL.

*/

var static_roots = [];

function load_static_roots(){

      try {
        var text = fs.readFileSync('static/config.yaml', 'utf8');
        var config = yaml.load(text);
        var addresses = (config && config.addresses) || [];
        static_roots = addresses
            .map(function(a){ return (typeof a === 'string') ? a : Object.keys(a || {})[0] })
            .filter(Boolean)
            .map(function(a){ return path.resolve(a) })
            .filter(function(a){
                 try { return fs.statSync(a).isDirectory() } catch(e) { return false }
              });
        console.log('[cbz] static roots: ' + static_roots.join(', '));
      } catch(e) {
        console.error('[cbz] could not read static/config.yaml: ' + e.message);
      }

}

load_static_roots();

function under(root, candidate){

      var rel = path.relative(root, candidate);
      return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);

}

function resolve_web_path(web_path){

      /*

      Resolve the URL of a book to a real file.

      The markdown gives its books whatever path the author felt like, and
      absolute_addr() in extract_folder.html turns that into a URL by rules
      that differ per folder (sdata, public, plain fallback). Rather than
      replay those rules, try the URL under every static root, then retry with
      its leading segments stripped one by one. The containment check keeps
      every attempt inside a root.

      */

      if (!web_path || typeof web_path !== 'string') return null;

      var clean = web_path.split('?')[0];
      try { clean = decodeURIComponent(clean) } catch(e) { /* keep it raw */ }
      if (clean.indexOf('\0') !== -1) return null;

      // normalize kills ../ the same way the browser does before sending the URL
      var rel = path.posix.normalize('/' + clean.replace(/\\/g, '/'));
      var segments = rel.split('/').filter(Boolean);

      for (var start = 0; start < segments.length; start++) {
          var tail = segments.slice(start).join('/');
          for (var i = 0; i < static_roots.length; i++) {
              var candidate = path.resolve(static_roots[i], tail);
              if (!under(static_roots[i], candidate)) continue;
              try {
                  if (fs.statSync(candidate).isFile()) return candidate;
              } catch(e) { /* try the next root */ }
          }
      }

      return null;

}

//--------------  open archives

/*

adm-zip reads the whole archive into memory, so keep the last few open rather
than paying that on every page turn. Two covers the usual "read one, glance at
another" pattern and bounds what a 300 MB album costs.

*/

var MAX_OPEN = 2;
var open_archives = [];   // most recently used first

var IMAGE_ENTRY = /\.(jpe?g|png|gif|webp|bmp|avif)$/i;

var MIME = {
      '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
      '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
      '.avif': 'image/avif'
    };

function natural_compare(a, b){

      // page2 before page10 — scanners number pages without padding often enough
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

}

function open_archive(file){

      var st = fs.statSync(file);
      var key = file + ':' + st.mtimeMs + ':' + st.size;

      for (var i = 0; i < open_archives.length; i++) {
          if (open_archives[i].key === key) {
              var hit = open_archives.splice(i, 1)[0];   // touch: move to front
              open_archives.unshift(hit);
              return hit;
          }
      }

      var zip = new AdmZip(file);
      var pages = zip.getEntries()
                     .filter(function(e){
                          return !e.isDirectory &&
                                 IMAGE_ENTRY.test(e.entryName) &&
                                 e.entryName.indexOf('__MACOSX/') !== 0 &&
                                 path.basename(e.entryName).charAt(0) !== '.';
                       })
                     .sort(function(a, b){ return natural_compare(a.entryName, b.entryName) });

      console.log('[cbz] opened ' + file + ' (' + pages.length + ' pages)');

      var archive = { key: key, zip: zip, pages: pages };
      open_archives.unshift(archive);
      open_archives.splice(MAX_OPEN);      // drop the least recently used
      return archive;

}

function archive_for(req, res){

      /*

      Shared entry point of both routes: resolve, check, open.
      Returns null and answers the request itself on any failure.

      */

      var file = resolve_web_path(req.query.file);
      if (!file) {
          res.status(404).json({ error: 'file not found: ' + (req.query.file || '') });
          return null;
      }
      if (!/\.cbz$/i.test(file)) {
          res.status(400).json({ error: 'not a cbz: ' + file });
          return null;
      }
      try {
          return open_archive(file);
      } catch(err) {
          console.error('[cbz] cannot read ' + file + ': ' + err.message);
          res.status(500).json({ error: err.message });
          return null;
      }

}

//--------------  routes

exports.setupRoutes = function(app){

      // How many pages, so the viewer can show its counter before asking for
      // any image.
      app.get('/cbz/pages', function(req, res){

            var archive = archive_for(req, res);
            if (!archive) return;
            res.json({ pages: archive.pages.length });

        });

      // One page, decompressed on demand.
      app.get('/cbz/page', function(req, res){

            var archive = archive_for(req, res);
            if (!archive) return;

            var i = parseInt(req.query.i, 10);
            if (!Number.isFinite(i) || i < 0 || i >= archive.pages.length) {
                res.status(404).json({ error: 'no page ' + req.query.i });
                return;
            }

            var entry = archive.pages[i];
            var sent = false;
            var fail = function(msg){
                if (sent) return;
                sent = true;
                console.error('[cbz] ' + entry.entryName + ': ' + msg);
                res.status(500).json({ error: msg });
            };

            try {
                // A stored entry with a bad CRC calls back AND throws, hence
                // both the guard flag and the try/catch.
                archive.zip.readFileAsync(entry, function(data, err){
                    if (err || !data) { fail(err || 'empty entry'); return; }
                    if (sent) return;
                    sent = true;
                    res.setHeader('Content-Type',
                                  MIME[path.extname(entry.entryName).toLowerCase()] || 'application/octet-stream');
                    // The page cannot change unless the archive does, and the
                    // cache key already carries its mtime and size.
                    res.setHeader('Cache-Control', 'private, max-age=3600');
                    res.end(data);
                });
            } catch(err) {
                fail(err.message);
            }

        });

      console.log('[cbz] routes ready: /cbz/pages, /cbz/page');

};
