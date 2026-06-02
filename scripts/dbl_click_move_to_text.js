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

            // Skip lazy video elements - they don't have corresponding text in source
            if ($(this).hasClass('vid-lazy-item') || $(this).closest('.vid-lazy-list').length > 0) {
                console.log('[dblclick_to_text] Skipping lazy video element');
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            // If the double-click landed on a PDF link (§§ / $pdf), flip using the
            // link itself: pattern_and_flip derives the pattern from its title,
            // not from the noisy enclosing <li> text. This handler stops
            // propagation, so the delegated .pdf-link handler never sees the
            // event for li-nested links — we must resolve it here.
            var $pdfLink = $(e.target).closest('.pdf-link');
            var flipTarget = $pdfLink.length ? $pdfLink : $(this);

            if (!text_blocked){
                console.log('[dblclick_to_text] Text not blocked, calling pattern_and_flip');
                pattern_and_flip(socket, flipTarget, index, addr_chann)

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
        // Clone element and remove lazy video lists to get clean text
        var elemClone = elem.clone()
        elemClone.find('.vid-lazy-list, .vid-lazy-item, .strapvid, span.\\:\\:').remove()
        var patt = elemClone.text().split('\n')[0]
        console.log('[pattern_and_flip] Element is <li>, pattern:', patt);

        // If the line contains deleted text (%%%), add %%% to pattern
        if (elem.find('del').length > 0) {
            patt = patt + '%%%'
            console.log('[pattern_and_flip] Found deleted text, added %%% to pattern');
        }

        // Get context: previous and next elements in source order
        var prevElem = elem.prev('li');
        var firstChildLi = elem.children('ul').find('li').first();
        var nextElem = elem.next('li');

        // PREV: if previous sibling exists, use its last deepest descendant (= actual previous line in source); else use parent li
        if (prevElem.length > 0) {
            // Find the last deepest descendant li of the previous sibling
            var prevTarget = prevElem;
            var lastDesc = prevTarget.find('li').last();
            if (lastDesc.length > 0) {
                prevTarget = lastDesc;
            }
            var prevClone = prevTarget.clone()
            prevClone.children('ul').remove();
            prevClone.find('.vid-lazy-list, .vid-lazy-item, .strapvid, span.\\:\\:').remove()
            patt_prev = prevClone.text().split('\n')[0].trim();
            console.log('[pattern_and_flip] Previous context (last descendant of prev sibling):', patt_prev);
        } else {
            // No previous sibling - use parent li as context
            var parentLi = elem.closest('ul').closest('li');
            if (parentLi.length > 0) {
                var parentClone = parentLi.clone();
                parentClone.children('ul').remove();
                parentClone.find('.vid-lazy-list, .vid-lazy-item, .strapvid, span.\\:\\:').remove();
                patt_prev = parentClone.text().split('\n')[0].trim();
                console.log('[pattern_and_flip] Parent li pattern as prev context:', patt_prev);
            }
        }

        // NEXT: find the next line in source order
        // 1) first child li, 2) next sibling li, 3) next sibling of parent, 4) next sibling of grandparent, etc.
        var nextTarget = null;
        if (firstChildLi.length > 0) {
            nextTarget = firstChildLi;
        } else {
            // Walk up the tree looking for a next sibling li
            var cur = elem;
            while (cur.length > 0 && !nextTarget) {
                var nxt = cur.next('li');
                if (nxt.length > 0) {
                    nextTarget = nxt;
                } else {
                    cur = cur.closest('ul').closest('li');
                }
            }
        }
        if (nextTarget) {
            var nextClone = nextTarget.clone();
            nextClone.children('ul').remove();
            nextClone.find('.vid-lazy-list, .vid-lazy-item, .strapvid, span.\\:\\:').remove();
            patt_next = nextClone.text().split('\n')[0].trim();
            console.log('[pattern_and_flip] Next context in source order:', patt_next);
        }

        console.log('[pattern_and_flip] Final pattern for <li>:', patt);
    }
    else if (elem.is('.date')){
        // Use the actual text content of the date element, not the ID
        var patt = elem.text().trim();
        console.log('[pattern_and_flip] Element is .date, extracted pattern from text:', patt);
        console.log('[pattern_and_flip] Date element id for reference:', elem.attr('id'));

        // Extract context from surrounding elements
        var prevElem = elem.prev();
        var nextElem = elem.next();

        if (prevElem.length > 0) {
            patt_prev = prevElem.text().split('\n')[0];
            console.log('[pattern_and_flip] Previous sibling pattern for .date:', patt_prev);
        }

        if (nextElem.length > 0) {
            patt_next = nextElem.text().split('\n')[0];
            console.log('[pattern_and_flip] Next sibling pattern for .date:', patt_next);
        }
    }
    else if (elem.is('.tag_a_to_text')){
        patt = elem.parent().text()
        console.log('[pattern_and_flip] Element is .tag_a_to_text, pattern from parent:', patt);
    }
    else if (elem.is('h2') || elem.is('h3') || elem.is('h4') || elem.is('h5') || elem.is('h6')){
        var patt = elem.text().trim()
        console.log('[pattern_and_flip] Element is heading, pattern:', patt);
    }
    else if (elem.is('.pdf-link')){
        // PDF link (§§ / $pdf syntax): the visible title is the direct text node
        // of the element. Strip child elements first (nested [-] toggle <a><span §§>,
        // .fold_toggle, .reading-status-buttons) so only the title remains — that
        // title is what appears in the markdown source line we want to flip to.
        var patt = elem.clone().children().remove().end().text().split('\n')[0].trim()
        console.log('[pattern_and_flip] Element is .pdf-link, pattern:', patt);
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
