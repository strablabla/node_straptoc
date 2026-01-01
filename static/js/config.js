var init = require('./init');
var fs = require('fs');
var yaml = require('js-yaml');

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

}
