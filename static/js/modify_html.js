

exports.modify_html_with_newtext = function(socket, fs, util, new_text){

    socket.emit('page_return_to_html','') // send message back for sending the scroll pos.
    fs.writeFile("views/strap_small.html", new_text, function(err) {
          if(err) { return console.log(err); }
          util.save_current_version(new_text)  // save strap_small.html with a date in saved directory
          console.log("The file views/strap_small.html was modified and saved!");
    }); // end write file

}
