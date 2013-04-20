/*
    Objet Time
    ----------
    Gestion de tout ce qui concerne le temps
*/
window.Time = {
  // Retourne le timestamp de maintenant
  // @param   millisecondes   Si true, renvoie ce temps en millisecondes. Sinon, en secondes
  //                          Default: en secondes
  now:function(millisecondes){
    if('undefined'==typeof millisecondes) millisecondes = false ;
    var divisor = millisecondes ? 1 : 1000 ;
    return parseInt(new Date().valueOf()/divisor,10) ;
  }
}