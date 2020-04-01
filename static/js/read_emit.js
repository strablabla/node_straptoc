/*

*/

var fs = require('fs');
var count = require('./count_lines'); // ./static/js/

function emit_from_read_txt (socket, patt, scroll_html_pos, name, channel){

      /*
      Emit after the data read for a given name and channel..
      */

      fs.readFile('views/' + name + '.html', 'utf8', function (err,text) {
              if (err) { return console.log(err); }

              socket.emit(channel, text); // send the text read in html file to textarea
              var line_number = count.find_line_of_pattern(text, patt)
              var json_line_patt = JSON.stringify( {'line' : line_number, 'pattern' : patt} );
              socket.emit('scroll', json_line_patt);            // send line number and pattern..
              socket.emit('scroll_html', scroll_html_pos)       // scroll position in the html..
              socket.emit('pattern', patt);                     // send the pattern

        }); // end fs.readFile

}
exports.emit_from_read = function(socket, patt, scroll_html_pos){

      /*
      Emit after the data read toward different channels..
      */

      console.log('in read_emit.js, curr_text is ' + curr_text)
      if (curr_text == 'main'){emit_from_read_txt (socket, patt, scroll_html_pos, 'main', 'main_text')}
      else if (curr_text == 'text_done'){emit_from_read_txt (socket, patt, scroll_html_pos, 'done', 'text_done')}
      //emit_from_read_txt (socket, patt, scroll_html_pos, 'main', 'main_text')


}
