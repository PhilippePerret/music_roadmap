/*
  Objet REdit
  
  Gère tout ce qui concerne les champs d'édition.
  
  @raccourci:     E
  @sous-objets:   E.textarea
                  E.input
*/

window.REdit = {
  /*
    === FORM ===
  */
  form: {
    /*
      Méthode soumettant le formulaire qui doit être défini par :
       REdit.form.submit.formulaire = <le formulaire>
      Cette méthode est utile par exemple quand on utilise un raccourci,
      pour retarder l'appel du formuaire. Par exemple, si Pomme+S permet
      d'enregistrer le textarea d'édition d'un paragraphe, il faut, avant
      de soumettre le formulaire, stopper la propagation de l'évènement.
      Dans la méthode, on utilise donc :
         REdit.form.submit.formulaire = <le form> ;
         var timer = setTimeout("REdit.form.submit()", 1000) ;
         REdit.form.submit.timer = timer ;
    */
    submit: function(){
      if(defined(REdit.form.submit.timer)) clearTimeout(REdit.form.submit.timer) ;
      REdit.form.submit.formulaire.submit() ;
    },
    
    data: function( fo, compact ){
      alert("La méthode REdit.form.data ne doit plus être appelée. Remplacer par UI.Form.data");
      return UI.Form.data( fo, compact ) ;
    }
    
  },
  
  /*
    === REDIT::TEXTAREA ===
  */
  textarea: {
    FOLLOW:       false, // mis à true quand on suit le textarea
    
    /*  Suivre le textarea
        ------------------
        Place un observer sur le textarea +id+ pour le suivre
        @usage:   REdit.textarea.follow( <id textarea / DOM object>[, method] )
        @param  id        L'identifiant du textarea ou l'objet DOM
        @param  method_obj    
                Optionnel. L'objet — possédant la méthode 'on_keypress'
                (et autres méthodes éventuelles) à utiliser pour suivre
                Par défaut, c'est cet objet (REdit.textarea)
    */
    follow: function( id, method_obj ){
      var my = REdit.textarea ;
      if ( "undefined" == typeof method_obj ) method_obj = my ;
      $(id).bind('keypress', $.proxy(method_obj.on_keypress, method_obj));
      my.FOLLOW = true ;
    },
    /* Pour arrêter de suivre le textarea +id_or_dom+ */
    unfollow: function( id_or_dom ){
      $(id_or_dom).unbind('keypress');
      REdit.textarea.FOLLOW = false ;
    },
    
    /*  Quand on presse une touche dans un textarea
        --------------------------------------------
    */
    on_keypress: function( e ){
      var my = REdit.textarea ;
      if ( my.FOLLOW == false ) return true ;
      // ---- barrière s'il ne faut pas suivre ----
      var otarget ;
      var target = e.currentTarget || e.target ;
      // Pour l'instant, on s'en retourne si la touche Command n'est pas
      // pressée, après avoir tenté de redimensionner le textarea
      if ( e.metaKey == false ){
        // Touches spéciales sans métakey
        switch( e.keyCode ){
          case 9 : // tabulation => autocompletion
            if ( "undefined" != typeof Autocomplete) {
              Autocomplete.add( target ) ;
              e.preventDefault();
            }
            break;
        }
        my.redim( target ) ;
        return true ; 
      }
      switch( e.charCode ){
        case 114: // Pomme + R
          return REvent.stop_event( e ) ; // Empêcher le rechargement
          break ;
        case 115: // Pomme + S
          alert("[REdit::textarea#on_keypress]\n" 
                  + "Pour le moment, je ne suis pas réglé pour sauver.");
          return REvent.stop_event( e ) ; // stop l'évènement
          break;
        default:
        entete_mess = "[REdit::textarea#on_keypress de lib/theme/javascript/rEdit.js]\n" ;
          F.show(entete_mess+"char/key code: " + e.charCode + '/' + e.keyCode);
      }
      // F.show("touche pressée. " + e.charCode + '/' + e.keyCode + '/' + e.metaKey) ;
      return true ; // poursuivre
    },
    /* Redimensionner tous les TEXTAREA

      @note: sauf ceux définissant la propriété 'nofollow'
    */
    redim_all: function( container ){
      if ( not_defined( container ) ) container = 'body' ;
      $(container).find('textarea').not('[nofollow]').each(function(i){
        // Pour ne pas voir le scroll chaque fois qu'on est au bout
        $(this).css('overflow', 'hidden');
        // Redimensionner si nécessaire
        E.textarea.redim( $(this) ) ;
        })
    },
    /* Redimensionne le textarea en fonction de son contenu
  
      @usage      REdit.textarea.redim( <id ou DOM obj> )
      @param  o   Identifiant jQuery ou object DOM/jQ
                  Note : ça peut être le textarea lui-même ou un 
                  élément le contenant (dans ce cas, tous les textareas
                  de l'élément seront redimensionnés).
    */
    redim: function( o ){
      o = $(o) ;
      var odom = o[0] ;
      if ( odom.tagName != 'TEXTAREA' ) return REdit.textarea.redim_all( o ) ;
      oh = odom.offsetHeight ;
      if( oh == 0 ) return ; // not displayed
      sh = odom.scrollHeight ;
      if ( oh >= (sh + 10) ) return ;
      o.css( 'height', (sh + 20) + "px" ) ;
    }
  }
}
window.E = REdit ; // raccourci