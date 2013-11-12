/*
    Objet Dom
    ---------
    Pour les tests des éléments DOM
*/

window.Dom = {
  clean_rapport:function(){$('div#rapport').html('')},
  
  
  // Retourne l'objet DOM jid (id jQuery) dans le document
  get:function(jid){return $(APP.document).find(jid)},
  
  /*-------------------------------------------------------------------
      Méthode de d'action sur le DOM de l'application
   */
  // Simule un click sur un élément DOM
  click:function(jid){
    var jo = this.get(jid);
    var o  = jo[0];
    switch(o.tagName){
      case 'INPUT'  : jo.click(); break;
      case 'A'      : jo.click(); break;
      default       : jo.click(); break;
    }
  },
  
  
  /*-------------------------------------------------------------------
      Méthode de test du DOM de l'application
      Pour les boucles Wait
   */
  
  // Return TRUE si l'objet jid (identifiant jQuery) existe
  // @note: pour une boucle wait
  exists:function(jid){
    return this.get(jid).length > 0;
  },
  // @note: pour une boucle wait
  visible:function(jid){
    if($(APP.document).find(jid).length == 0)return false;
    return this.get(jid).is(':visible');
  },
  // Return TRUE si l'objet +jid+ possède la classe +class+
  hasClass:function(jid, classe){
    return this.get(jid).hasClass(classe);
  },

  /*-------------------------------------------------------------------
      Méthodes de TEST
  */
  // Return true si 
  val_should_be:function(jid, value){
    if(this.get(jid).val() == value){
      success("La valeur de "+jid+" est \""+value+"\"");
    }
    else{
      failure("La valeur de "+jid+" devait être \""+value+"\"");
    }
  },
}