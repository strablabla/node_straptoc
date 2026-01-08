
function modify_html_with_newtext(io, fs, util, new_text, name){

    /*

    Save the new version of the text..

    */

    console.log('save before changing the text')
    util.save_current_version(new_text, false, name + '_before_change')      // save before change
    io.sockets.emit('page_return_to_html', name)       //
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

    socket.on('scroll', function(pattern) {
        console.log('[modify_html] Received scroll event with pattern:', pattern)
        global.patt = pattern
        console.log('[modify_html] global.patt set to:', global.patt)
    })

    socket.on('scroll_html', function(pos) {
        console.log('[modify_html] Received scroll_html event with position:', pos)
        global.html_pos = pos
        console.log('[modify_html] global.html_pos set to:', global.html_pos)
    })

    socket.on('curr_txt', function(currtxt) {
        console.log('[modify_html] Received curr_txt event:', currtxt)
        console.log('[modify_html] Previous global.curr_text was:', global.curr_text)
        global.curr_text = currtxt     // changing current_text..
        console.log('[modify_html] global.curr_text now set to:', global.curr_text)
    })


}
