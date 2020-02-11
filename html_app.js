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
var init = require('./static/js/init');
var notes = require('./static/js/notes');

//--------------  Server

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('server.crt')
};

var app = express()
var server =  https.createServer(options, app)
//var server = http.createServer(app);

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
    // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
});

app.get('/', function(req, res){ res.render('strap_small.html'); });
app.get('/text', function(req, res){ res.render('text.html'); });

//--------------  static addresses

init.static_addr(app,express)

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);
global.patt = '' // pattern for scroll position, used in modify.textarea_html
global.html_pos = 0 // position in html view,  used in modify.textarea_html
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
              re.emit_from_read(socket, count, patt, text, html_pos)
          }); // end fs.readFile
      util.save_regularly()                                           // save the regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) }); // end socket.on join

      init.comm_voc(io)  //----- comm voc
      modify.textarea_html(socket, io, fs, util)  //----  textarea to html and viceversa
      folders.deals_with_pdfs(socket)  //------  pdfs in folders
      socket.on('make_elems', function(){             //----- pdf
          socket.emit('make_elems','')
      })
      notes.handle(socket)


}); // io.sockets.on connection

var port = 3001
var host = '0.0.0.0' // 127.0.0.1
server.listen(port, host);
var addr = 'https://{}'.format(host) + ':{}/'.format(port) // access through 192.168.0.13..
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
