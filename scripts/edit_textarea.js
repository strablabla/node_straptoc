/*
Textarea edition
*/

function wrap_hyperlink(aster, sel){

      /*
      markdown syntax for hyperlink
      */

      var subsel = sel.split('\/')
      if (subsel.slice(-1)[0].length < 5){
         subsel = sel.split('\/').slice(-2,-1) // case final '/'
      }
      else{
          subsel = sel.split('\/').slice(-1)  // case no '/' at the end
      }
      var subsubsel = subsel[0].split('.html')[0]
      var name = '[' + subsubsel + ']'
      var replace = aster + '* ' + name + '(' + sel + ')' +'\n'

      return replace

}
