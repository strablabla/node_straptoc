/*

Initialization

*/

var fs = require('fs');

exports.comm_voc = function(io){

      /*

      Dictionary for vocal commands..

      */

      fs.readFile('static/comm_voc.json', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
               io.sockets.emit('dic_voc', text)
          }); // end fs.readFile
  }

exports.static_addr = function(app, express){

      /*

      Static addresses

      */

      fs.readFile('static/addr.json', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
               let dic_addr = JSON.parse(text);
               for (stat_addr of dic_addr){
                   console.log(stat_addr)
                   app.use(express.static(stat_addr));
               }
          }); // end fs.readFile

    }

function make_html_around_md(file){

  var model = function(){/*

{% extends "page_struct/base.html" %}

{% block text %}
    {% include "md/inserted_file" %}
{% endblock %}

{% block plugins %}
    {% include 'plugins/list_folders_for_extract.html' %}
    {% include 'plugins/extract_folder.html' %}
    {% include 'plugins/notes.html' %}
    {% include 'plugins/alerts.html' %}
    {% include 'plugins/djvu.html' %}
    {% include 'plugins/vid_playing.html' %}
    {% include 'plugins/audio.html' %}
{% endblock %}

*/}.toString().slice(14,-3).replace('inserted_file',file)

return model

}

function fill_globals(elem){

      /*

      Create the global variables used for pages communication..

      */

      global.dic_md['#' + elem] = elem + '_md'
      global.dic_md_name['#' + elem] = [elem + '_md', '_' + elem]
      global.dic_text_id[elem] = 'text-#' + elem
      global.list_md.push(elem + '_md')
      global.list_pages.push(elem)
      global.dic_text_id[''] = 'text-#main'

}

exports.handle_pages = function(app){

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
        var data0 = JSON.stringify(lmd)
        //console.log("########## lmd is " + data)
        //io.sockets.emit('pages', data)
        var namefile0 = 'static/pages.json'
        fs.writeFile(namefile0 , data0, function(err) {
                if(err) { return console.log(err); }
                console.log("The file was saved as {} !".format(namefile0));

                pages()

                Object.keys(dic_app).forEach(function(key) {
                    var page = dic_app[key];
                    app.get(page.path,function(req, res){
                         res.render(page.html);
                    });
                });

          });    // end writeFile

    }) // end readdir

}

function pages(){

      /*


      */

      fs.readFile('static/pages.json', 'utf8', function (err,text) {

          /*

          Create the variable for exchanging text between html and md..

          */

         if (err) { return console.log(err); }
         let list_pages = JSON.parse(text);
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
         dic_glob['_main'] = '/'
         data = 'var dchandir = ' + JSON.stringify(dic_glob) + '\n'
         data += 'var list_pages = ' + JSON.stringify(global.list_pages) + '\n'
         data += 'var dic_text_id = ' + JSON.stringify(global.dic_text_id) + '\n'
         var namefile = 'scripts/global.js'
            fs.writeFile(namefile , data, function(err) {
               if(err) { return console.log(err); }
               console.log("The file was saved as {} !".format(namefile));
              });    // end writeFile
        }); // end fs.readFile

  }
