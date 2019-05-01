

exports.emit_from_read = function(socket, count, patt, text, scroll_html_pos){

      /*
      Emit after the data read
      */

      socket.emit('message', text); // send the text read in html file to textarea
      var line_number = count.find_line_of_pattern(text, patt)
      socket.emit('scroll', line_number + '+++' + patt);
      socket.emit('scroll_html', scroll_html_pos)
      //if (comment){ console.log('scroll_html_pos ' + scroll_html_pos) }
      socket.emit('pattern', patt); // send the text read in html file to textarea

}
