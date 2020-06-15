var init = require('./init');
var fs = require('fs')

exports.handle = function(io,socket){


      socket.on('ask_config',function(){
          init.config_state(io)
      })


      socket.on('save_config', function(new_dic_config){               //-----

            //---------------

            dic_config_change = JSON.parse(new_dic_config)

            fs.readFile('static/config.json', 'utf8', function (err, text) {

                if (err) { return console.log(err); }
                console.log('######### savingggg config !!! ')
                try{
                    var dic_config = JSON.parse(text)
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
                    var newdic = JSON.stringify(dic_config)
                    fs.writeFile("static/config.json", newdic, function(err) {
                            if(err) { return console.log(err); }
                            console.log('saved config')
                        }); // end write file
              }catch(err){console.log(err)}
          })


    })

}
