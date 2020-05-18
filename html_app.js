const https = require('https')
const http = require('http')
var express = require('express')
var path = require("path");
var open = require('open');
var fs = require('fs');
var nunjucks  = require('nunjucks');      // templating tool..

//-----------------

var util = require('./static/js/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');
var folders = require('./static/js/folders');
var init = require('./static/js/init');
var notes = require('./static/js/notes');
var subtit = require('./static/js/make_subtit');
var new_obj = require('./static/js/new_obj');
var store = require('./static/js/store');
var agenda = require('./static/js/agenda');

//--------------  Server

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('server.crt')
};

var app = express()
var server =  https.createServer(options, app)

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:true

});

init.handle_pages(app)

app.get('/', function(req, res){ res.render('main.html'); });
app.get('/text', function(req, res){ res.render('struct/text.html'); });

//--------------  static addresses

init.static_addr(app, express)

//------------- store

store.walkDir('../../../../../../media/sdata/docs/test', function(filePath) {
  //const fileContents = fs.readFileSync(filePath, 'utf8');
  console.log('############### WalkDir')
  //console.log(filePath, fileContents);
  console.log(filePath)

});

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);
global.patt = ''                 // pattern for scroll position, used in modify.textarea_html
global.html_pos = 0              // position in html view,  used in modify.textarea_html
global.curr_text = '#main'
var comment = false;

//----------- format strings..

String.prototype.format = function () {
  var i = 0, args = arguments;
  return this.replace(/{}/g, function () {
    return typeof args[i] != 'undefined' ? args[i++] : '';
  });
};

subtit.make_sub() // make the subtitles..

var users = {}
num_user = 0

io.sockets.on('connection', function (socket) {
      socket.on('new_user', function(name_user){
          users[socket.id] =  name_user        // parseInt((num_user-1)/2)
          num_user += 1
          console.log('users[socket.id] is ' + users[socket.id])
          io.sockets.emit('add_new_user', { name_new_user: name_user, id_user: socket.id } )
      })

      //------------

      console.log('A client is connected!');
      re.emit_from_read(socket, patt, html_pos)
      util.save_regularly_all()                                                // save the regularly the text..
      socket.on('join', function(data) { socket.emit('scroll', patt) });       // end socket.on join

      new_obj.create(socket, app, io)

      // init.comm_voc(io)                                            //---- comm voc
      // init.latex_voc(io)                                           //---- lateX voc commands
      modify.textarea_html(socket, io, fs, util, curr_text)        //---- textarea to html and viceversa
      folders.deals_with_pdfs(socket)                              //---- pdfs in folders
      notes.handle(socket, 'notes')                                //---- notes
      agenda.handle(socket)                                        //---- agenda

      socket.on('tchat_message',function(mess){
          io.sockets.emit('broadcast_message', { mess : mess.curr_message, name_user : users[socket.id] })
      })
      socket.on('trig_voice',function(name_page){
          io.sockets.emit('trig_voice_recogn', name_page)
          init.comm_voc(io)                                            //---- comm voc
          init.latex_voc(io)                                           //---- lateX voc commands
      })


}); // io.sockets.on connection

var port = 3001
var host = '0.0.0.0' // 127.0.0.1
server.listen(port, host);
var addr = 'https://{}'.format(host) + ':{}/'.format(port) // access through 192.168.0.13..
console.log('Server running at {}'.format(addr));
open(addr,"node-strap");
