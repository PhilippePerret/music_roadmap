/*
  Class Flash
  
  Pour l'affichage de message interactif dans la page
  
  Require dans toutes les pages : div#flash
  
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
    this.kill_timers();
    this.set_options(options);
    this.definir_messages(p);
    this.affiche_messages(); 
    this.run_timers();
    return true ;
  },
  warning: function( message_erreur, options ){
    this.show( { message: message_erreur, type: 'warning' }, options) ;
    return false ;
  },
  // Affiche le message d'erreur +message_erreur+ et retourne false
  error: function( message_erreur, options ){
    return this.warning(message_erreur, options) 
  },
  // On applique les options, en remettant toujours les options par défaut
  // quand elles ne sont pas définies.
  set_options:function(options){
    if ('undefined' == typeof options) options = {} ;
    if ('undefined' == typeof options.timer) options.timer = true;
    if ('undefined' == typeof options.keep)  options.keep  = false;
    if ('undefined' == typeof options.inner) options.inner = 'body';
    this.options = options ;
  },
  /*
      Méthodes pour le utimer
      -----------------------
      Le “utimer” est un timer toujours lancé, même lorsque le timer de mess
      n'est pas lancé, pour supprimer obligatoirement un message qui resterait
      trop longtemps affiché.
  */
  // Mise en route des timers après l'affichage du message
  run_timers:function(){
    if(this.options.timer !== false) this.run_timer();
    this.run_utimer();
  },
  // Détruit tous les timers courants
  kill_timers:function(){
    this.kill_utimer();
    this.kill_timer();
  },
  // Lancer le timer de message
  timer:null,
  run_timer: function(){
    this.on = true;
    if( this.options.timer === false ) return ;
    if ( $('div#inner_flash').length ){
      this.calcule_duree_lecture();
      // this.timer = setTimeout("Flash.clean()", 10 * 1000) ;
    }
  },
  // Détruit le compte à rebours s'il existe
  kill_timer: function(){
    if ( this.timer != null ) clearTimeout(this.timer) ;
    this.timer = null ;
  },
  utimer: null,
  run_utimer: function(){
    this.kill_utimer();
    this.utimer = setTimeout( $.proxy(Flash.force_clean,Flash), this.DUREE_UTIMER * 1000 ) ;
  },
  kill_utimer:function(){
    if (this.utimer != null ) clearTimeout(this.utimer) ;
    this.utimer = null;
  },
  /*
      Méthodes utilitaires pour l'affichage des messages
  */
  // Affiche les messages dans la fenêtre
  // @param   options   Cf. la méthode show ci-dessus
  old_inner_flash: null,
  old_inner_position:null,
  affiche_messages: function(){
    oflash = $('div#flash') ;
    if (this.options.inner == 'body') this.set_flash_in_body();
    else this.set_flash_in_inner() ;
    // oflash.hide() ;
    if ( $('#inner_flash').length > 0 ){
      if ( this.options.keep == false ) $('#inner_flash').html('') ;
      $('#inner_flash').append( this.textes ) ;
    } else {
      oflash.html('<div id="inner_flash">' + this.textes + '</div>');      
    }
    if( false == $(oflash).is(':visible') ) oflash.fadeIn();
    this.set_display_value_of_spans();
  },
  // Quand le message tient sur plusieurs lignes, il faut passer tous les spans en 
  // display:block pour avoir un affichage correct
  set_display_value_of_spans:function(){
    var plusieurs_lignes = $('div#flash div#inner_flash').height() > 30 ;
    if ( false == plusieurs_lignes ) return ;
    $('div#flash div#inner_flash > div > span').css('display', 'block');
  },
  // Remet le flash dans le body (if any)
  set_flash_in_body:function(){
    var oflash = $('div#flash') ;
    if (this.old_inner_flash != null ){
      this.old_inner_flash.css({position:this.old_inner_position});
      this.old_inner_flash = null;
      oflash.attr('style', ""/* naturel, défini par CSS */);
      oflash.css({position:'fixed', 'max-width':'400px'});
    }
    $('body').append(oflash);
  },
  /*  Pour placer le flash ailleurs
      -------------------------------------------------------------------
      Cet emplacement est spécifié avec l'option `inner'. Il y a deux solutions
      alors:
        - L'inner possède un div de class 'flash' (pas d'identifiant !) et alors
          le flash est mis à l'intérieur.
        - L'inner ne possède pas ce div, et alors le flash est mis à l'intérieur
          de lui. Deux solutions :
          1.  L'inner a une position normale, on met alors sa position à relative
              et le flash à top:1em et left:1em pour qu'il se trouve au-dessus
          2.  L'inner a une position fixed, et alors on place le flash en haut à
              gauche par rapport au offset de l'inner.
  */
  set_flash_in_inner: function(){
    if ( this.inner_flash_str == this.options.inner ) return ;
    var oflash  = $('div#flash') ;
    var inner   = $(this.options.inner) ;
    this.inner_flash_str = this.options.inner.toString();
    this.old_inner_flash = inner;
    if ( $(this.options.inner + ' div.flash').length ){
      oflash.css({position:'relative'})
      $(this.options.inner + ' div.flash').append( oflash );
    } else {
      this.old_inner_position = inner.css('position');
      if (this.old_inner_position == 'fixed'){
        var dim = inner.offset();
        style = "top:"+(dim.top + 20) + "px;left:"+(dim.left + 20) +"px;";
      } else {
        inner.css('position','relative');
        style = "top:1em;left:1em;" ;
      }
      inner.append( oflash );
      oflash.attr('style', style);
    }
    oflash.css({'max-width':'100%'});
  },
  definir_messages: function( p ){
    var _i, key ;
    if( is_string( p ) ) p = [{message:p.replace(/\\("|')/g,'$1'), type:'notice' }] ;
    if ( is_object( p ) ) p = [ p ] ;
    this.textes     = "" ;
    this.texte_brut = "" ;
    for(_i=0, _len=p.length;_i<_len;++_i){
      dm = p[_i];
      this.textes += "<div class=\"flash "+dm.type+"\">" + 
                      '<span class="'+dm.type+'">' + dm.message + '</span></div>';
      this.texte_brut += dm.message ;
      }
    this.textes = this.textes.replace( /\n/g, '<br />' ) ;
  },
  clean:function(){
    // TODO: En laissant cette méthode, les messages s'effacent tout de suite
    // J'ai juste conservé `force_clean' sur le utimer
    return false; // Pour le a-lien éventuel
  },
  force_clean:function(){
    $('div#flash').fadeOut( null,function(){$(this).html("");});
    this.kill_timers();
    this.on = false;
  },
  // Durée de lecture du message (en secondes, pour le timer)
  calcule_duree_lecture: function(){
    if(this.texte_brut == null) this.define_texte_brut();
    this.duree_lecture = parseInt(this.texte_brut.length * 4, 10);
  },
  // On doit définir le texte brut quand c'est un rechargement de page
  // et qu'il y a un message flash affiché
  define_texte_brut: function(){
    this.texte_brut = $('#inner_flash').html().replace(/<([^>]*>)/g, '');
  }
  
}
Flash.klass=Flash;

window.F = Flash; // raccourci