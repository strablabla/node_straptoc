/*

Handle folders.

*/


var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var offline = require('../../lib/offline');

// Load registered addresses from config.yaml
var registered_addresses = [];

function load_registered_addresses() {
    try {
        const text = fs.readFileSync('static/config.yaml', 'utf8');
        const config = yaml.load(text);
        if (config.addresses && Array.isArray(config.addresses)) {
            // Extract paths from addresses - can be strings or objects with path as key
            registered_addresses = config.addresses.map(addr => {
                if (typeof addr === 'string') {
                    return addr;
                } else if (typeof addr === 'object' && addr !== null) {
                    // If it's an object, the path is the first key
                    return Object.keys(addr)[0];
                }
                return null;
            }).filter(addr => addr !== null);
            console.log('[folders] Loaded registered addresses:', registered_addresses);
        }
    } catch (e) {
        console.error('[folders] Error loading config.yaml:', e);
    }
}

// Load addresses at module initialization
load_registered_addresses();

// The web path absolute_addr() in extract_folder.html gives a folder.
function web_addr(addr) {
    var m = addr.match(/sdata\/\w+.+/) || addr.match(/public\/(.+)/);
    return m ? (m[1] || m[0]) : addr;
}

// Where the offline copies of a folder's books sit, if any were made.
function offline_folder(folder_path) {
    var candidates = [folder_path, web_addr(folder_path)];
    if (path.isAbsolute(folder_path)) {
        // an absolute path under a root also has a web path relative to it
        candidates = registered_addresses
            .map(addr => path.relative(path.resolve(addr), folder_path))
            .filter(rel => rel && !rel.startsWith('..') && !path.isAbsolute(rel));
    }
    for (var c of candidates) {
        var rel = offline.web_rel(c);
        var dir = rel && path.join(offline.OFFLINE_DIR, rel);
        if (dir && fs.existsSync(dir)) return dir;
    }
    return null;
}

function resolve_folder_path(folder_path) {
    /*
    Resolve folder path:
    - If absolute, return as-is
    - If relative, search in registered addresses
    A NAS that does not answer is never looked into (a stat there hangs);
    the offline copies stand in for it.
    */
    if (path.isAbsolute(folder_path)) {
        if (offline.reachable(folder_path)) return folder_path;
        // nowhere that exists: readdir fails at once instead of hanging on the NAS
        return offline_folder(folder_path) || path.join(offline.OFFLINE_DIR, '.nas-away');
    }

    // Search in registered addresses
    for (var addr of registered_addresses) {
        if (!offline.reachable(addr)) continue;
        var full_path = path.join(addr, folder_path);
        if (fs.existsSync(full_path)) {
            console.log('[folders] Resolved "' + folder_path + '" to "' + full_path + '"');
            return full_path;
        }
    }

    var local = offline_folder(folder_path);
    if (local) {
        console.log('[folders] Resolved "' + folder_path + '" to its offline copies "' + local + '"');
        return local;
    }

    // Fallback: return as-is
    console.log('[folders] Could not resolve "' + folder_path + '", using as-is');
    return folder_path;
}

function deals_with_folder(socket, name_folder){

      /*

      handle a unique folder

      */

      var count_pdf = name_folder.split('§§')[1]
      var name_folder = name_folder.split('§§')[0]

      // Resolve relative paths using registered addresses
      var resolved_path = resolve_folder_path(name_folder);

      var strap_addr = ''
      fs.readdir(resolved_path, (err, files) => {
          strap_addr +=  count_pdf + '§§'
          if (err) {
              console.error('[folders] Error reading directory:', resolved_path, err.message);
              // Send empty response to unblock client
              socket.emit('folder_extract', strap_addr)
              return;
          }
          files.forEach(file => {
             strap_addr += file + '\n'
          });

          socket.emit('folder_extract', strap_addr)

      });


}

function deals_with_folder_scan(socket, data){

      /*

      Scan a folder and return entries with type info (f: for files, d: for directories).
      Supports recursive !fold: the client can request any subfolder.

      */

      var count_pdf = data.split('§§')[1]
      var folder_path = data.split('§§')[0]

      // Resolve relative paths using registered addresses
      var resolved_path = resolve_folder_path(folder_path);

      var strap_addr = count_pdf + '§§'
      fs.readdir(resolved_path, (err, files) => {
          if (err) {
              console.error('[folders] Error scanning directory:', resolved_path, err.message);
              socket.emit('folder_scan', strap_addr)
              return;
          }
          files.forEach(file => {
              try {
                  var full = path.join(resolved_path, file);
                  var stat = fs.statSync(full);
                  if (stat.isDirectory()) {
                      strap_addr += 'd:' + file + '\n'
                  } else {
                      strap_addr += 'f:' + file + '\n'
                  }
              } catch(e) {
                  // skip files we can't stat
              }
          });

          socket.emit('folder_scan', strap_addr)
      });
}

function deals_with_list_folders(socket, name_folder){

      /*

      handle the list of folders

      */

      var count_pdf = name_folder.split('§§')[1]
      var name_folder = name_folder.split('§§')[0]

      // Resolve relative paths using registered addresses
      var resolved_path = resolve_folder_path(name_folder);

      var strap_addr = ''
      fs.readdir(resolved_path, (err, files) => {
          strap_addr +=  count_pdf + '§§'
          try {
              files.forEach(file => {
                  strap_addr += file + '\n';
              });
          } catch (error) {
              console.error("Erreur lors du traitement des fichiers :", error);
          }

        socket.emit('list_folders', strap_addr)

      });

}

exports.deals_with_pdfs = function(socket){

      /*


      */

      socket.on('folder_extract', function(name_folder) {
             deals_with_folder(socket, name_folder)
        })

      socket.on('list_folders', function(name_folder) {
             deals_with_list_folders(socket, name_folder)
        })

      socket.on('make_elems', function(){             //---- pdf
            socket.emit('make_elems', '')
        })

      socket.on('folder_scan', function(data) {
             deals_with_folder_scan(socket, data)
        })


}
