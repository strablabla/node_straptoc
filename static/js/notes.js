/*

Notes

*/



var fs = require('fs');


function modify_notes(dic_notes,text){

        var infos = text.split('!id')[1]
        console.log('**** infos to save *****' + infos)
        var date = infos.split(' ').slice(-1)[0]  // retrieve the date

        var id = infos.split(date)[0].trim() // retrieve the id..
        console.log('****** id ****** ' + id)

        console.log('****** date ****** ' + date)
        dic_notes[id] = text.split('!id')[0] + ' !date ' + date

        return dic_notes

}

exports.handle = function(socket, targ){

    var targ_json = 'static/' + targ + '.json'
    var all_targ = 'all_' + targ
    socket.on('ask_' + targ, function(){

        fs.readFile(targ_json, 'utf8', function (err,notes) {
              if (err) { return console.log(err); }
               socket.emit(all_targ, notes)

            })
          })

    socket.on('save_' + targ, function(text){               //----- note
        fs.readFile(targ_json, 'utf8', function (err,notes) {
                if (err) { return console.log(err); }
            try{
                var dic_notes = JSON.parse(notes)

                dic_notes = modify_notes(dic_notes,text)

                var dicstring = JSON.stringify(dic_notes)
                console.log(dic_notes)
                console.log(dicstring)


                  fs.writeFile(targ_json, dicstring, function(err) {
                        if(err) { return console.log(err); }
                        console.log('saved ' + targ)
                  }); // end write file
                  socket.emit(all_targ, dicstring)

            }catch(err){}


        }); // end fs.readFile

    })

    socket.on('new_note', function(){               //----- note triggered by voice..
        console.log('creating a new note from voice command.. ')
        socket.emit('create_new_note','')
    })

}
