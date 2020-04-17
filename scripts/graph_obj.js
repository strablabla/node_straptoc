/*

Arrow icon for left or right

*/


class Arrow {
      constructor(cl, butt, dic) {
          this.cl = cl;
          this.butt = butt;
          this.dic = dic;
      }
      make(num) {
          var arr = $('<img/>').attr('src',"capicon/svg/" + num + ".svg") // toggle play_list_arrow left
              arr.css(this.dic)
                   .addClass(this.cl)
                   .click($('#toggle_' + this.butt).click());
        return arr
      }
}
