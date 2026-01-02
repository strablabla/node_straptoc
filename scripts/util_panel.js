
function icon_deactivate(){

      $('#id_view_image').hide()       // prevent the browser to open the svg..
      $('#id_view_image_body').hide()   //

    }

function panel_act(curr_panel, action){

      /*


      */

      var panel_width = parseInt($('#' + curr_panel + '_panel').css('width'))
      var translr = '-' + panel_width //+ 'px'
      var dic_anim = {
                            'open':{ 'right': ($(window).width()-panel_width) / 2 },
                            'close':{ 'right': translr }
                      }
  return dic_anim[action]
}

function toggle_panel(curr_panel){

      /*


      */

      var panel_open = []
      panel_open[curr_panel] = 0
      $('#' + curr_panel + '_state' + ',#icon_'+ curr_panel).on('click', function(){   // toggle help
           icon_deactivate()
           var panel = $('#' + curr_panel + '_panel')
           if ( !panel_open[curr_panel] ){ panel.animate( panel_act(curr_panel,'open') ) } // show the panel
           else{ panel.animate( panel_act(curr_panel,'close') ) } // hide the panel
           panel_open[curr_panel] ^= true
      }) //
      // '#icon_'+ curr_panel

}
