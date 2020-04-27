/*

* Set the size of Codemirror area..
* yellow line where the text is found..
* one click select line, two clicks make the WRAP function appear..

*/

posx = null
posy = null
function printMousePos(event) {
      if ((event.clientX != 0) & (event.clientY != 0)){
        //alert('#wrap_url').css('top'))
          posx = event.clientX
          posy = event.clientY-20

      }
    }

document.addEventListener("click", printMousePos);

function code_mirror_add_func(editor){


        editor.setSize('80%',500);

        editor.on('gutterClick', function(editor, line, gutter) {

           if (gutter === 'CodeMirror-linenumbers') {
               $('#wrap_url').css({'position':'fixed', 'left': '2%', 'top': posy + 'px'})
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
              clean_selection = selection.split('* ')[1].slice(0,-1)
              aster = selection.split('* ')[0]
              var modified_selection = wrap_hyperlink(aster, clean_selection)  // wrap the link..
              editor.replaceSelection(modified_selection)
              $('#wrap_url').css({'position':'fixed', 'left': '2%', 'top': '520px'}) // replace wrap
         })

 }
