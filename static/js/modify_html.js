

exports.modify_html_with_newtext = function(socket, fs, util, new_text){

    console.log('save before changing the text')
    util.save_current_version(new_text,false)  // save before change
    socket.emit('page_return_to_html','') // send message back for sending the scroll pos.
    fs.writeFile("views/strap_small.html", new_text, function(err) {
          if(err) { return console.log(err); }
          console.log('new text modified and saved in views/strap_small.html')
    }); // end write file

}
