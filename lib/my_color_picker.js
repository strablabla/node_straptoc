

function make_palette(idinp, idpalette){

        function chooseColor(elem, inp, pal) {
            let color = rgbToHex(elem.css('background-color'))
            inp.val(color)
            inp.css({'borderRight' : '10px solid ' + color })
            pal.css({ 'display' : 'none' })
        }

        function componentToHex(c) {
            var hex = c.toString(16)
            return hex.length == 1 ? "0" + hex : hex
        }

        function rgbToHex(color) {
            arr = color.replace('rgb', '').replace('(', '').replace(')', '').split(',')
            return "#" + componentToHex(Number(arr[0])) + componentToHex(Number(arr[1])) + componentToHex(Number(arr[2]))
        }

        //alert(idinp)

        var inp = $( '#' +  idinp )                             //document.getElementById(idinp)
        var pal =  $( '#' + idpalette )                        // document.getElementById(idpalette)
        inp.click(function(){showColorPalette()})
        inp.focusout(function(){hideColorPalette()})


        $('.color-palette').css({
              'height': '100px',
              'width': '100px',
              'background': 'red',
              'display': 'none',
            })
       $('#' + idpalette).css({
          'width': '270px',
          'height': '220px',
          'background': '#efefef',
          'border': '1px solid #bcbcbc',
          'border-radius': '1px',
          'display': 'none',
          'padding': '1px',
          'position': 'absolute',
          'z-index': '1000',
          'left' : '130px',
          'bottom' : '0px'

        })

      function showColorPalette() {

              pal.css({'display':'block'})
              var newDiv = '<div class="pal_col" style="background-color:#000000" ></div><div class="pal_col" style="background-color:#191919" ></div><div class="pal_col" style="background-color:#323232" ></div><div class="pal_col" style="background-color:#4b4b4b" ></div><div class="pal_col" style="background-color:#646464" ></div><div class="pal_col" style="background-color:#7d7d7d" ></div><div class="pal_col" style="background-color:#969696" ></div><div class="pal_col" style="background-color:#afafaf" ></div><div class="pal_col" style="background-color:#c8c8c8" ></div><div class="pal_col" style="background-color:#e1e1e1" ></div><div class="pal_col" style="background-color:#ffffff" ></div><div class="pal_col" style="background-color:#820000" ></div><div class="pal_col" style="background-color:#9b0000" ></div><div class="pal_col" style="background-color:#b40000" ></div><div class="pal_col" style="background-color:#cd0000" ></div><div class="pal_col" style="background-color:#e60000" ></div><div class="pal_col" style="background-color:#ff0000" ></div><div class="pal_col" style="background-color:#ff1919" ></div><div class="pal_col" style="background-color:#ff3232" ></div><div class="pal_col" style="background-color:#ff4b4b" ></div><div class="pal_col" style="background-color:#ff6464" ></div><div class="pal_col" style="background-color:#ff7d7d" ></div><div class="pal_col" style="background-color:#823400" ></div><div class="pal_col" style="background-color:#9b3e00" ></div><div class="pal_col" style="background-color:#b44800" ></div><div class="pal_col" style="background-color:#cd5200" ></div><div class="pal_col" style="background-color:#e65c00" ></div><div class="pal_col" style="background-color:#ff6600" ></div><div class="pal_col" style="background-color:#ff7519" ></div><div class="pal_col" style="background-color:#ff8532" ></div><div class="pal_col" style="background-color:#ff944b" ></div><div class="pal_col" style="background-color:#ffa364" ></div><div class="pal_col" style="background-color:#ffb27d" ></div><div class="pal_col" style="background-color:#828200" ></div><div class="pal_col" style="background-color:#9b9b00" ></div><div class="pal_col" style="background-color:#b4b400" ></div><div class="pal_col" style="background-color:#cdcd00" ></div><div class="pal_col" style="background-color:#e6e600" ></div><div class="pal_col" style="background-color:#ffff00" ></div><div class="pal_col" style="background-color:#ffff19" ></div><div class="pal_col" style="background-color:#ffff32" ></div><div class="pal_col" style="background-color:#ffff4b" ></div><div class="pal_col" style="background-color:#ffff64" ></div><div class="pal_col" style="background-color:#ffff7d" ></div><div class="pal_col" style="background-color:#003300" ></div><div class="pal_col" style="background-color:#004d00" ></div><div class="pal_col" style="background-color:#008000" ></div><div class="pal_col" style="background-color:#00b300" ></div><div class="pal_col" style="background-color:#00cc00" ></div><div class="pal_col" style="background-color:#00e600" ></div><div class="pal_col" style="background-color:#1aff1a" ></div><div class="pal_col" style="background-color:#4dff4d" ></div><div class="pal_col" style="background-color:#66ff66" ></div><div class="pal_col" style="background-color:#80ff80" ></div><div class="pal_col" style="background-color:#b3ffb3" ></div><div class="pal_col" style="background-color:#001a4d" ></div><div class="pal_col" style="background-color:#002b80" ></div><div class="pal_col" style="background-color:#003cb3" ></div><div class="pal_col" style="background-color:#004de6" ></div><div class="pal_col" style="background-color:#0000ff" ></div><div class="pal_col" style="background-color:#0055ff" ></div><div class="pal_col" style="background-color:#3377ff" ></div><div class="pal_col" style="background-color:#4d88ff" ></div><div class="pal_col" style="background-color:#6699ff" ></div><div class="pal_col" style="background-color:#80b3ff" ></div><div class="pal_col" style="background-color:#b3d1ff" ></div><div class="pal_col" style="background-color:#003333" ></div><div class="pal_col" style="background-color:#004d4d" ></div><div class="pal_col" style="background-color:#006666" ></div><div class="pal_col" style="background-color:#009999" ></div><div class="pal_col" style="background-color:#00cccc" ></div><div class="pal_col" style="background-color:#00ffff" ></div><div class="pal_col" style="background-color:#1affff" ></div><div class="pal_col" style="background-color:#33ffff" ></div><div class="pal_col" style="background-color:#4dffff" ></div><div class="pal_col" style="background-color:#80ffff" ></div><div class="pal_col" style="background-color:#b3ffff" ></div><div class="pal_col" style="background-color:#4d004d" ></div><div class="pal_col" style="background-color:#602060" ></div><div class="pal_col" style="background-color:#660066" ></div><div class="pal_col" style="background-color:#993399" ></div><div class="pal_col" style="background-color:#ac39ac" ></div><div class="pal_col" style="background-color:#bf40bf" ></div><div class="pal_col" style="background-color:#c653c6" ></div><div class="pal_col" style="background-color:#cc66cc" ></div><div class="pal_col" style="background-color:#d279d2" ></div><div class="pal_col" style="background-color:#d98cd9" ></div><div class="pal_col" style="background-color:#df9fdf" ></div><div class="pal_col" style="background-color:#660029" ></div><div class="pal_col" style="background-color:#800033" ></div><div class="pal_col" style="background-color:#b30047" ></div><div class="pal_col" style="background-color:#cc0052" ></div><div class="pal_col" style="background-color:#e6005c" ></div><div class="pal_col" style="background-color:#ff0066" ></div><div class="pal_col" style="background-color:#ff1a75" ></div><div class="pal_col" style="background-color:#ff3385" ></div><div class="pal_col" style="background-color:#ff4d94" ></div><div class="pal_col" style="background-color:#ff66a3" ></div><div class="pal_col" style="background-color:#ff99c2" ></div>'

              pal.html(newDiv)

              $('.pal_col').click(function(){
                  chooseColor( $(this), inp, pal )
              })
              $('.pal_col').css({
                   'width': '18px',
                   'height': '18px',
                   'margin': '3px',
                   'cursor':'pointer',
                   'float': 'left'
                 })
        }

}
