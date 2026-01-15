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

      console.log('[dblclick_to_text] Initializing double-click listener', {
          elem_selector: elem.selector,
          index: index,
          addr_chann: addr_chann,
          elem_count: elem.length
      });

      elem.dblclick(function(e){  // when clicking right go back to html
            console.log('[dblclick_to_text] Double-click event triggered', {
                target: e.target,
                text_blocked: text_blocked,
                elem_type: $(this).prop('tagName'),
                elem_text: $(this).text().substring(0, 50) + '...'
            });

            e.preventDefault();
            e.stopPropagation();

            if (!text_blocked){
                console.log('[dblclick_to_text] Text not blocked, calling pattern_and_flip');
                pattern_and_flip(socket, $(this), index, addr_chann)

              } else {
                console.log('[dblclick_to_text] Text blocked, preventing navigation');
              }
            return false;
            });
}

function pattern_and_flip(socket, elem, take_elem, addr_chann){

    /*
    Find the pattern and flip to text
    */

    console.log('[pattern_and_flip] Starting pattern detection and flip', {
        elem_type: elem.prop('tagName'),
        elem_classes: elem.attr('class'),
        take_elem: take_elem,
        addr_chann: addr_chann,
        elem_text_preview: elem.text().substring(0, 100)
    });

    // ------------ find the pattern

    var patt_prev = null;  // Pattern for line before
    var patt_next = null;  // Pattern for line after

    if (elem.is('li')){
        var patt = elem.text().split('\n')[0]
        console.log('[pattern_and_flip] Element is <li>, pattern:', patt);

        // If the line contains deleted text (%%%), add %%% to pattern
        if (elem.find('del').length > 0) {
            patt = patt + '%%%'
            console.log('[pattern_and_flip] Found deleted text, added %%% to pattern');
        }

        // Get context: previous and next sibling elements
        var prevElem = elem.prev('li');
        var nextElem = elem.next('li');

        if (prevElem.length > 0) {
            patt_prev = prevElem.text().split('\n')[0];
            console.log('[pattern_and_flip] Previous sibling pattern:', patt_prev);
        }

        if (nextElem.length > 0) {
            patt_next = nextElem.text().split('\n')[0];
            console.log('[pattern_and_flip] Next sibling pattern:', patt_next);
        }

        console.log('[pattern_and_flip] Final pattern for <li>:', patt);
    }
    else if (elem.is('.date')){
        var patt = elem.attr('id').split('_')[take_elem]
        console.log('[pattern_and_flip] Element is .date, extracted pattern:', patt, 'from id:', elem.attr('id'));
    }
    else if (elem.is('.tag_a_to_text')){
        patt = elem.parent().text()
        console.log('[pattern_and_flip] Element is .tag_a_to_text, pattern from parent:', patt);
    }
    else if (elem.is('h2') || elem.is('h3') || elem.is('h4') || elem.is('h5') || elem.is('h6')){
        var patt = elem.text().trim()
        console.log('[pattern_and_flip] Element is heading, pattern:', patt);
    }

    // ------------ flip to text

    var addr = addr_chann.split('-')[0]
    var curr_text = addr_chann.split('-')[1]

    console.log('[pattern_and_flip] Preparing to flip to text mode', {
        addr: addr,
        curr_text: curr_text,
        pattern: patt,
        scroll_pos: $(document).scrollTop()
    });

    // ------------ send informations BEFORE navigation
    // Store in sessionStorage so they survive the page reload

    var scroll_html_pos = $(document).scrollTop()     // scroll pos in html

    console.log('[pattern_and_flip] Storing navigation data in sessionStorage', {
        scroll_pattern: patt,
        scroll_pattern_prev: patt_prev,
        scroll_pattern_next: patt_next,
        scroll_html_pos: scroll_html_pos,
        curr_txt: curr_text
    });

    // Store values in sessionStorage to survive page navigation
    sessionStorage.setItem('text_mode_patt', patt);
    sessionStorage.setItem('text_mode_patt_prev', patt_prev || '');
    sessionStorage.setItem('text_mode_patt_next', patt_next || '');
    sessionStorage.setItem('text_mode_scroll_html_pos', scroll_html_pos);
    sessionStorage.setItem('text_mode_curr_txt', curr_text);

    console.log('[pattern_and_flip] sessionStorage saved, navigating to text mode');
    window.location.href = addr;                    // flip from html to textarea

}
