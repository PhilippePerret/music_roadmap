/**
  * @module seance
  *
  * Objet gérant la séance de travail du musicien.
  *
  * @class Seance
  * @static
  *
  */
window.Seance = {
  ready           :false,   // Set to true when form is ready
  section_opened  :false,   // True if section seance is opened
  
  /** Les paramètres de la dernière séance de travail (confection). Ils sont
    * remontés au chargement de la feuille de route et permettent de repartir
    * avec les mêmes réglages.
    * @class last_params
    * @static
    */
  last_params:null,
  
  // During session
  running         :false,   // True when we work on the exercices suite
  pause_on        :false,   // Set to TRUE when we pause
  cur_exercice    :null,    // Current exercice (instance of Exercice)
  ordre_stack     :null,    // Stack of the exercices to play
  init_ordre_stack:null,    // Initial stack of exercices (in order to run previous)
  exercices_count :null,    // Number total of exercices to play
  curex_indice    :null,    // Index of the current exercice
  start_time      :null,    // Number of seconds for starting session time
  stop_time       :null,    // Number of seconds for stopping session time
  /**
    * Instance du chronomètre comptant le jeu de la séance
    * @property {Chrono} chronometre
    * @default NULL
    */
  chronometre     :null,

  // Key press handler (on seance)
  onkeypress:function(evt){
    switch(evt.charCode){
      case K_SPACE:
        evt.stopPropagation();
        /*
         * La touche espace remplit trois rôles :
         *    - Démarre la séance si elle n'est pas lancée
         *    - Passe à l'exercice suivant si on est en cours de séance
         *    - Sort de la pause si la pause est activée
         */ 
        if(this.pause_on)     this.pause();
        else if(this.running) this.next_exercice();
        else                  this.start();
        return false;
      case Key_p:
      case Key_P:
        evt.stopPropagation();
        if(this.running) this.pause();
        return false;break;
      case Key_s:
      case Key_S:
        evt.stopPropagation();
        if(this.running) this.stop(true);
        return false;break;
      case Key_m:
      case Key_M:
        evt.stopPropagation();
        Metronome.toggleMute();
        return false;break;
    }
    switch(evt.keyCode){
      case K_LARROW:
        evt.stopPropagation();
        return this.previous_exercice();
        break;
    }
  },
  // Start working session (either prepared session or normal session)
  start:function(){
    UI.open_volet('running_seance');
    if(false == this.set_exercices_stack())return this.show();
    Exercices.deselect_all();
    UI.set_visible('section#current_exercice');
    this.curex_indice = 0;
    this.start_time   = Time.now();
    this.chronometre  = UI.Chrono.start('span#curex_horloge_seance');
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
    this.init_ordre_stack = this.ordre_stack.concat([]);// => clone
    this.set_number_total_of_exercices();
    return true;
  },
  // Display information for current exercice
  display_infos_current_exercice:function(){
    var temp;//template
    var tone = Roadmap.Data.tone; // tonalité courante
    var human_tone = Tone.human(tone);
    var iex = this.cur_exercice; // Exercice Instance
    this.next_indice_current_exercice();
    var indics = [LOCALE_UI.Seance.Exinfos.exercice_doit];
    if(iex.symetric){
      indics.push(LOCALE_UI.Seance.Exinfos[Roadmap.Data.down_to_up?'to_up':'to_down']);
    }
    if(iex.tone == null){
      // Suivant le type de la suite harmonique, un message différent
      if(iex.suite == 'HA'){
        temp = LOCALE_UI.Seance.Exinfos.must_suivre_this_suite;//un template
        // Remplacer TONE, MAJ_MIN, EXEMPLE
        var maj_min = LOCALE_UI.Exercices.Config[Roadmap.Data.maj_to_rel?'maj_to_rel':'rel_to_maj'].toLowerCase();
        var next_tone = Tone.next_by_config_of(tone);
        var debut = [ human_tone, 
                      Tone.relative_of(tone,{human:true}),
                      Tone.human(next_tone),
                      Tone.relative_of(next_tone,{human:true})
                      ] ;
        temp = temp.replace(/TONE/,human_tone);
        temp = temp.replace(/MAJ_MIN/,maj_min);
        temp = temp.replace(/DEBUT/, debut.join(" -> "));
        indics.push(temp);
      } else if (iex.suite == 'WK'){
        indics.push(LOCALE_UI.Seance.Exinfos.must_be_played_in + human_tone);
      }
    }
    if(iex.note) indics.push(iex.note);
    indics.push("Durée moyenne : <span style=\"font-size:1.2em;display:block;margin-left:1em;\">"+
    Time.s2h(this.data_seance.duree_moyenne_par_ex[iex.id])+'</span>');
    if(indics != ""){
      $('div#curex_indications span.value').html(indics.join('<br>- '));
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
  // Special method to get back to previous exercice
  // (@note: when "<-" key is hit)
  previous_exercice:function(){
    var current_indice = this.init_ordre_stack.length - this.ordre_stack.length - 1;
    if (current_indice <= 0){
      F.show(MESSAGE.Seance.no_previous_ex);
      return false
    }
    var previous_ex = this.init_ordre_stack[current_indice - 1]
    this.ordre_stack.unshift(previous_ex, this.cur_exercice.id)
    this.curex_indice -= 2
    return this.next_exercice()
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
  // Pause the seance (ou reprend)
  pause:function(){
    var o = $('a#btn_seance_pause');
    this.cur_exercice.play(); //start or stop
    this.pause_on = !this.pause_on;
    o.html(LOCALE_UI.Seance[this.pause_on?'restart':'pause']);
    this.chronometre[this.pause_on?'pause':'unpause']()
    // UI.Chrono[this.pause_on?'pause':'unpause']('span#curex_horloge_seance');
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
    this.chronometre.stop()
    // UI.Chrono.stop('span#curex_horloge_seance');
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
    this.set_values() ;
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
    UI.Shortcuts.build(
      'div#seance_start_shortcuts',
      {shortcuts:'Seance', options:{current:true, open:true}}
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
    this.params_seance = this.get_values();
    if( this.params_seance == null ) return this.building = false;
    Flash.show( MESSAGE.thank_to_wait )
    Ajax.query({
      data:{
        proc          :'seance/build',
        rm_nom        :Roadmap.nom,
        user_mail     :User.mail,
        user_md5      :User.md5,
        params_seance :this.params_seance
      }, 
      success:$.proxy(this.suite_build, this)
    });
    return false;//pour le a-lien
  },
  // Retour ajax de la précédente
  suite_build:function(rajax){
    if(false==traite_rajax(rajax)){
      Flash.clean()
      this.data_seance = rajax.data_seance ; // les données remontées pour la séance
      if ( this.show_data_seance() ){
        Roadmap.Data.set_general_config($.extend(this.data_seance, this.params_seance));
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
      liste_ex.push(iex.titre_complet(vignette = true));
    }
    // Display data
    liste_ex    = liste_ex.join('<br>');
    var sens    = this.data_seance.maj_to_rel?'maj_to_rel':'rel_to_maj';
    var imgsens = UI.path_image('note/harmonic/'+sens+'.jpg')
    var dir     = this.data_seance.down_to_up?'down_to_up':'up_to_down';
    var imgdir  = UI.path_image('config/direction/'+dir+'.png');
    $('span#seance_data_working_time').html(Time.seconds_to_horloge(this.data_seance.working_time));
    Exercices.Edition.peuple_menu_tones('select#seance_tone');
    $('select#seance_tone').val(this.data_seance.tone);
    $('img#seance_data_img_tone').attr('src',UI.path_image('note/gamme/'+this.data_seance.tone+'.jpg'));
    $('span#seance_data_suite_harmonique').html(LOCALE_UI.Exercices.Config[sens]);
    $('img#seance_data_img_suite_harmonique').attr('src', imgsens);
    $('div#seance_data_suite_exercices').html(
      this.explication_couleurs() + liste_ex
    );
    $('span#seance_data_downtoup').html(LOCALE_UI.Exercices.Config[dir]);
    $('img#seance_data_img_downtoup').attr('src', imgdir);
    // On indique les exercices rejoués de la dernière séance
    for( i = 0, len = this.data_seance.idexs_rejoues.length; i<len; ++i)
    {
      var idex = this.data_seance.idexs_rejoues[i]
      $('div#seance-ex-'+idex).css('border-color','orange')
    }
    for( i = 0, len = this.data_seance.mandatories.length; i<len; ++i)
    {
      var idex = this.data_seance.mandatories[i]
      $('div#seance-ex-'+idex).css('border-color','red')
    }
    
    
    return true;//ok for the seance
  },
  // Explication des couleurs autour de certains exercices :
  // Orange : les exercices déjà joués à la session précédentes
  // Red : les exercices obligatoires si la case est cochées
  explication_couleurs:function()
  {
    return  '<div>'+
            (this.params_seance.options.obligatory?'<div>'+LOCALE_UI.Seance.color_mandatories+'</div>':'')+
            '<div>'+LOCALE_UI.Seance.color_replayed+'</div>'+
            '</div>'
  },
  // When user changes seance tone
  change_tone:function(tone){
    tone = parseInt(tone,10);
    this.data_seance.tone = tone;
    Roadmap.Data.tone     = tone;
    $('img#seance_data_img_tone').attr('src',UI.path_image('note/gamme/'+tone+'.jpg'));
    Exercices.set_tones_of_exercices(tone);
    Roadmap.save_general_config();
  },
  // 
  cancel_seance:function(){
    UI.open_volet('exercices');
    this.ordre_stack = null; // empties the stack
    return false;//for a-link
  },
  /** Méthode qui règle le formulaire de définition de la séance de travail
    * en prenant les derniers réglages utilisés pour la roadmap courante
    * @method set_values
    */
  set_values:function(params)
  {
    if(undefined == params){ params = this.last_params }
    if(!params || params == {}){ return }
    var wtime = parseInt(params.working_time) ;
    // Réglage du temps
    $('select#seance_duree_heures').val( Math.floor(wtime / 60) ) ;
    $('select#seance_duree_minutes').val( wtime % 60 ) ;
    // Réglage des options
    $.map(params.options, function(value, opt){
      $('input#seance_option_'+opt)[0].checked = value ;
    });
    // Peut-être que plus tard il faudra aussi remettre les difficultés choisies
    // ...
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