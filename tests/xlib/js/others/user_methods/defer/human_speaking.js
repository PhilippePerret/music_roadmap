/*
 *	Ce fichier contient tout ce qu'il faut pour "parler humain" dans les tests.
 *
 *	AVANT :			should.be.equal('Objet.property', 'expected value');
 *							should_not.be.null('MonObjet');
 *
 *  APRÈS : 		'Objet.property'.should.be.equal_to('expected valeur')
 *							'MonObjet'.should_not.be.null		// - long et + clair
 *
 *
 *	NOTES
		
		* J'appelle "end-property" les propriétés qui ne peuvent se trouver qu'en
			bout de chaine. Par exemple 'null' : <this>.should_not.be.null

 */
/* 	Fonctions de test 
		-----------------

		Ces fonctions sont indépendantes pour pouvoir être utilisées par 
		plusieurs sujets. Notamment : String et jq()

		@note		Une fonction de test doit être utilisée quand une ou plusieurs valeurs
						doivent être fournies. Dans le cas contraire, il faut utiliser une
						'propriété complexe' (définie par defineProp)
*/

// Note		Tous les tests qui sont de l'ordre de l'égalité peuvent utiliser
// 				cette constante dans leur donnée `_before_result`
var _default_before_result_equality

function _HumanSpeakingDefineLocales(){
	window._default_before_result_equality = {
		positif:{success:LOCALES['is'], failure:LOCALES['should be']},
		negatif:{success:LOCALES['is'], failure:LOCALES['should not be']}
	}
}

String.prototype._eval = function(){
  if(undefined == this._evaluate_)
  {
    // Il ne faut absolument évaluer le code qu'une seule fois
    // cf. bug #30
  	try{
  		 var ev = eval('APP.'+this.toString())
       this._evaluate_ = ev
  	}catch(erreur){return undefined}
  }
  return this._evaluate_
}
Object.defineProperties(String.prototype, {
	"level":{get:function(){return 1}},
	// Retourne le string évalué dans l'application
	"eval":{
		get:function(){return this._eval()}
	},
	// Retourne l'évaluation du string sous forme de string
	"value_to_s":{get:function(){return inspect(this.eval)}},
	// Retourne le type exact du string ('array', 'object', 'null', 'float', 'nan', 'infinity', etc.)
	// 
	// @note: la méthode est approximative pour les flottants sans décimal. Par exemple,
	// 				12.2 va retourner 'float' mais 12.0 va retourner 'integer'.
	"exact_type":{
		get:function(){return _exact_type_of(this.eval)}
	},
  // Retourne le script contenant le test
  "script":{
    get:function()
    {
      // window.file.caller.script // utilisé dans file avec succès
      // return this.caller.script // va fonctionner ?
      return window.CURRENT_SCRIPT
    }
  },
	"should":{
		get:function(){
      this.positif=true;return this},
		// Pour pouvoir utiliser `'<foo>'.should = <valeur>`
		set:function(value){
      return this.should.be.equal_to(value, strict = true)}
	},
	"should_not":{
		get:function(){
      this.positif=false;return this},
		set:function(value){
      return this.should_not.be.equal_to(value, strict = true)}
	},
  "has":{
    get:function(){
      if(undefined == this._has) this._define_has
      this._has.positif = true
      return this._has
    }
  },
  "has_not":{
    get:function(){
      if(undefined == this._has) this._define_has
      this._has.positif = false
      return this._has
    }
  },
  "_define_has":{
    get:function(){
      this._has = $.extend({}, _HumanSpeakingPropertiesHas)
      this._has.parent = this
    }
  }
})

_HumanSpeakingPropertiesHas = {}

Object.defineProperties(_HumanSpeakingPropertiesHas, {
  "property":{
    value:function(prop){
      return this.positif == (this.parent.eval.hasOwnProperty(prop) || 'undefined' != typeof this.parent.eval[prop])
    },
    enumerable:true
    // Noter bien ça : c'est ce `enumerable:true' qui permet au $.extend de "_define_has" (cf. 
    // plus haut) de transporter les propriétés dans `has' et `has_not'.
  }
})


window._function_equal_to = function(comp, strict){
  var evaluation = complexEquality( this.eval, comp, strict )
  return _estime(
    evaluation,
    {
			test:'be.equal_to',
			args:[comp],
			positif:this.positif,
			sujet:tostring(this),
			_before_result:_default_before_result_equality,
			result:{
				positif:{success:LOCALES['equal to'], failure:LOCALES['equal to']},
				negatif:{success:LOCALES['different']+" "+LOCALES['from'], failure:LOCALES['different']+" "+LOCALES['from']}
			},
			expected_result:comp,
			after_if_failure:{
				positif:LOCALES['it is']+inspect(this.eval), 
				negatif:LOCALES['it is']+inspect(this.eval)
			}
		}
    );
}


window._function_greater_than = function(comp, strict){
	if(undefined == strict) strict = true
	var prop = strict ? 'greater_than' : 'greater_than_or_equal_to'
	var strictement = strict ? ' '+LOCALES['strictly']: ''
	var ou_egal = strict ? '' : LOCALES['or']+' '+LOCALES['egal']
  return _estime(
    strict ? (this.eval > comp) : (this.eval >= comp),
    { 
			// test, args : pour les messages customisés
			test:'be.'+prop,
			args:[comp],
			positif:this.positif,
			sujet:tostring(this),
			_before_result:_default_before_result_equality,
			result:{
				positif:{success:strictement+LOCALES['greater'], failure:strictement+LOCALES['greater']},
				negatif:{success:strictement+LOCALES['less'], failure:strictement+LOCALES['less']}
			},
			expected_result:ou_egal+LOCALES['than']+comp,
			dont_inspect_expected:true,
			after_if_failure:{
				positif:LOCALES['it is']+inspect(this.eval), 
				negatif:LOCALES['it is']+inspect(this.eval)
			}
		}
    );
}

window._function_less_than = function(comp, strict){
	if(undefined == strict) strict = true 
	var prop = strict ? 'less_than' : 'less_than_or_equal_to'
	var strictement = strict ? ' '+LOCALES['strictly']: ''
	var ou_egal = strict ? '' : LOCALES['or']+' '+LOCALES['egal']
  return _estime(
    strict ? this.eval < comp : this.eval <= comp,
    { 
			// test, args : pour les messages customisés
			test:'be.'+prop,
			args:[comp],
			positif:this.positif,
			sujet:tostring(this),
			_before_result:_default_before_result_equality,
			result:{
				positif:{success:strictement+LOCALES['less'], failure:strictement+LOCALES['less']},
				negatif:{success:strictement+LOCALES['greater'], failure:strictement+LOCALES['greater']}
			},
			expected_result:ou_egal+LOCALES['than']+comp,
			dont_inspect_expected:true,
			after_if_failure:{
				positif:LOCALES['it is']+inspect(this.eval), 
				negatif:LOCALES['it is']+inspect(this.eval)
			}
		}
  )
}


const HumanStringProperties_Should = {
  // Pour `should.exist`, raccourci de `should.be.defined`
  "exist":{
    get:function()
    {
      return this.should.be.defined
    }
  },
	"be":{
		get:function(){return this},
		set:function(value){return this.should.be.equal_to(value)}
	},
	"have":{
		get:function(){return this}
	},
  // Test si une méthode/fonction produit bien une erreur
  // Cas spécial : quand on utilise `should_not.throw`, il peut n'y avoir aucun message défini
  throw:{
    value:function(err_expected){
      try{
        eval('APP.' + this.toString())
        resultat      = this.positif
        if(this.positif){  
          // should + réussite
          err_produced  = LOCALES.messages['no error thrown']
          // after_result  = LOCALES['error']
        }
        else{ 
          // should_not + réussite
          if(undefined == err_expected) err_expected  = "("+LOCALES['undefined_e']+")"
        }
          
      }catch(err){
        resultat      = err == err_expected
        err_produced  = LOCALES['throw']+inspect(err)
        after_result  = LOCALES['error']
        err_expected  = inspect(err_expected)
      }
      _estime(resultat,{
    		test:'should.throw',
    		args:[err_expected],
    		positif:this.positif,
    		sujet:tostring(this),
    		_before_result:null,
    		result:{
    			positif:{success:LOCALES['throw'], failure:LOCALES['should throw']},
    			negatif:{success:LOCALES['doesnt throw'], failure:LOCALES['should not throw']}
    		},
        _after_result:null,
    		dont_inspect_expected:true,
    		no_expected_result:false,
    		expected_result:err_expected,
    		after_if_failure:{
    			positif:err_produced, 
    			negatif:null
    		}
      })
    }
  }
}


Object.defineProperties(String.prototype.should, 			HumanStringProperties_Should);
Object.defineProperties(String.prototype.should_not, 	HumanStringProperties_Should);


// -------------------------------------------------------------------
// <string>.should.be properties
// -------------------------------------------------------------------

window.data_estimation = function(obj){ 
	var dest = $.extend(deep = true, {}, {
		// test, args : pour les messages customisés
		test:obj.test,
		args:[],
		positif:obj.positif,
		sujet:tostring(obj),
		_before_result:_default_before_result_equality,
		result:{
			positif:{success:(obj.strict?LOCALES['strictly']:''), 										failure:""},
			negatif:{success:"différent "+(obj.strict?LOCALES['strictly']:'')+LOCALES['from'], 	failure:""}
		},
		dont_inspect_expected:false,
		no_expected_result:false,
		expected_result:obj.expected,
		after_if_failure:{
			positif:LOCALES['it is']+inspect(obj.eval), 
			negatif:LOCALES['it is']+inspect(obj.eval)
		}
	});
	if(obj.data_extension && 'object' == typeof obj.data_extension){
		dest = data_estimation_put_obj_in(dest, obj.data_extension)
	}
	return dest
}
window.data_estimation_put_obj_in = function(owner, new_obj){
	for(var prop in new_obj){
		if(false == new_obj.hasOwnProperty(prop)) continue;
		if(owner.hasOwnProperty(prop)){
			if(new_obj[prop] && 'object'==typeof new_obj[prop]){
				// Un objet non null
				owner[prop] = data_estimation_put_obj_in(owner[prop], new_obj[prop])
			} else {
				// Une autre chose qu'un objet non null => on l'injecte dans l'owner
				owner[prop] = new_obj[prop]
			}
		} else { // ajout tel quel
			owner[prop] = new_obj
			break
		}
	}
	return owner
}

const data_estimation_should_have = function(obj){
	var dest = $.extend(deep = true, {}, {
		// test, args : pour les messages customisés
		test:obj.test,
		args:obj.args || [],
		positif:obj.positif,
		sujet:tostring(obj),
		_before_result:null,
		result:{
			positif:{success:LOCALES['has'], failure:LOCALES['should have']},
			negatif:{success:LOCALES['doesnt have'], failure:LOCALES['should not have']}
		},
		dont_inspect_expected:true,
		no_expected_result:false,
		expected_result:obj.expected,
		after_if_failure:{
			positif:null, 
			negatif:null
		}
	});
	if(obj.data_extension && 'object' == typeof obj.data_extension){
		dest = data_estimation_put_obj_in(dest, obj.data_extension)
	}
	return dest
}

const HumanProperties_Should_Have = {
	"property":{
		value:function(prop){
			this.test = "should.have.property" ;
			this.args = [prop] ;
			this.expected = LOCALES['property']+"`"+prop+"`" ;
      // @note  Le test ci-dessous n'est pas fiable à 100% sur les instances. Lorsque
      //        la propriété (complexe) retourn `undefined`, l'évaluation est fausse même
      //        si la propriété existe.
			return _estime(this.eval.hasOwnProperty(prop) || ('undefined' != typeof this.eval[prop]) , data_estimation_should_have(this))
		}
	}
}
Object.defineProperties(String.prototype.should.have,			HumanProperties_Should_Have)
Object.defineProperties(String.prototype.should_not.have,	HumanProperties_Should_Have)

const HumanProperties_Should_Be = {
  "empty":{
    get:function(){
      var result ;
      var thiseval = this.eval
      switch(_exact_type_of(thiseval)){
      case 'string':
        result = thiseval == ""
        break
      case 'array':
        result = thiseval.length == 0
        break
      case 'object':
        result = thiseval == {}
        break
      default:
        force_db(inspect(this.toString()) + LOCALES['cant be'] + LOCALES['empty'], WARNING)
        return
      }
			this.expected = "empty"
			this.test			= 'be.empty'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime(result, data_estimation(this))
    }
  },
	"null":{
		set:function(strict){
			this.expected = null
			this.test			= 'be.null'
			this.strict		= strict
			return _estime(strict ? (this.eval === null) : (this.eval == null), data_estimation(this))
		},
		get:function(){
			this.expected = null
			this.test			= 'be.null'
			this.strict		= false
			return _estime(this.eval == null, data_estimation(this))
    }
	},
	"false":{
		set:function(strict){
			this.expected = false
			this.test			= 'be.false'
			this.strict		= strict
			return _estime(strict ? (this.eval === false) : (this.eval == false), data_estimation(this))
		},
		get:function(){
			this.expected = false
			this.test			= 'be.false'
			this.strict		= false
			return _estime(this.eval == false, data_estimation(this))
    }
	},
	"true":{
		get:function(){
			this.expected = true
			this.test			= 'be.true'
			this.strict		= false
			return _estime(this.eval == true, data_estimation(this))
    }
	},
  // Répond aux méthodes magiques `and` et son alias `_`
	"defined":{
		get:function(){
			this.expected = LOCALES["DEFINED"]
			this.test			= 'be.defined'
			this.strict		= false
			this.data_extension = {
				result:{negatif:{success:LOCALES["UNDEFINED"]}}
			}
			_estime(this.eval != undefined, data_estimation(this))
    }
	},
	"undefined":{
		get:function(){
			this.expected = LOCALES["UNDEFINED"]
			this.test			= 'be.undefined'
			this.strict		= false
			this.data_extension = {
				result:{negatif:{success:LOCALES["DEFINED"]}}
			}
			return _estime(undefined == this.eval, data_estimation(this))
    }
	},
  "between":{
    value:function(min, max, strict){
			this.expected = (strict?LOCALES['strictly']:'') + LOCALES['between'] + min + LOCALES['and'] + max
			this.test			= 'be.between'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime(this.is.between(min, max, strict), data_estimation(this))
    }
  },
  "an_instanceof":{
    value:function(classe){
      this.expected = LOCALES['an instance of'] + classe.toString()
			this.test			= 'be.an_instanceof'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime(this.eval instanceof classe, data_estimation(this))
	  }
  },
	"a_string":{
		get:function(){
			this.expected = LOCALES['A STRING']
			this.test			= 'be.a_string'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime('string' == typeof this.eval, data_estimation(this))
	  }
	},
	"a_number":{
		get:function(){
			this.expected = LOCALES['A NUMBER']
			this.test			= 'be.a_number'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime('number' == typeof this.eval, data_estimation(this))
    }
	},
	"a_function":{
		get:function(){
			this.expected = LOCALES['A FUNCTION']
			this.test			= 'be.a_function'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime('function' == typeof this.eval, data_estimation(this))
    }
	},
	"an_object":{
		get:function(){
			this.expected = LOCALES['AN OBJECT']+LOCALES['but an array']
			this.test			= 'be.an_object'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime(('object' == _exact_type_of( this.eval )), data_estimation(this))
    }
	},
	"an_array":{
		get:function(){
			this.expected = LOCALES['AN ARRAY']
			this.test			= 'be.an_object'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime(('array' == _exact_type_of( this.eval )), data_estimation(this))
    }
	},
	
	"a_boolean":{
		get:function(){
			this.expected = LOCALES['A BOOLEAN']
			this.test			= 'be.a_boolean'
			this.data_extension = {
				dont_inspect_expected:true
			}
			return _estime('boolean' == typeof this.eval, data_estimation(this))
    }
	}
}
Object.defineProperties(String.prototype.should.be, 			HumanProperties_Should_Be)
Object.defineProperties(String.prototype.should_not.be, 	HumanProperties_Should_Be)

/* 	Fonctions de tests sur String */

// should.be
String.prototype.should.be.equal_to 								= _function_equal_to;
String.prototype.should.be.eq 											= _function_equal_to;
String.prototype.should.be.greater_than 						= _function_greater_than;
String.prototype.should.be.greater_than_or_equal_to = function(comp){return this.greater_than(comp,false)}
String.prototype.should.be.less_than								= _function_less_than;
String.prototype.should.be.less_than_or_equal_to		= function(comp){return this.less_than(comp,false)}

// should.return
String.prototype.should.return = function(value){
	var method = this.toString()
	if(method.substr(-1)!=')') method+="()"
	method.should.be.equal_to(value)
};


// should.contain
String.prototype.should.contain = function(value, strict){
	var result = strict ? this.eval == value : ((this.eval || "").indexOf(value) > -1)
	return _estime(result,
		{
			test:'contain',
			args:[value],
			positif:this.positif,
			sujet:tostring(this),
			_before_result:{
						positif:{success:LOCALES['contains'], failure:LOCALES['should contain']},
						negatif:{success:LOCALES['doesnt contains'], failure:LOCALES['should not contain']}
					},
			result:{
				positif:{success:"", 	failure:""},
				negatif:{success:"", 	failure:""}
			},
			expected_result:value,
			after_if_failure:{positif:null, negatif:null}
			
		}
	)
}

// should.respond_to
String.prototype.should.respond_to = function(method){
	return _estime(
		'function' == typeof eval('APP.'+this.toString()+"."+method),
		{
			test:'respond_to',
			args:[method],
			positif:this.positif,
			sujet:tostring(this),
			_before_result:{
				positif:{success:"", 	failure:""},
				negatif:{success:"", 	failure:""}
			},
			result:{
				positif:{success:LOCALES['responds to'], 		 failure:LOCALES['should respond to']},
				negatif:{success:LOCALES['not responds to'], failure:LOCALES['should not respond to']}
			},
			expected_result:method,
			after_if_failure:{positif:null, negatif:null}
		}
	)
}
