const https = require('https')
const http = require('http')
const express = require('express')
const path = require("path");
const open = require('open');
const fs = require('fs');
const yaml = require('js-yaml');
const nunjucks  = require('nunjucks');      // templating tool..

//-----------------

var util = require('./lib/util');
var re = require('./static/js/read_emit');
var modify = require('./static/js/modify_html');
var folders = require('./static/js/folders');
var init = require('./lib/init');
var notes = require('./lib/notes');
var subtit = require('./static/js/make_subtit');
var new_obj = require('./static/js/new_obj');
var store = require('./static/js/store');
var agenda = require('./static/js/agenda');
var config = require('./lib/config');
var annotations = require('./lib/annotations');
var reminders = require('./lib/reminders');

//--------------  Load configuration

// Load server configuration from config.yaml
const configPath = './static/config.yaml';
let serverConfig = {
  port: 3001,
  host: '0.0.0.0',
  ssl: {
    key: 'key.pem',
    cert: 'server.crt'
  }
};

try {
  const configFile = fs.readFileSync(configPath, 'utf8');
  const fullConfig = yaml.load(configFile);
  if (fullConfig.server) {
    serverConfig = {
      port: fullConfig.server.port || 3001,
      host: fullConfig.server.host || '0.0.0.0',
      ssl: {
        key: (fullConfig.server.ssl && fullConfig.server.ssl.key) || 'key.pem',
        cert: (fullConfig.server.ssl && fullConfig.server.ssl.cert) || 'server.crt'
      }
    };
  }
  console.log('Server configuration loaded from config.yaml');
} catch (err) {
  console.warn('Warning: Could not load server config from config.yaml, using defaults');
  console.warn('Error:', err.message);
}

//--------------  Server

const options = {
  key: fs.readFileSync(serverConfig.ssl.key),
  cert: fs.readFileSync(serverConfig.ssl.cert)
};

var app = express()
var server =  https.createServer(options, app)

nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch:false,
    noCache: true

});

//--------------  static addresses (MUST be before routes)

// Mount lib directory specifically at /lib path
app.use('/lib', express.static('lib'))

init.static_addr(app, express)

init.handle_pages(app, function() {
    // Callback: handle_pages finished, global.list_md is now populated
    console.log('[html_app] handle_pages completed, calling save_regularly_all');
    util.save_regularly_all();
})

app.get('/', function(req, res){ res.render('main.html'); });
app.get('/text', function(req, res){ res.render('struct/text.html'); });

db = init.data_base()

db.run(
  `INSERT INTO utilisateurs (nom, email) VALUES (?, ?)`,
  ['Alice', 'alice@example.com'], // Email existant
  function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        console.log('this email is yet registered.');
        //
      } else {
        console.error('Erreur unexpected SQL :', err.message);
      }
    } else {
      console.log(`user inserted with ID: ${this.lastID}`);
    }
  }
);

db.all(`SELECT * FROM utilisateurs`, (err, rows) => {
  console.log(rows)
});

//--------------  websocket

// Loading socket.io
var io = require('socket.io')(server);
global.patt = ''                 // pattern for scroll position, used in modify.textarea_html
global.html_pos = 0              // position in html view,  used in modify.textarea_html
global.curr_text = '#main'
var comment = false;

// ========== INTERCEPT CONSOLE FOR DEBUG TERMINAL ==========
// Store original console methods
var originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info
};

// Intercept console methods and broadcast to clients
console.log = function() {
  originalConsole.log.apply(console, arguments);
  var message = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  io.sockets.emit('terminal_output', '[LOG] ' + message);
};

console.warn = function() {
  originalConsole.warn.apply(console, arguments);
  var message = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  io.sockets.emit('terminal_output', '[WARN] ' + message);
};

console.error = function() {
  originalConsole.error.apply(console, arguments);
  var message = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  io.sockets.emit('terminal_output', '[ERROR] ' + message);
};

console.info = function() {
  originalConsole.info.apply(console, arguments);
  var message = Array.prototype.slice.call(arguments).map(function(arg) {
    return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
  }).join(' ');
  io.sockets.emit('terminal_output', '[INFO] ' + message);
};

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

// NOTE: save_regularly_all() is now called in handle_pages callback (line 85)
// to ensure global.list_md is populated before setting up autosave timers

// Setup annotation handlers ONCE (not per connection)
annotations.setupAnnotationHandlers(io)                              //---- annotations

// Set app instance for config module
config.setApp(app)

io.sockets.on('connection', function (socket) {
      socket.on('new_user', function(name_user){
          users[socket.id] =  name_user        // parseInt((num_user-1)/2)
          num_user += 1
          console.log('users[socket.id] is ' + users[socket.id])
          io.sockets.emit('add_new_user', { name_new_user: name_user, id_user: socket.id } )
      })

      //------------

      console.log('A client is connected!');
      console.log('[html_app] Client connected with initial globals:', {
          global_patt: global.patt,
          global_html_pos: global.html_pos,
          global_curr_text: global.curr_text
      });
      // NOTE: emit_from_read is now called in 'join' handler below
      // This ensures global values are updated by earlier socket events first

      socket.on('join', function(data) {
          console.log('[html_app] Received join event');
          console.log('[html_app] Current globals at join time:', {
              global_patt: global.patt,
              global_html_pos: global.html_pos,
              global_curr_text: global.curr_text
          });

          // Now call emit_from_read with potentially updated globals
          // emit_from_read will handle all the socket emissions (scroll, scroll_html, pattern)
          re.emit_from_read(socket, global.patt, global.html_pos);
      });       // end socket.on join

      socket.on('curr_txt', function(currtxt) {
          console.log('[html_app] Received curr_txt:', currtxt);
          global.curr_text = currtxt;
          console.log('[html_app] Updated global.curr_text to:', global.curr_text);
          // Send confirmation back to client
          socket.emit('globals_updated');
          console.log('[html_app] Sent globals_updated confirmation to client');
      });       // end socket.on curr_txt

      socket.on('scroll', function(patt) {
          console.log('[html_app] Received scroll pattern:', patt);
          global.patt = patt;
          console.log('[html_app] Updated global.patt to:', global.patt);
      });       // end socket.on scroll

      socket.on('scroll_html', function(pos) {
          console.log('[html_app] Received scroll_html position:', pos);
          global.html_pos = pos;
          console.log('[html_app] Updated global.html_pos to:', global.html_pos);
      });       // end socket.on scroll_html

      new_obj.create(socket, app, io)

      modify.textarea_html(socket, io, fs, util, curr_text)        //---- textarea to html and viceversa
      folders.deals_with_pdfs(socket)                              //---- pdfs in folders
      notes.handle(socket, 'notes')                                //---- notes
      agenda.handle(socket)                                        //---- agenda
      config.handle(io,socket)

      socket.on('tchat_message',function(mess){
          io.sockets.emit('broadcast_message', { mess : mess.curr_message, name_user : users[socket.id] })
      })

      socket.on('trig_voice',function(name_page){
          io.sockets.emit('trig_voice_recogn', name_page)
          init.comm_voc(io)                                            //---- comm voc
          init.latex_voc(io)                                           //---- lateX voc commands
          init.drawing_state(io)                                       //---- drawing color
      })
      socket.on('ask_color_tags',function(){
          init.color_tags(io)
      })
      socket.on('ask_pages_data',function(){
          init.pages_data(io)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected');
        delete users[socket.id];
        socket.removeAllListeners(); //
      });


}); // io.sockets.on connection

// Use configuration from config.yaml
var port = serverConfig.port;
var host = serverConfig.host;
server.listen(port, host);
var addr = 'https://{}'.format(host) + ':{}/'.format(port) // access through 192.168.0.13..
console.log('Server running at {}'.format(addr));
console.log('Port: {} | Host: {}'.format(port, host));
open(addr,"node-strap");

// Start reminder system
reminders.start(io);

// Listen for reminders config changes to restart the system
io.sockets.on('connection', function(socket) {
    socket.on('reminders_config_changed_internal', function(data) {
        var config = JSON.parse(data);
        reminders.restart(io, config);
    });
});
