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
  },
  
  // Return a "MM:SS" from a number of seconds
  // 
  // @param   secs      Integer, number of seconds
  // @param   complet   If true, always "H:MM:SS". Otherwise minimum format according to the
  //                    number of hours, minutes, etc. Default: FALSE
  // @param   del_hour    Delimitor between hours and minutes (default: ":")
  // @param   del_mns     Delimitor between minutes and seconds (default: ":")
  seconds_to_horloge:function(secs, complet, del_hour, del_mns){
    if('undefined'==typeof complet)   complet   = false;
    if('undefined'==typeof del_hour)  del_hour  = ":";
    if('undefined'==typeof del_mns)   del_mns   = ":";
    var hrs = parseInt(secs / 3600, 10);
    var res = secs - (hrs * 3600);
    var mns = parseInt(res / 60, 10);
    var scs = res - (mns * 60);
    // Formatage
    var hrl = "";
    if (hrs > 0 || complet) hrl += hrs + del_hour ;
    if (complet || hrs > 0) if (mns < 10){mns = "0"+mns}; 
    hrl += mns + del_mns ;
    if (scs < 10) scs = "0" + scs ;
    hrl += scs;
    return hrl ;
  }
}