/*

Utilities

*/

var fs = require('fs');

function make_date(depth){

      /*
      Build the text date
      */

      var date = new Date()
      var sec = date.getSeconds();
      var minute = date.getMinutes();
      var hour = date.getHours();
      var day = date.getDate();
      var month = date.getMonth();
      var year = date.getFullYear();
      var txt_date = [year, month, day, hour, minute, sec]
      txt_date = txt_date.slice(0,depth).join('_')

      return txt_date

}

exports.save_current_version = function(data, with_date, name){

      /*
      Save the current main.html in views/saved/main_old.html
      */

      var basename = 'views/saved/'+ name +'_old'
      txt_date = make_date(5)  // 6 --> sec
      if ( with_date ){             // case where it is saved with a date..
          //console.log('txt_date ' + txt_date)
          var namefile = basename + '_' + txt_date + ".html"
          list_saved.push(txt_date)
          // console.log('list_saved.length ' + list_saved.length)
          // console.log('lim_nb_saved ' + lim_nb_saved)
          // console.log(list_saved)
          while (list_saved.length > lim_nb_saved){
              //console.log('removing the oldest element ' + list_saved[0] + '!!!')
              var addr_removed = basename + '_' + list_saved[0] + '.html'
              try{
                  fs.unlinkSync(addr_removed)
                  console.log('addr_removed is ' + addr_removed)
              }
              catch(err){
                  console.log('cannot erase ' + addr_removed)
              }
              var index = list_saved.indexOf(list_saved[0]);
              // console.log('index is ' + index)
              // console.log('list_saved.length ' + list_saved.length)
              if (index > -1) {
                list_saved.splice(index, 1);
                //console.log('list_saved in while ' + list_saved)
              }
              //console.log('list_saved  ' + list_saved)
          }
      }
      else{ var namefile = basename + ".html" }
      fs.writeFile( namefile, data, function(err) {
            if(err) { return console.log(err); }
            console.log("The file was saved as {} !".format(namefile));
      });    // end writeFile
}           // end save_current_version

function save_regularly(name){

      /*
      Saving regularly views/ + name + .html
      */

      list_saved = []        // global
      lim_nb_saved = 3       // max versions saved
      var min_interv = 3     // interval in minute

      console.log('reading before saving in utils.js.. ')
      console.log('name is ' + name)

      var addr = 'views/md/' + name + '.html'
      console.log('addr is ' + addr)

      setInterval(function() {
              fs.readFile(addr, 'utf8', function (err,data) {
                      if (err) { return console.log(err); }
                      console.log(make_date(6)) // 6 --> sec
                      console.log('inside setInterval, name.. is ' + name)
                      exports.save_current_version(data, true, name) // with date
                  });   // end fs.readFile
        }, parseInt(min_interv*60*1000)); // 300000 5 min  //10000 10 sec //600000 10 min

}

exports.save_regularly_all = function(){

    /*
    Saving regularly markdown files..
    */

    try{
        for (i in list_md){
            save_regularly (list_md[i])
        }
    }catch(err){
        console.log('saving did not work ')
    }

}
