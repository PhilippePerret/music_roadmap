/*
  Class Flash
  
  Pour l'affichage de message interactif dans la page
  
  Require dans toutes les pages un div#flash
  
  @raccourci:       F
  
*/
window.Flash={
  klass         : null,
  class         : "Flash",
  
  // Durée pour l'UNIVERSAL TIMER
  // (un compte à appliqué dans tous les cas au message, pour le supprimer 
  // s'il reste trop longtemp — en cas d'erreur par exemple. Ici, il est 
  // réglé à deux minutes si sa valeur est 2*60)
  DUREE_UTIMER  : 2*60,     // en secondes
  on            : true,
  options       : {
    keep      : false,      // Pour laisser ou non le texte précédent
    timer     : true,       // Pour lancer ou non le timer
  },     // Les options pour l'affichage du message
  keep        : false,    // Si true, on ne met pas de timer sur le message
  // DOIT DEVENIR OBSOLÈTE : remplacer par options.keep
  // Pour que certains messages d'erreur restent, 
                            // utiliser : F.error("<le message>", true ) ;
  with_error:     false,    // Pour savoir si c'est un message avec erreur
                            // (=> pas de timer)
  no_timer:       false,    // Mis à true pour ne pas fermer le message
  timer:          null,
  textes:         null,     // Textes finaux à afficher (liste de divs)
  duree_lecture:  null,     // Temps approximatif de lecture du message
  texte_brut:     null,     // Texte sans balise (pour calcul durée)
  /*
    Affiche un message
    ------------------
    @param  p   Les données du message. Soit un string simple, dans ce cas
                le message sera écrit dans un div.notice, soit un Array
                contenant des éléments Hash définissant chacun :
                type    :   Le type du message (class css), parmi 'warning',
                            'notice', 'doux'
                message :   Le message à afficher.
    @param  options   Les options pour l'affichage.
                      keep      Si true, le message précédent est gardé.
                      timer     Si false, pas de timer sur le message
  */
  show:function(p, options){
    if ('undefined' == typeof options) options = {
      // Valeurs par défaut
      timer: true,    // mettre à false pour retirer le timer
                      // note : le “timer universel tournera quand même”
      keep: false,    // mettre à true pour laisser le message précédent
    } ;
    this.options = options ;
    this.with_error == false;
    if('string'==typeof p) p = {message:p, type:'notice'};
    this.definir_messages( p );
    if ( options.timer !== false ) this.calcule_duree_lecture();
    this.affiche_messages( options ); 
    // Réglage du timer
    $.proxy(this.kill_current_timer, this)() ;
    if( options.timer ) $.proxy(this.set_timer,this)();
    // Dans tous les cas, il faut (re)lancer le timer universel
    this.run_utimer() ;
    return true ;
  },
  utimer: null,
  run_utimer: function(){
    if (this.utimer != null ) clearTimeout( this.utimer ) ;
    this.utimer = setTimeout( "$.proxy(Flash.clean,Flash)()", this.DUREE_UTIMER * 1000 ) ;
  },
  warning: function( message_erreur, options ){
    this.show( { message: message_erreur, type: 'warning' }, options) ;
    return false ;
  },
  // Affiche le message d'erreur +message_erreur+ et retourne false
  error: function( message_erreur, options ){
    return this.warning(message_erreur, options) 
  },
  
  // Affiche les messages dans la fenêtre
  // @param   options   Cf. la méthode show ci-dessus
  affiche_messages: function(options){
    oflash = $('#flash') ;
    // oflash.hide() ;
    if ( $('#inner_flash').length > 0){
      if ( options.keep == false ) $('#inner_flash').html('') ;
      $('#inner_flash').append( this.textes ) ;
    } else {
      oflash.html('<div id="inner_flash">' + this.textes + '</div>');      
    }
      
    if( false == $(oflash).is(':visible') ) oflash.fadeIn();
  },
  definir_messages: function( p ){
    var _i, key ;
    if( 'string' == typeof  p ) p = [{message:p.replace(/\\("|')/g,'$1'), type:'notice' }] ;
    if ( 'object' == typeof p ) p = [ p ] ;
    this.textes     = "" ;
    this.texte_brut = "" ;
    for(_i=0, _len=p.length;_i<_len;++_i){
      dm = p[_i];
      if ( dm.type == 'warning' || dm.type == 'error') this.with_error = true ;
      this.textes += "<div class=\"flash "+dm.type+"\">" + 
                      '<span class="'+dm.type+'">' + dm.message + '</span></div>';
      this.texte_brut += dm.message ;
      }
    this.textes = this.textes.replace( /\n/g, '<br />' ) ;
  },
  clean:function(){
    $('#flash').fadeOut( null,function(){$(this).html("");});
    if (this.timer != null) clearTimeout( this.timer ) ;
    this.on = false;
  },
  // Placer un timeout pour fermer le message flash (sauf si c'est
  // une erreur)
  set_timer: function(){
    this.on = true;
    if( this.options.timer === false ) return ;
    // if ( ($('#inner_flash').length && this.check_if_not_a_warning()) ){
    if ( true ){
      if(this.duree_lecture == null) this.calcule_duree_lecture();
      this.timer = setTimeout("Flash.clean()", this.duree_lecture * 1000) ;
    }
  },
  // Détruit le compte à rebours s'il existe
  kill_current_timer: function(){
    if ( this.timer == null ) return ;
    clearTimeout(this.timer) ;
    this.timer = null ;
  },
  // Verifie qu'il n'y ait bien aucune erreur affichée
  // On table large, en recherchant seulement 'warning' dans tout le
  // inner_flash
  // @note:   On ne vérifie que si this.with_error est false
  check_if_not_a_warning: function(){
    var my = Flash ;
    if ( my.with_error ) return false ;
    var messages = $('#inner_flash').html() ;
    return messages.indexOf('warning') < 0 ;
  },
  // Durée de lecture du message (en secondes, pour le timer)
  calcule_duree_lecture: function(){
    if(this.texte_brut == null) this.define_texte_brut();
    this.duree_lecture = parseInt(this.texte_brut.length / 6, 10);
    if(this.duree_lecture < 10)this.duree_lecture = 5;
  },
  // On doit définir le texte brut quand c'est un rechargement de page
  // et qu'il y a un message flash affiché
  define_texte_brut: function(){
    this.texte_brut = $('#inner_flash').html().replace(/<([^>]*>)/g, '');
  }
  
}
Flash.klass=Flash;

window.F = Flash; // raccourci