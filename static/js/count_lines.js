/*

Count lines before pattern

*/


exports.find_line_of_pattern = function(text, pattern){

      /*
      Find the line index of the given pattern..
      */

      var line_number = 1
      var tot_lines = 0
      var astring = text.split('\n')
      var count = true
      astring.forEach(function (line, number) {

          if( line.match(pattern) == null & count){
                //console.log('##' + line_number + '## '  + line)
                line_number += 1
          }
          else{ count = false }
          tot_lines += 1

      });
      //

      return line_number

}
