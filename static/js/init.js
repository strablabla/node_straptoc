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
