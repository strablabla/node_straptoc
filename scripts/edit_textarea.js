/*
Textarea edition
*/

text_area_redefine_cmds = function(){ // Tab  equal four spaces in textarea..

    $('#comment').keydown(function (e) {
        var keyCode = e.keyCode || e.which;

        if (keyCode === 9) {
            e.preventDefault();
            var start = this.selectionStart;
            var end = this.selectionEnd;
            // set textarea value to: text before caret + tab + text after caret
            spaces = "    ";
            this.value = this.value.substring(0, start) + spaces + this.value.substring(end);
            // put caret at right position again
            this.selectionStart = this.selectionEnd = start + spaces.length;
        }
      }); // end comment keydown

}

wrap_as_link = function (){

      /*
      Passing from http to markdown notation
      */

      //alert('in wrap')
      var textarea = document.getElementById("comment");
      var len = textarea.value.length;
      var start = textarea.selectionStart;
      var end = textarea.selectionEnd;
      var sel = textarea.value.substring(start, end);
      //alert(sel)
      var subsel = sel.split('\/')
      //alert(subsel)
      if (subsel.slice(-1)[0].length < 5){
         subsel = sel.split('\/').slice(-2,-1) // case final '/'
      }
      else{
          subsel = sel.split('\/').slice(-1)  // case no '/' at the end
      }
      var subsubsel = subsel[0].split('.html')[0]
      var name = '[' + subsubsel + ']'
      var replace = name + '(' + sel + ')'
      //alert(replace)
      textarea.value = textarea.value.substring(0,start) + replace +
      textarea.value.substring(end,len);

}
