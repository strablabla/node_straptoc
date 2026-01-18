/*

Count lines before pattern

*/


exports.find_line_of_pattern = function(text, pattern, pattern_prev, pattern_next){

      /*
      Find the line index of the given pattern with optional context.
      If pattern_prev and/or pattern_next are provided, use them to disambiguate.
      */

      // Helper function to strip HTML tags for matching
      function stripHtmlTags(str) {
          return str.replace(/<[^>]*>/g, '');
      }

      var line_number = 1
      var tot_lines = 0
      var astring = text.split('\n')

      console.log('[count_lines] pattern type:', typeof pattern);
      console.log('[count_lines] pattern value:', pattern);
      console.log('[count_lines] pattern_prev received:', pattern_prev);
      console.log('[count_lines] pattern_next received:', pattern_next);

      // Use parameters directly (parsing already done in html_app.js)
      var pattern_trimmed = pattern.trim()
      var context_prev = pattern_prev;
      var context_next = pattern_next;

      console.log('[count_lines] Using pattern:', pattern_trimmed);
      console.log('[count_lines] Using context_prev:', context_prev);
      console.log('[count_lines] Using context_next:', context_next);

      // If no context is provided, use old behavior (find first match)
      // Check for null, undefined, or empty string..
      var hasContext = (context_prev && context_prev.trim() !== '') || (context_next && context_next.trim() !== '');

      if (!hasContext) {
          console.log("NO CONTEXT !!!!")
          var count = true
          astring.forEach(function (line, number) {
              // Strip HTML tags from line before searching
              var lineText = stripHtmlTags(line);
              // Use indexOf for literal string matching (not regex)
              console.log("lineText.indexOf(pattern_trimmed)", lineText.indexOf(pattern_trimmed))
              if( lineText.indexOf(pattern_trimmed) == -1 & count){
                    
                    line_number += 1
              }
              else{ count = false }
              tot_lines += 1
          });
          return line_number
      }

      // New behavior with context: find the match that has matching context
      console.log('[count_lines] Using context-based matching', {
          pattern: pattern_trimmed,
          context_prev: context_prev,
          context_next: context_next
      });

      console.log("WITH CONTEXT !!!!")

      for (var i = 0; i < astring.length; i++) {
          var line = astring[i];
          var lineText = stripHtmlTags(line);

          // Check if current line matches the pattern (use indexOf for literal matching)
          if (lineText.indexOf(pattern_trimmed) !== -1) {
              console.log('[count_lines] Found main pattern at line:', i + 1, '- lineText:', lineText);
              var contextMatch = true;

              // Check context_prev in the 3 lines above (if provided and not empty)
              if (context_prev && context_prev.trim() !== '') {
                  var foundPrev = false;
                  // Search in up to 3 lines above
                  var searchStart = Math.max(0, i - 3);
                  console.log('[count_lines] Searching for context_prev "' + context_prev.trim() + '" in lines', searchStart + 1, 'to', i);
                  for (var j = searchStart; j < i; j++) {
                      var prevLine = stripHtmlTags(astring[j]);
                      if (prevLine.indexOf(context_prev.trim()) !== -1) {
                          foundPrev = true;
                          console.log('[count_lines] ✓ Found context_prev at line:', j + 1);
                          break;
                      }
                  }
                  if (!foundPrev) {
                      contextMatch = false;
                      console.log('[count_lines] ✗ context_prev not found in 3 lines above');
                  }
              }

              // Check context_next in the 3 lines below (if provided and not empty)
              if (context_next && context_next.trim() !== '' && contextMatch) {
                  var foundNext = false;
                  // Search in up to 3 lines below
                  var searchEnd = Math.min(astring.length, i + 4); // i+1 to i+3
                  console.log('[count_lines] Searching for context_next "' + context_next.trim() + '" in lines', i + 2, 'to', searchEnd);
                  for (var k = i + 1; k < searchEnd; k++) {
                      var nextLine = stripHtmlTags(astring[k]);
                      if (nextLine.indexOf(context_next.trim()) !== -1) {
                          foundNext = true;
                          console.log('[count_lines] ✓ Found context_next at line:', k + 1);
                          break;
                      }
                  }
                  if (!foundNext) {
                      contextMatch = false;
                      console.log('[count_lines] ✗ context_next not found in 3 lines below');
                  }
              }

              // If context matches (or no context provided), this is our line
              if (contextMatch) {
                  console.log('[count_lines] ★ Found match with context at line:', i + 1);
                  return i + 1;
              }
          }
      }

      // If no match found with context, fall back to first match
      console.log('[count_lines] No context match found, falling back to first occurrence');
      line_number = 1;
      var count = true;
      astring.forEach(function (line, number) {
          var lineText = stripHtmlTags(line);
          // Use indexOf for literal string matching (not regex)
          if( lineText.indexOf(pattern_trimmed) == -1 & count){
                line_number += 1
          }
          else{ count = false }
      });

      return line_number

}
