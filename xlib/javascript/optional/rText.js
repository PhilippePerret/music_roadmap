/*
  Objet RText
  
  Pour le traitement particulier des textes
  
  @raccourci:   T
  
*/
window.RText = {
  
  /*  Transforme certains caractères HTML pour un affichage dans
      un textarea ou en code visible
  */
  escape_html: function(t){
    return t.escape_html();
  }
}
window.T = RText ;