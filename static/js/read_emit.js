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

      console.log('[read_emit] emit_from_read_txt called', {
          patt: patt,
          scroll_html_pos: scroll_html_pos,
          name: name,
          channel: channel
      })

      console.log('just before reading in read_emits..  ' )

      fs.readFile('views/md/' + name + '.html', 'utf8', function (err,text) {
              if (err) { return console.log(err); }

              console.log('[read_emit] File read successful, text length:', text.length);

              socket.emit(channel, text); // send the text read in html file to textarea

              // Parse pattern if it's JSON containing pattern + context
              var main_pattern = patt;
              var patt_prev = null;
              var patt_next = null;

              try {
                  var pattern_data = JSON.parse(patt);
                  if (pattern_data.pattern) {
                      console.log('[read_emit] Pattern is JSON, extracting components');
                      main_pattern = pattern_data.pattern;
                      patt_prev = pattern_data.pattern_prev;
                      patt_next = pattern_data.pattern_next;
                  }
              } catch (e) {
                  // Not JSON, use pattern as-is and check globals
                  console.log('[read_emit] Pattern is not JSON, using as plain string');
                  patt_prev = global.patt_prev || null;
                  patt_next = global.patt_next || null;
              }

              console.log('[read_emit] About to find line with:', {
                  pattern: main_pattern,
                  pattern_prev: patt_prev,
                  pattern_next: patt_next
              });

              var line_number = count.find_line_of_pattern(text, main_pattern, patt_prev, patt_next)
              console.log('[read_emit] Line number found for pattern "' + main_pattern + '" with context:', line_number);
              console.log('[read_emit] Type of line_number:', typeof line_number);

              var json_line_patt = JSON.stringify( {'line' : line_number, 'pattern' : main_pattern} );
              console.log('[read_emit] Emitting scroll with JSON:', json_line_patt);

              socket.emit('scroll', json_line_patt);            // send line number and pattern..
              socket.emit('scroll_html', scroll_html_pos)       // scroll position in the html..
              socket.emit('pattern', main_pattern);             // send the pattern

              console.log('[read_emit] All socket events emitted');

        }); // end fs.readFile

}
exports.emit_from_read = function(socket, patt, scroll_html_pos){

      /*

      Emit after the data read toward different channels..

      */

      console.log('[read_emit] emit_from_read called', {
          patt: patt,
          scroll_html_pos: scroll_html_pos,
          curr_text: global.curr_text
      })
      console.log('in read_emit.js, global.curr_text is ' + global.curr_text)
      console.log('[read_emit] global.dic_md_name is', global.dic_md_name)
      console.log('[read_emit] Looking up dic_md_name[' + global.curr_text + ']:', global.dic_md_name[global.curr_text])
      emit_from_read_txt (socket, patt, scroll_html_pos, global.dic_md_name[global.curr_text] )

}
