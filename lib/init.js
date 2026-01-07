/*

Initialization

*/

const fs = require('fs');
const yaml = require('js-yaml');
const sqlite3 = require('sqlite3').verbose();

exports.comm_voc = function(io){

      /*

      Dictionary for vocal commands..
      Load and send it from centralized config.yaml

      */

      fs.readFile('static/config.yaml', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
              try {
                const config = yaml.load(text);
                const vocJson = JSON.stringify(config.vocabulaire);
                io.sockets.emit('dic_voc', vocJson);
              } catch (e) {
                console.error("Erreur lors du chargement du vocabulaire:", e);
              }
          }); // end fs.readFile
  }

exports.latex_voc = function(io){

        /*

        Dictionary of vocal commands for Latex syntax..

        */

        fs.readFile('static/latex_voc.json', 'utf8', function (err,text) {
                if (err) { return console.log(err); }
                 io.sockets.emit('dic_latex', text)
            }); // end fs.readFile
    }

exports.static_addr = function(app, express){

      /*

      Static addresses
      Load them and create the routes with express..

      */

      function case_array(elem,ob){
          if (Array.isArray(ob)){ return 'array' + elem }
          else{ return elem }
      }

      function flattenObject(ob) {
            var toReturn = {};

            for (var i in ob) {
                if (!ob.hasOwnProperty(i)) continue;

                if ((typeof ob[i]) == 'object' && ob[i] !== null) {
                    var flatObject = flattenObject(ob[i]);
                    for (var x in flatObject) {
                        if (!flatObject.hasOwnProperty(x)) continue;

                        toReturn[case_array(i,ob) + '§§' + case_array(x,flatObject)] = flatObject[x];

                    }
                } else {

                    toReturn[case_array(i,ob)] = ob[i];

                }
            }
            return toReturn;
        }

      function make_stat_addr(key,val){

            var newkey = key.replace(/array\d{1,3}/g,'').replace(/^(§§)/,'')
            newkey = newkey.replace(/(§§)$/,'').replace(/(§§)+/g,'/')
            if (newkey == ''){ stat_addr = val }
            else{ stat_addr = newkey + '/' +  val  }

            return stat_addr

      }

      try {
        const text = fs.readFileSync('static/config.yaml', 'utf8');
        const config = yaml.load(text); // yaml to js
        const flat_dic = flattenObject(config.addresses);
        console.log("mytests");

        for (const [key, val] of Object.entries(flat_dic)) {
          const stat_addr = make_stat_addr(key, val);
          console.log('final expr is ' + stat_addr);
          app.use(express.static(stat_addr)); // serve files from directory
        }
      } catch (e) {
        console.error("Erreur lors du chargement des adresses statiques:", e);
      }

  } // end exports.static_addr

function make_html_around_md(file){

      /*

      Make the html around the markdown..

      */

      var list_plugins =  '\n'
      var files = fs.readdirSync('views/plugins')
      for (var f of files) {
          list_plugins += "    {% include 'plugins/" + f + "' %} \n"
      }
      console.log("### list_plugins_text " + list_plugins)
      page = '\n  {% include "md/inserted_file" %}  \n'.replace('inserted_file', file)

      var base = function(){/*

  {% extends "page_struct/base.html" %}

  {% block text %}
      insert_page
  {% endblock %}

  {% block plugins %}
       insert_plugins
  {% endblock %}

  */}.toString().slice(14,-3).replace('insert_page', page)
                             .replace('insert_plugins', list_plugins)

    console.log(base)
    return base

    }

function fill_globals(elem){

      /*

      Create the global variables used for pages communication..

      */
      console.log("create global variables.. ")
      global.dic_md['#' + elem] = elem + '_md'
      global.dic_md_name['#' + elem] = [elem + '_md', '_' + elem]
      global.dic_text_id[elem] = 'text-#' + elem
      global.list_md.push(elem + '_md')
      global.list_pages.push(elem)
      global.dic_text_id[''] = 'text-#main'

}

exports.handle_pages = function(app, callback){

    /*



    */

    fs.readdir('views/md', (err, files) => {

        /*

        Create the template html for each md file in views..

        */

        var lmd = []
        var dic_app = {}
        files.forEach(file => {
            if (file.search('_md.html') != -1){
                console.log('#### found md !!! it is ' + file)
                model = make_html_around_md(file)                // template
                console.log('#### model is ' + model)
                var addr = 'views/' + file.replace('_md.html','.html')
                var name = file.replace('_md.html','')
                lmd.push(name)
                dic_app[name] = {'path': '/' + name, 'html': name + '.html'}
                //route_page(app, name)
                fs.writeFile(addr, model, function(err) {   // create the template
                      if(err) { return console.log(err); }
                      console.log("The file was saved at {} !".format(addr));
                });    // end writeFile
            }
        }) // end for
        console.log("list of the md is " + lmd)
        var data0 = JSON.stringify(lmd)
        var namefile0 = 'static/pages.json'
        fs.writeFile(namefile0 , data0, function(err) {
                if(err) { return console.log(err); }
                console.log("The file was saved as {} !".format(namefile0));

                pages(callback)

                Object.keys(dic_app).forEach(function(key) {
                    var page = dic_app[key];
                    app.get(page.path,function(req, res){
                         res.render(page.html);
                    });
                });

          });    // end writeFile

    }) // end readdir

}

function pages(callback){

      /*


      */
      console.log("in pages")
      fs.readFile('static/pages.json', 'utf8', function (err,text) {

         /*

          Create the variable for exchanging text between html and md..

         */

          if (err) { return console.log(err); }
          let list_pages = JSON.parse(text);
          console.log("list_pages in function pages is " + list_pages)
          dic_glob = {}
          global.dic_md = {}
          global.dic_md_name = {}
          global.dic_text_id = {}
          global.list_md = []  // list markdowns
          global.list_pages = []  // list pages
          for (var page of list_pages){
             dic_glob['_' + page] = page
             fill_globals(page)
          }
          console.log("make the global.js file !!!")
          dic_glob['_main'] = '/'
          data = 'var dchandir = ' + JSON.stringify(dic_glob) + '\n'
          data += 'var list_pages = ' + JSON.stringify(global.list_pages) + '\n'
          data += 'var list_md = ' + JSON.stringify(global.list_md) + '\n'
          data += 'var dic_text_id = ' + JSON.stringify(global.dic_text_id) + '\n'
          var namefile = 'scripts/global.js'
          fs.writeFile(namefile , data, function(err) {
             if(err) { return console.log(err); }
             console.log("The file was saved as {} !".format(namefile));
             if(callback){ callback() }
            });    // end writeFile
        }); // end fs.readFile

  }


exports.color_tags = function(io){

  fs.readFile('static/config.yaml', 'utf8', function (err,text) {
          if (err) { return console.log(err); }
          try {
            const config = yaml.load(text);
            const colorTagsJson = JSON.stringify(config.color_tags);
            console.log('pingpong...')
            console.log(colorTagsJson)
            io.sockets.emit('dic_color_tags', colorTagsJson)
          } catch (e) {
            console.error("Erreur lors du chargement des color_tags:", e);
          }
      }); // end fs.readFile
}

exports.drawing_state = function(io){

  fs.readFile('static/drawing_state.json', 'utf8', function (err,text) {
          if (err) { return console.log(err); }
          console.log('drawing_state...')
          console.log(text)
          io.sockets.emit('dic_drawing_state', text)

      }); // end fs.readFile
}

exports.config_state = function(io){

  fs.readFile('static/config.yaml', 'utf8', function (err,text) {
          if (err) { return console.log(err); }
          try {
            const config = yaml.load(text);
            const configJson = JSON.stringify(config.config);
            console.log('config_state...')
            console.log(configJson)
            io.sockets.emit('config_state', configJson)
          } catch (e) {
            console.error("Erreur lors du chargement de config:", e);
          }
      }); // end fs.readFile
}

exports.data_base = function(){

  const dbPath = path.resolve(__dirname, 'strap_database.db');

  // open the connexion to database
  let db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.error('connexion error:', err.message);
    } else {
      console.log('Connected to Sqlite databse.');
    }
  });

  function setupDatabase() {
    db.serialize(() => {
          // Ceate a table if it does not exist..
          db.run(`
            CREATE TABLE IF NOT EXISTS utilisateurs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              nom TEXT NOT NULL,
              email TEXT UNIQUE,
              date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
            )
          `, (err) => {
            if (err) {
              console.error('Error when creating the table:', err.message);
            } else {
              console.log('Users table checked and created.');
            }
          });
        });
      }

  // setup the databse
  setupDatabase();

  return db


}
