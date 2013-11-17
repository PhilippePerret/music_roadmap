const NEXT_POINT = 'NextStopPoint'


/* Class pour gérer la suite à donner à un test
 *
 * Usage :  Toutes les méthodes de tests/interrogation/manipulation
 *          peuvent être suivies de `._(valeur)`. Par exemple :
 *            file(path).should.exist._(3)
 *              OU
 *            file(path).should.exist.and("Étape suivante")
 *
 *          Ci-dessus, le 3 signifie "et passer au stop-point n°3"
 *
 *  Requis pour l'objet/class/method qui doit pouvoir gérer la suite :
 *  ------------------------------------------------------------------
 *    - Définir une propriété `suite` qui est une instance de _SuiteTest_
 *      et retourner cette propriété.
 *      C'est ça qui permettra d'ajouter `._(...)` ou `.and(...)` à la
 *      propriété complexe d'interrogation ou de test.
 *      Par exemple :
 *        "test":{
 *          get:function()
 *          {
 *            ... du code ...
 *            if(undefined == this.suite) this.suite = new _SuiteTest_(this)
 *            this.suite.reset
 *            return this.suite
 *          }
 *        }
 *    - Possèder une propriété complexe `script` qui RETOURNE le script
 *      courant, concerné par la demande de suite.
 *      Note: Si ce script ne peut être connu par quelque chose comme 
 *      `this.callee.script`, on peut l'atteindre simplement par :
 *      window.CURRENT_SCRIPT qui contient et actualise toujours le script
 *      courant.
 *    - Posséder une propriété complexe `humanName` qui retourne le nom de
 *      l'objet/class/method. Utile pour les messages d'erreur.
 *      Par exemple, la class `_TFile` retourne "file(...)" puisque c'est
 *      avec cette fonction qu'on va interroger les fichiers.
 *    - Dans ces méthodes
 *
 */
_SuiteTest_ = function(parent){
  this.parent = parent
}
Object.defineProperties(_SuiteTest_.prototype,{
  // Raccourci pour "this.parent.script"
  "script":{
    get:function(){
      return window.CURRENT_SCRIPT
      // return this.parent.script
    }
  },
  // alternative à "_"
  "and":{value:function(val){return this._(val)}},
  "_":{
    value:function(val)
    {
      // Valeurs spéciales
      switch(val)
      {
      case NEXT_POINT: val = 0; break;
      }
      
      // Traitement de l'argument en fonction de son type
      switch(_exact_type_of(val))
      {
      case 'integer':
        // Si c'est un entier, il faut passer à au stop-point défini
        this.next_stop_point( val )
        break
      case 'string':
        // String => un nom d'étape
        this.next_step( val )
        break
      case 'object':
        // Un objet (étude ci-dessous)
        this.next_with_object( val )        
        break
      default:
        force_db("Impossible de définir la suite à donner au test avec : " + inspect(val))
      }
      // w("J'ai reçu "+val+" et la valeur est : "+this.parent.value)
    }
  },
  // Quand un objet est donné en argument de <...>._(<arg>)
  "next_with_object":{
    value:function(obj)
    {
      if(undefined != obj.stop_point) this.next_stop_point(obj.stop_point)
      if(undefined != obj.success && 'string' == typeof obj.success)
      {
        this._onsuccess = obj.success
      }
      if(undefined != obj.failure && 'string' == typeof obj.failure)
      {
        this._onfailure = obj.failure
      }
      if(undefined != obj.success_step)
      {
        this.step_on_success = obj.success_step
      }
      if(undefined != obj.failure_step)
      {
        this.step_on_failure = obj.failure_step
      }
      if(undefined != obj.success_stop_point)
      {
        this.stop_point_on_success = obj.success_stop_point
      }
      if(undefined != obj.failure_stop_point)
      {
        this.stop_point_on_failure = obj.failure_stop_point
      }
    }
  },
  "next_stop_point":{
    value:function(stop_point)
    {
      if( 0 == stop_point || stop_point == NEXT_POINT)
      {
        // => il faut rechercher le stop point suivant
        stop_point = this.script.stop_point + 1
      }
      this.script.arg = stop_point
      // window.CURRENT_SCRIPT.arg = stop_point
    }
  },
  "next_step":{
    value:function(step)
    {
      // Ici une vérification de l'existence de l'étape
      var step_indice = this.script.indice_of_step(step)
      if(undefined == step_indice)
      {
        warning(LOCALES.errors['dont know step'] + "`" + step + "`")
      }
      else
      {
        this.script.curstep_indice = step_indice - 1
      }
    }
  }
})


// Les méthodes ajoutées au prototype de _SuiteTest_ pour régler les onsuccess et
// onfailure

_PropertiesOnSuccessAndFailure = {
  // Permet de ré-initialiser l'objet suite
  "reset":{
    get:function()
    {
      // console.log("-> TSuite.reset")
      delete this._step_on_success
      delete this._step_on_failure
      delete this._stop_point_on_success
      delete this._stop_point_on_failure
      delete this._onsuccess
      delete this._onfailure
    }
  },
 
  // Méthode qui doit être appelée par les objets/propriétés utilisant les méthodes
  // magiques `_` et son alias `and` avant d'envoyer le résultat.
  // Cette méthode retourne FALSE si un message de résultat (success/failure) a été produit 
  // et TRUE dans le cas contraire. En d'autres termes, si la méthode appelante reçoit FALSE,
  // elle ne doit pas produire de succès ou d'échec (si c'est ce genre de méthode).
  // @param   evaluation    Pour savoir si c'est un succès ou un échec (ou un résultat
  //                        positif ou négatif si méthode d'interrogation) qui a été 
  //                        obtenu.
  "onresultat":{
    value:function(evaluation)
    {
      if(evaluation) return this.onsuccess
      else           return this.onfailure
    }
  },
  
  "onsuccess":{
    get:function(){
      // Un message de succès a été défini
      if(this._onsuccess != null) success(this._onsuccess)
      // Une étape doit être appelée
      if(this._step_on_success) this.step_on_success
      // Un stop point doit être invoqué
      if(this._stop_point_on_success) this.stop_point_on_success
      return undefined != this._onsuccess && this._onsuccess != null
    }
  },
  "onfailure":{
    get:function()
    {
      if(this._onfailure != null) failure(this._onfailure)
      if(this._step_on_failure) this.step_on_failure
      if(this._stop_point_on_failure) this.stop_point_on_failure
      return undefined != this._onfailure && this._onfailure != null
    }
  },

  "step_on_success":{
    get:function()
    {
      this.next_step(this._step_on_success)
    },
    set:function(step){this._step_on_success = step}
  },
  "step_on_failure":{
    get:function()
    {
      this.next_step(this._step_on_failure)
    },
    set:function(step){this._step_on_failure = step}
  },
  "stop_point_on_success":{
    get:function()
    {
      this.next_stop_point(this._stop_point_on_success)
    },
    set:function(st)
    {
      this._stop_point_on_success = st
    }
  },
  "stop_point_on_failure":{
    get:function()
    {
      this.next_stop_point(this._stop_point_on_failure)
    },
    set:function(st)
    {
      this._stop_point_on_failure = st
    }
  }
}
Object.defineProperties(_SuiteTest_.prototype, _PropertiesOnSuccessAndFailure)
