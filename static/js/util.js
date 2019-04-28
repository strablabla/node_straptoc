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

exports.save_current_version = function(data){

      /*
      Save the current strap_small.html in a file with the date
      */

      txt_date = make_date()
      console.log('saving the text with save_current_version !!!! ')
      //console.log(data)
      fs.writeFile("views/saved/strap_small_old_" + txt_date + ".html", data, function(err) {

            if(err) { return console.log(err); }
            console.log("The file was saved!");

      }); // end writeFile
} // end save_current_version

exports.save_regularly = function(){

      /*
      Saving regularly views/strap_small.html
      */

      setInterval(function() {
              fs.readFile('views/strap_small.html', 'utf8', function (err,data) {
                      if (err) { return console.log(err); }
                      exports.save_current_version(data)
                  });   // end fs.readFile
        }, 300000);   // 5 min intervall

}

exports.tab_textarea = function(){

      /*
      Transforming TAB in four spaces
      */

      $('#comment').keydown(function (e) {
          var keyCode = e.keyCode || e.which;

          if (keyCode === 9) {   // Four spaces for TAB
              e.preventDefault();
              var start = this.selectionStart;
              var end = this.selectionEnd;
              // set textarea value to: text before caret + tab + text after caret
              spaces = "    ";
              this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
              // put caret at right position again
              this.selectionStart = this.selectionEnd = start + spaces.length;
          }
        });

} // end tab_textarea

// function wrapAsLink(){
//
//       /*
//       Passing from http to markdown notation
//       */
//
//       var textarea = $('#comment');
//       var len = textarea.value.length;
//       var start = textarea.selectionStart;
//       var end = textarea.selectionEnd;
//       var sel = textarea.value.substring(start, end);
//       alert(sel)
//       var subsel = sel.split('\/')
//       alert(subsel)
//       var name = '[' + subsel.slice(-1)[0].slice(0,-5) + ']'
//       var replace = name + '(' + sel + ')'
//       alert(replace)
//       textarea.value = textarea.value.substring(0,start) + replace +
//       textarea.value.substring(end,len);
//
// }
