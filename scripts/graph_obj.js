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
          if (num === undefined) {
              console.error('Arrow.make() called with undefined num. Class:', this.cl, 'Button:', this.butt)
              console.trace()
          }
          var arr = $('<img/>').attr('src',"capicon/svg/" + num + ".svg") // toggle play_list_arrow left
              arr.css(this.dic)
                   .addClass(this.cl)
                   .click($('#toggle_' + this.butt).click());
        return arr
      }
}
