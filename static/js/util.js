/*

Utilities

*/

var fs = require('fs');

function make_date(){

      /*
      Build the text date
      */

      var date = new Date()
      var minute = date.getMinutes();
      var hour = date.getHours();
      var day = date.getDate();
      var month = date.getMonth();
      var year = date.getFullYear();
      var txt_date = [year, month, day, hour, minute].join('_')

      return txt_date

}

exports.save_current_version = function(data,with_date){

      /*
      Save the current main.html in views/saved/main_old.html
      */

      var basename = 'views/saved/main_old'
      txt_date = make_date()
      if ( with_date ){
          var namefile = basename + '_' + txt_date + ".html"
          list_saved.push(txt_date)
          if (list_saved.length > lim_nb_saved){
              list_saved = list_saved.slice(1,-1)  // removing the oldest element
          }
      }
      else{ var namefile = basename + ".html" }
      fs.writeFile( namefile, data, function(err) {
            if(err) { return console.log(err); }
            console.log("The file was saved as {} !".format(namefile));
            //console.log('list_saved.slice(-1)[0] is {} '.format(list_saved.slice(-1)[0]))
      });    // end writeFile
}         // end save_current_version

exports.save_regularly = function(){

      /*
      Saving regularly views/main.html
      */

      list_saved = []     // global
      lim_nb_saved = 10   // max versions saved
      var min_interv = 5  // intervall in minute
      setInterval(function() {
              fs.readFile('views/main.html', 'utf8', function (err,data) {
                      if (err) { return console.log(err); }
                      exports.save_current_version(data,true) // with date
                  });   // end fs.readFile
        }, parseInt(min_interv*60*1000)); // 300000 5 min  //10000 10 sec //600000 10 min

}
