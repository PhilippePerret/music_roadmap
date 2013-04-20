if('undefined'==typeof UI) UI = {} ;
$.extend(UI,{
  
  /*
      Définit l'état de l'application au chargement de la page
      --------------------------------------------------------
  */
  
  ready:false,
  // Hash mémorisant les éléments à surveiller au démarrage. Le hash est 
  // donné ici en exemple mais il doit être défini en dehors de cette 
  // librairie commune, par UI.ready_states = ...
  // ready_states:{
  //   length      : -1,       // calculé ci-dessous
  //   not_readies : null,     // compte à rebours
  //   jquery      : false,    // mis à true à la fin du document.ready de jQuery
  //   exedition   : false,    // formulaire exercice
  // },
  set_ready:function(foo,is_ready){
    if ( this.ready_states.length == -1 ){
      // => Lancement
      this.ready = false ;
      for(var i in this.ready_states) ++ this.ready_states.length ;
      -- this.ready_states.length ; // enlever le length lui-même
      this.ready_states.not_readies = parseInt(this.ready_states.length,10);
    }
    if ('undefined' == typeof is_ready) is_ready = true ;
    this.ready_states[foo] = is_ready ;
    this.ready_states.not_readies += is_ready ? -1 : 1 ;
    // Est-ce la fin ?
    if (this.ready_states.not_readies == 0){
      // => Fin
      this.ready = true ; // à utiliser par exemple par Watir
    }
  },
  // Ajouter un élément au bout du body (pour tests)
  add_body: function(code_o){
    return this.add( 'body', code_o ) ;
  },
  // Ajouter l'élément +code+ à l'élément +jid+
  add: function(jid, code){
    $(jid).append( code );
    return true ;
  },
  // Supprime les éléments correspondant à +jid+ de la page
  // @param   jid     Spécification de l'élément jQuery (p.e. "div#monid")
  // @param   onlyin  Si true, détruit seulement l'intérieur de l'élément
  //                  Si false, détruit l'élément lui-même
  remove: function(jid, onlyin){
    if ( onlyin ) $(jid).html('') ;
    else $(jid).remove();
  },
  // Focus dans un champ s'il existe (et met sa valeur à +content+ si elle 
  // est définie)
  focus: function(id, content){
    if ( id.indexOf('#') < 0 ) id = '#' + id ;
    if ( 'undefined' != typeof content) $(id).val(content) ;
    $(id).focus();    
  },
});