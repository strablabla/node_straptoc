
var new_page = require('./new_page'); // /static/js

exports.create = function(socket, app, io){

  socket.on('new_page', function(name_page) { new_page.create_new_page( app, name_page, io ) }); // new page
  socket.on('create_new_note', function() { socket.emit('create_new_note','') });

}
