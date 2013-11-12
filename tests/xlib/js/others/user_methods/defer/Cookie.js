/*
 *  Gestion des cookies de l'application
 * 
 *  USAGE
 *  -----
 *  Pour créer un objet cookie : cookie([name][, value])
 *
 * -------------------------------------------------------------------
 *
 *  Définit la class _Cookie
 *
 *  coo.have.value()
 *  coo.exists
 *  coo.expires_at(<date>)
 *  coo.expires_in(<laps>)
 *  coo.delete
 *  coo.create
 *
 *  coo.should.have.value() / should_not
 *  coo.should.exists / should_not
 *  -- IMPOSSIBLE -- coo.should.expire.at('AA:MM:JJ-HH:MM:SS') / should_not
 *  -- IMPOSSIBLE -- coo.should.expire.in( (one.hour|two.days|weeks(21))  / should_not
 */



function cookie(name, value) {
  if(undefined == name && undefined == value) return new _Cookie()
  else
  {
    if('string' == typeof name) data = {name:name, value:value}
    else if ('object' == typeof name) data = name
    else throw "Impossible de définir le cookie"
    return new _Cookie(data)
  }
}


window._Cookie = function(data){
  this._name    = null
  this._value   = null
  this._expire  = null
  this._path    = null
  
  if(undefined != data)
  {
    var me = this
    L(['name', 'value', 'expire', 'path']).each(function(prop){
      if(undefined != data[prop]) me['_'+prop] = data[prop]
    })
  }
}
Object.defineProperties(_Cookie.prototype, {
  // Retourne le nom du cookie
  "name":{
    get:function(){return this._name}
  },
  // Récupère et définit la valeur
  "value":{
    get:function()
    {
      if(null == this._value && this.exists) this.get
      return this._value
    },
    set:function(foo){
      if('string' != typeof foo) foo = JSON.stringify( foo )
      this._value = foo
    }
  },
  // Récupère la valeur du cookie et la met dans `this._value'
  "get":{
    get:function(){
      if(this._value == null) this._value = this.get_value
      return this // pour pouvoir utiliser coo.get.value
    }
  },
  // Récupère la valeur dans le code du cookie
  "get_value":{
    get:function(){
      var name_eq, cookies, _i, _len, coo ;
      this._value = null ;
      name_eq = this.name + "=" ;
      cookies = APP.document.cookie.split(';')
      nb_cookies = cookies.length
      for(var i = 0; i < nb_cookies; ++i)
      {
        coo = cookies[i]
        if(this._value != null) return // pour accélérer
        while( coo.charAt( 0 ) == ' ' ){ coo = coo.substring( 1, coo.length ) ; }
        if ( coo.indexOf( name_eq) == 0 ){ 
          return unescape(coo.substring( name_eq.length, coo.length )) ;
        }
      }
      return null // Non trouvé
    }
  },
  // Crée le cookie
  "create":{
    get:function(){
      APP.document.cookie = this.code
    }
  },
  // @Return le code du cookie
  "code":{
    get:function()
    {
      return  this.name + "=" + 
              this._value + '; ' +
              "expires=" + this.expireToUTCString + '; ' +
              "path=" + (this._path || '/') ;
    }
  },
  // Supprime le cookie
  "delete":{
    get:function(){
      this._expire  = -1
      this.create
    }
  },
  
  // Définit le nombre de jours de vie du cookie (par rapport à aujourd'hui)
  // @note : si +millisecondes+ est inférieur à 1000 (ce qui correspond à 1 seconde), on
  // considère que c'est un nombre de jours
  // @note : si la valeur est négative, ça détruit le cookie tout de suite
  "expire_in":{
    value:function( millisecondes ){
      this._expire = millisecondes
    }
  },
  
  // Définit la date exacte de l'expiration du cookie
  // @param   arr_date {Array} [month, day, year, hours, minutes, seconds]
  "expire_at":{
    value:function(arr_date){
      if('array' == _exact_type_of( arr_date ))
      {
        if(undefined != arr_date[1]) arr_date[1] -= 1 ;
        while(arr_date.length < 6) arr_date.push(0)
        this._expire = arr_date
      }
      else
      {
        throw "Il faut spécifier la data d'expiration (avec `expire_at') avec un [année, mois, jour, heure, minute, secondes]"
      }
    }
  },


  /* @return Date d'expiration sous forme de {Date Object}
   *
   * Cette propriété complexe se sert de `this._expire' pour déterminer la date
   * Si _expire est un nombre, c'est le nombre de jour à partir de maintenant
   * Si _expire est un array, c'est une date précise, spécifiée par [year, month, day, H, MN, Secs]
   * Si _expire n'est pas défini, renvoie la date de maintenant
   */ 
  "expireDate":{
    get:function(){
      var t = 0 ;
      d = new Date()
      if ( 'number' == typeof this._expire )
      {
        // Expiration fournie par un nombre de millisecondes
        // Exceptionnellement, on regarde si le nombre est inférieur à 1000 => c'est 
        // considéré comme un nombre de jours
        if(this._expire < 1000)
        {
          this._expire = this._expire * 24 * 3600 * 1000
        }
        t = d.getTime() + this._expire /* millisecondes */
      }
      else if( _exact_type_of(this._expire) == 'array' )
      {
        // Expiration fournie par une date (format {Array} [year, month, day, hour, minute, secs])
        t = Date.UTC.apply(null, this._expire) - Time.lag
      }
      else
      {
        // Dans tous les autres cas, l'expiration se fera à la fin de la session
        t = 0
      }
      if(t > 0) d.setTime( t ) // setTime reçoit des millisecondes
      return d
    }
  },

  // Retourne la date d'expiration qui sera écrite dans le cookie
  //
  // @note: La date d'expiration peut être définie de deux façons :
  //        - Par un nombre de jour (flottant, donc .5 possible pour 12 heures)
  //        - Par la date d'expiration proprement dite.
  //          (quel format ?)
  // 
  "expireToUTCString":{
    get:function()
    {
      return this.expireDate.toUTCString()
    }
  },
  // cookie().exists => true/false
  "exists":{get:function(){return ("; "+APP.document.cookie).indexOf("; "+this.name+"=") > -1;}
  },
  
  /* -------------------------------------------------------------------
   *      Méthodes de test
   *
   * Les méthodes de tests sont limitées puisqu'on ne peut connaitre
   * que le nom et la valeur d'un cookie. D'où :
   *
   *  should.exist        Succès si le cookie existe
   *  should = <valeur>   Succès si le cookie a la valeur <valeur>
   *
   ------------------------------------------------------------------- */
  "should":{
    get:function(){this.positif = true;return this},
    set:function(valeur)
    {
      this.positif = true
      this.have_value( valeur )
    }
  },
  "should_not":{
    get:function(){this.positif = false; return this},
    set:function(comp)
    {
      this.positif = false
      this.have_value(comp)
    }
  },
  "have_value":{
    value:function( comp )
    {
      _estime( this.get.value == comp,{
  			test:'exist',
  			args:[],
  			positif:this.positif,
  			sujet:"cookie("+this.name+")",
  			_before_result:null,
  			result:{
  				positif:{success:LOCALES['has'], failure:LOCALES['should have']},
  				negatif:{success:LOCALES['has'], failure:LOCALES['should not have']}
  			},
  			expected_result:LOCALES['value'] + comp,
  			dont_inspect_expected:true,
  			after_if_failure:{
  				positif:null, 
  				negatif:null
  			}
      })
    }
  },
  // cookie().should.exist => failure/success
  "exist":{get:
    function(){
      _estime(this.exists, {
  			test:'exist',
  			args:[],
  			positif:this.positif,
  			sujet:"cookie("+this.name+")",
  			_before_result:null,
  			result:{
  				positif:{success:LOCALES['exists'], failure:LOCALES['should exist']},
  				negatif:{success:LOCALES['doesnt exists'], failure:LOCALES['should not exist']}
  			},
  			expected_result:null,
        no_expected_result:true,
  			dont_inspect_expected:true,
  			after_if_failure:{
  				positif:null, 
  				negatif:null
  			}
      })
    }
  }
})
