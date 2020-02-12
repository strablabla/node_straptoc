/*

Notes

*/



var fs = require('fs');



exports.handle = function(socket){

    socket.on('ask_notes', function(){

      fs.readFile('static/notes.json', 'utf8', function (err,notes) {
            if (err) { return console.log(err); }
             socket.emit('all_notes',notes)

          })
        })

    socket.on('new_note', function(){               //----- note triggered by voice..
        console.log('creating a new note from voice command.. ')
        socket.emit('create_new_note','')
    })

    socket.on('save_note', function(text){               //----- note
        fs.readFile('static/notes.json', 'utf8', function (err,notes) {
                if (err) { return console.log(err); }
            try{
                var dic_notes = JSON.parse(notes)
                var infos = text.split('!id')[1]
                console.log(infos)
                var date = infos.split(' ').slice(-1)[0]

                var id = infos.split(date)[0].trim()
                console.log(id)

                console.log(date)
                dic_notes[id] = text.split('!id')[0] + ' !date ' + date
                var dicstring = JSON.stringify(dic_notes)
                console.log(dic_notes)
                console.log(dicstring)


                  fs.writeFile("static/notes.json", dicstring, function(err) {
                        if(err) { return console.log(err); }
                        console.log('saved notes')
                  }); // end write file
                  socket.emit('all_notes', dicstring)

            }catch(err){}


        }); // end fs.readFile

    })

}
