
function code_mirror_add_func(editor){


        editor.setSize('100%',500);

        editor.on('gutterClick', function(editor, line, gutter) {
          if (gutter === 'CodeMirror-linenumbers') {
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
              var modified_selection = wrap_hyperlink(aster, clean_selection)
              editor.replaceSelection(modified_selection)
         })

 }
