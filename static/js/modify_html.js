
function modify_html_with_newtext(io, fs, util, new_text){

    /*

    */

    console.log('save before changing the text')
    util.save_current_version(new_text,false)    // save before change
    io.sockets.emit('page_return_to_html','')   // send message back for sending the scroll pos.
    fs.writeFile("views/main.html", new_text, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in views/main.html')
    }); // end write file

}

exports.textarea_html = function(socket, io, fs, util){

    /*

    */

    socket.on('return', function(new_text) {        // change html with textarea
          modify_html_with_newtext(io, fs, util, new_text)
      }); // end socket.on return

    socket.on('scroll', function(pattern) { global.patt = pattern })
    socket.on('scroll_html', function(pos) { global.html_pos = pos })


}
