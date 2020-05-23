function trigger_voice(){

      const artyom = new Artyom();
      artyom.initialize({

        lang:'fr-FR',
        continuous:true,
        debug:false,
        listen:true,
        obeyKeyword: "écoute mammouth"

      })

      // --------------------------------

      voice_onoff()
      artyom.isObeying(function(){
        $('#voice_onoff').css({'background-color':'yellow'})
      })

      // --------------------------------

      function voice_onoff(){

            /*

            */

            var icon_sound = $('<img/>').attr('src',"capicon/svg/085.svg")  // icon for play_list on/off

            dic_css_icon_sound = {'position':'relative', // css for play list arrows
                              'width':'10px',
                              'bottom':'7px',
                              'left':'7px'
                              }
            icon_sound.css(dic_css_icon_sound)

            var elem = $('<div/>').attr('id','voice_onoff')
            $('#content').append(elem)
            elem.css({'background-color':'rgb(255,224,102)',
                      'box-shadow': '0.5em 0.5em 0.7em',
                      'position': 'fixed',
                      'left': '50px',
                      'top': '50px',
                      'width': '20px',
                      'height': '20px',
                      //'font-size': '85%',
                      'z-index': '3'
                      })
              $('#voice_onoff').append(icon_sound)
                  icon_sound.click(function(){
                            //alert('hellloo')
                            document.getElementById("#voice_onoff").click()
                            //$('#voice_onoff').click()
                            $('#id_view_image').hide()      // prevent from opening the icon image..
                            $('#id_view_image_body').hide()
                        })
              manual_flip(elem)

            }

      // -------------------------------- stop recognition..

      var dic_trig =  {
              indexes: ['arrête ton char'],
              action: function() {
                  //artyom.say("change le toc");
                  $('#voice_onoff').css({'background-color':'blue'})
                  artyom.dontObey()
                  }
          }

      artyom.addCommands(dic_trig); //

      // -------------------------------- trigger recognition..

      var dic_listen =  {
              indexes: ['écoute mammouth'],
              action: function() {
                  $('#voice_onoff').css({'background-color':'yellow'})
                  }
          }
      artyom.addCommands(dic_listen); //

      function manual_flip(elem){

        /*

        Flip manually between recognition and non recognition..

        */

        elem.click(function(){

                if(artyom.isObeying()){
                    artyom.dontObey()
                    $('#voice_onoff').css({'background-color':'blue'})
                }else{
                    artyom.obey()
                    $('#voice_onoff').css({'background-color':'yellow'})
                }

            })

        }

      // -------------------------------- go to location function..

      function goto(root, name){

            var dic_name =  {
                indexes: [name],
                action: function() {
                    location.href = root + name
                    }
            }
            return dic_name

      }

      // -------------------------------- toggle TOC

      var dic_toc =  {
              indexes: ['table des matières', 'matières'],
              action: function() {
                  //artyom.say("change le toc");
                  $('#toc').toggle()
                  }
          }
      artyom.addCommands(dic_toc); //

      // -------------------------------- Create a new note

      var dic_note =  {
              indexes: ['nouvelle note', 'ajouter une note'],
              action: function() {
                socket.emit('create_new_note')
                //alert('nouvelle note !!!')

                }
          }

      artyom.addCommands(dic_note); //

      // -------------------------------- Search in the document

      var dic_search =  {
              indexes: ['Rechercher'],
              action: function() {
                  $('.todotheme').toggle()
                  }
          }

      artyom.addCommands(dic_search); //

      // -------------------------------- Putting order..

      var dic_put_order =  {
              indexes: ['Rangement'],
              action: function() {
                  $('#store_state').click()
                  }
          }

      artyom.addCommands(dic_put_order); //

      // -------------------------------- Agenda

      var dic_agenda =  {
              indexes: ['Agenda'],
              action: function() {
                  $('#agenda_state').click()
                  }
          }

      artyom.addCommands(dic_agenda); //

      // -------------------------------- Help

      var dic_help =  {
              indexes: ['Aide'],
              action: function() {
                  $('#help_state').click()
                  }
          }

      artyom.addCommands(dic_help); //

      // -------------------------------- Drawing

      var dic_drawing =  {
              indexes: ['Dessin'],
              action: function() {
                  $('#manuscript_state').click()
                  }
          }

      artyom.addCommands(dic_drawing); //

      //----------- Drawing state

      function make_comm_drawing_tool(name, comm){     // write LateX command in the editor..

            var dic_comm_drawing_tool =  {
                indexes: [name],
                action: function() {
                    if (name.search('stylo') != -1){
                        colstroke = comm
                        list_moves_col.push([moves.length, colstroke, linewidth])
                        $('#control_size_color').css({'background-color': colstroke, 'border': 'none'}) // change color of indicator
                    }
                    else if (name.search('pointe') != -1){
                        linewidth = parseInt(comm)
                        list_moves_col.push([moves.length, colstroke, linewidth])
                        $('#control_size_color').css({'height': linewidth, 'margin-bottom':-linewidth/2}) // change linewidth indicator
                    }
                    else if (name.search('gomme') != -1){
                        colstroke = manuscript_canvas_color
                        list_moves_col.push([moves.length, colstroke, linewidth])
                        $('#control_size_color').css({'background-color': '#ffffff','border': '3px solid black'}) // change to rubber indicator
                    }
                }
            }
            return dic_comm_drawing_tool

      }

      socket.on('dic_drawing_state', function(dic) {   // Read the lateX commands and associate them to voice command..

            var dic_drawing = JSON.parse(dic)
            for (var name of Object.keys(dic_drawing)){                 // keys
                var comm = dic_drawing[name]
                artyom.addCommands(make_comm_drawing_tool(name, comm));    //  Register lateX commad in Artyom..

            } // end for

       });

      // -------------------------------- Config

      var dic_config =  {
              indexes: ['Config'],
              action: function() {
                  $('#config_state').click()
                  }
          }

      artyom.addCommands(dic_config); //

      // -------------------------------- LateX

      function make_comm_latex(name, comm){     // write LateX command in the editor..

            var dic_comm_latex =  {
                indexes: [name],
                action: function() {
                    editor.replaceSelection(comm)
                    }
            }
            return dic_comm_latex

      }

      socket.on('dic_latex', function(dic) {         // Read the lateX commands and associate them to voice command..

            var dic_latex = JSON.parse(dic)
            for (var name of Object.keys(dic_latex)){                 // keys
                var comm = dic_latex[name]
                artyom.addCommands(make_comm_latex(name, comm));    //  Register lateX commad in Artyom..

            } // end for

       });

      //----------- Dic voc for goto

      socket.on('dic_voc', function(dic) {

            var dic_voc = JSON.parse(dic)
            for (var root in dic_voc){                 // keys
                curr_list = dic_voc[root]              // current list
                for (var name of curr_list){
                    artyom.addCommands(goto(root, name)); //
                }
            } // end for

       });

 }
