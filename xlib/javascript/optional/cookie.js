/*
    Objet Cookies
    Class Cookie
    
    Pour gérer les cookies
*/
window.Cookies = {
  
}
function Cookie( coo_name, coo_value ) {
  
  this.name     = coo_name  ;
  this.value    = ""        ;
  this.expire   = null      ; // nombre de jours
  this.expires  = null      ; // la date (pas encore utilisé)
  if ( defined( coo_value ) ) this.set_value( coo_value ) ;
  
  // Toutes ces méthodes sont définies en prototype ci-dessous
  // set_value  = function( valeur )  ;        // Définit la valeur du cookie
  // expire_in  = function( nombre_jours ) ;  // Définit la date d'expiration
  // create     = function( ) ;               // Crée le cookie
  // get        = function( ) ;               // Récupère le cookie
  // delete     = function( ) ;               // Détruit le cookie

}

/*
  Définir la valeur du cookie
  ----------------------------
  @usage:
    icookie = Cookie.new( 'nomducookie' ) ;
    icookie.set_value( <valeur à donner> ) ;
  
  @note:
    Bien sûr, il serait possible de faire :
      icookie.value = <valeur à donner> ;
    … mais la méthode set_value permet de transmettre toute sorte de
    données. (TODO:)
*/
Cookie.prototype.set_value = function( coo_value ){
  this.value  = coo_value ; 
}
Cookie.prototype.set_expires = function( coo_expires ){
  this.expires = coo_expires ;
}
/* 
  Définir la date d'expiration
  ------------------------------
  @usage:
    icookie = Cookie.new( 'nomducookie' ) ;
    icookie.expire_in( 4 ) ; // pour : "dans 4 jours"
//*/
Cookie.prototype.expire_in = function( nbdays ){  this.expire = parseInt(nbdays, 10) ; }

/*
  Créer le cookie proprement dit
  ------------------------------
  @usage:
    icookie = Cookie.new( 'nomducookie') ;
    ...
    icookie.create() ;
*/
Cookie.prototype.create = function(){
  if (this.value == null ) return alert("La valeur du cookie " + this.name + " est nulle…") ;
  document.cookie = this.name + "=" + this.value + this.calc_expire() + "; path=/" ;
}

/*
  Récupère le cookie
  -------------------
  @usage:
    icookie = Cookie.new( 'moncookie' ) ;
    icookie.get() ;
    alert( icookie.value ) // => affiche la valeur du cookie
*/
Cookie.prototype.get = function(){
  var name_eq, cookies, _i, _len, coo ;
  this.value = null ;
  name_eq = this.name + "=" ;
  cookies = document.cookie.split( ';' ) ;
  for ( _i = 0, _len = cookies.length ; _i < _len ; ++ _i ){
    coo = cookies[ _i ] ;
    while( coo.charAt( 0 ) == ' ' ){ coo = coo.substring( 1, coo.length ) ; }
    if ( coo.indexOf( name_eq) == 0 ){ 
      this.value = coo.substring( name_eq.length, coo.length ) ;
      break ;
    }
  }
}
/*
  Détruit le cookie
  ------------------
*/
Cookie.prototype.delete = function(){
  this.value  = "" ; 
  this.expire = -1 ;
  this.create() ;
}

/*
  Calcul de la donnée de date d'expiration
  -----------------------------------------
  @note:  Usage interne.
*/
Cookie.prototype.calc_expire  = function(){
  var t ;
  d = new Date() ;
  if ( this.expire == null && this.expires == null ) return "" ;
  if ( this.expires == null )
    t = d.getTime() + ( this.expire * 24 * 3600 * 1000 ) ;
  else
    t = parseInt( this.expires, 10 ) ;
  d.setTime( t ) ;
  d = "; expires=" + d.toGMTString() ;
  return d ;
}
