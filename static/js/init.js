/*

Initialization

*/

var fs = require('fs');
//var express = require('express')


exports.comm_voc = function(io){

      /*
      Dictionary for vocal commands..
      */

      fs.readFile('static/comm_voc.json', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
               io.sockets.emit('dic_voc', text)
          }); // end fs.readFile
  }

exports.static_addr = function(app,express){

      /*
      Static addresses
      */

      fs.readFile('static/addr.json', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
               let dic_addr = JSON.parse(text);
               for (i in dic_addr){
                   console.log(dic_addr[i])
                   app.use(express.static(dic_addr[i]));
               }
          }); // end fs.readFile

    }


function make_html_around_md(file){

  var model = function(){/*

{% extends "base.html" %}

{% block text %}
    {% include "md/inserted_file" %}
{% endblock %}

{% block plugins %}
    {% include 'list_folders_for_extract.html' %}
    {% include 'extract_folder.html' %}
    {% include 'notes.html' %}
    {% include 'alerts.html' %}
    {% include 'djvu.html' %}
    {% include 'vid_playing.html' %}
{% endblock %}

*/}.toString().slice(14,-3).replace('inserted_file',file)

return model

}

function fill_globals(elem){

      /*

      */

      global.dic_md['#' + elem] = elem + '_md'
      global.dic_md_name['#' + elem] = [elem + '_md', '_' + elem]
      global.list_md.push(elem + '_md')

}

exports.pages = function(){

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
         global.list_md = []  // list markdowns
         for (i in list_pages){
             var elem = list_pages[i]
             dic_glob['_' + elem] = elem
             fill_globals(elem)
         }
         dic_glob['_main'] = '/'
         data = 'var dchandir = ' + JSON.stringify(dic_glob)
         var namefile = 'scripts/global.js'
            fs.writeFile(namefile , data, function(err) {
               if(err) { return console.log(err); }
               console.log("The file was saved as {} !".format(namefile));
              });    // end writeFile
        }); // end fs.readFile

        fs.readdir('views/md', (err, files) => {

              /*

              Create the template html for each md file in views..

              */

              files.forEach(file => {
                  if (file.search('_md.html') != -1){
                      console.log('#### found md !!! it is ' + file)
                      model = make_html_around_md(file)
                      console.log('#### model is ' + model)
                      var addr = 'views/' + file.replace('_md.html','.html')
                      fs.writeFile(addr, model, function(err) {
                            if(err) { return console.log(err); }
                            console.log("The file was saved at {} !".format(addr));
                      });    // end writeFile
                  }
              })
          }) // end readdir

  }
