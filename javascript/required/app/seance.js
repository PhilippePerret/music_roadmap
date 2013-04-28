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
  // If +ordre+ is defined, it's an Array with exercice ids to play. Used by the
  // building seance functionnality. So we don't use the exercice suite defined in the
  // listing but this +ordre+ (where exercices can be repeated)
  set_exercices_stack:function(cur_order){
    if(this.ordre_stack != null) return true; // déjà défini
    if('undefined' == typeof cur_order){
      cur_order = Exercices.ordre();
      if ( cur_order.length == 0 ) return F.error(ERROR.Seance.no_exercices);
      if (!Roadmap.Data.first_to_last) cur_order.reverse();
    }
    this.ordre_stack = $(cur_order).toArray();//clone
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
    this.cur_exercice = null;
    this.ordre_stack  = null; // important
    this.set_working_ui(this.running = false);
    return false;//for a-link
  },
  
  // Fin des méthodes de jeu de la séance (start, pause, etc.)
  // -------------------------------------------------------------------
  
  // -------------------------------------------------------------------
  // Début des méthodes pour la définition d'une séance de travail
  // 
  
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
      this.data_seance = rajax.data_seance ; // les données remontées pour la séance
      // if(console){
      //   console.log("Data remontées pour la séance:");
      //   console.dir(this.data_seance);
      // }
      this.show_data_seance();
      Roadmap.Data.set_config_generale(this.data_seance);
      Roadmap.Data.show();
      this.hide_form(false);
      this.show_start();
    }
    this.building = false;
  },
  // Quand le musicien demande à rejouer la même séance de travail
  replay:function(){
    if(this.data_seance == null) return F.error(ERROR.Seance.no_data);
    this.set_exercices_stack( this.data_seance.suite_ids);
    this.start();
    return false;//for a-link
  },
  // Affiche les données de la séance construite
  show_data_seance:function(){
    var liste_ex = [];
    this.set_exercices_stack( this.data_seance.suite_ids);
    // Prepare display of exercice (human list)
    for( var i in this.data_seance.suite_ids){
      var iex = exercice(this.data_seance.suite_ids[i]);
      liste_ex.push(iex.titre_complet());
    }
    // Display data
    liste_ex    = liste_ex.join('<br>');
    var sens    = this.data_seance.maj_to_rel?'maj_to_rel':'rel_to_maj';
    var imgsens = UI.path_image('note/harmonic/'+sens+'.jpg')
    var dir     = this.data_seance.down_to_up?'down_to_up':'up_to_down';
    var imgdir  = UI.path_image('config/direction/'+dir+'.png');
    $('span#seance_data_working_time').html(Time.seconds_to_horloge(this.data_seance.working_time));
    $('span#seance_data_scale').html(IDSCALE_TO_HSCALE[LANG][this.data_seance.scale]);
    $('img#seance_data_img_scale').attr('src',UI.path_image('note/gamme/'+this.data_seance.scale+'.jpg'));
    $('span#seance_data_suite_harmonique').html(LOCALE_UI.Exercices.Config[sens]);
    $('img#seance_data_img_suite_harmonique').attr('src', imgsens);
    $('div#seance_data_suite_exercices').html(liste_ex);
    $('span#seance_data_downtoup').html(LOCALE_UI.Exercices.Config[dir]);
    $('img#seance_data_img_downtoup').attr('src', imgdir);
  },
  // 
  cancel_seance:function(){
    this.hide_section();
    this.ordre_stack = null; // empties the stack
    return false;//for a-link
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
    this.display_button_replay(this.data_seance != null);
    if (this.ready) return false;
    this.localize_form();
    this.prepare_menu_heures();
    this.prepare_menu_minutes();
    this.prepare_types_exercices();
    this.ready = true;
  },
  // Hide or show the replay button
  display_button_replay:function(show){
    $('div#seance_div_replay')[show?'show':'hide']();
  },
  // Set the localized texte in seance windows
  LOCALES:{
    'div#seance_form_titre'           :'Seance.form_title',
    'div#seance_start_titre'          :'Seance.start_title',
    'div#seance_end_titre'            :'Seance.end_title',
    'label#seance_lab_duree'          :'Seance.label_duree',
    'label#seance_lab_difficulties'   :'Seance.label_difficulties',
    'label#seance_lab_opt_aleatoire'  :'Seance.label_aleatoire',
    'label#seance_lab_opt_same_ex'    :'Seance.option_same_ex',
    'label#seance_lab_opt_obligatory' :'Seance.option_obligatory',
    'label#seance_lab_opt_new_scale'  :'Seance.option_new_scale',
    'label#seance_lab_opt_next_config':'Seance.option_next_config',
    'a#btn_seance_prepare'            :'Seance.btn_prepare',
    'a#btn_seance_start'              :'Seance.start',
    'a#btn_seance_replay'             :'Seance.replay',
    'span#seance_lib_working_time'    :'Label.working_time',
    'span#seance_lib_downtoup'        :'Seance.direction',
    'span#seance_lib_scale'           :'Label.scale',
    'span#seance_lib_suite_harmonique':'Exercices.Config.Label.libelle_harmonic_seq',
    'span#seance_lib_suite_exercices' :'Label.suite_exercices'
  },
  localize_form:function(){
    for(var jid in this.LOCALES){$(jid).html(eval('LOCALE_UI.'+this.LOCALES[jid]))}
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