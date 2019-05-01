/*

Go to text after double click
and send some informations : pattern, scrollpos etc..

*/


function dblclick_to_text(socket, elem, index){

      /*
      Go to text
      */

      elem.dblclick(function(e){  // when clicking right go back to html
            e.preventDefault();
            pattern_and_flip(socket, $(this),index)
            return false;
            });
}


function pattern_and_flip(socket, elem, take_elem){

    /*
    Find the pattern and flip to text
    */

    // ------------ find the pattern
    
    if (elem.is('li')){ var patt = elem.text().split('\n')[0] }
    else if (elem.is('.date')){ var patt = elem.attr('id').split('_')[take_elem] }

    // ------------ flip to text

    window.location.href = 'text';                    // flip from html to textarea

    // ------------ send informations

    socket.emit('scroll', patt );                     //  emit pattern toward html_app.js
    var scroll_html_pos = $(document).scrollTop()     // scroll pos in html
    socket.emit('scroll_html', scroll_html_pos);

}
