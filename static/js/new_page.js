/*

New page

*/

var fs = require('fs');
var init = require('./init');


exports.create_new_page = function(app, name_page, io){

    make_new_md(name_page)
    io.sockets.emit('load_new_page', '')
    init.handle_pages(app)


 }


function make_md_text(title){

    var md_text = function(){/*

# inserted_title

* First sentence..

*/}.toString().slice(14,-3).replace('inserted_title',title)

return md_text

}

function make_new_md(title){

  /*

   Create a new md file

  */

    var md_text = make_md_text(title)
    console.log(md_text)
    var addr = 'views/md/' + title + '_md.html'
    fs.writeFile(addr, md_text, function(err) {   // create the template
          if(err) { return console.log(err); }
          console.log("The file was saved at {} !".format(addr));
    });    // end writeFile

}
