/*
 *  Class TStep
 *  -----------
 *  Classe pour les étapes (utilisé par TScript)
 *
 */
// Instanciation
window.TStep = function(data){
  this.class      = 'TStep'
  this._script    = null // class TScript du script de l'étape
  this._name      = null
  this._fonction  = null
  this._indice    = null
  this._test      = null
  
  this.dispatch(data)
  
}

TStep.prototype.dispatch = function(data){
  me = this
  L(data).each(function(k,v){ me['_'+k] = v })
}

Object.defineProperties(TStep.prototype,{
  // Retourne le script contenant l'étape (instance TScript)
  "script":{
    get:function(){return this._script},
    set:function(val){this._script = val}
  },
  "name":{
    get:function(){return this._name},
    set:function(value){this._name = value},
    enumerable:true
  },
  "fonction":{
    get:function(){return this._fonction},
    set:function(value){this._fonction = value}
  },
  "test":{
    get:function(){return this._test},
    set:function(value){this._test = value}
  },
  "indice":{
    get:function(){return this._indice},
    set:function(val){this._indice = val}
  },
  // Écrit l'étape dans le rapport, sauf en mode silencieux
  // @noter que le return ne sert qu'au test, pour que l'existence de
  // la propriété soit reconnue dans une instance.
  "write":{
    get:function(){
			if( Test.NO_TEST || Test.SILENCE) return false
      Test.step( this.name ); return true
    }
  },
  // Pour "jouer" l'étape, quel que soit son type. 
  // SI seul `name` est défini, c'est un rappel de la fonction principale qui 
  //    passera par un case. Si
  // SI `fonction' est défini, c'est une fonction à appeler (de la fonction principal ou window)
  // SI `test' est défini, c'est un appel d'un autre test (run_test ?)
  "run":{
    get:function(){
      // console.log("\n---> TStep.run (étape:"+this.name+"/script:"+this.script.relative_path)
      // this._script.curstep = this
      if(this.fonction != null)   return this.run_fonction
      else if(this.test != null)  return this.run_test
      else                        return this.run_script
      return true // pour savoir que la propriété existe au cours du test des tests
    }
  },
  // Étape "normale", rappelant simplement la Test Main Function pour passer
  // à l'étape suivante
  "run_script":{
    get:function(){return this.script.fonction()}
  },
  // L'étape définit un TEST à appeler.
  "run_test":{
    get:function(){return this.script.fonction.run_test(this.test)}
  },
  "run_fonction":{
    get:function(){
      // console.log("-> TStep.run_fonction")
      if(undefined == this.fonction || 'function' != typeof this.fonction)
      {
        throw "Il faut définir la fonction de l'étape !"
        return false
      }
      else
      { 
        // Mais que se passe-t-il si la fonction fait appel à une attente ?
        return this.fonction()
      }
    }
  }
  
})
