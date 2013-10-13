/*
    Objet Cookies
    Class Cookie
    
    Pour gérer les cookies
    
    Pour créer un cookie
    --------------------
    var coo = Cookie.new(<cookie name>);
    coo.expire_in(<nombre de jours>);
    coo.create();
    
    OU
    
    Cookies.create(<name>, <value>, <nombre de jours expiration>)
    
    Pour lire un cookie
    -------------------
    var coo = Cookie.new(<cookie name>);
    var coo_value = coo.get().value;
    coo.delete() // Sinon il sera écrit une deuxième fois
    
    OU
    
    Cookies.valueOf(<name>)
    
*/


window.Cookies = {
  // Créer un cookie
  create:function(name,value,expire){
    var coo = new Cookie(name, value);
    coo.expire_in(expire);
    coo.create();
  },
  // Récupérer la valeur d'un cookie +name+
  valueOf:function(name){
    var coo = new Cookie(name);
    var val_cookie = coo.get().value;
    return val_cookie;
  },
  // Retourne TRUE si le cookie de nom +name+ existe
  exists:function(name){
    return ("; "+document.cookie).indexOf("; "+name+"=") > -1;
  },
  // Détruire un cookie
  delete:function(name){
    (new Cookie(name)).delete();
  }
}
function Cookie( coo_name, coo_value ) {
  
  this.name     = coo_name  ;
  this.value    = ""        ;
  this.expire   = null      ; // nombre de jours
  this.expires  = null      ; // la date (pas encore utilisé)
  if ( undefined != coo_value ) this.set_value( coo_value ) ;
  
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
      this.value = unescape(coo.substring( name_eq.length, coo.length )) ;
      break ;
    }
  }
  return this;
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
