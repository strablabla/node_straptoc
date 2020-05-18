/*

* Set the size of Codemirror area..
* yellow line where the text is found..
* one click select line, two clicks make the WRAP function appear..

*/


var nbclick = 0
posx = null
posy = null
function printMousePos(event) {
      if ((event.clientX != 0) & (event.clientY != 0)){
        //alert('#wrap_url').css('top'))
          posx = event.clientX
          posy = event.clientY-20

      }
    }

function make_date_todo_list(){

      var curr_date = make_date(3)
      var lcurr_date = curr_date.slice(2).split('_') // slice to remove the first 2 cifers in the year..
      lcurr_date[1] = parseInt(lcurr_date[1]) + 1
      var fr_date = lcurr_date.reverse().join('/')

      return fr_date

}

document.addEventListener("click", printMousePos);

function code_mirror_add_func(editor, socket){


        editor.setSize('80%',500);

        editor.on('gutterClick', function(editor, line, gutter) {

           if (gutter === 'CodeMirror-linenumbers') {
               nbclick += 1
               if( nbclick == 2 ){$('#tool_text__panel').show() } //
               if( nbclick == 3 ){$('#tool_text__panel').hide(); nbclick = 0 } //
               var h = parseInt($('#tool_text__panel').css('height'))
               var pos_tool_panel = posy-h/2 + 'px' // posy-h-30 + 'px'
               $('#tool_text__panel').css({'position':'fixed', 'left': '1%', 'top': pos_tool_panel})
               return editor.setSelection(CodeMirror.Pos(line, 0), CodeMirror.Pos(line + 1, 0));
          }
        });

        function jumpToLine(i) {
              var t = editor.charCoords({line: i, ch: 0}, "local").top;
              var middleHeight = editor.getScrollerElement().offsetHeight / 2;
              editor.scrollTo(null, t - middleHeight - 5);
            }

        jumpToLine(line_number)

        editor.addLineClass(line_number-1, "background", 'line_highlight')

        $('#wrap_url').click(function(){
              var selection = editor.getSelection()
              if (selection.slice(0,4) == 'http'){selection = '* ' + selection} // case not in a list..
              clean_selection = selection.split('* ')[1].slice(0,-1)
              aster = selection.split('* ')[0]
              var suff = find_suffix(selection)
              var modified_selection = wrap_hyperlink(aster, clean_selection, suff)  // wrap the link..
              editor.replaceSelection(modified_selection)
              $('#tool_text__panel').hide()
              nbclick = 0

         })

         $('#insert_date').click(function(){
               var selection = editor.getSelection()
               if (selection.length < 2){
                     //alert(selection.length)
                     var fr_date = make_date_todo_list()
                     var modified_selection = fr_date + '\n'
                     editor.replaceSelection(modified_selection)
                     $('#tool_text__panel').hide()
                     nbclick = 0
               }

          })

 }
