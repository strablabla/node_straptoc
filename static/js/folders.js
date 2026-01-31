/*

Handle folders.

*/


var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');

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

function resolve_folder_path(folder_path) {
    /*
    Resolve folder path:
    - If absolute, return as-is
    - If relative, search in registered addresses
    */
    if (path.isAbsolute(folder_path)) {
        return folder_path;
    }

    // Search in registered addresses
    for (var addr of registered_addresses) {
        var full_path = path.join(addr, folder_path);
        if (fs.existsSync(full_path)) {
            console.log('[folders] Resolved "' + folder_path + '" to "' + full_path + '"');
            return full_path;
        }
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


}
