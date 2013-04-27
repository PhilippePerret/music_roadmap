/*  Object Seance
    ---------------
    Gestion des séances de travail
*/
window.Seance = {
  ready     :false, // Set to true when form is ready
  section_opened:false,     // True if section seance is opened
  
  // During session
  running         :false,   // True when we work on the exercices suite
  cur_exercice    :null,    // Current exercice (instance of Exercice)
  ordre_stack     :null,    // Stack of the exercices to play

  // Start working session
  start:function(){
    if(this.section_opened) this.hide_section();
    if(false == this.set_exercices_stack()) return;
    Exercices.deselect_all() ;
    this.set_working_ui(this.running = true);
    this.play_first_in_stack();
    this.initialize_seance_file();
    return false;//for the a-link
  },
  // Defines the order of the exercices to play (according to the exercice displayed
  // on the page)
  // @return True if OK, FALSE if no exercice to play
  set_exercices_stack:function(){
    var cur_order = Exercices.ordre();
    if ( cur_order.length == 0 ) return F.error(ERROR.Seance.no_exercices);
    this.ordre_stack = $(cur_order).toArray();
    if (!Roadmap.Data.start_to_end) this.ordre_stack.reverse();
    return true;
  },
  // Initialize the seance file at starting (Ajax call)
  initialize_seance_file:function(){
    Ajax.query({data:{proc:"seance/start", rm_nom:Roadmap.nom, rm_mail:User.mail, md5:Roadmap.md5}})
  },
  // Set UI when we work the exercices or when stop
  // - The buttons to create and move exercices are hidden
  // - The buttons to stop, play, pause are shown
  // Buttons to hide/show during working session
  HIDDENS_WHILE_WORKING:new DArray(['a#btn_exercice_create','a#btn_exercices_move', 'div#open_roadmap_specs']),
  SHOWED_WHILE_WORKING:new DArray(['a#btn_seance_end','a#btn_seance_pause']),
  set_working_ui:function(on){
    var method_btn_run;
    if (on){
      // When running
      this.HIDDENS_WHILE_WORKING.hide();
      this.SHOWED_WHILE_WORKING.show();
    } else {
      // Stopping
      this.HIDDENS_WHILE_WORKING.show();
      this.SHOWED_WHILE_WORKING.hide();
    }
    var orun = $('a#btn_seance_play');
    orun.html(LOCALE_UI.Seance[on ? 'next_exercice' : 'start']);
    orun.attr('onclick', "return $.proxy(Seance." + 
              (on ? 'next_exercice' : 'start') + ", Seance)()");
  },
  // Play next exercice of the session
  // (call by button 'Next exercice')
  next_exercice:function(){
    this.stop_cur_exercice();
    if ( this.ordre_stack.length > 0 ){
      // Still exercices
      if ( this.ordre_stack.length == 1 ){
        // Last exercice
        UI.set_invisible('a#btn_seance_end');
        $('a#btn_seance_play').html(LOCALE_UI.Seance.end_exercices);
      }
      this.play_first_in_stack();
    } else {
      // No more exercices
      this.stop() ;
    }
    return false;// for a-link
  },
  // Stop exercice (with next exercice is required or pause)
  stop_cur_exercice:function(){
    if(this.pause_on) this.pause();
    else{
      Exercices.deselect(this.cur_exercice.id) ; // stop aussi l'exercice et le métronome
      this.cur_exercice = null ;
    }
  },
  // Play the first exercice in the stack
  play_first_in_stack:function(){
    this.cur_exercice = exercice(this.ordre_stack.shift());
    this.cur_exercice.play();
    this.pause_on = false;
  },
  // Pause the seance
  pause_on:false,
  pause:function(){
    var o = $('a#btn_seance_pause');
    this.cur_exercice.play(); //start or stop
    this.pause_on = !this.pause_on;
    o.html(LOCALE_UI.Seance[this.pause_on?'restart':'pause']);
    return false;//for a-link
  },
  // To Stop the working session
  // +forcer_arret+ is true when called from "Stop seance" button.
  stop:function(forcer_arret){
    if( forcer_arret === true ) this.cur_exercice.play(); // pour l'arrêter
    Metronome.stop() ;
    Exercices.deselect_all();
    this.cur_exercice = null ;
    this.set_working_ui(this.running = false);
    return false;//for a-link
  },
  
  // Open section Seance (hidding exercices)
  show_section:function(not_hidden){
    UI.set_invisible('ul#exercices');
    UI.animin($('section#seance_travail'));
    $(['seance_form', 'seance_start', 'seance_end']).map(function(i,key){
      if (key != not_hidden) UI.animout($('div#'+key));
      else UI.animin($('div#'+key));
    });
    this.section_opened = true;
  },
  // Close section Seance (revealing exercices)
  hide_section:function(){
    UI.animout($('section#seance_travail'));
    UI.set_visible('ul#exercices');
    this.section_opened = false;
  },
  // Open form to define working seance
  show_form:function(){
    this.prepare();
    this.show_section('seance_form');
    return false;//pour le a-lien
  },
  hide_form:function(for_good){
    if('undefined' == typeof for_good) for_good = true;
    if(for_good) this.hide_section();
    else UI.animout($('div#seance_form'));
    return false;//for a-link
  },
  show_start:function(){
    this.hide_form(false);UI.animin($('div#seance_start'))},
  hide_start:function(){
    UI.animout($('div#seance_start'))},
  show_end:function(){
    this.show_section('seance_end')},

  // Build the working seance
  building:false,
  build:function(){
    this.building = true;
    var params_seance = this.get_values();
    if( params_seance == null ) return this.building = false;
    // console.dir(params_seance);
    Ajax.query({
      data:{
        proc          :'seance/build',
        rm_nom        :Roadmap.nom,
        user_mail     :User.mail,
        user_md5      :User.md5,
        params_seance :params_seance
      }, 
      success:$.proxy(this.build_suite, this)
    });
    return false;//pour le a-lien
  },
  // Retour ajax de la précédente
  build_suite:function(rajax){
    if(false==traite_rajax(rajax)){
      this.data_seance = rajax.data_seance ; // les données pour la séance
      this.show_data_seance();
      this.hide_form(false);
      this.show_start();
    }
    this.building = false;
  },
  // Affiche les données de la séance construite
  show_data_seance:function(){
    var scaleh = IDSCALE_TO_HSCALE[LANG][this.data_seance.scale];
    var liste_ex = [];
    for( var i in this.data_seance.suite_ids){
      var iex = exercice(this.data_seance.suite_ids[i]);
      liste_ex.push(iex.titre_complet());
    }
    liste_ex = liste_ex.join('<br>');
    var wtimeh = Time.seconds_to_horloge( this.data_seance.working_time);
    var message = [] ;
    wtimeh = this.label_and_data(LOCALE_UI.Label.working_time, wtimeh, ": ");
    message.push(wtimeh) ;
    message.push(this.label_and_data(LOCALE_UI.Label.scale,scaleh,": ")) ;
    message.push('<img style="width:300px;" src="_MVC_/view/img/note/gamme/'+this.data_seance.scale+'.jpg" />');
    message.push(this.label_and_data(LOCALE_UI.Label.suite_exercices,liste_ex,":<br />"));
    message = message.join('<br>');
    $('div#seance_start_description').html(message);
  },
  label_and_data: function(label, data, separator){
    return '<span class="libelle">' + label + '</span>' + separator +
            '<span class="data">' + data + "</span>" ;
  },
  // Relève les data du formulaire
  get_values:function(){
    // Working time
    var hrs = parseInt($('select#seance_duree_heures').val());
    var mns = parseInt($('select#seance_duree_minutes').val());
    var working_time = hrs * 60 + mns ;
    if (working_time == 0){
      F.error(ERROR.Seance.no_working_time);
      return null;
    }
    // Difficulties
    var difficulties = Exercices.Edition.pickup_types('sw');
    var options      = {};
    $(['obligatory', 'new_scale', 'same_ex', 'next_config']).map(function(itm,key){
        options[key] = $('input#seance_option_'+key).is(':checked');
    });
    return {
      working_time  :working_time,
      difficulties  :difficulties.join(','),
      options       :options
    }
  },
  // Prepare the form
  prepare:function(){
    if (this.ready) return false;
    this.localize_form();
    this.prepare_menu_heures();
    this.prepare_menu_minutes();
    this.prepare_types_exercices();
    this.ready = true;
  },
  // Set the localized texte in form
  localize_form:function(){
    // @TODO:
  },
  prepare_types_exercices:function(){
    var o = $('div#seance_form_types');
    Exercices.Edition.types_populate(o, 'sw');
  },
  prepare_menu_heures:function(){
    var o = $('select#seance_duree_heures');
    for(var i=0; i<10; ++i) o.append('<option value="'+i+'">'+i+'</option>');
  },
  prepare_menu_minutes:function(){
    var istr, o = $('select#seance_duree_minutes');
    for(var i=0; i<60; ++i){
      istr = i.toString();
      if(i<10) istr = "0"+istr;
      o.append('<option value="'+i+'">'+istr+'</option>');
    }
  }
}