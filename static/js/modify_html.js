
function modify_html_with_newtext(io, fs, util, new_text, name){

    /*
    Save the new version of the text..
    */

    console.log('save before changing the text')
    util.save_current_version(new_text, false, name)      // save before change
    io.sockets.emit('page_return_to_html','')       // send message back for sending the scroll pos.
    var addr = "views/md/" + name + ".html"
    fs.writeFile(addr, new_text, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in ' + addr)
    }); // end write file

}

exports.textarea_html = function(socket, io, fs, util, currtxt){

    /*
    Handle text in textarea..
    */

    socket.on('return', function(new_text) {        // change html with textarea
          modify_html_with_newtext(io, fs, util, new_text, dic_md[curr_text])
          console.log("###### currtxt is " + currtxt)
          console.log("######%%%##### curr_text is " + curr_text)
      }); // end socket.on return

    socket.on('scroll', function(pattern) { global.patt = pattern })
    socket.on('scroll_html', function(pos) { global.html_pos = pos })
    socket.on('curr_txt', function(currtxt) {
            console.log("currtxt is " + currtxt)
            global.curr_text = currtxt     // changing current_text..
    })


}
