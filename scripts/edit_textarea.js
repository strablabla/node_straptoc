/*
Textarea edition
*/

function wrap_hyperlink(aster, sel){

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
      var name = '[' + subsubsel + ']'                           // name
      var replace = aster + '* ' + name + '(' + sel + ')' +'\n'  // final line

      return replace

}
