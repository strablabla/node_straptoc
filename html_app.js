const https = require('https')
const http = require('http')
var express = require('express')
var path = require("path");
var open = require('open');
var fs = require('fs');
var nunjucks  = require('nunjucks');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');
var folders = require('./static/js/folders');

//--------------  Server

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('server.crt')
};

var app = express()
//var server =  https.createServer(options, app)
var server = http.createServer(app);

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
    // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
});

app.get('/', function(req, res){ res.render('strap_small.html'); });
app.get('/text', function(req, res){ res.render('text.html'); });

//--------------  static addresses

fs.readFile('static/addr.json', 'utf8', function (err,text) {
        if (err) { return console.log(err); }
         let dic_addr = JSON.parse(text);
         for (i in dic_addr){
             console.log(dic_addr[i])
             app.use(express.static(dic_addr[i]));
         }
    }); // end fs.readFile

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);
var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;

//----------- format strings..

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

io.sockets.on('connection', function (socket) {

      console.log('A client is connected!');
      fs.readFile('views/main.html', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
              re.emit_from_read(socket, count, patt, text, scroll_html_pos)
          }); // end fs.readFile
      util.save_regularly()                                           // save the regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) }); // end socket.on join

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) {        // change html with textarea
            modify.modify_html_with_newtext(io, fs, util, new_text)
        }); // end socket.on return

      socket.on('scroll', function(pattern) { patt = pattern })
      socket.on('scroll_html', function(pos) { scroll_html_pos = pos })

      //-------------------------------- Folders

      socket.on('folder_extract', function(name_folder) {
             console.log('Received the address ' + name_folder)
             folders.deals_with_folder(socket,name_folder)
        })

      socket.on('list_folders', function(name_folder) {
             console.log('################ addr list_folders.. ' + name_folder)
             folders.deals_with_list_folders(socket,name_folder)
        })

      //-------------------------------- pdf

      socket.on('make_pdfs', function(){
        socket.emit('make_pdfs','')
      })

}); // sockets.on connection

var port = 3001
var host = '0.0.0.0' // 127.0.0.1
server.listen(port, host);
var addr = 'http://{}'.format(host) + ':{}/'.format(port) // access through 192.168.0.13..
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
