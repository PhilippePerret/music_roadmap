/*  Object Seance
    ---------------
    Gestion des séances de travail
*/
window.Seance = {
  ready           :false,   // Set to true when form is ready
  section_opened  :false,   // True if section seance is opened
  
  // During session
  running         :false,   // True when we work on the exercices suite
  cur_exercice    :null,    // Current exercice (instance of Exercice)
  ordre_stack     :null,    // Stack of the exercices to play
  exercices_count :null,    // Number total of exercices to play
  curex_indice    :null,    // Index of the current exercice
  start_time      :null,    // Number of seconds for starting session time
  stop_time       :null,    // Number of seconds for stopping session time

  // Key press handler (on seance)
  onkeypress:function(evt){
    switch(evt.charCode){
      case K_SPACE:
        this.running ? this.next_exercice() : this.start();
        evt.stopPropagation();
        return false;
        break;
      case Key_p:
      case Key_P:
        evt.stopPropagation();
        if(this.running) this.pause();
        return false;
        break;
      case Key_s:
      case Key_S:
        evt.stopPropagation();
        if(this.running) this.stop(true);
        return false;
        break;
      case Key_m:
      case Key_M:
        evt.stopPropagation();
        Metronome.toggleMute();
        return false;
        break;
      default:
        // console.log("touche:"+evt.charCode);
    }
  },
  // Start working session (either prepared session or normal session)
  start:function(){
    UI.open_volet('running_seance');
    if(false == this.set_exercices_stack())return this.show();
    Exercices.deselect_all();
    UI.set_visible('section#current_exercice');
    this.curex_indice = 0;
    this.start_time = Time.now();
    UI.Chrono.start('span#curex_horloge_seance');
    this.play_first_in_stack();
    this.initialize_seance_file();
    return false;//for a-link
  },
  // Defines the order of the exercices to play (according to the exercice displayed
  // on the page)
  // @return True if OK, FALSE if no exercice to play
  // If +ordre+ is defined, it's an Array with exercice ids to play. Used by the
  // building seance functionnality. So we don't use the exercice suite defined in the
  // listing but this +ordre+ (where exercices can be repeated)
  set_exercices_stack:function(cur_order){
    try {
      if(this.ordre_stack != null){ // déjà défini
        if(this.ordre_stack.length == 0) throw 'no_exercice_found';
        else return true;
      }
      if('undefined' == typeof cur_order){
        cur_order = Exercices.ordre();
        if ( cur_order.length == 0 ) throw 'no_exercices';
        if (!Roadmap.Data.first_to_last) cur_order.reverse();
      }
      this.ordre_stack = $(cur_order).toArray();//clone
      if (this.ordre_stack.length == 0) throw 'no_exercice_found';
    } catch(iderr){
      return F.error(ERROR.Seance[iderr]);
    }
    this.set_number_total_of_exercices();
    return true;
  },
  // Display information for current exercice
  display_infos_current_exercice:function(){
    var iex = this.cur_exercice; // Exercice Instance
    this.next_indice_current_exercice();
    var indics = [];
    if(iex.symetric){
      indics.push(LOCALE_UI.Seance.Exinfos[Roadmap.Data.down_to_up?'to_up':'to_down']);
    }
    if(iex.tone == null)
      indics.push(LOCALE_UI.Seance.Exinfos.must_be_played_in + IDSCALE_TO_HSCALE[Roadmap.Data.tone].entier);
    if(iex.note) indics.push(iex.note);
    if(indics != ""){
      $('div#curex_indications span.value').html(
        LOCALE_UI.Seance.Exinfos.exercice_doit + indics.join('<br>'));
    }
  },

  set_number_total_of_exercices:function(){
    this.exercices_count = this.ordre_stack.length;
    $('div#curex_total span.value').html(this.exercices_count);
  },
  next_indice_current_exercice:function(){
    this.curex_indice += 1;
    $('div#curex_indice span.value').html(this.curex_indice);
  },
  // Initialize the seance file at starting (Ajax call)
  initialize_seance_file:function(){
    Ajax.query({data:{proc:"seance/start", rm_nom:Roadmap.nom, rm_mail:User.mail, md5:Roadmap.md5}})
  },
  // Set UI when we work the exercices or when stop
  set_working_ui:function(on){
    var orun = $('a#btn_seance_play');
    orun.html(LOCALE_UI.Seance[on ? 'next_exercice' : 'start']);
    orun.attr('onclick', "return $.proxy(Seance." + 
              (on ? 'next_exercice' : 'start') + ", Seance)()");
  },
  // Play next exercice of the session
  // (call by button 'Next exercice')
  next_exercice:function(){
    this.stop_cur_exercice();
    if ( this.ordre_stack.length > 0 ){// Still exercices
      if ( this.ordre_stack.length == 1 ){
        // Last exercice
        UI.set_invisible('a#btn_seance_end');
        $('a#btn_seance_play').html(LOCALE_UI.Seance.end_exercices);
      }
      this.play_first_in_stack();
    } else {// No more exercices
      this.stop() ;
    }
    return false;// for a-link
  },
  // Return true if exercices stack is empty
  no_more_exercice:function(){
    return this.ordre_stack.length == 0;
  },
  // Stop exercice (with next exercice is required or pause)
  // 
  stop_cur_exercice:function(fin){
    if(this.pause_on) this.pause();
    else{
      // Si c'est le dernier exercice, il faut définir la méthode qui 
      // suivra l'enregistrement (ou non) de la durée de travail sur
      // l'exercice. Cette méthode ouvrira le rapport de travail.
      if('undefined'==typeof fin) fin = this.no_more_exercice();
      if(this.cur_exercice != null){
        if(fin) this.cur_exercice.fx_after_save = $.proxy(this.stop_suite,this);
        Exercices.deselect(this.cur_exercice.id) ; // stop aussi l'exercice et le métronome
        this.cur_exercice = null ;
      }
    }
  },
  // Play the first exercice in the stack
  // WARMING: THIS IS NOT THE FIRST EXERCICE. This method is always called to
  // play the first in stack, and this first is removed from the stack to 
  // play the next then.
  play_first_in_stack:function(){
    this.cur_exercice = exercice(this.ordre_stack.shift());
    this.display_infos_current_exercice();
    this.cur_exercice.play();
    this.pause_on =false;
    this.running  =true;
  },
  // Pause the seance
  pause_on:false,
  pause:function(){
    var o = $('a#btn_seance_pause');
    this.cur_exercice.play(); //start or stop
    this.pause_on = !this.pause_on;
    o.html(LOCALE_UI.Seance[this.pause_on?'restart':'pause']);
    UI.Chrono[this.pause_on?'pause':'unpause']('span#curex_horloge_seance');
    return false;//for a-link
  },
  // To Stop the working session
  // +forcer_arret+ is true when called from "Stop seance" button.
  // @note: in every case, the `stop_suite' will be called after or not 
  // saving the working time on the last exercice.
  stopping:false,
  stop:function(forcer_arret){
    this.stopping = true;
    if( forcer_arret === true ) this.stop_cur_exercice(true);
    this.stop_time = Time.now();
    UI.Chrono.stop('span#curex_horloge_seance');
    Metronome.stop();
    UI.set_invisible('section#current_exercice');
    this.ordre_stack  =null;
    this.running      =false;
    return false;//for a-link
  },
  // After stop, we display the report
  stop_suite:function(){
    this.stopping     = false;
    Rapport.show();
  },
  
  // Fin des méthodes de jeu de la séance (start, pause, etc.)
  // -------------------------------------------------------------------
  
  // -------------------------------------------------------------------
  // Début des méthodes pour la confection d'une séance de travail
  // 
  
  // Open section Seance (hidding exercices)
  show_section:function(not_hidden){
    UI.animin($('section#seance'));
    $(['seance_form', 'seance_start', 'seance_end']).map(function(i,key){
      if (key != not_hidden) UI.animout($('div#'+key));
      else UI.animin($('div#'+key));
    });
    this.section_opened = true;
  },
  // Close section Seance
  hide_section:function(){
    UI.animout($('section#seance'));
    this.section_opened = false;
  },
  // Open form to define working seance
  show:function(){
    UI.open_volet('seance');
    return false;//pour le a-lien
  },
  hide_form:function(for_good){
    if('undefined' == typeof for_good) for_good = true;
    if(for_good) this.hide_section();
    else UI.animout($('div#seance_form'));
    return false;//for a-link
  },
  show_start:function(){
    this.hide_form(false);
    this.table_shortcuts();
    UI.animin($('div#seance_start'));
    UI.set_visible('a#btn_seance_play');
  },
  // Construction de la table des raccourcis clavier
  table_shortcuts:function(){
    data = [
      {key:'P',       effect:'seance_pause'},
      {key:'FlecheG', effect:'seance_back'},
      {key:'S',       effect:'seance_stop'},
      {key:'Espace',  effect:'seance_start_or_next'}
    ];
    UI.Shortcuts.build(
      'div#seance_start_shortcuts',
      {shortcuts:data, options:{current:true, open:true}}
      );
  },
  hide_start:function(){
    UI.animout($('div#seance_start'))},
  show_end:function(){
    this.show_section('seance_end')},

  // Build the working seance
  building:false,
  build:function(){
    this.building     = true;
    this.ordre_stack  = null;
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
      if ('undefined' != typeof rajax.debug_building_seance){
        if($('pre#pre_debug').length) $('pre#pre_debug').remove();
        $('body').append(rajax.debug_building_seance);
      }
      this.data_seance = rajax.data_seance ; // les données remontées pour la séance
      if (this.show_data_seance()){
        Roadmap.Data.set_general_config(this.data_seance);
        Roadmap.Data.show();
        this.hide_form(false);
        this.show_start();
      }
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
    if (!this.set_exercices_stack(this.data_seance.suite_ids)) return false;
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
    $('span#seance_data_tone').html(IDSCALE_TO_HSCALE[this.data_seance.tone]['double']);
    $('img#seance_data_img_tone').attr('src',UI.path_image('note/gamme/'+this.data_seance.tone+'.jpg'));
    $('span#seance_data_suite_harmonique').html(LOCALE_UI.Exercices.Config[sens]);
    $('img#seance_data_img_suite_harmonique').attr('src', imgsens);
    $('div#seance_data_suite_exercices').html(liste_ex);
    $('span#seance_data_downtoup').html(LOCALE_UI.Exercices.Config[dir]);
    $('img#seance_data_img_downtoup').attr('src', imgdir);
    return true;//ok for the seance
  },
  // 
  cancel_seance:function(){
    UI.open_volet('exercices');
    this.ordre_stack = null; // empties the stack
    return false;//for a-link
  },
  // Relève les data du formulaire
  OPTIONS_LIST:['aleatoire', 'obligatory', 'new_tone', 'same_ex', 'next_config'],
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
    $(this.OPTIONS_LIST).map(function(itm,key){
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
    'label#seance_lab_opt_new_tone'  :'Seance.option_new_tone',
    'label#seance_lab_opt_next_config':'Seance.option_next_config',
    'a#btn_seance_prepare'            :'Seance.btn_prepare',
    'a#btn_seance_start'              :'Seance.start',
    'a#btn_seance_replay'             :'Seance.replay',
    'span#seance_lib_working_time'    :'Label.working_time',
    'span#seance_lib_downtoup'        :'Seance.direction',
    'span#seance_lib_tone'           :'Label.tone',
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