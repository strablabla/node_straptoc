/*

Go to text after double click
and send some informations : pattern, scrollpos etc..

*/

var text_blocked = -1
// socket.on('blocked', function(val){  // if text_blocked true, it prevents from going to text..
//     //text_blocked = val
//     alert('text_blocked is ' + text_blocked)
// })

function dblclick_to_text(socket, elem, index, addr_chann){

      /*
      Go to text
      */

      elem.dblclick(function(e){  // when clicking right go back to html
            e.preventDefault();
            e.stopPropagation();
            if (!text_blocked){
                pattern_and_flip(socket, $(this), index, addr_chann)
                
              }
            return false;
            });
}

function pattern_and_flip(socket, elem, take_elem, addr_chann){

    /*
    Find the pattern and flip to text
    */

    // ------------ find the pattern

    if (elem.is('li')){ var patt = elem.text().split('\n')[0]
                            patt = patt.replace('?','\\?').replace('+','\\+')
                           }
    else if (elem.is('.date')){ var patt = elem.attr('id').split('_')[take_elem] }
    else if (elem.is('.tag_a_to_text')){ patt = elem.parent().text() }

    // ------------ flip to text

    var addr = addr_chann.split('-')[0]
    var curr_text = addr_chann.split('-')[1]
    window.location.href = addr;                    // flip from html to textarea

    // ------------ send informations

    socket.emit('scroll', patt );                     //  emit pattern toward html_app.js
    var scroll_html_pos = $(document).scrollTop()     // scroll pos in html
    socket.emit('scroll_html', scroll_html_pos);
    socket.emit('curr_txt', curr_text);

}
