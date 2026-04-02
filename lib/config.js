var init = require('./init');
var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');

var appInstance = null;

exports.setApp = function(app) {
    appInstance = app;
};

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    var html = markdown;

    // Escape HTML entities first
    html = html.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');

    // Headers
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Code blocks (triple backticks)
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, function(match, lang, code) {
        return '<pre><code>' + code.trim() + '</code></pre>';
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.+?)_/g, '<em>$1</em>');

    // Links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^\*\*\*$/gm, '<hr>');

    // Lists
    var lines = html.split('\n');
    var inList = false;
    var listType = null;
    var result = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var ulMatch = line.match(/^[\s]*[-*+]\s+(.+)/);
        var olMatch = line.match(/^[\s]*\d+\.\s+(.+)/);

        if (ulMatch) {
            if (!inList || listType !== 'ul') {
                if (inList) result.push('</' + listType + '>');
                result.push('<ul>');
                listType = 'ul';
                inList = true;
            }
            result.push('<li>' + ulMatch[1] + '</li>');
        } else if (olMatch) {
            if (!inList || listType !== 'ol') {
                if (inList) result.push('</' + listType + '>');
                result.push('<ol>');
                listType = 'ol';
                inList = true;
            }
            result.push('<li>' + olMatch[1] + '</li>');
        } else {
            if (inList) {
                result.push('</' + listType + '>');
                inList = false;
                listType = null;
            }
            result.push(line);
        }
    }

    if (inList) {
        result.push('</' + listType + '>');
    }

    html = result.join('\n');

    // Paragraphs (lines separated by blank lines)
    html = html.replace(/\n\n+/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<h/g, '<h');
    html = html.replace(/<\/h(\d)>\s*<\/p>/g, '</h$1>');
    html = html.replace(/<p>\s*<ul>/g, '<ul>');
    html = html.replace(/<\/ul>\s*<\/p>/g, '</ul>');
    html = html.replace(/<p>\s*<ol>/g, '<ol>');
    html = html.replace(/<\/ol>\s*<\/p>/g, '</ol>');
    html = html.replace(/<p>\s*<pre>/g, '<pre>');
    html = html.replace(/<\/pre>\s*<\/p>/g, '</pre>');
    html = html.replace(/<p>\s*<hr>/g, '<hr>');
    html = html.replace(/<hr>\s*<\/p>/g, '<hr>');

    return html;
}

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


      // Get aliases for the editor
      socket.on('get_aliases', function() {
          fs.readFile('static/config.yaml', 'utf8', function (err, text) {
              if (err) {
                  socket.emit('aliases_data', JSON.stringify({}));
                  return;
              }
              try {
                  var fullConfig = yaml.load(text);
                  var aliases = fullConfig.aliases || {};
                  socket.emit('aliases_data', JSON.stringify(aliases));
              } catch(err) {
                  socket.emit('aliases_data', JSON.stringify({}));
              }
          });
      });

      // Update aliases
      socket.on('update_aliases', function(newAliasesJson) {
          console.log('Updating aliases...');
          fs.readFile('static/config.yaml', 'utf8', function (err, text) {
              if (err) {
                  socket.emit('aliases_updated', false);
                  return;
              }
              try {
                  var fullConfig = yaml.load(text);
                  fullConfig.aliases = JSON.parse(newAliasesJson);
                  var newYaml = yaml.dump(fullConfig, {
                      indent: 2,
                      lineWidth: -1,
                      noRefs: true
                  });
                  fs.writeFile("static/config.yaml", newYaml, function(err) {
                      if(err) {
                          socket.emit('aliases_updated', false);
                          return;
                      }
                      console.log('Aliases saved successfully');
                      socket.emit('aliases_updated', true);
                      // Broadcast to all clients
                      io.sockets.emit('dic_aliases', JSON.stringify(fullConfig.aliases));
                  });
              } catch(err) {
                  socket.emit('aliases_updated', false);
              }
          });
      });

      socket.on('save_config', function(new_dic_config){               //-----

            //---------------

            try { dic_config_change = JSON.parse(new_dic_config) }
            catch(e) { console.error('[config] Invalid JSON in save_config:', e.message); return; }

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
        try { var params = JSON.parse(data); }
        catch(e) { console.error('[config] Invalid JSON in add_subdir:', e.message); return; }
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

    // Get server config for the editor
    socket.on('get_server_config', function() {
        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('server_config_data', JSON.stringify({}));
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var serverConfig = fullConfig.server || {};
                socket.emit('server_config_data', JSON.stringify(serverConfig));
                console.log('Sent server_config to client');
            } catch(err) {
                console.log('Error parsing config.yaml:', err);
                socket.emit('server_config_data', JSON.stringify({}));
            }
        });
    });

    // Update server config
    socket.on('update_server_config', function(newServerConfigJson) {
        console.log('Updating server config...');

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('server_config_updated', false);
                return;
            }

            try {
                var fullConfig = yaml.load(text);
                var newServerConfig = JSON.parse(newServerConfigJson);

                // Update the server section
                fullConfig.server = newServerConfig;

                // Save back to YAML
                var newYaml = yaml.dump(fullConfig, {
                    indent: 2,
                    lineWidth: -1,
                    noRefs: true
                });

                fs.writeFile("static/config.yaml", newYaml, function(err) {
                    if(err) {
                        console.log('Error saving config.yaml:', err);
                        socket.emit('server_config_updated', false);
                        return;
                    }
                    console.log('Server config saved successfully');
                    socket.emit('server_config_updated', true);

                    // Notify about config state change
                    init.config_state(io);
                });
            } catch(err) {
                console.log('Error updating server config:', err);
                socket.emit('server_config_updated', false);
            }
        });
    });

    // Search across all pages
    socket.on('search_all_pages', function(searchTerm) {
        console.log('Searching for:', searchTerm);

        if (!searchTerm || searchTerm.trim() === '') {
            socket.emit('search_results', JSON.stringify([]));
            return;
        }

        fs.readFile('static/pages.json', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading pages.json:', err);
                socket.emit('search_results', JSON.stringify([]));
                return;
            }

            try {
                var pages = JSON.parse(text);
                var results = [];
                var pendingReads = pages.length;

                if (pendingReads === 0) {
                    socket.emit('search_results', JSON.stringify([]));
                    return;
                }

                pages.forEach(function(pageName) {
                    var mdPath = 'views/md/' + pageName + '_md.html';

                    fs.readFile(mdPath, 'utf8', function(err, mdContent) {
                        if (!err && mdContent) {
                            var lines = mdContent.split('\n');
                            var matches = [];

                            // Search in each line
                            lines.forEach(function(line, index) {
                                // Check if line is a list item and contains search term
                                if (line.trim().match(/^[-*]\s+/) &&
                                    line.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
                                    matches.push({
                                        line: line.trim(),
                                        lineNumber: index + 1
                                    });
                                }
                            });

                            if (matches.length > 0) {
                                results.push({
                                    page: pageName,
                                    matches: matches
                                });
                            }
                        }

                        pendingReads--;
                        if (pendingReads === 0) {
                            socket.emit('search_results', JSON.stringify(results));
                            console.log('Search complete, found results in', results.length, 'pages');
                        }
                    });
                });

            } catch(err) {
                console.log('Error parsing pages.json:', err);
                socket.emit('search_results', JSON.stringify([]));
            }
        });
    });

    // ========== PAGE MANAGEMENT ==========

    // Rename a page
    socket.on('rename_page', function(data) {
        try { var params = JSON.parse(data); }
        catch(e) { console.error('[config] Invalid JSON in rename_page:', e.message); return; }
        var oldName = params.old_name;
        var newName = params.new_name;

        console.log('Renaming page from', oldName, 'to', newName);

        // Validate new name
        if (!newName || newName.trim() === '' || newName === oldName) {
            socket.emit('page_renamed', JSON.stringify({ success: false, error: 'Invalid new name' }));
            return;
        }

        // Check if target name already exists
        var oldMdPath = 'views/md/' + oldName + '_md.html';
        var newMdPath = 'views/md/' + newName + '_md.html';

        if (fs.existsSync(newMdPath)) {
            socket.emit('page_renamed', JSON.stringify({ success: false, error: 'A page with that name already exists' }));
            return;
        }

        if (!fs.existsSync(oldMdPath)) {
            socket.emit('page_renamed', JSON.stringify({ success: false, error: 'Original page not found' }));
            return;
        }

        try {
            // Rename the markdown file
            fs.renameSync(oldMdPath, newMdPath);

            // Remove the old template file if it exists
            var oldTemplatePath = 'views/' + oldName + '.html';
            if (fs.existsSync(oldTemplatePath)) {
                fs.unlinkSync(oldTemplatePath);
            }

            // Regenerate all pages and routes
            if (appInstance) {
                init.handle_pages(appInstance, function() {
                    console.log('Pages regenerated after rename');
                    socket.emit('page_renamed', JSON.stringify({ success: true }));
                    io.sockets.emit('load_new_page', '');
                    // Send updated pages data
                    init.pages_data(io);
                });
            } else {
                socket.emit('page_renamed', JSON.stringify({ success: false, error: 'Server error: app not initialized' }));
            }

        } catch(err) {
            console.log('Error renaming page:', err);
            socket.emit('page_renamed', JSON.stringify({ success: false, error: err.message }));
        }
    });

    // Delete a page
    socket.on('delete_page', function(pageName) {
        console.log('Deleting page:', pageName);

        // Prevent deletion of main page
        if (pageName === 'main') {
            socket.emit('page_deleted', JSON.stringify({ success: false, error: 'Cannot delete main page' }));
            return;
        }

        var mdPath = 'views/md/' + pageName + '_md.html';
        var templatePath = 'views/' + pageName + '.html';

        if (!fs.existsSync(mdPath)) {
            socket.emit('page_deleted', JSON.stringify({ success: false, error: 'Page not found' }));
            return;
        }

        try {
            // Delete the markdown file
            fs.unlinkSync(mdPath);

            // Delete the template file if it exists
            if (fs.existsSync(templatePath)) {
                fs.unlinkSync(templatePath);
            }

            // Regenerate all pages and routes
            if (appInstance) {
                init.handle_pages(appInstance, function() {
                    console.log('Pages regenerated after delete');
                    socket.emit('page_deleted', JSON.stringify({ success: true }));
                    io.sockets.emit('load_new_page', '');
                    // Send updated pages data
                    init.pages_data(io);
                });
            } else {
                socket.emit('page_deleted', JSON.stringify({ success: false, error: 'Server error: app not initialized' }));
            }

        } catch(err) {
            console.log('Error deleting page:', err);
            socket.emit('page_deleted', JSON.stringify({ success: false, error: err.message }));
        }
    });

    // ========== HIDDEN PAGES ==========

    // Pages that are always hidden on startup (not persisted)
    var ALWAYS_HIDDEN_ON_STARTUP = ['example1', 'example2'];

    // Session-only: pages temporarily made visible (reset on server restart)
    if (!global.temporarilyVisiblePages) {
        global.temporarilyVisiblePages = [];
    }

    // Get hidden pages
    socket.on('get_hidden_pages', function() {
        try {
            var configPath = 'static/config.yaml';
            var configContent = fs.readFileSync(configPath, 'utf8');
            var config = yaml.load(configContent);

            var hiddenPages = config.hidden_pages || [];

            // Add "always hidden on startup" pages, but only if not temporarily visible
            ALWAYS_HIDDEN_ON_STARTUP.forEach(function(page) {
                if (hiddenPages.indexOf(page) === -1 && global.temporarilyVisiblePages.indexOf(page) === -1) {
                    hiddenPages.push(page);
                }
            });

            // Remove temporarily visible pages from hidden list
            hiddenPages = hiddenPages.filter(function(page) {
                return global.temporarilyVisiblePages.indexOf(page) === -1;
            });

            socket.emit('hidden_pages_data', JSON.stringify(hiddenPages));
        } catch(err) {
            console.log('Error loading hidden pages:', err);
            // Even on error, return the always-hidden pages (minus temporarily visible)
            var defaultHidden = ALWAYS_HIDDEN_ON_STARTUP.filter(function(page) {
                return global.temporarilyVisiblePages.indexOf(page) === -1;
            });
            socket.emit('hidden_pages_data', JSON.stringify(defaultHidden));
        }
    });

    // Save hidden pages
    socket.on('save_hidden_pages', function(data) {
        try {
            var hiddenPages = JSON.parse(data);

            // Update temporarily visible pages for ALWAYS_HIDDEN_ON_STARTUP pages
            ALWAYS_HIDDEN_ON_STARTUP.forEach(function(page) {
                var isNowHidden = hiddenPages.indexOf(page) !== -1;
                var wasTemporarilyVisible = global.temporarilyVisiblePages.indexOf(page) !== -1;

                if (isNowHidden && wasTemporarilyVisible) {
                    // User wants to hide it again - remove from temporarily visible
                    global.temporarilyVisiblePages = global.temporarilyVisiblePages.filter(function(p) {
                        return p !== page;
                    });
                } else if (!isNowHidden && !wasTemporarilyVisible) {
                    // User wants to show it - add to temporarily visible
                    global.temporarilyVisiblePages.push(page);
                }
            });

            // Filter out the "always hidden on startup" pages - don't persist them
            var pagesToSave = hiddenPages.filter(function(page) {
                return ALWAYS_HIDDEN_ON_STARTUP.indexOf(page) === -1;
            });

            var configPath = 'static/config.yaml';
            var configContent = fs.readFileSync(configPath, 'utf8');
            var config = yaml.load(configContent);

            config.hidden_pages = pagesToSave;

            var newYaml = yaml.dump(config, { indent: 2, lineWidth: -1 });
            fs.writeFileSync(configPath, newYaml, 'utf8');

            socket.emit('hidden_pages_saved', JSON.stringify({ success: true }));

            // Broadcast to all clients that hidden pages have been updated
            io.sockets.emit('hidden_pages_updated');
        } catch(err) {
            console.log('Error saving hidden pages:', err);
            socket.emit('hidden_pages_saved', JSON.stringify({ success: false, error: err.message }));
        }
    });

    // ========== SERVER SHUTDOWN ==========

    socket.on('shutdown_server', function() {
        console.log('========================================');
        console.log('SHUTDOWN REQUESTED BY CLIENT');
        console.log('Socket ID:', socket.id);
        console.log('========================================');

        // Broadcast to all clients to close their pages
        console.log('Broadcasting server_shutting_down to all clients...');
        io.sockets.emit('server_shutting_down');

        // Give clients time to receive the message and close
        setTimeout(function() {
            console.log('========================================');
            console.log('SHUTTING DOWN SERVER NOW...');
            console.log('========================================');
            process.exit(0);
        }, 1000);
    });

    // ========== GIT CHECK UPDATES ==========

    socket.on('git_check_updates', function() {
        var exec = require('child_process').exec;
        exec('git fetch && git rev-list HEAD..@{u} --count', { cwd: process.cwd() }, function(err, stdout, stderr) {
            if (err) {
                socket.emit('git_update_count', { count: 0 });
                return;
            }
            var count = parseInt(stdout.trim(), 10) || 0;
            socket.emit('git_update_count', { count: count });
        });
    });

    // ========== GIT PULL & RESTART ==========

    socket.on('git_pull_restart', function() {
        console.log('========================================');
        console.log('GIT PULL & RESTART REQUESTED BY CLIENT');
        console.log('Socket ID:', socket.id);
        console.log('========================================');

        var exec = require('child_process').exec;
        exec('git pull', { cwd: process.cwd() }, function(err, stdout, stderr) {
            console.log('git pull stdout:', stdout);
            if (stderr) console.log('git pull stderr:', stderr);

            if (err) {
                console.error('git pull failed:', err.message);
                socket.emit('git_pull_result', { success: false, message: 'git pull failed: ' + err.message });
                return;
            }

            socket.emit('git_pull_result', { success: true, message: stdout.trim() });

            // Broadcast to all clients to expect a restart
            io.sockets.emit('server_restarting');

            // Restart: spawn a new process then exit
            setTimeout(function() {
                var spawn = require('child_process').spawn;
                var child = spawn(process.argv[0], process.argv.slice(1), {
                    cwd: process.cwd(),
                    detached: true,
                    stdio: 'inherit'
                });
                child.unref();

                console.log('========================================');
                console.log('RESTARTING SERVER NOW...');
                console.log('========================================');
                process.exit(0);
            }, 1500);
        });
    });

    // ========== ADDR_SAVED MANAGEMENT ==========

    socket.on('get_addr_saved', function() {
        console.log('========================================');
        console.log('GET_ADDR_SAVED REQUESTED');
        console.log('========================================');

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('addr_saved_data', JSON.stringify({ relative_path: 'views/saved/', absolute_path: '' }));
                return;
            }

            try {
                var config = yaml.load(text);
                var relativePath = config.addr_saved || 'views/saved/';
                var absolutePath = path.resolve(relativePath);

                socket.emit('addr_saved_data', JSON.stringify({
                    relative_path: relativePath,
                    absolute_path: absolutePath
                }));
            } catch (e) {
                console.error('Error loading addr_saved:', e);
                socket.emit('addr_saved_data', JSON.stringify({ relative_path: 'views/saved/', absolute_path: '' }));
            }
        });
    });

    socket.on('save_addr_saved', function(absolutePath) {
        console.log('========================================');
        console.log('SAVE_ADDR_SAVED REQUESTED');
        console.log('Absolute path:', absolutePath);
        console.log('========================================');

        try {
            // Calculate relative path from current directory
            var currentDir = process.cwd();
            var relativePath = path.relative(currentDir, absolutePath);

            // Ensure it ends with /
            if (!relativePath.endsWith('/')) {
                relativePath += '/';
            }

            console.log('Current dir:', currentDir);
            console.log('Calculated relative path:', relativePath);

            // Read config.yaml
            fs.readFile('static/config.yaml', 'utf8', function (err, text) {
                if (err) {
                    console.log('Error reading config.yaml:', err);
                    socket.emit('addr_saved_updated', JSON.stringify({ success: false, error: 'Could not read config file' }));
                    return;
                }

                try {
                    var config = yaml.load(text);
                    config.addr_saved = relativePath;

                    // Write back to config.yaml
                    var yamlStr = yaml.dump(config);
                    fs.writeFile('static/config.yaml', yamlStr, 'utf8', function(err) {
                        if (err) {
                            console.error('Error writing config.yaml:', err);
                            socket.emit('addr_saved_updated', JSON.stringify({ success: false, error: 'Could not write config file' }));
                            return;
                        }

                        console.log('addr_saved updated successfully to:', relativePath);
                        socket.emit('addr_saved_updated', JSON.stringify({
                            success: true,
                            relative_path: relativePath
                        }));
                    });
                } catch (e) {
                    console.error('Error parsing/updating config.yaml:', e);
                    socket.emit('addr_saved_updated', JSON.stringify({ success: false, error: 'Error parsing config file' }));
                }
            });
        } catch (e) {
            console.error('Error calculating relative path:', e);
            socket.emit('addr_saved_updated', JSON.stringify({ success: false, error: 'Error calculating relative path' }));
        }
    });

    // ========== AUTOSAVE INTERVAL MANAGEMENT ==========

    socket.on('get_autosave_interval', function() {
        console.log('========================================');
        console.log('GET_AUTOSAVE_INTERVAL REQUESTED');
        console.log('========================================');

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.log('Error reading config.yaml:', err);
                socket.emit('autosave_interval_data', JSON.stringify({ interval: 15 }));
                return;
            }

            try {
                var config = yaml.load(text);
                var interval = config.autosave_interval || 15;

                socket.emit('autosave_interval_data', JSON.stringify({
                    interval: interval
                }));
            } catch (e) {
                console.error('Error loading autosave_interval:', e);
                socket.emit('autosave_interval_data', JSON.stringify({ interval: 15 }));
            }
        });
    });

    socket.on('save_autosave_interval', function(interval) {
        console.log('========================================');
        console.log('SAVE_AUTOSAVE_INTERVAL REQUESTED');
        console.log('Interval:', interval);
        console.log('========================================');

        // Read config.yaml
        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                socket.emit('autosave_interval_updated', JSON.stringify({ success: false, error: 'Could not read config file' }));
                return;
            }

            try {
                var config = yaml.load(text);
                config.autosave_interval = interval;

                // Write back to config.yaml
                var yamlStr = yaml.dump(config);
                fs.writeFile('static/config.yaml', yamlStr, 'utf8', function(err) {
                    if (err) {
                        socket.emit('autosave_interval_updated', JSON.stringify({ success: false, error: 'Could not write config file' }));
                        return;
                    }

                    console.log('autosave_interval updated successfully to:', interval);
                    socket.emit('autosave_interval_updated', JSON.stringify({
                        success: true,
                        interval: interval
                    }));
                });
            } catch (e) {
                socket.emit('autosave_interval_updated', JSON.stringify({ success: false, error: 'Error parsing config file' }));
            }
        });
    });

    // Get icon mappings for pages
    socket.on('get_icon_pages', function() {
        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.error('[config.js] Error reading config.yaml:', err);
                socket.emit('icon_pages_data', JSON.stringify({
                    dic_icon_pages: {},
                    error: err.message
                }));
                return;
            }
            try {
                var config = yaml.load(text);
                var dic_icon_pages = config.dic_icon_pages || {};
                socket.emit('icon_pages_data', JSON.stringify({
                    dic_icon_pages: dic_icon_pages
                }));
            } catch (e) {
                console.error('[config.js] Error parsing config.yaml:', e);
                socket.emit('icon_pages_data', JSON.stringify({
                    dic_icon_pages: {},
                    error: e.message
                }));
            }
        });
    });

    // Save icon mapping for a specific page
    socket.on('save_page_icon', function(data) {
        try { var parsedData = JSON.parse(data); }
        catch(e) { console.error('[config] Invalid JSON in save_page_icon:', e.message); return; }
        var pageName = parsedData.page;
        var iconNum = parsedData.icon;

        console.log('[config.js] Saving icon for page:', pageName, 'icon:', iconNum);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.error('[config.js] Error reading config.yaml:', err);
                socket.emit('page_icon_updated', JSON.stringify({
                    success: false,
                    error: err.message
                }));
                return;
            }
            try {
                var config = yaml.load(text);
                if (!config.dic_icon_pages) {
                    config.dic_icon_pages = {};
                }
                config.dic_icon_pages[pageName] = iconNum;

                var yamlStr = yaml.dump(config);
                fs.writeFile('static/config.yaml', yamlStr, 'utf8', function(err) {
                    if (err) {
                        console.error('[config.js] Error writing config.yaml:', err);
                        socket.emit('page_icon_updated', JSON.stringify({
                            success: false,
                            error: err.message
                        }));
                    } else {
                        console.log('[config.js] Icon saved successfully for', pageName);
                        socket.emit('page_icon_updated', JSON.stringify({
                            success: true,
                            page: pageName,
                            icon: iconNum
                        }));
                        // Broadcast to all clients so they update their icon
                        io.sockets.emit('icon_updated', JSON.stringify({
                            page: pageName,
                            icon: iconNum
                        }));
                    }
                });
            } catch (e) {
                console.error('[config.js] Error processing config:', e);
                socket.emit('page_icon_updated', JSON.stringify({
                    success: false,
                    error: e.message
                }));
            }
        });
    });

    // Get reminders configuration
    socket.on('get_reminders_config', function() {
        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.error('[config.js] Error reading config.yaml:', err);
                socket.emit('reminders_config_data', JSON.stringify({
                    reminders: {}
                }));
                return;
            }
            try {
                var config = yaml.load(text);
                socket.emit('reminders_config_data', JSON.stringify({
                    reminders: config.reminders || {}
                }));
            } catch (e) {
                console.error('[config.js] Error parsing config.yaml:', e);
                socket.emit('reminders_config_data', JSON.stringify({
                    reminders: {}
                }));
            }
        });
    });

    // Save reminders configuration
    socket.on('save_reminders_config', function(data) {
        try { var remindersConfig = JSON.parse(data); }
        catch(e) { console.error('[config] Invalid JSON in save_reminders_config:', e.message); return; }
        console.log('[config.js] Saving reminders config:', remindersConfig);

        fs.readFile('static/config.yaml', 'utf8', function (err, text) {
            if (err) {
                console.error('[config.js] Error reading config.yaml:', err);
                socket.emit('reminders_config_updated', JSON.stringify({
                    success: false,
                    error: err.message
                }));
                return;
            }
            try {
                var config = yaml.load(text);
                config.reminders = remindersConfig;

                var yamlStr = yaml.dump(config);
                fs.writeFile('static/config.yaml', yamlStr, 'utf8', function(err) {
                    if (err) {
                        console.error('[config.js] Error writing config.yaml:', err);
                        socket.emit('reminders_config_updated', JSON.stringify({
                            success: false,
                            error: err.message
                        }));
                    } else {
                        console.log('[config.js] Reminders config saved successfully');
                        socket.emit('reminders_config_updated', JSON.stringify({
                            success: true
                        }));

                        // Broadcast config update to restart reminder checker
                        io.sockets.emit('reminders_config_changed', JSON.stringify(remindersConfig));
                    }
                });
            } catch (e) {
                console.error('[config.js] Error processing config:', e);
                socket.emit('reminders_config_updated', JSON.stringify({
                    success: false,
                    error: e.message
                }));
            }
        });
    });

    // Get README content
    socket.on('get_readme', function() {
        console.log('[config.js] README requested');

        fs.readFile('README.md', 'utf8', function(err, content) {
            if (err) {
                console.error('[config.js] Error reading README.md:', err);
                socket.emit('readme_content', JSON.stringify({
                    success: false,
                    error: 'Could not read README.md file'
                }));
                return;
            }

            // Convert markdown to HTML (basic conversion)
            // For now, we'll use a simple regex-based approach
            // You can install 'marked' npm package for better rendering
            var html = convertMarkdownToHTML(content);

            socket.emit('readme_content', JSON.stringify({
                success: true,
                html: html
            }));
        });
    });

}
