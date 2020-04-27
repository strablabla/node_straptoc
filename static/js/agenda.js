/*

Agenda

*/



var fs = require('fs');


function date_day(){

      /*

      Build the text date

      */

      var date = new Date()
      var day = date.getDate();
      var month = date.getMonth() + 1;
      var year = date.getFullYear();
      var txt_date = [year, month, day].join('_').slice(2)

      return txt_date

}

function modify_agenda(dic_agenda, text){

      var year = text.split('_')[0]
      var month = text.split('_')[1]
      var day = text.split('_')[2]
      var info_day = text.split('_')[3]
      var new_agenda_infos = JSON.parse(info_day)

      //-----

      if(dic_agenda[year] == undefined){ dic_agenda[year] = {} }
      else{ console.log('dic_agenda[year] is ' + dic_agenda[year]) }
      if(dic_agenda[year][month] == undefined){ dic_agenda[year][month] = {} }
      if(dic_agenda[year][month][day] == undefined){ dic_agenda[year][month][day] = {} }
      dic_agenda[year][month][day] = new_agenda_infos

      return dic_agenda

}

exports.handle = function(socket){

    socket.on('ask_agenda', function(){

        fs.readFile('static/agenda.json', 'utf8', function (err,agenda) {
              if (err) { return console.log(err); }
               socket.emit('all_agenda', agenda)

            })
          })

    // socket.on('new_note', function(){               //----- note triggered by voice..
    //     console.log('creating a new note from voice command.. ')
    //     socket.emit('create_new_note','')
    // })

    socket.on('save_agenda', function(text){               //----- note
        fs.readFile('static/agenda.json', 'utf8', function (err, agenda) {
                if (err) { return console.log(err); }
            try{
                var dic_agenda = JSON.parse(agenda)

                dic_agenda = modify_agenda(dic_agenda, text)

                var dicstring = JSON.stringify(dic_agenda) // return to string..


                console.log(dic_agenda)
                console.log(dicstring)


                fs.writeFile("static/agenda.json", dicstring, function(err) {
                        if(err) { return console.log(err); }
                        console.log('saved agenda')
                    }); // end write file
                socket.emit('all_agenda', dicstring) // reemit no

            }catch(err){}


        }); // end fs.readFile

    })

}
