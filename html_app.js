var express = require('express')
var path = require("path");
var fs = require('fs');
var nunjucks  = require('nunjucks');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var mh = require('./static/js/modify_html');

//--------------  Server

var app = express()
var server = require('http').createServer(app);

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
    // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
});

app.get('/', function(req, res){
    res.render('strap_small.html');
});

app.get('/text', function(req, res){
    res.render('text.html');
});

//--------------  static addresses

app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);

var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;

io.sockets.on('connection', function (socket) {

      console.log('A client is connected!');
      fs.readFile('views/strap_small.html', 'utf8', function (err,text) {
              if (err) { return console.log(err); }
              re.emit_from_read(socket, count, patt, text, scroll_html_pos)
          }); // end fs.readFile

      //util.save_regularly() // save the regularly the text..

      socket.on('join', function(data) {
          //var a = 1
          console.log('client sent a message... ' + data);
          console.log('value of patt on server side ... ' + patt);
          socket.emit('scroll', patt)

        }); // end socket.on join

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) {

            /*
            Change the text with the text from textarea when submitted
            */

            mh.modify_html_with_newtext(socket, fs, util, new_text)

        }); // end socket.on return

      socket.on('scroll', function(pattern) {
          console.log('############ in html_apps pattern is :  ' + pattern)
          patt = pattern
          })

      socket.on('scroll_html', function(pos) {
          console.log('############ viewed from server side,  scroll html pos is :  ' + pos)
          scroll_html_pos = pos
          })


}); // sockets.on connection

server.listen(3000);
//Console will print the message
console.log('Server running at http://127.0.0.1:3000/');
