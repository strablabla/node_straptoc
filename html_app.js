var express = require('express')
var path = require("path");
var fs = require('fs');
var nunjucks  = require('nunjucks');
var count = require('./static/js/count_lines');
var util = require('./static/js/util');

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

//--------------  address

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
      fs.readFile('views/strap_small.html', 'utf8', function (err,data) {

              if (err) { return console.log(err); }
              socket.emit('message', data); // send the text read in html file to textarea
              var line_number = count.find_line_of_pattern(data, patt)
              socket.emit('scroll', line_number + '+++' + patt);
              socket.emit('scroll_html', scroll_html_pos)
              if (comment){ console.log('scroll_html_pos ' + scroll_html_pos) }
              socket.emit('pattern', patt); // send the text read in html file to textarea

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

            socket.emit('page_return_to_html','') // send message back for sending the scroll pos.
            console.log('Retrieving the whole text modified... ' + new_text);
            fs.writeFile("views/strap_small.html", new_text, function(err) {
                  if(err) { return console.log(err); }
                  util.save_current_version(new_text)  // save strap_small.html with a date in saved directory
                  console.log("The file views/strap_small.html was modified and saved!");
            }); // end write file
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
