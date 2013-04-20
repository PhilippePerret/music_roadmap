
/*
    Traite le retour ajax d'une procédure
    -------------------------------------------------------------------
    Affiche le message d'erreur s'il y en a un
    
    @usage
      Si on doit interrompre la methode :
        if (traite_rajax(rajax)) return ;
        OU 
        if ( ! traite_rajax(rajax) ){
          // ... actions quand il n'y a pas eu d'erreurs
        }
      Sinon, mettre simplement :
        traite_rajax( rajax ) ;
    
    @return
      True si une erreur a été détectée, sinon false.
*/
window.traite_rajax = function(rajax){
  if ('undefined' == typeof rajax || rajax == null ) return false ; // no error
  if ( rajax.error != null ){
    var errmess ;
    try { errmess = eval(rajax.error) } 
    catch (erreur) { errmess = rajax.error }
    F.error( errmess ) ;
    return true ;
  } else {
    return false ; // => aucune erreur
  }
}