var express = require('express')
var path = require("path");
var open = require('open');
var fs = require('fs');
var nunjucks  = require('nunjucks');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');

//--------------  Server

var app = express()
var server = require('http').createServer(app);

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true
    // echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
});

app.get('/', function(req, res){ res.render('strap_small.html'); });
app.get('/text', function(req, res){ res.render('text.html'); });

//--------------  static addresses
app.use(express.static('../../Téléchargements'));
app.use(express.static('public'));
app.use(express.static('scripts'));
app.use(express.static('lib'));

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);
var patt = '' // pattern for scroll position
var scroll_html_pos = 0 //
var comment = false;

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
      util.save_regularly() // save the regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) }); // end socket.on join

      //-------------------------------- From textarea to html

      socket.on('return', function(new_text) {        // change html with textarea
            modify.modify_html_with_newtext(io, fs, util, new_text)
        }); // end socket.on return

      socket.on('scroll', function(pattern) { patt = pattern })
      socket.on('scroll_html', function(pos) { scroll_html_pos = pos })

      socket.on('folder_extract', function(name_folder) {
             console.log('Received the address ' + name_folder)
             deals_with_folder(socket,name_folder)

        })


}); // sockets.on connection

function deals_with_folder(socket,name_folder){

      var count_pdf = name_folder.split('§§')[1]
      var name_folder = name_folder.split('§§')[0]

      var strap_addr = ''
      fs.readdir(name_folder, (err, files) => {
          strap_addr +=  count_pdf + '§§'
          files.forEach(file => {
             console.log(file);
             strap_addr += file + '\n'
        });

        console.log('######### sending ' + strap_addr)
        socket.emit('folder_extract', strap_addr)
      });

}

var port = 3001
var host = '0.0.0.0' // 127.0.0.1
server.listen(port, host);
var addr = 'http://{}'.format(host) + ':{}/'.format(port) // access through 192.168.0.13..
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
