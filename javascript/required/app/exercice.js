/*
    Class Exercice
    --------------
    Pour la gestion des exercices
    
*/

window.EXERCICES = {length: 0} ; // Instances Exercice déjà créées

// Liste des propriétés enregistrées dans les data de l'exercice
window.EXERCICE_PROPERTIES = [
  'id', 'abs_id', 'titre', 'recueil', 'auteur', 'suite', 
  'tempo', 'tempo_min', 'tempo_max', 'up_tempo',
  'types', 'obligatory', 'with_next',
  'note', 'started_at', 'ended_at', 'created_at', 'updated_at'
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
  this.id         = null ;
  this.class      = "Exercice" ;
  this.abs_id     = null ;  // ID absolu si l'exercice vient de la Database Exercices
  this.titre      = null ;  // titre de l'exercice
  this.recueil    = null ;  // Le recueil contenant l'exercice
  this.auteur     = null ;  // Auteur de l'exercice (p.e. "Hanon")
  this.types      = null ;  // Types de l'exercice (sur deux lettres/chiffres séparés par ',')
  this.tempo      = 120  ;  // Tempo actuel
  this.suite      = null ;  // Le type de suite (harmonic, normale, etc.)
  // this.image      = null ;  // L'image éventuelle (partition) OBSOLÈTE (cf. extrait et vignette)
  this.extrait    = null ;  // Null ou path relatif à l'image de l'extrait
  this.vignette   = null ;  // Null ou path relatif à la vignette
  this.tempo_min  = null ;  // Tempo minimum requis
  this.tempo_max  = null ;  // Tempo maximum requis
  this.up_tempo   = null ;  // Mis à true si on doit augmenter le tempo la prochaine fois
  this.note       = null ;  // Note sur l'exercice
  this.obligatory = false;  // Pour savoir s'il est obligatoire
  this.with_next  = false;  // Pour savoir s'il est lié au suivant
  this.started_at = null ;  // Début du travail de l'exercice
  this.ended_at   = null ;  // Fin du travail de l'exercice
  this.created_at = null ;
  this.updated_at = null ;
  
  // Propriétés volatiles
  this.playing      = false ;
  this.w_duree      = null  ; // Le temps de travail si l'exercice est
                              // travaillé au cours de la session
  this.w_start      = null  ; // Début du travail (défini par play) (en sec)
  this.w_end        = null  ; // Fin du travail (défini par play) (en sec)
  this.tempo_risen  = false ; // mis à '+' ou '-' si le tempo a été changé
                              // Ne surtout pas mettre après l'appel de
                              // `rise_tempo' ci-dessous
  
  if ( "string" == typeof data ){
    this.id = data ;
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
// => Retourne le LI de l'exercice
Exercice.prototype.li = function(){
  return $('ul#exercices > li#li_ex-'+this.id);
}
// Sélection/Déselection de l'exercice
// (et focus sur son menu tempo)
Exercice.prototype.select = function(){
  this.li().addClass('selected') ;
  this.li().find('select.ex_tempo').focus();
}
Exercice.prototype.deselect = function(){
  this.li().removeClass('selected') ;
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
  $('select#tempo_ex-'+this.id).val( this.tempo ) ;
}
// Sauvegarde de l'exercice
Exercice.prototype.save = function(fx_suite){
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
// Dispatch les données +data+
// @note: toutes les valeurs "" sont mises à null
Exercice.prototype.dispatch = function(data){
  for( var k in data ) {
    if ( data[k] == "" ) data[k] = null ;
    this[k] = data[k] ;
  }
}
// Convenient alias
Exercice.prototype.update = Exercice.prototype.dispatch

// => Retourne le code HTML du li de l'exercice
Exercice.prototype.code_html = function(){
  // log("-> <Exercice>.code_html") ;
  var li = "" ;
  li += '<li id="li_ex-'+this.id+'" class="ex">' ;
  li += this.code_btns_edition() ;
  li += this.code_vignette() ;
  li += this.code_div_titre() ;
  li += this.code_tempo() ;
  li += this.code_suite() ;
  li += this.code_note() ;
  li += '</li>'
  // log("<- <Exercice>.code_html") ;
  return li ;
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
  var div = '<div class="btns_edition">' ;
  div += '<a class="btn_del petit btn" onclick="$.proxy(Exercices.delete, Exercices, \''+this.id+'\')()">Sup</a>';
  div += '<a class="btn_edit petit btn" onclick="$.proxy(Exercices.edit, Exercices, \''+this.id+'\')()">Edit</a>';
  div += '<a id="btn_clic-'+this.id+'"class="btn_clic petit btn" onclick="$.proxy(Exercices.play, Exercices, \''+this.id+'\')()">Play</a>';
  div += '</div>' ;
  return div ;
}
// Return le code d'affichage de la vignette (if any)
Exercice.prototype.code_vignette = function(){
  if ( this.vignette == null ) return "" ;
  return '<img class="ex_image" id="image_ex-'+this.id+'"'+
          ' src="' + this.vignette + '"' + 
          this.onclick_pour_extrait() +
          ' />' ;
}
// Return le code HTML onclick="..." pour afficher l'extrait (if any)
Exercice.prototype.onclick_pour_extrait = function(){
  if (this.extrait == null ) return "" ;
  return ' onclick="return $.proxy(Exercices.show_partition,Exercices,\''+this.extrait+'\')()"';
  
}
Exercice.prototype.code_div_titre = function(){
  var recueil = this.recueil ? '<span class="ex_recueil">'+this.recueil+'</span>': "" ;
  var auteur  = this.auteur ? ' <span class="ex_auteur"> ('+this.auteur+')</span>':"";
  var titre   = '<span class="ex_titre">' + this.titre + '</span>' ;
  titre = recueil + auteur + '<br />' + titre ;
  return '<div id="titre_ex-'+this.id+'" class="ex_titre">' + titre + '</div>' ;
}
Exercice.prototype.code_tempo = function(){
  var h = ""
  h += '<div id="tempi_ex-'+this.id+'" class="ex_tempo">' ;
  h += '<a class="ex_id" onclick="$.proxy(Exercices.show_path,Exercices,\''+this.id+'\')()">[ID '+this.id + "]</a>" ;      // ID
  var meth = "$.proxy(Exercices.onchange_tempo, Exercices, '"+this.id+"', this.value)()" ;
  h += 'Tempo ' ;
  if ( this.tempo_risen ){
    var sens = LOCALE_UI.Label[this.tempo_risen.substring(0,1) == '+' ? 'increased' : "decreased"];
    h += '<span class="red">' + sens + ' (' + this.tempo_risen + ') </span>' ;
  }
  h += ' <select id="tempo_ex-'+this.id+'" class="ex_tempo" onchange="'+meth+'">' +
        Exercices.Edition.options_list(this.tempo_min, this.tempo_max) + '</select>' ;
  h += this.span_tempo_de_a() ;
  h += '<div>' + LOCALE_UI.Label.in_next_session + ', ' + this.menu_up_tempo()+ '.</div>' ;
  h += "</div>" ;
  return h ;
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
    var suite = Roadmap.Data.maj_to_rel ?
          "C->Am F->Dm Bb->Gm Eb->Cm Ab->Fm Db->Bbm Gb->Ebm B->G#m E->C#m A->F#m D->Bm G->Em C"
        : "Am->C Em->G Bm->D F#m->A C#m->E G#m->B D#m->F# Bbm->Db Fm->Ab Cm->Eb Gm->Bb Dm->F Am"        
    h += "Aujourd'hui : " + suite ;
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
Exercice.prototype.play = function( dont_stop_metronome ){
  var running;
  if (this.playing){ this.stop_exercice( dont_stop_metronome ) ; running = false }
  else{              this.start_exercice() ; running = true }
  this.set_btn_metronome(running);
}
// Méthode appelée par Exercices.deselect() si l'exercice était en train
// de jouer.
Exercice.prototype.stop = function(){
  this.play( true ) ;
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
  if ( ! dont_stop_metronome ) $.proxy(Metronome.stop, Metronome)();
  this.w_end    = Time.now() ;
  this.calc_duree_travail() ;
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
    F.show("L'exercice n'a été travaillé que "+this.w_duree+" secondes, je ne l'enregistre pas.");
    this.playing = false ;
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
        scale       :Exercices._scale(),
        config      :Exercices._config()
      },
      success: $.proxy(this.save_duree_travail, this)
    });
    return false; // pour le a-lien si c'est appelé depuis un message
  } else {
    if (false == traite_rajax(rajax)){
      F.show(MESSAGE.Exercice.work_on_exercice_saved);
    }
    this.playing = false;
    this.ajax_on = false;
  }
}