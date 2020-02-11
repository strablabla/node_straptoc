/*

Notes

*/

var fs = require('fs');


exports.handle = function(socket){

    socket.on('new_note', function(){               //----- note
        console.log('creating a new note from voice command.. ')
        socket.emit('create_new_note','')
    })
    socket.on('save_note', function(text){               //----- note
        console.log(text)
        fs.readFile('static/notes.json', 'utf8', function (err,notes) {
                if (err) { return console.log(err); }
            var dic_notes = JSON.parse(notes)
            var infos = text.split('!pos')[1]
            console.log("infos.split(' ') " + infos.split(' '))
            var pos = infos.split(' ')[1]
            console.log('pos ' + pos)
            var date = infos.split(' ')[2]
            console.log('date ' + date)
            dic_notes[date] = text.split('!pos')[0] + ' !pos ' + pos
            console.log(dic_notes)
            var dicstring = JSON.stringify(dic_notes)
            fs.writeFile("static/notes.json", dicstring, function(err) {
                  if(err) { return console.log(err); }
                  console.log('saved notes')
            }); // end write file
        }); // end fs.readFile

    })

}
