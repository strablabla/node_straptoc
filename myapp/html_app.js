var express = require('express')
var path = require("path");
var fs = require('fs');
// var iframe = require('iframe')
//
// // creates a new iframe and appends it to the container
// frame = iframe({ container: document.querySelector('#strap') })


var app = express()
var server = require('http').createServer(app);

app.get('/',function(req,res){
      res.sendFile(path.join(__dirname + '/views/strap_small.html'));
  });

app.get('/text',function(req,res){
      res.sendFile(path.join(__dirname + '/views/text.html'));
  });

app.use(express.static('public'));

// Loading socket.io
var io = require('socket.io')(server);
// When a client connects, we note it in the consol

function count_empty_before_pattern(text, pattern) {

    /*
    Count the number of empty lines until the pattern.
    */

    var cut_text = text.split(pattern)[0]
    return (cut_text.match(/(^[ \t]*(\n|$))/gm) || []).length;
}

function count_empty_lines_tot(text, pattern) {

    /*
    Count the number of empty lines until the pattern.
    */
    return (text.match(/(^[ \t]*(\n|$))/gm) || []).length;
}

function find_line_of_pattern(text, pattern){

      /*
      Find the line index of the given pattern..
      */

      console.log('#########################################')
      var line_number = 0
      var tot_lines = 0
      var astring = text.split('\n')
      var count = true
      astring.forEach(function (line, number) {

          if( line.match(pattern) == null & count){
                console.log('##--## ' + line)
                line_number += 1
          }
          else{ count = false }
          tot_lines += 1

      });
      //
      var nb_empty_lines_tot = count_empty_lines_tot(text, pattern)
      var nb_empty_lines = count_empty_before_pattern(text, pattern)    // number of empty lines before pattern
      line_number += nb_empty_lines                                     // full line plus empty lines
      tot_lines += nb_empty_lines_tot
      console.log('############## line_number ############' + line_number)
      console.log('############## tot_lines ###############' + tot_lines)
      var ratio = line_number/tot_lines

      console.log('############## ratio ###############' + ratio)

      return line_number

}

function make_date(){

      /*
      Build the text date
      */

      var date = new Date()
      var minute = date.getMinutes();
      var hour = date.getHours();
      var day = date.getDate();
      var month = date.getMonth();
      var year = date.getFullYear();
      var txt_date = [year, month, day, hour, minute].join('_')

      return txt_date

}

function save_current_version(data){

      /*
      Save the current strap_small.html in a file with the date
      */

      txt_date = make_date()
      console.log('saving the text with save_current_version !!!! ')
      //console.log(data)
      fs.writeFile("views/saved/strap_small_old_" + txt_date + ".html", data, function(err) {

            if(err) { return console.log(err); }
            console.log("The file was saved!");

      }); // end writeFile
} // end save_current_version

function emit_ratio(){

      /*
      Scrolling ratio
      */

      fs.readFile('views/scroll.json', 'utf8', function (err, ratio) {
          if (err) { return console.log(err); }
          console.log("ratio from readFile is : " + ratio);
          io.sockets.emit('scroll', ratio); // send the text to the client side.
      });  // end fs.readFile

}

function save_regularly(){

      /*
      Saving regularly the text
      */

      setInterval(function() { // Save the current strap version.
              // Do something every 1 minute (60000 s)

              fs.readFile('views/strap_small.html', 'utf8', function (err,data) {
                      if (err) { return console.log(err); }
                      save_current_version(data)
                  });   // end fs.readFile views/strap_small.html
        }, 300000);   // 5 min intervall

}

var patt = ''

var comment = false;

io.sockets.on('connection', function (socket) {

    console.log('A client is connected!');
    fs.readFile('views/strap_small.html', 'utf8', function (err,data) {
            if (err) { return console.log(err); }
            //io.sockets.emit('message', data); // send the text read in html file to textarea
            socket.emit('message', data); // send the text read in html file to textarea
            if (comment){ console.log('blablabala in readFile !! ') }
            // console.log('patt before emit !! ' + patt)
            // socket.emit('scroll', patt);
            // console.log('patt after emit !! ' + patt)


            var line_number = find_line_of_pattern(data, patt)
            if (comment){ console.log('line_number after find_line_of_pattern !! ' + line_number) }
            socket.emit('scroll', line_number);
            if (comment){ console.log('just after scrolllll !! ') }

        }); // end fs.readFile

    save_regularly()

    socket.on('join', function(data) {
        //var a = 1
        console.log('client sent a message... ' + data);
        console.log('value of patt on server side ... ' + patt);
        socket.emit('scroll',patt)
      }); // end socket.on join

    //-------------------------------- From textarea to html

    socket.on('return', function(data) {       // change the text with the text from textarea
          console.log('Retrieving the whole text modified... ' + data);
          fs.writeFile("views/strap_small.html", data, function(err) {

                if(err) { return console.log(err); }
                var ratio = find_line_of_pattern(data, '1/1/16')
                console.log(ratio)
                //io.sockets.emit('scroll', ratio);
                //socket.emit('scroll', ratio );
                save_current_version(data)  // save strap_small.html with a date in saved directory
                console.log("The file views/strap_small.html was modified and saved!");

          }); // end write file
      }); // end socket.on return

      socket.on('scroll', function(pattern) {
          console.log('############ in html_apps pattern is :  ' + pattern)
          patt = pattern
        })

        socket.on('pos_scroll', function() {
            console.log('sending scroll info back !! ')
            socket.emit('scroll', patt); // send the text read in html file to textarea
        })


}); // sockets.on connection

server.listen(3000);
