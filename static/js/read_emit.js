/*

*/

var fs = require('fs');
var count = require('./count_lines'); 

function emit_from_read_txt (socket, patt, scroll_html_pos, id){

      /*

      Emit after the data read for a given name and channel..

      */

      name = id[0]
      channel = id[1]

      console.log('just before reading in read_emits..  ' )

      fs.readFile('views/md/' + name + '.html', 'utf8', function (err,text) {
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
      emit_from_read_txt (socket, patt, scroll_html_pos, dic_md_name[curr_text] )

}
