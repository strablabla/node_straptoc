/*

Handle folders.

*/


var fs = require('fs');

exports.deals_with_folder = function(socket,name_folder){

      var count_pdf = name_folder.split('§§')[1]
      var name_folder = name_folder.split('§§')[0]

      var strap_addr = ''
      fs.readdir(name_folder, (err, files) => {
          strap_addr +=  count_pdf + '§§'
          files.forEach(file => {
             console.log(file);
             strap_addr += file + '\n'
        });

        console.log('######### sending ' + strap_addr)
        socket.emit('folder_extract', strap_addr)
      });

}

exports.deals_with_list_folders = function(socket,name_folder){

      var count_pdf = name_folder.split('§§')[1]
      var name_folder = name_folder.split('§§')[0]
      console.log('######################################')
      var strap_addr = ''
      fs.readdir(name_folder, (err, files) => {
          strap_addr +=  count_pdf + '§§'
          files.forEach(file => {
             console.log(file);
             strap_addr += file + '\n'
        });

        console.log('######### before sending for list ' + strap_addr)
        socket.emit('list_folders', strap_addr)
      });

}
