/*
    Object RealValue
    ----------------
    Permet d'interpréter de façon complexe les valeurs retournées par les requêtes
    ajax :
      - transforme les "true", "false", "null" en true, false, null
      - transforme les "243", "12.3" en 245, 12.3
      - reconstruit les objects propres (classes)
    
    Requis
    ------
    
      [Requis 1]
      - L'application doit charger les librairies :
        * RealValue.js (cette libraire)
        * flash.js
        * list.js
      [Requis 2]
      - Chaque classe de l'application doit définir la propriété `class', qui est un
        string correspondant exactement au nom de la classe. Par exemple
          window.MaClasse = function(data){
            this.class = "MaClasse";
          }
      [Requis 3]
      - Chaque classe doit contenir une méthode `deserialize' qui peut recevoir l'obj (le
        hash) et le traiter. En général, cette méthode fait simplement appel à la 
        méthode window `deserialize' (cf. ci-dessous), sauf pour un traitement particulier
        (lorsque par exemple les données contiennent seulement une `class' et un `id' qui
        font référence à un autre objet de l'application).
          
          MaClasse.prototype.deserialize = function(data){return RealValue.deserialize(this,data)}
          
          @noter que le `return this' est très important, car c'est la valeur définitive
          qui sera donnée en RealValue (entendu que certaines méthode peuvent renvoyer un
          objet complètement différent de l'instance).
      [Requis 4]
      - Chaque classe doit définir la méthode `serialize' avec un parametre `real_objet' qui
        peut renvoyer soit le hash réel des données de l'instance, soit un Hash contenant
        simplement :
          {class:<classe de l'instance (String)>, id:<identifiant absolu de l'instance>}
      [Requis 5]
      – L'application peut définir la fonction :
      
          get_or_create_<class en minuscule>
        
        … lorsqu'il est possible de récupérer l'instance dans une liste (Hash) 
        d'instances déjà définis. Par exemple :
        
          function get_or_create_monobj(data){
            if('undefined' == typeof MES_OBJETS[data.id]) return new MonObjet(data);
            else return MES_OBJETS[data.id];
          }
        // … Si la fonction n'existe pas, RealValue crée d'office une nouvelle instance
*/


window.RealValue = {
  // Prend la valeur +foo+ (tout type) et retourne sa vraie valeur
  of:function(foo){
    // console.log("Étude de foo de type `"+(typeof foo) + "'\n"+foo.toString());
    switch(typeof foo){
      case 'string':
        foo = foo.stripSlashes();
        switch(foo){
          case 'false'    : return false;
          case 'true'     : return true;
          case "null"     :
          case ""         : return null;
          case "undefined": return undefined;
          default:
            if(isNaN(foo)) return foo;
            if(parseInt(foo,10) == parseFloat(foo)) return parseInt(foo,10);
            else return parseFloat(foo);
        }
        break;
      case 'object':
        if(this.has_property_class_as_class(foo)){
          return this.object_to_classe(foo);
        } else {
          // Traitement comme un objet normal (un hash)
          for(var prop in foo){ 
            if (false == foo.hasOwnProperty(prop)) continue;
            foo[prop] = this.of(foo[prop]);
          }
        }
        break;
    }
    return foo;
  },
  // Transforme un object (hash) en instance de la classe voulue, en la définissant
  // @note Lire les points [Requis 2], [Requis 3] et [Requis 5]
  object_to_classe: function(obj){
    // console.log("-> RealValue.object_to_classe(obj de classe "+obj.class+")");
    try{
      return eval('get_or_create_'+obj.class.toLowerCase())(obj);
    }catch(erreur){
      var instance = eval("new " + obj.class + "();");
      return instance.deserialize(obj);
    }
  },
  // Retourne true si l'objet +obj+ a une property `class' correspondant à un objet
  // propre de l'application
  has_property_class_as_class:function(obj){
    // console.log("-> RealValue.has_property_class_as_class");
    if('undefined'==typeof obj || obj==null) return false;
    if('string' != typeof obj.class) return false;
    try{
      eval(obj.class);
      return true;
    }catch(erreur){F.error(erreur); return false}
  },
  
  /*
      Sérialize une valeur quelconque (tout type)
      
      @param  foo   La valeur de type quelconque
      @return Soit un Hash (si objet) soit foo (si valeur scalaire)
      
  */
  serialize:function(foo){
    if(foo == null || 'undefined' == typeof foo) return null;
    switch(typeof foo){
      case 'string':
        if (foo == "") return null;
        return foo.stripSlashes();
      case 'number':
      case 'boolean':
        return foo;
      case 'object':
        if('function'==typeof foo.serialize) return foo.serialize();
        else {
          if(foo.length){ // Une liste, a priori
            return (new List(foo)).serialize();
          }else{          // un Hash quelconque
            for(var prop in foo){
              if(false == foo.hasOwnProperty(prop)) continue;
              var serialized_data = this.serialize( foo[prop] );
              if(serialized_data !== null) foo[prop] = serialized_data;
            }
            return foo;
          }
        }
        break;
      default:
        // Si on passe par là, c'est qu'on tente d'enregistrer un objet non reconnu,
        // comme une fonction par exemple.
        return foo;
    }
  },
  
  /*
    Permet de désérialiser un objet (une instance de classe propre) lorsqu'un traitement
    particulier n'a pas permis d'utiliser directement le prototype `deserialize' de la
    classe `Object' (cf. ci-dessus)
    
    @param    obj     L'instance à traiter (ou le hash à desérialiser)
    @param    data    Les données à injecter dans l'instance
    
    @return L'objet (instance) lui-même. cf. [Requis 3]
  */
  deserialize:function(obj, data){
    // console.log("-> RealValue.deserialize (objet de class `"+obj.class+"')");
    for (var prop in data) {
      if(false == data.hasOwnProperty(prop)) continue;
      // console.log("   --> Traitement de la propriété "+prop);
      obj[prop] = RealValue.of( data[prop] );
    }
    return obj;
  }
}
