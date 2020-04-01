
function modify_html_with_newtext(io, fs, util, new_text, name){

    /*

    */

    console.log('save before changing the text')
    util.save_current_version(new_text, false, name)      // save before change
    io.sockets.emit('page_return_to_html','')       // send message back for sending the scroll pos.
    var addr = "views/" + name + ".html"
    fs.writeFile(addr, new_text, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in ' + addr)
    }); // end write file

}

exports.textarea_html = function(socket, io, fs, util, name){

    /*

    */

    socket.on('return', function(new_text) {        // change html with textarea
          dtxt = {'main':'main', 'text_done':'done'}
          modify_html_with_newtext(io, fs, util, new_text, dtxt[name])
          console.log("###### name is " + name)
          console.log("###### curr_text is " + curr_text)
      }); // end socket.on return

    socket.on('scroll', function(pattern) { global.patt = pattern })
    socket.on('scroll_html', function(pos) { global.html_pos = pos })
    socket.on('curr_txt', function(currtxt) {
            console.log("currtxt is " + currtxt)
            global.curr_text = currtxt
    })


}
