/*

Textarea edition

*/

function wrap_hyperlink(aster, sel, suff){

      /*

      markdown syntax for hyperlink

      */

      var subsel = sel.split('\/')
      if (subsel.slice(-1)[0].length < 5){
         subsel = sel.split('\/').slice(-2,-1)                   // case final '/'
      }
      else{
          subsel = subsel.slice(-1)                              // case no '/' at the end
      }
      var subsubsel = subsel[0].split('.html')[0]                // remove .html for making the name
      var name = '[' + subsubsel + suff + ']'                           // name
      var replace = aster + '* ' + name + '(' + sel + ')' +'\n'  // final line

      return replace

}

function make_date(depth){

      /*

      Build the text date,
      year, month, day, hour, minute, sec
      depth = 6 --> goes to the seconds..

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

function find_suffix(expr){

     var suff = ''
     if (expr.match(/youtube/)){suff = ' ;;'}
     else if (expr.match(/(\.mp4)$|(\.mp3)$/)){suff = ' %%'}
     else if (expr.match(/(\.txt)$/)){suff = ' ,,'}
     else if (expr.match(/(\.pdf)$|(\.djvu)$/)){suff = ' §§'}

     return suff

}
