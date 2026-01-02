var init = require('./init');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');

exports.handle = function(io,socket){


      socket.on('ask_config',function(){
          init.config_state(io)
      })

      // Get color_tags for the editor
      socket.on('get_color_tags', function() {
          fs.readFile('static/config.yaml', 'utf8', function (err, text) {
              if (err) {
                  console.log('Error reading config.yaml:', err);
                  socket.emit('color_tags_data', JSON.stringify({}));
                  return;
              }

              try {
                  var fullConfig = yaml.load(text);
                  var colorTags = fullConfig.color_tags || {};
                  socket.emit('color_tags_data', JSON.stringify(colorTags));
                  console.log('Sent color_tags to client');
              } catch(err) {
                  console.log('Error parsing config.yaml:', err);
                  socket.emit('color_tags_data', JSON.stringify({}));
              }
          });
      });

      // Update color_tags
      socket.on('update_color_tags', function(newColorTagsJson) {
          console.log('Updating color_tags...');

          fs.readFile('static/config.yaml', 'utf8', function (err, text) {
              if (err) {
                  console.log('Error reading config.yaml:', err);
                  socket.emit('color_tags_updated', false);
                  return;
              }

              try {
                  var fullConfig = yaml.load(text);
                  var newColorTags = JSON.parse(newColorTagsJson);

                  // Update the color_tags section
                  fullConfig.color_tags = newColorTags;

                  // Save back to YAML
                  var newYaml = yaml.dump(fullConfig, {
                      indent: 2,
                      lineWidth: -1,
                      noRefs: true
                  });

                  fs.writeFile("static/config.yaml", newYaml, function(err) {
                      if(err) {
                          console.log('Error saving config.yaml:', err);
                          socket.emit('color_tags_updated', false);
                          return;
                      }
                      console.log('Color tags saved successfully');
                      socket.emit('color_tags_updated', true);

                      // Notify all clients to reload color tags
                      init.color_tags(io);
                  });
              } catch(err) {
                  console.log('Error updating color_tags:', err);
                  socket.emit('color_tags_updated', false);
              }
          });
      });


      socket.on('save_config', function(new_dic_config){               //-----

            //---------------

            dic_config_change = JSON.parse(new_dic_config)

            fs.readFile('static/config.yaml', 'utf8', function (err, text) {

                if (err) { return console.log(err); }
                console.log('######### savingggg config !!! ')
                try{
                    var fullConfig = yaml.load(text)
                    var dic_config = fullConfig.config
                    console.log('dic_config before ' + dic_config )
                    for (var [page, dic_tag] of Object.entries(dic_config)) {
                        console.log('page ' + page )
                        console.log('JSON.stringify(dic_config_change) ' + JSON.stringify(dic_config_change))
                        console.log('dic_tag ' + dic_tag )
                        for (var [tag, dic_css] of Object.entries(dic_tag)) {
                            if ((typeof dic_config[page][tag] != "undefined") & (typeof dic_config_change[page][tag] != "undefined")){
                               dic_config[page][tag] = Object.assign({}, dic_css, dic_config_change[page][tag])
                            }
                            else if(typeof dic_config_change[page][tag] != "undefined"){
                               dic_config[page][tag] = dic_config_change[page][tag]
                            }

                      }
                    }
                    console.log(dic_config[page][tag])
                    // Update the full config and save to YAML
                    fullConfig.config = dic_config
                    var newYaml = yaml.dump(fullConfig)
                    fs.writeFile("static/config.yaml", newYaml, function(err) {
                            if(err) { return console.log(err); }
                            console.log('saved config')
                        }); // end write file
              }catch(err){console.log(err)}
          })


    })

    // ========== PATHS MANAGEMENT ==========

    // Get paths for the editor
    socket.on('get_paths', function() {
        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('paths_data', JSON.stringify([]));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var addresses = fullConfig.addresses || [];

                // Default paths to exclude from the editor
                var defaultPaths = ['fonts', 'icons', 'lib', 'public', 'scripts', 'static'];

                // Filter addresses (keep both strings and objects, but exclude default paths)
                var filteredPaths = addresses.filter(function(item) {
                    if (typeof item === 'string') {
                        return defaultPaths.indexOf(item) === -1;
                    }
                    // For objects, check the key (path name)
                    if (typeof item === 'object') {
                        var keys = Object.keys(item);
                        if (keys.length > 0) {
                            return defaultPaths.indexOf(keys[0]) === -1;
                        }
                    }
                    return false;
                });

                socket.emit('paths_data', JSON.stringify(filteredPaths));
                console.log('Sent paths to client:', filteredPaths);
            } catch(err) {
                console.log('Error parsing config.yaml:', err);
                socket.emit('paths_data', JSON.stringify([]));
            }
        });
    });

    // Add a new path from input
    socket.on('add_path_from_input', function(inputPath) {
        console.log('Adding path from input:', inputPath);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('path_added', JSON.stringify({ success: false, error: 'Failed to read config file' }));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var addresses = fullConfig.addresses || [];

                // Calculate relative path from project root
                var projectRoot = process.cwd();
                console.log('Project root:', projectRoot);
                console.log('Input path:', inputPath);

                // If path starts with 'media/' or 'media', treat it as /media/...
                var normalizedPath = inputPath;
                if (inputPath.startsWith('media/') || inputPath === 'media') {
                    normalizedPath = '/' + inputPath;
                    console.log('Normalized media path to:', normalizedPath);
                }

                // Always calculate relative path from project root to input path
                var relativePath = path.relative(projectRoot, normalizedPath);
                console.log('Relative path calculated:', relativePath);

                // If relativePath is empty (same directory), use '.'
                if (!relativePath) {
                    relativePath = '.';
                }

                // Extract simple string paths
                var simplePaths = addresses.filter(function(item) {
                    return typeof item === 'string';
                });

                // Check if path already exists
                if (simplePaths.indexOf(relativePath) !== -1) {
                    socket.emit('path_added', JSON.stringify({
                        success: false,
                        error: 'Path already exists',
                        paths: simplePaths
                    }));
                    return;
                }

                // Add the new path to simple paths
                simplePaths.push(relativePath);
                simplePaths.sort();

                // Rebuild addresses array (keep objects, replace strings)
                var newAddresses = addresses.filter(function(item) {
                    return typeof item === 'object';
                });
                newAddresses = newAddresses.concat(simplePaths);

                fullConfig.addresses = newAddresses;

                // Save back to YAML
                var newYaml = yaml.dump(fullConfig, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true
                });

                fs.writeFile("static/config.yaml", newYaml, function(err) {
                    if(err) {
                        console.log('Error saving config.yaml:', err);
                        socket.emit('path_added', JSON.stringify({ success: false, error: 'Failed to save config file' }));
                        return;
                    }
                    console.log('Path added successfully:', relativePath);
                    socket.emit('path_added', JSON.stringify({ success: true, paths: simplePaths }));
                });
            } catch(err) {
                console.log('Error adding path:', err);
                socket.emit('path_added', JSON.stringify({ success: false, error: err.message }));
            }
        });
    });

    // Remove a path
    socket.on('remove_path', function(pathToRemove) {
        console.log('Removing path:', pathToRemove);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('path_removed', JSON.stringify({ success: false, error: 'Failed to read config file' }));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var addresses = fullConfig.addresses || [];

                // Extract simple string paths
                var simplePaths = addresses.filter(function(item) {
                    return typeof item === 'string';
                });

                // Remove the path
                var index = simplePaths.indexOf(pathToRemove);
                if (index === -1) {
                    socket.emit('path_removed', JSON.stringify({
                        success: false,
                        error: 'Path not found',
                        paths: simplePaths
                    }));
                    return;
                }

                simplePaths.splice(index, 1);

                // Rebuild addresses array (keep objects, replace strings)
                var newAddresses = addresses.filter(function(item) {
                    return typeof item === 'object';
                });
                newAddresses = newAddresses.concat(simplePaths);

                fullConfig.addresses = newAddresses;

                // Save back to YAML
                var newYaml = yaml.dump(fullConfig, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true
                });

                fs.writeFile("static/config.yaml", newYaml, function(err) {
                    if(err) {
                        console.log('Error saving config.yaml:', err);
                        socket.emit('path_removed', JSON.stringify({ success: false, error: 'Failed to save config file' }));
                        return;
                    }
                    console.log('Path removed successfully:', pathToRemove);
                    socket.emit('path_removed', JSON.stringify({ success: true, paths: simplePaths }));
                });
            } catch(err) {
                console.log('Error removing path:', err);
                socket.emit('path_removed', JSON.stringify({ success: false, error: err.message }));
            }
        });
    });

    // Add a subdirectory to an existing path
    socket.on('add_subdir', function(data) {
        var params = JSON.parse(data);
        var parentPath = params.parentPath;
        var subdirName = params.subdirName;
        var type = params.type; // 'child' or 'sibling'

        console.log('Adding subdirectory:', subdirName, 'to', parentPath, 'as', type);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('subdir_added', JSON.stringify({ success: false, error: 'Failed to read config file' }));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var addresses = fullConfig.addresses || [];

                // Find and update the path structure
                var updated = addSubdirToStructure(addresses, parentPath, subdirName, type);

                if (updated) {
                    fullConfig.addresses = addresses;

                    // Save back to YAML
                    var newYaml = yaml.dump(fullConfig, {
                        indent: 2,
                        lineWidth: -1,
                        noRefs: true
                    });

                    fs.writeFile("static/config.yaml", newYaml, function(err) {
                        if(err) {
                            console.log('Error saving config.yaml:', err);
                            socket.emit('subdir_added', JSON.stringify({ success: false, error: 'Failed to save config file' }));
                            return;
                        }
                        console.log('Subdirectory added successfully');

                        // Re-read and send updated paths
                        var filteredPaths = addresses.filter(function(item) {
                            var defaultPaths = ['fonts', 'icons', 'lib', 'public', 'scripts', 'static'];
                            if (typeof item === 'string') {
                                return defaultPaths.indexOf(item) === -1;
                            }
                            if (typeof item === 'object') {
                                var keys = Object.keys(item);
                                if (keys.length > 0) {
                                    return defaultPaths.indexOf(keys[0]) === -1;
                                }
                            }
                            return false;
                        });

                        socket.emit('subdir_added', JSON.stringify({ success: true, paths: filteredPaths }));
                    });
                } else {
                    socket.emit('subdir_added', JSON.stringify({ success: false, error: 'Parent path not found' }));
                }
            } catch(err) {
                console.log('Error adding subdirectory:', err);
                socket.emit('subdir_added', JSON.stringify({ success: false, error: err.message }));
            }
        });
    });

    // Remove a subdirectory or path from anywhere in the structure
    socket.on('remove_subdir', function(pathToRemove) {
        console.log('Removing path/subdirectory:', pathToRemove);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('subdir_removed', JSON.stringify({ success: false, error: 'Failed to read config file' }));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var addresses = fullConfig.addresses || [];

                // Find and remove the path/subdirectory
                var removed = removeFromStructure(addresses, pathToRemove);

                if (removed) {
                    fullConfig.addresses = addresses;

                    // Save back to YAML
                    var newYaml = yaml.dump(fullConfig, {
                        indent: 2,
                        lineWidth: -1,
                        noRefs: true
                    });

                    fs.writeFile("static/config.yaml", newYaml, function(err) {
                        if(err) {
                            console.log('Error saving config.yaml:', err);
                            socket.emit('subdir_removed', JSON.stringify({ success: false, error: 'Failed to save config file' }));
                            return;
                        }
                        console.log('Path/subdirectory removed successfully');

                        // Re-read and send updated paths
                        var filteredPaths = addresses.filter(function(item) {
                            var defaultPaths = ['fonts', 'icons', 'lib', 'public', 'scripts', 'static'];
                            if (typeof item === 'string') {
                                return defaultPaths.indexOf(item) === -1;
                            }
                            if (typeof item === 'object') {
                                var keys = Object.keys(item);
                                if (keys.length > 0) {
                                    return defaultPaths.indexOf(keys[0]) === -1;
                                }
                            }
                            return false;
                        });

                        socket.emit('subdir_removed', JSON.stringify({ success: true, paths: filteredPaths }));
                    });
                } else {
                    socket.emit('subdir_removed', JSON.stringify({ success: false, error: 'Path not found' }));
                }
            } catch(err) {
                console.log('Error removing path/subdirectory:', err);
                socket.emit('subdir_removed', JSON.stringify({ success: false, error: err.message }));
            }
        });
    });

    // Helper function to remove path/subdirectory from structure
    function removeFromStructure(addresses, pathToRemove) {
        // Try to remove from root level first
        for (var i = 0; i < addresses.length; i++) {
            var item = addresses[i];

            // Check if this is a simple string at root level
            if (typeof item === 'string' && item === pathToRemove) {
                addresses.splice(i, 1);
                return true;
            }

            // Check if this is an object with the path as key
            if (typeof item === 'object') {
                var keys = Object.keys(item);
                if (keys.length > 0 && keys[0] === pathToRemove) {
                    addresses.splice(i, 1);
                    return true;
                }

                // Try to remove from within the object
                if (removeFromObject(item, pathToRemove)) {
                    // If object becomes empty after removal, remove the object itself
                    if (keys.length === 1 && (!item[keys[0]] || (Array.isArray(item[keys[0]]) && item[keys[0]].length === 0))) {
                        addresses.splice(i, 1);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    function removeFromObject(obj, pathToRemove) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (Array.isArray(obj[key])) {
                    for (var i = 0; i < obj[key].length; i++) {
                        var item = obj[key][i];

                        // Check if this is a string to remove
                        if (typeof item === 'string' && item === pathToRemove) {
                            obj[key].splice(i, 1);
                            return true;
                        }

                        // Check if this is an object with the key to remove
                        if (typeof item === 'object') {
                            var itemKeys = Object.keys(item);
                            if (itemKeys.length > 0 && itemKeys[0] === pathToRemove) {
                                obj[key].splice(i, 1);
                                return true;
                            }

                            // Recurse into nested objects
                            if (removeFromObject(item, pathToRemove)) {
                                // If nested object becomes empty, remove it
                                if (itemKeys.length === 1 && (!item[itemKeys[0]] || (Array.isArray(item[itemKeys[0]]) && item[itemKeys[0]].length === 0))) {
                                    obj[key].splice(i, 1);
                                }
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    // Helper function to add subdirectory to structure
    function addSubdirToStructure(addresses, parentPath, subdirName, type) {
        for (var i = 0; i < addresses.length; i++) {
            var item = addresses[i];

            // Check if this is a simple string path
            if (typeof item === 'string' && item === parentPath) {
                if (type === 'child') {
                    // Convert string to object with subdirectories
                    var newObj = {};
                    newObj[parentPath] = [subdirName];
                    addresses[i] = newObj;
                    return true;
                } else {
                    // Add as a sibling in the addresses array
                    addresses.splice(i + 1, 0, subdirName);
                    return true;
                }
            }

            // Check if this is an object with the parent path
            if (typeof item === 'object') {
                var found = addSubdirToObject(item, addresses, parentPath, subdirName, type, null);
                if (found) return true;
            }
        }
        return false;
    }

    function addSubdirToObject(obj, parentArray, parentPath, subdirName, type, parentKey) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Check if this is the parent we're looking for
                if (key === parentPath) {
                    if (type === 'child') {
                        // Ensure value is an array
                        if (!Array.isArray(obj[key])) {
                            obj[key] = [];
                        }
                        // Add as a child (simple string)
                        obj[key].push(subdirName);
                        return true;
                    } else {
                        // For sibling, we need to add to the parent array that contains this object
                        // parentArray is the array that contains the current object
                        if (parentArray && Array.isArray(parentArray)) {
                            // Find the position of the current object in parentArray
                            for (var j = 0; j < parentArray.length; j++) {
                                if (typeof parentArray[j] === 'object' && parentArray[j].hasOwnProperty(key)) {
                                    // Add sibling right after this object
                                    parentArray.splice(j + 1, 0, subdirName);
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                }

                // Recurse into subdirectories only if value is an array
                if (Array.isArray(obj[key])) {
                    for (var i = 0; i < obj[key].length; i++) {
                        if (typeof obj[key][i] === 'string' && obj[key][i] === parentPath) {
                            if (type === 'child') {
                                // Convert string to object with subdirectories
                                var newSubObj = {};
                                newSubObj[parentPath] = [subdirName];
                                obj[key][i] = newSubObj;
                                return true;
                            } else {
                                // Add as a sibling in the same array
                                obj[key].splice(i + 1, 0, subdirName);
                                return true;
                            }
                        } else if (typeof obj[key][i] === 'object') {
                            var found = addSubdirToObject(obj[key][i], obj[key], parentPath, subdirName, type, key);
                            if (found) return true;
                        }
                    }
                }
            }
        }
        return false;
    }

}
