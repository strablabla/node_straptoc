/*

Count lines before pattern

*/


function count_empty_before_pattern(text, pattern) {

    /*
    Count the number of empty lines until the pattern.
    */

    var cut_text = text.split(pattern)[0]
    return (cut_text.match(/(^[ \t]*(\n|$))/gm) || []).length;
}

function count_empty_lines_tot(text, pattern) {

    /*
    Count the number of empty lines until the pattern.
    */
    return (text.match(/(^[ \t]*(\n|$))/gm) || []).length;
}

exports.find_line_of_pattern = function(text, pattern){

      /*
      Find the line index of the given pattern..
      */

      console.log('#########################################')
      var line_number = 0
      var tot_lines = 0
      var astring = text.split('\n')
      var count = true
      astring.forEach(function (line, number) {

          if( line.match(pattern) == null & count){
                console.log('##--## ' + line)
                line_number += 1
          }
          else{ count = false }
          tot_lines += 1

      });
      //
      var nb_empty_lines_tot = count_empty_lines_tot(text, pattern)
      var nb_empty_lines = count_empty_before_pattern(text, pattern)    // number of empty lines before pattern
      line_number += nb_empty_lines                                     // full line plus empty lines
      tot_lines += nb_empty_lines_tot
      console.log('############## line_number ############' + line_number)
      console.log('############## tot_lines ###############' + tot_lines)
      var ratio = line_number/tot_lines

      console.log('############## ratio ###############' + ratio)

      return line_number

}
