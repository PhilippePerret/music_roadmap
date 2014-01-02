/**
  * @module exercice
  * @class Exercice
  * @constructor
  *
  * Pour la gestion interactive des exercices de music-roadmap
  *
  */

window.EXERCICES = {length: 0} ; // Instances Exercice déjà créées

// Liste des propriétés enregistrées dans les data de l'exercice
window.EXERCICE_PROPERTIES = [
  'id', 'abs_id', 'titre', 'recueil', 'auteur', 'suite', 
  'tempo', 'tempo_min', 'tempo_max', 'up_tempo',
  'types', 'obligatory', 'with_next', 'symetric',
  'note', 'started_at', 'ended_at', 'created_at', 'updated_at',
  'nb_mesures', 'nb_temps', 'tone'
  ];

// Au lieu de créer une instance à chaque fois, on passe par cette méthode
// qui checke si l'exercice a déjà été instancié
window.exercice = function( foo ){
  if ('number' == typeof foo) foo = { 'id': foo.toString() } ;
  else if ('string' == typeof foo) foo = { 'id': foo.toString() } ;
  else id = foo['id'].toString() ;
  if ('undefined' == typeof EXERCICES[foo['id']]) new Exercice(foo);
  return EXERCICES[foo['id']] ;
}

function Exercice(data){
  this.id         =null;
  this.class      ="Exercice";
  this.abs_id     =null;  // ID absolu si l'exercice vient de la Database Exercices
  this.titre      =null;  // titre de l'exercice
  this.recueil    =null;  // Le recueil contenant l'exercice
  this.auteur     =null;  // Auteur de l'exercice (p.e. "Hanon")
  this.types      =null;  // Types de l'exercice (sur deux lettres/chiffres séparés par ',')
  this.tempo      =120;   // Tempo actuel
  this.tempo_min  =null;  // Tempo minimum requis
  this.tempo_max  =null;  // Tempo maximum requis
  this.suite      =null;  // Le type de suite (harmonic, normale, etc.). Cf. Exercices.TYPES_SUITE_HARMONIQUE
  this.tone       =null;  // Tonalité (0-C à 23-Bm)
  this.extrait    =null;  // Null ou path relatif à l'image de l'extrait
  this.vignette   =null;  // Null ou path relatif à la vignette
  this.up_tempo   =null;  // Mis à true si on doit augmenter le tempo la prochaine fois
  this.note       =null;  // Note sur l'exercice
  this.obligatory =false; // Pour savoir s'il est obligatoire
  this.with_next  =false; // Pour savoir s'il est lié au suivant
  this.symetric   =false; // Pour savoir si c'est un exercice de type symétrique
  this.started_at =null;  // Début du travail de l'exercice
  this.ended_at   =null;  // Fin du travail de l'exercice
  this.created_at =null;
  this.updated_at =null;
  
  // Propriétés volatiles
  this.loaded       =false; // Set by 'dispatch' method if data are defined
  this.playing      =false;
  this.w_duree      =null;  // Le temps de travail si l'exercice est
                            // travaillé au cours de la session
  this.w_start      =null;  // Début du travail (défini par play) (en sec)
  this.w_end        =null;  // Fin du travail (défini par play) (en sec)
  this.tempo_risen  =false; // mis à '+' ou '-' si le tempo a été changé
                            // Ne surtout pas mettre après l'appel de
                            // `rise_tempo' ci-dessous
  
  if ( "string" == typeof data ){
    this.id = data;
  } else {
    this.dispatch( data ) ;
    // S'il y a eu une demande changement de tempo pour la prochaine séance
    // on modifie la valeur ici.
    if ( this.up_tempo ) this.rise_tempo() ;
  }
  // On l'ajoute à la liste
  EXERCICES[this.id] = this ;
  EXERCICES.length ++ ;
  
}

/**
  * Méthodes de classe
  */
$.extend(Exercice,{
  /**
    * @class Exercice.Dom
    * @static
    * Pour tout ce qui concerne le DOM
    */
  Dom:{
    /**
      * Return le code HTML pour le "footer" de chaque exercice
      * @method footer_buttons_for
      * @param  {Exercice} iex Instance de l'exercice
      */
    footer_buttons_for:function(iex)
    {
      return  '<div class="ex_footer">'+
                this.button_delete_for(iex)+
              '</div>'
    },
    /* Return le code HTML du bouton pour jouer l'exercice +iex+ */
    button_play_for:function(iex)
    {
      return '<a id="btn_clic-'+iex.id+'"class="btn_clic petit btn" onclick="$.proxy(Exercices.play, Exercices, \''+iex.id+'\')()">Play</a>'    
    },
    /* Return le code HTML du bouton pour éditer l'exercice */
    button_edit_for:function(iex)
    {
      return '<a class="btn_edit petit btn" onclick="$.proxy(Exercices.edit, Exercices, \''+iex.id+'\')()">Edit</a>'
    },
    /* Return le code HTML du bouton pour détruire l'exercice */
    button_delete_for:function(iex)
    {
      return '<a class="btn_del" onclick="$.proxy(Exercices.delete, Exercices, \''+iex.id+'\')()">'+LOCALE_UI.Exercice.remove+'</a>'
    }
  }
})

/*
  * Extension du prototype Exercice
  *
  */
$.extend(Exercice.prototype,{
  /**
    * Sauvegarde de l'exercice
    *
    * @method save
    * @async
    * @param  {Function|Null} fx_suite  La méthode pour suivre
    *
    */
  save:function(fx_suite)
  {
    if('undefined' == typeof fx_suite) fx_suite = $.proxy(this.end_save, this) ;
    this.saving = true ;
    Ajax.query({
      data:{
        proc:'exercice/save',
        roadmap_nom : Roadmap.nom, 
        mail        : User.mail,
        md5         : User.md5,
        data        : this.as_hash()
      },
      success : fx_suite
    })
  },

  /**
    * Retourne la balise LI de l'exercice
    * @method li
    * @return {DOMElement} Balise LI
    */
  li:function()
  {
    return $('ul#exercices > li#li_ex-'+this.id);
  },
  
  /**
    * Dispatch les données +data+ dans l'exercice.
    * Notes
    *   * Toutes les valeurs "" sont mises à NULL
    *   * Met la propriété `loaded` à true.
    *   * Cette méthode a un alias : `update`
    * @method dispatch
    * @param  {Object} data Données à dispatcher
    */
  dispatch:function(data)
  {
    for( var k in data ) {
      if ( data[k] == "" ) data[k] = null ;
      this[k] = data[k] ;
    }
    // Est-ce qu'on peut considérer l'exercice comme chargé ?
    if(this.id == null || this.titre==null) return;
    if(this.tempo==null || this.tempo_min==null || this.tempo_max==null)return;
    // Otherwise, exercice is loaded
    this.loaded = true;
  }
})

// Convenient alias
Exercice.prototype.update = Exercice.prototype.dispatch

// Sélection/Déselection de l'exercice
// (et focus sur son menu tempo)
Exercice.prototype.select = function(){
  this.li().addClass('selected') ;
  this.scroll_to();
  this.li().find('select.ex_tempo').focus();
  this.set_image_extrait(true);
}
// Scroll jusqu'à l'exercice
Exercice.prototype.scroll_to = function(){
  UI.scroll_to('li#li_ex-'+this.id, 'ul#exercices', 10);
  window.timer = setTimeout("wait_and_scroll_to()", 1000);
}
function wait_and_scroll_to(){
  $('html').scrollTo(0);
  clearTimeout(window.timer);
  window.timer = null;
}
Exercice.prototype.deselect = function(){
  this.li().removeClass('selected') ;
  this.set_image_extrait(false);
}
// Mise en édition de l'exercice
Exercice.prototype.edit = function(){
  if (User.is_not_owner()) return false ;
  $.proxy(Exercices.Edition.set_btn_save,Exercices.Edition,LOCALE_UI.Exercice.update)() ;
  $.proxy(Exercices.Edition.set_values,Exercices.Edition, this.as_hash())() ;
  $.proxy(Exercices.Edition.open,Exercices.Edition)() ;
}
// Supprime l'exercice de la liste des exercices
Exercice.prototype.remove = function(){
  this.li().remove();
}
// Construction du div de l'exercice
Exercice.prototype.build = function(after){
  // log("-> <Exercice>.build (id="+this.id+")") ;
  var next = null ;
  var o = $('li#li_ex-'+this.id) ;
  // Actualisation ?
  if ( o.length > 0 ){
    if ( o.prev().length ) after = o.prev().attr('id').split('-')[1] ;
    else if ( o.next().length ) next = o.next() ;
    o.remove() ;
  } 
  // Construction du LI
  var li = this.code_html() ;
  // Insertion dans le document
  if ( next )
    next.before( li ) ;
  if( 'undefined' == typeof after )
    $('ul#exercices').append( li ) ;
  else
    $('li#li_ex-'+after).after( li ) ;
  // Réglage du tempo
  $('select#tempo_ex-'+this.id).val( this.tempo );
  // Réglage de la tonalité
  this.set_tone();
}
// TRUE if we can change the tone of this exercice
Exercice.prototype.has_variable_tone = function(){
  return (this.suite == 'WK' || this.suite == 'TO');
}
Exercice.prototype.set_tone = function(){
  var valtone;
  if (this.has_variable_tone()){
    valtone = this.tone || Roadmap.Data.tone;
  } else if (this.suite == 'HA' || this.suite == '00'){
    valtone = "";
  }
  $('select#tone_ex-'+this.id).val(valtone);
}
Exercice.prototype.end_save = function(rajax){
  if (rajax['error']) F.error( rajax['error'] ) ;
  else F.show("Exercice enregistré.") ;
  this.saving = false ; // pour interrompre la boucle d'attente
}

Exercice.prototype.as_hash = function(){
  var data = {}, k, i ;
  for(var i in EXERCICE_PROPERTIES ){
    k = EXERCICE_PROPERTIES[i];
    data[k] = this[k] ;}
  return data ;
}

// Return techniques (types) of exercice as human string
Exercice.prototype.types_as_human = function(delimiter){
  if('undefined' == typeof delimiter) delimiter = ", ";
  var techs = [];
  for(var i in this.types){
    techs.push(Exercices.TYPES_EXERCICE[this.types[i]]);
  }
  return techs.join(delimiter) + ".";
}

// => Retourne le code HTML du li de l'exercice
Exercice.prototype.code_html = function(){
  return  '<li id="li_ex-'+this.id+'" class="ex">' +
            this.code_btns_edition() +
            this.code_vignette() +
            this.code_div_titre() +
            this.code_tempo_et_tones() +
            this.code_suite() +
            this.code_note() +
            this.code_footer_buttons() + 
            '</li>'
}

/**
  * Retourne le code HTML pour les boutons du "footer" de l'exercice
  * (le lien pour retirer l'exercice de la roadmap)
  * @method code_footer_buttons
  * @return {StringHTML} Le code à écrire dans le LI de l'exercice
  */
Exercice.prototype.code_footer_buttons = function()
{
  return Exercice.Dom.footer_buttons_for(this)
}

// Règle le bouton pour le métronome
// 
// @param   running     True si l'exercice doit être en jeu, FALSE dans le cas contraire
// 
// @note: on ne se sert pas de la valeur this.playing, car au moment où la méthode est
// appelée, this.playing n'a peut-être pas encore la bonne valeur (définie par exemple à
// FALSE seulement après l'enregistrement d'une durée de jeu, qui peut être très lointain
// lorsque la durée de jeu excède l'heure et qu'on doit avoir confirmation du musicien)
Exercice.prototype.set_btn_metronome = function( running ){
  $("li#li_ex-"+this.id+" a#btn_clic-"+this.id).html(running ? 'STOP' : 'Play') ;
}
Exercice.prototype.code_btns_edition = function(){
  return  '<div class="btns_edition">' +
            Exercice.Dom.button_edit_for(this) +
            Exercice.Dom.button_play_for(this) +
          '</div>'
}
// Return le code d'affichage de la vignette for main listing (if any)
Exercice.prototype.code_vignette = function(){
  if ( this.vignette == null ) return "" ;
  return '<div id="div_ex_image-'+this.id+'" class="div_ex_image">' +
            '<img class="ex_image" id="image_ex-'+this.id+'"'+
            ' src="' + this.vignette + '"' + 
            this.onclick_pour_extrait() +
            ' />' + 
          '</div>';
}
// Return HTML code for vignette in listing but ul#exercices (e.g. in report)
Exercice.prototype.vignette_listing = function(style){
  if ( this.vignette == null ) return "" ;
  if(undefined == style) style = ""
  else style = " style=\"" + style + "\""
  return '<img class="ex_vignette"' +
            ' src="' + this.vignette + '"' + 
            this.onclick_pour_extrait() +
            style +
            ' />';
}
Exercice.prototype.set_image_extrait = function(extrait){
  $('img#image_ex-'+this.id).attr('src', this[extrait ? 'extrait':'vignette']);
}
// Return le code HTML onclick="..." pour afficher l'extrait (if any)
Exercice.prototype.onclick_pour_extrait = function(){
  if (this.extrait == null ) return "" ;
  return ' onclick="return $.proxy(Exercices.show_partition,Exercices,\''+this.extrait+'\')()"';
  
}
// Return title for simple listing (e.g. in report ou présentation session)
// @param vignette    Si TRUE affiche le tout en regard de sa vignette
Exercice.prototype.titre_complet = function(vignette){
  if(undefined == vignette) vignette = false
  titre = this.titre
  if(this.recueil)  titre += " - " + this.recueil
  if(this.auteur)   titre += " - " + this.auteur
  if(vignette)
  {
    return '<div id="seance-ex-'+this.id+'" style="border:1px solid white;">' + 
              '<div class="fright" style="width:300px;">' + titre + '</div>' +
              '<div>' + this.vignette_listing('width:130px;') + '</div>'+
            '</div>'
  }
  else return titre
}
Exercice.prototype.code_div_titre = function(){
  var recueil = this.recueil ? '<span class="ex_recueil">'+this.recueil+'</span>': "" ;
  var auteur  = this.auteur ? ' <span class="ex_auteur"> ('+this.auteur+')</span>':"";
  var titre   = '<span class="ex_titre">' + this.titre + '</span>' ;
  titre = recueil + auteur + titre ;
  return '<div id="titre_ex-'+this.id+'" class="ex_titre">' + titre + '</div>' ;
}
Exercice.prototype.code_tempo_et_tones = function(){
  var h = ""
  h += '<div id="tempi_ex-'+this.id+'" class="ex_tempo">' ;
  h += '<a class="ex_id" onclick="$.proxy(Exercices.show_path,Exercices,\''+this.id+'\')()">[ID '+this.id + "]</a>" ;      // ID
  var meth = "$.proxy(Exercices.onchange_tempo, Exercices, '"+this.id+"', this.value)()" ;
  if ( this.tempo_risen ){
    var sens = LOCALE_UI.Label[this.tempo_risen.substring(0,1) == '+' ? 'increased' : "decreased"];
    h += '<span class="red">' + sens + ' (' + this.tempo_risen + ') </span>' ;
  }
  h += ' <select id="tempo_ex-'+this.id+'" class="ex_tempo" onchange="'+meth+'">' +
        Exercices.Edition.options_list(this.tempo_min, this.tempo_max) + '</select>' ;
  h += this.span_tempo_de_a() ;
  h += this.code_tones();
  h += '<div class="div_up_tempo">' + LOCALE_UI.Label.in_next_session + ', ' + this.menu_up_tempo()+ '</div>' ;
  h += "</div>" ;
  return h ;
}
// Return select for current tone of ex
// @note: ce menu ne doit avoir aucune action. Il est simplement lu par 
// l'instance au moment où on doit enregistrer son temps de travail, pour savoir
// dans quelle tonalité l'exercice/morceau a été joué
Exercice.prototype.code_tones = function(){
  return '<select id="tone_ex-'+this.id+'" class="tones">' +
          Exercices.Edition.options_of_select_tones() + 
          '</select>';
}
Exercice.prototype.span_tempo_de_a = function(){
  return ' <span id="tempo_de_a_ex-'+this.id+'">(' +
          "de " + this.tempo_min + 
          " à " + this.tempo_max + 
          ')</span>' ;
}
Exercice.prototype.menu_up_tempo = function(){
  var meth = '$.proxy(Exercices.set_up_tempo, Exercices,\''+this.id+'\', this)()' ;
  var options = [], pul ;
  var liste_incs = [1, 2, 4] ;
  for(var i in liste_incs ){
    var inc = liste_incs[i] ;
    pul = LOCALE_UI.Label.pulse + (inc > 1 ? "s" : "") ;
    options.unshift('<option value="'+inc+'">'+inc+" "+pul+"</option>");
    options.push('<option value="-'+inc+'">-'+inc+" "+pul+"</option>");
  }
  return '<select class="ex_menu_uptempo inherit" onchange="'+meth+'">' +
            '<option value="0">'+LOCALE_UI.Verb.increase + '/' +LOCALE_UI.Verb.decrease + ' ' + LOCALE_UI.Label.de_by + '…</option>'+
            options.join("") + '</select>';
}
// On monte le tempo quand il a été indiqué, à la précédente session, que ce
// tempo devait être élevé
Exercice.prototype.rise_tempo = function(){
  var signe ;
  if (this.up_tempo.length == 2){
    signe = '-' ;
    value = parseInt(this.up_tempo.substring(1,2)) ; 
  } else {
    signe = '+' ;
    value = parseInt(this.up_tempo) ;
  }
  this.tempo_risen = signe.toString() + value.toString() ; // Pour l'affichage
  var newtempo = parseInt(this.tempo, 10) ;
  newtempo = (signe == "+") ? newtempo += value : newtempo -= value ;
  this.up_tempo = null ;
  this.tempo = newtempo ;
  this.save() ;
}
// Code suivant la suite. On n'affiche pour le moment quelque chose que si
// c'est une suite harmonique, qu'il faut donc définir en fonction de
// maj_to_rel
Exercice.prototype.code_suite = function(){
  var h = '<div class="ex_suite petit">' ;
  if (this.suite == 'harmonic'){
    // @TODO: Remplacer par une image
    h += Roadmap.Data.maj_to_rel ? "MAJ -> Rel" : "Rel -> MAJ"
  }
  h += '</div>';
  return h ;
}
// Code HTML pour la note si elle existe
Exercice.prototype.code_note = function(){
  if(this.note == null ) return "" ;
  var h = '<div class="ex_note" class="petit">' ;
  h += "<i>Note</i> : " + this.note ;
  h += '</div>' ;
  return h ;
}
// Lance ou arrête le métronome
// @param dont_stop_metronome Si mis à true, le métronome continue de battre
//                            Cela arrive quand un autre exercice et lancé.
Exercice.prototype.play = function(dont_stop_metronome){
  var running;
  if (this.playing){ this.stop_exercice(dont_stop_metronome) ; running = false }
  else{              this.start_exercice() ; running = true }
  this.set_btn_metronome(running);
}
// Méthode appelée par Exercices.deselect() si l'exercice était en train
// de jouer.
Exercice.prototype.stop = function(){
  // if(console)console.log("-> stop");
  this.play(true) ;
  // if(console)console.log("<- stop");
}

// Met en route le jeu de l'exercice
Exercice.prototype.start_exercice = function(){
  this.playing = true ;
  this.w_start = Time.now() ;
  $.proxy(Metronome.start, Metronome, this.tempo)() ;
  Exercices.select(this.id) ;
  this.w_end   = null ;
}
// Arrête l'exercice en train de jouer
// 
// Si dont_stop_metronome est true (false par défaut), on n'arrête pas le métronome
// (utile lorsqu'on joue une série d'exercices)
// 
// @noter qu'on ne mettra le `playing` de l'exercice à false qu'une fois l'enregistrement
// de la durée effectué (donc: on se trouvera parfois avec deux exercices qui ont cette
// propriété à true, quand une durée de jeu d'un exercice est en train d'être enregistrée
// tandis que l'exercice suivant est déjà en train d'être joué).
// 
Exercice.prototype.stop_exercice = function(dont_stop_metronome){
  // if(console)console.log("-> stop_exercice");
  if ( ! dont_stop_metronome ) $.proxy(Metronome.stop, Metronome)();
  this.w_end    = Time.now() ;
  this.calc_duree_travail() ;
  if(Seance.data_seance && Seance.data_seance.duree_moyenne_par_ex){
    var jeu = this.w_duree;
    var moy = Seance.data_seance.duree_moyenne_par_ex[this.id];
    var dif = moy - jeu;
    // Note : si négatif on a été moins vite, sinon plus vite
    $('div#curex_info_prev').html(this.titre);
    $('span#curex_duree_jeu_prev').html(Time.s2h(jeu));
    $('span#curex_duree_moyenne_prev').html(Time.s2h(moy));
    if(dif>0) mess = "+ vite de "+Time.s2h(dif);
    else mess = "- vite de "+Time.s2h(-dif);
    $('div#curex_difference_jeu').html(mess);
  }
  // if(console)console.log("<- stop_exercice");
}

/* Calcul de la durée de travail de l'exercice

  Si la durée a été suffisante ( > à 30 secondes), alors on enregistre cette durée dans le
  fichier des données de durée de jeu. Sinon, on indique au musicien que le temps de travail
  a été trop court pour l'enregistrer.
  On affiche aussi une alerte lorsque le temps de travail a dépassé l'heure, pour avoir 
  confirmation que le musicien a bien travaillé tout ce temps. S'il confirme, on enregistre
  aussi cette durée de travail.

*/
Exercice.prototype.calc_duree_travail = function(){
  if (this.w_start == null || this.w_end == null) {
    this.playing = false ;
    return F.error("Impossible de calculer la durée de travail de l'exercice (une valeur null)");
  }
  this.w_duree = this.w_end - this.w_start ;
  if ( this.w_duree > 60 * 60 ){
    // Demande de confirmation
    var mes = MESSAGE.Exercice.really_save_duree_travail + '<br />' +
          '<a href="#" id="cancel_save_duree_jeu" class="petit btn" onclick="exercice(\''+this.id+'\').playing=false;return Flash.clean();">' + LOCALE_UI.Verb.Cancel + '</a>&nbsp;&nbsp;&nbsp;&nbsp;' +
          '<a href="#" class="petit btn" onclick="return exercice(\''+this.id+'\').save_duree_travail();">' +
          LOCALE_UI.Exercice.save_duree_travail + '</a>' ;
    F.error(mes);
  } else if ( this.w_duree > 30 ){
    // On peut mémoriser le travail sur cet exercice
    this.save_duree_travail();
  } else {
    // Temps insuffisant pour mémoriser l'exercice
    F.show(MESSAGE.Exercice.working_time_insuffisant + " (" + this.w_duree + "\")");
    this.playing = false ;
    // Si une méthode après sauvegarde (de la durée, ici) a été définie, il
    // faut l'appeler maintenant
    this.call_method_after_save();
  }
}

/* Enregistre la durée du travail sur l'exercice */
Exercice.prototype.save_duree_travail = function(rajax){
  if ('undefined' == typeof rajax){
    // Procéder à l'enregistrement
    this.ajax_on = true ;
    Ajax.query({
      data:{
        proc:       'exercice/save_duree_travail',
        roadmap_nom :Roadmap.nom,
        user_mail   :User.mail,
        user_md5    :User.md5,
        ex_id       :this.id,
        ex_w_duree  :this.w_duree,
        ex_tempo    :this.tempo,
        tone        :this.get_tone() || this.tone || Exercices._tone(),
        config      :Exercices._config()
      },
      success: $.proxy(this.save_duree_travail, this)
    });
    return false; // pour le a-lien si c'est appelé depuis un message
  } else {
    if (false == traite_rajax(rajax)){
      F.show(MESSAGE.Exercice.work_on_exercice_saved + " ("+
              Time.seconds_to_horloge(parseInt(rajax.duree,10))+")");
    }
    // Est-ce qu'une méthode est à appeler après la sauvegarde ?
    this.call_method_after_save();
    this.playing = false;
    this.ajax_on = false;
  }
}
Exercice.prototype.get_tone = function(){
  var menutone = $('li#li_ex-'+this.id+' select#tone_ex-'+this.id);
  if(menutone.length == 0) return null;
  return parseInt(menutone.val(),10);
}
Exercice.prototype.call_method_after_save = function(){
  if('function' == typeof this.fx_after_save){
    this.fx_after_save();
    this.fx_after_save = null;
  }
}