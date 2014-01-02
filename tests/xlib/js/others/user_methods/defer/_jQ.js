/*
 *  Permet de tester les objets DOM avec des syntaxes telles que :
 *
 *    jq('div#mondiv').have.class('actif'); => return true si oui
 *    jq('div#mondiv').should.have.class('actif'); => failure si non
 *
 *  Méthodes d'interrogation (à utiliser par exemple dans les fonctions Wait)
 *  ------------------------
 *    jq(<jid>).exists      // => TRUE si l'élément DOM existe
 *    jq(<jdi>).is_visible  // => TRUE si l'élément DOM est visible
 *
 *  Méthodes de test
 *  ----------------
 *  Produisent une erreur ou un succès.
 *
 *    jq(<jid>).[should|should_not].
 *      exist
 *      be_visible
 *      contain(<texte>)
 *      have.class(<class>)
 *      have.attr(<attr>[,<valeur])
 *
 */

// Reçoit un jID, un jQ ou un objet jQuery et retourne l'objet jQuery
window._obJOf = function(foo){
	if(foo.hasOwnProperty('attr')) 	return foo ; 			// objet jQuery
	if(foo.hasOwnProperty('jid'))		return foo.obj	; // objet jQ
	with(APP){foo = $(foo)} 													// jId
	return foo				
}
// Reçoit un jID, un jQ ou un objet jQuery et retourne une Instance jQ
window._jqOf = function(foo){
	if(foo.hasOwnProperty('jid')) 	return foo ; // Objet jQ
	if(foo.hasOwnProperty('attr')){						// Objet JQuery
		var jid, id, cla, type;
		var tag 		= foo[0].tagName.capitalize();
		if 			(undefined != (id=foo.attr('id'))) 			jid = tag+"#"+id
		else if (undefined != (cla=foo.attr('class'))) 	jid = tag+"."+classe
		else if (undefined != (ty=foo.attr('type'))) 		jid = tag+'[type="'+ty+'"]'
		return jq(jid)
	}
	else return jq(foo)		// simple jId
}

/* -------------------------------------------------------------------
 *  Les trois éléments principaux:
 *
 *    - La fonction jq permettant d'instancier les éléments DOM
 *    - La liste _JQS pour les mémoriser.
 *    - Le passage de jq à l'application pour simplifier le code
 *
 */

_JQS = {}

function jq(jid){
	if(undefined == _JQS[jid]) _JQS[jid] = new _jq(jid)
	else _JQS[jid]._get_obj()
  return _JQS[jid]
}

APP.jq = jq

/* 
 * ------------------------------------------------------------------- */


window._jq = function(jid){
  this.jid 			= jid
	this.obj			= null		// L'énumérateur jQuery
	this.obj_dom	= null		// Véritable objet DOM
  this._get_obj()
	
	// Réglage des sous-objets `is' et `is_not'
	this.is = {}
	this.is_not = {}
	Object.defineProperties(this.is, 			HumanPropertiesJQIs)
	Object.defineProperties(this.is_not, 	HumanPropertiesJQIs)	
	this.is.parent  		= this
	this.is.positif			= true
	this.is_not.parent  = this
	this.is_not.positif	= false

	// Réglage des sous-objets `has' et `has_not'
	this.has = {}
	this.has_not = {}
	Object.defineProperties(this.has, 			HumanPropertiesJQHas)
	Object.defineProperties(this.has_not, 	HumanPropertiesJQHas)	
	this.has.parent  		  = this
	this.has.positif			= true
	this.has_not.parent   = this
	this.has_not.positif	= false

}

// === Méthodes (raccourcis) simulant l'objet jQuery ===

// Définit ou renvoie la valeur de l'élément
// @usage			jq('<tag>#<id ou autre>').val() //=> retourne la valeur
// 						jq('<tag>#<id ou autre>').val(<valeur>) //=> Rentre la valeur dans l'élément
// 
// @note    Si +value+ est définie, la méthode produit un évènement onchange sur l'élément.
//          Mais seulement si l'élément est visible.
_jq.prototype.val = function(value){
	if(undefined == value)
  {
    return this._content
  } 
  else
  {
    if(this.exists)
    {
    	this.obj.val(value)
      if(this.is.visible) this.onchange
      return this
    }
    else
    {
      warning(LOCALES.errors.dom['DOM Element unfound'] + this.jid)
      return null
    }
  }
}

// NON: Cette méthode est écrasée ci-dessous par le test should.have.css (mais elle
//      gère quand même l'utilisation <jq>.css(...) pour affecter des propriétés)
// _jq.prototype.css = function(prop, value){
//   this.obj.css(prop, value)
// }

Object.defineProperties(_jq.prototype, {
  // Pour détruire l'élément DOM
  // @note : pas de parenthèses.
  "remove":{get:function(){this.obj.remove()}
  },
  // Pour simuler un "onchange" sur l'élément
  "onchange":{get:function(){
    this.obj_dom.onchange()
  }
  }
})


// Récupérer l'objet DOM dans l'application testée (méthode interne seulement)
_jq.prototype._get_obj = function(){
	var jid = this.jid;
	with(APP){obj = $(jid)};
	this.obj 			= obj
	this.obj_dom 	= obj[0]
}

// -------------------------------------------------------------------
//  Méthodes de manipulation

/* Pour la méthode `create', cf. ./defer/jQ_create.js */


/* 
 * Produit un click-and-drag sur l'objet jQ
 *
 * Cf. la méthode Mouse.move_on pour le détail des +data+
 * Ou la page :
 *    https://github.com/PhilippePerret/PureJavascriptTests/wiki/Manipulation-dom#press_and_drag
 */
_jq.prototype.press_and_drag = function(data){
  Mouse.press_and_drag( this.obj_dom, data)
}

// -------------------------------------------------------------------
//  Méthodes d'interrogation
// 

// Retourne TRUE si l'objet est visible
// @param		strict		Si FALSE, on fonctionne comme jQuery, c'est-à-dire qu'un élément
// 										est considéré comme visible lorsqu'il prend de la place dans le
// 										DOM. C'est-à-dire que même si l'objet est visibility:hidden, il
// 										peut être considéré comme visible.
// 										(TRUE par défaut)
_jq.prototype._is_visible = function(strict){
	if(undefined == strict) strict = true
	if(this.not_exists) return false
	if(strict && 
			(
				this.obj.css('display')		 == 'none'   ||
				this.obj.css('visibility') == 'hidden' ||
				this.obj.css('opacity') 	 == '0'
			)
		) return false
	return this.obj.is(':visible')
}

// Méthode d'interrogation `Contains`
_jq.prototype.contains_element = function(foo){
	var foo = _obJOf(foo)
	if(this.not_exists) return false
	return foo.parent()[0] == this.obj[0]
}


/* 	Utiliser cette fonction pour envoyer le deuxième paramètre de la
		fonction `_estime`
		Un appel classique est :
				
				data_estimation_jq(this, {
					test:'be.visible',
					result:{
						positif:{success:"", failure:""},
						negatif:{success:"", failure:""}
					},
					expected:null
				})
 */
window.data_estimation_jq = function(obj, data){ 
	return {
		// test, args : pour les messages customisés
		test						: data.test,
		args						: data.args || [],
		positif				: obj.positif,
		sujet  				: data.sujet || obj.jid,
		_before_result	: data._before_result || null,
		result					: data.result || {
			positif:{success:(obj.strict?LOCALES['strictly']:''), 										failure:""},
			negatif:{success:LOCALES['different']+(obj.strict?LOCALES['strictly']:'')+LOCALES['from'], 	failure:""}
		},
		dont_inspect_expected	:true,
		no_expected_result		:data.no_expected_result || false,
		expected_result			:data.expected || "",
		after_if_failure			:data.after_if_failure || {positif:null,negatif:null}
	}
}

/* =============== HUMAN SPEAKING ==============
 *
 */
Object.defineProperties(_jq.prototype,{
	
	// --- Méthodes utilitaires ---
  // Reset <jq>
  // ----------
  // Note: La méthode est appelée APRÈS chaque traitement, pas avant
  "reset":{
    get:function()
    {
      this.mode = null
    }
  },
	// Retourne le tagname de l'élément
	"tagName":{
		get:function(){
			if(this.not_exists) return undefined
			return this.obj_dom.tagName
		}
	},
	// Click sur l'objet (retourne TRUE si le click a pu se faire)
	"click":{
		get:function(){
			// this.obj.click() // Pour le moment, comme un objet jQuery
			if(this.not_exists) return false
			this.obj[0].click()
			return true
		}
	},
  // Définit le contenu de l'objet (et provoque un onchange)
	"content":{
		get:function(){return this._content},
		set:function(contenu){this.val(contenu)}
	},
	// Retourne le contenu HTML ou la valeur de l'élément suivant son type
	"_content":{
		get:function(){
			if(this.not_exists) return null
		  switch(this.obj[0].tagName){
		    case 'INPUT':
		    case 'TEXTAREA':
		    case 'SELECT':
		    case 'RADIO':
		      return this.obj.val();
		    default:
		      return this.obj.html();
		  }
		}
	},
  // Retourne TRUE si l'élément contient +value+ (en contenu HTML ou propriété `value`)
	"contains":{value:function(value){return this._content == value}},
	"not_contains":{
		value:function(value){return this._content != value}
	},
	// --- Méthodes de tests ---
	"should":{
		get:function(){this.positif=true ;this.mode='test';return this},
		// Pour pouvoir utiliser `<jq>.should = <valeur>`
		set:function(value){return this.should.contain(value)}
	},
	"should_not":{
		get:function(){this.positif=false;this.mode='test';return this},
		set:function(value){return this.should_not.contain(value)}
	},
  "set":{
    get:function(){this.mode='set';return this}
  },
	// --- Méthodes d'interrogation ---
	"exists":{ get:function(){return this.obj.length > 0}},
	"not_exists":{ get:function(){return false == this.exists}},

})


/* -------------------------------------------------------------------
 *	Méthodes d'interrogation
 */

// Propriétés complexes et méthodes qui seront ajoutés au `is` de l'objet à
// son instanciation.
// 
// @note		Tous les `is.<quelque chose>' doivent être définis ici
// 
var HumanPropertiesJQIs = {
	// --- Méthodes utilitaires ---

 	// --------------------------------
	// --- Méthodes d'interrogation ---
 	// --------------------------------
	
	// -- Propriétés complexe --
	"checked":{
		get:function(){return this.parent.obj_dom.checked      
    }
	},
	"visible"				:{
		get:function(){
      var res = this.parent._is_visible(true) == this.positif
      this.parent.reset
			return res
    },
		set:function(strict){	
			return this.parent._is_visible(string) == this.positif},
		enumerable:true
	},
	"hidden"				:{
		get:function(){
			return !this.visible},
		set:function(strict){ 
			return !(this.visible = strict)}
	},
  "empty":{
    get:function(){
      this.parent.reset
      return this.parent._content == ""
    }
  },
	// -- Méthodes --
	"before"				:{
		value:function(foo){
			var res = this.positif == (this.parent.obj.next()[0] == _obJOf(foo)[0])
      this.parent.reset
      return res
		}
	},
	"after"					:{
		value:function(foo){
			var res = this.positif == (this.parent.obj.prev()[0] == _obJOf(foo)[0])
      this.parent.reset
      return res
		}
	},
	"contained_by"	:{
		value:function(foo){
			var res = this.positif == (this.parent.obj.parent()[0] == _obJOf(foo)[0])
      this.parent.reset
      return res
		}
	}
	
}

var HumanPropertiesJQHas = {
    
  // has.attr(<attr>[, <valeur>])
  "attr":{
    value:function(attr, value){
  		var attr_val = this.parent.obj.attr(attr)
  		var result = attr_val != undefined
  		if( undefined != value ) result = result && (value == attr_val)
      this.parent.reset
      return result
    }
  },
  "value":{
    get:function(valeur){ 
      var res = this.parent.obj_dom.value == valeur 
      this.parent.reset
      return res
    }
  },
  // `has.position(x, y) / Substitut à `is.at`
  "position":{
    value:function(x, y, tol_x, tol_y){
      return false // pour le moment
    }
  }
}


 	// --------------------------------
 	//	Méthodes de tests
 	// --------------------------------


const HumanProperties_JQ_Should = {
	
	// --- Propriétés à chainer ---
	"be"			:	{
		get:function(){return this},
		// Pour pouvoir utiliser `jq('input#field).should.be = <valeur>`
		set:function(value){return this.should.contain(value)}
	},
	"have"		:	{get:function(){return this}},
	"stand"		: {get:function(){return this}},
	
	// --- Propriété complexes de fin de chaine ---
	
	"exist"		: {
		get:function(){
			return _estime(
				this.obj.length > 0,
				{
					test:'exist',
					args:[],
					positif:this.positif,
					sujet:tostring(this.jid),
					_before_result:null,
					result:{
						positif:{success:LOCALES['exists'], 			failure:LOCALES['should exist']},
						negatif:{success:LOCALES['not exists'], 	failure:LOCALES['should not exist']}
					},
					dont_inspect_expected:true,
					expected_result:LOCALES['in the DOM'],
					after_if_failure:{
						positif:null, 
						negatif:" ("+LOCALES['it stands in']+" `"+this.jid+"`)"
					}
				}
			)
		}
	},
	"mess_long_contain":{
		value:function(mess){
      if('string' != typeof mess) mess = mess.toString()
			mess_formated = mess.replace(/\</g,'&lt;').replace(/\t/g,'&nbsp;&nbsp;&nbsp;')
			if(mess.length < 50) return "“"+mess_formated+"”"
			else return "“<br />"+mess_formated+"<br />”"
		}
	},
	"contain" :{
		value:function(mess){
	    var t = this._content, rep ;
      if( undefined != mess && mess === "")
      {
        res = this.is.empty
        rep = this.mess_long_contain( t )
      } 
      else 
      {
  			if( ! mess ) mess = ""
        if(t)
        { 
          // res = t.indexOf( mess ) >-1 ;
          res = t.contains( mess ) // traite les expressions régulières
          rep = this.mess_long_contain( t )
        }
        else
        {  
          res = false ; rep = "" 
        }
      }
	    return _estime(
	      res, {
					test:'contain',
					args:[mess],
					positif:this.positif,
					sujet:this.jid,
					_before_result:{
								positif:{success:"", failure:""},
								negatif:{success:"", failure:""}
							},
					result:{
						positif:{success:LOCALES['contains'], 	failure:LOCALES['should contain']},
						negatif:{success:LOCALES['doesnt contain'], failure:LOCALES['should not contain']}
					},
					expected_result:" "+this.mess_long_contain(mess),
					dont_inspect_expected:true,
					after_if_failure:{
						positif:LOCALES['it contains']+rep, 
						negatif:null}
				}  
			)
		}
	}
}

Object.defineProperties(_jq.prototype.should, 		HumanProperties_JQ_Should)
Object.defineProperties(_jq.prototype.should_not,	HumanProperties_JQ_Should)



const HumanProperties_JQ_Should_Be = {
  "at":{
    value:function(x_comp, y_comp, tol_x, tol_y){
      tol_x   = _when_undefined_or_null(tol_x, 2)
      tol_y   = _when_undefined_or_null(tol_y, tol_x)
      var pos, x_
      if(this.obj.length){
        pos = this.obj.position(), x_obj = pos.left, y_obj = pos.top
        x_comp  = _when_undefined_or_null(x_comp, x_obj)
        y_comp  = _when_undefined_or_null(y_comp, y_obj)
        var x_good = Math.abs(x_comp - x_obj) <= tol_x
        var y_good = Math.abs(y_comp - y_obj ) <= tol_y
        
        res = x_good && y_good
        pos_expected = LOCALES['at']+x_comp+" / "+y_comp+" (x±"+tol_x+"/y±"+tol_y+")"
        after_failure_pos = LOCALES['it is']+LOCALES['at']+x_obj+" / "+y_obj
      } else {
        pos = null
        res = false
        x_comp = "undefined"
        y_comp = "undefined"
        pos_expected = LOCALES.errors.jq['at_pos_but_unfound']
        after_failure_pos = LOCALES.errors.dom['DOM Element unfound']
      }
      return _estime(res, data_estimation_jq(this, {
        test:'be.at',
        result:{
          positif:{success:LOCALES['is'], failure:LOCALES['should be']},
          negatif:{success:LOCALES['is not'], failure:LOCALES['should not be']}
        },
        expected:pos_expected,
        after_if_failure:{positif:after_failure_pos, negatif:null}
      }))
    }
  },
	"empty"   :{
		get:function(){
			return _estime(this._content == "", data_estimation_jq(this, {
				test:'be.empty',
				result:{
					positif:{success:LOCALES['is'], failure:LOCALES['should be']},
					negatif:{success:LOCALES['is not'], failure:LOCALES['should not be']}
				},
				expected:LOCALES['empty'],
				after_if_failure:{positif:LOCALES['it contains']+" `"+this._content+"`", negatif:null}
			}))
		}
	},
	"visible" :{
		set:function(strict){
			return _estime(this._is_visible(strict), data_estimation_jq(this, {
				test:'be.visible',
				result:{
					positif:{success:LOCALES['is'], failure:LOCALES['should be']},
					negatif:{success:LOCALES['is not'], failure:LOCALES['should not be']}
				},
				expected:LOCALES['visible']+(strict?LOCALES['strict visual mode']:LOCALES['jquery mode'])
			}))
		},
		get:function(){
			return _estime(this._is_visible(true), data_estimation_jq(this, {
				test:'be.visible',
				result:{
					positif:{success:LOCALES['is'], failure:LOCALES['should be']},
					negatif:{success:LOCALES['is not'], failure:LOCALES['should not be']}
				},
				expected:LOCALES['visible']+LOCALES['strict visual mode']
			}))
    }
	},
  "check":{
    value:function(val){
      if(this.mode == 'set')
      {
        this.obj_dom.checked = val
        this.onchange
      }
      else
      {
        warning("Use check only with `<jQ>.set.check(<value>)`")
      }
    }
  },
	"checked":{
		get:function(){
      if(this.mode == 'set')
      {
        this.obj_dom.checked = true
        this.onchange
      }
      else
      {
  			return _estime(this.obj_dom.checked == true, data_estimation_jq(this, {
  				test:'be.checked',
  				result:{
  					positif:{success:"est", failure:"devrait être"},
  					negatif:{success:"n'est pas", failure:"ne devrait pas être"}
  				},
  				expected:LOCALES['checked']
  			  })
        )
      }
    }
	},
  "unchecked":{
    get:function(){
      if(this.mode == 'set')
      {
        this.obj_dom.checked = false
        this.onchange
      }
      else
      {
        this.positif = false
        return this.checked
      }
    }
  },
	"after"   :{
		value:function(before){
			return _estime(this.is.after(before), data_estimation_jq(this, {
				test:'be.after',
				result:{
					positif:{success:LOCALES['stands'], failure:LOCALES['should stand']},
					negatif:{success:LOCALES['doesnt stand'], failure:LOCALES['should not stand']}
				},
				expected:LOCALES['after']+"`"+_jqOf(before).jid+"`"
			}))
		}
	},
	"before"   :{
		value:function(after){
			return _estime(this.is.before(after), data_estimation_jq(this, {
				test:'be.before',
				result:{
					positif:{success:LOCALES['stands'], failure:LOCALES['should stand']},
					negatif:{success:LOCALES['doesnt stand'], failure:LOCALES['should not stand']}
				},
				expected:LOCALES['before']+"`"+_jqOf(after).jid+"`"
			}))
		}
	}
}

Object.defineProperties(_jq.prototype.should.be, 			HumanProperties_JQ_Should_Be);
Object.defineProperties(_jq.prototype.should_not.be, 	HumanProperties_JQ_Should_Be);

const HumanProperties_JQ_Should_Have = {
	"value" :{
		value:function(value){
			_estime(this._content == value, data_estimation_jq(this, {
				test:'have.value',
				result:{
					positif:{success:LOCALES['has'], failure:LOCALES['should have']},
					negatif:{success:LOCALES['has not'], failure:LOCALES['should not have']}
				},
				expected:LOCALES['value'] + inspect(value),
				no_expected_result:true,
				after_if_failure:null
			}))
		}
	},
  // Vérifie la propriété css de l'élément
  // @param foo   Soit une propriété, soit un tableau associatif (comme pour jQuery)
  // @param val   La valeur attendue pour la propriété si foo est une propriété ou undefined
  // 
  // @warning   Cette propriété complexe peut être appelée dans 2 circonstances :
  //            - Pour tester une propriété css : <jq>.should.have.css('prop', 'valeur')
  //            - Pour affecter une valeur      : <jq>.css('prop', 'valeur')
  //            On fait la distinction grâce à la propriété `mode` de <jq>, qui est à "test"
  //            lorsque `should` est utilisé.
  "css":{
    value:function(foo, val){
      if('string' == typeof foo){ tbl = {}; tbl[foo] = val}
      else tbl = foo
      if(this.mode == 'set') // lire le @warning ci-dessus
      {
        this.obj.css(tbl)
        this.reset
        return
      }
      var result  = true, mess ;
      var props_good = []
      var props_bad  = []
      for(var prop in tbl){
        if(false == tbl.hasOwnProperty(prop)) continue
        if( this.positif == ( this.obj.css(prop) == tbl[prop] )){
          props_good.push( prop )
        } else {
          mess = prop + LOCALES['is'] + inspect(this.obj.css(prop))
          if(this.positif) mess += " vs " + LOCALES['expected'] + inspect(tbl[prop])
          props_bad.push( mess )
          result = false
        }
      }
      var mess_success = "", mess_failure = "" ;
      if(result){
        mess_success = LOCALES[this.positif ? 'has' : 'has not'] 
        if(this.positif) mess_success += LOCALES['expected properties']
        else mess_success += LOCALES['properties'] + inspect(tbl)
      } else {
        // failure
        mess_failure =  LOCALES[this.positif ? 'should have' : 'should not have']  +
                        LOCALES[this.positif ? 'expected properties' : 'properties'] + "\n("
        if(props_good.length) mess_failure += LOCALES['good-es'] +': '+ props_good.join(', ')
        if(props_bad.length ){ 
          if(props_good.length) mess_failure += " / "
          mess_failure += LOCALES['bad-es'] +': '+ props_bad.join(', ')
        }
        mess_failure += " )"
      }
      this.reset
      
			_estime(result == this.positif, data_estimation_jq(this, {
				test:'have.css',
				result:{
					positif:{success:mess_success, failure:mess_failure},
					negatif:{success:mess_success, failure:mess_failure}
				},
				expected:null,
				no_expected_result:true,
				after_if_failure:null
			}))
    }
  },
	"attr"	:{
		// @note: si value n'est pas fourni, on veut juste savoir si l'objet
		// 				possède l'attribut fourni en premier argument.
		value:function(attr, value){
      var result    = this.has.attr( attr, value )
      var attr_val = this.obj.attr(attr), result_pos, result_neg ;
			if(undefined == attr_val){
				result_pos = {failure:LOCALES['should exist']}
				result_neg = {success:LOCALES['not exists']}
			} else {
				// L'attribut existe
				if(undefined == value){
					// Pour une simple recherche de l'attribut
					result_pos = {success:LOCALES['exists']}
					result_neg = {failure:LOCALES['should not exist']}
				} else {
					// Pour une recherche de la valeur de l'attribut
					if(value == attr_val){
						result_pos = {success:LOCALES['has']+LOCALES['value']+"`"+value+"`"}
						result_neg = {failure:LOCALES['should not have']+LOCALES['value']+"`"+value+"`"}
					}else{
						result_pos = {failure:LOCALES['should have']+LOCALES['value']+"`"+value+"`"}
						result_neg = {success:LOCALES['has not']+LOCALES['value']+"`"+value+"` (OK)"}
					}
				}
			}
      // result = attr_val != undefined
      // if(undefined != value) result = result && (value == attr_val)
			return _estime( result, data_estimation_jq(this, {
				test:'have.attr',
				sujet:"`"+attr+"`"+LOCALES['de']+"`"+this.jid+"` ",
				result:{
					positif:result_pos,
					negatif:result_neg
				},
				expected:"",
				no_expected_result:true,
				after_if_failure:null
			}))
		}
	},
	// Vérifie que l'élément a les bonnes dimensions (avec une tolérance possible)
	"dimension":{
		value:function(comp_w, comp_h, tol_w, tol_h){
      tol_w   = _when_undefined_or_null(tol_w, 2)
      tol_h   = _when_undefined_or_null(tol_w, tol_w)
      comp_w  = _when_undefined_or_null(comp_w, this.obj_dom.offsetWidth)
      comp_h  = _when_undefined_or_null(comp_h, this.obj_dom.offsetHeight)
			var obj_larg = this.obj_dom.offsetWidth
			var obj_haut = this.obj_dom.offsetHeight
			var good 	= Math.abs(comp_w - obj_larg) <= tol_w
					good 	= good && ( Math.abs(comp_h - obj_haut <= tol_h))
			return _estime(
				good, data_estimation_jq(this, {
				test:'have.dimension',
				result:{
					positif:{success:LOCALES['has'], failure:LOCALES['should have']},
					negatif:{success:LOCALES['doesnt have'], failure:LOCALES['should not have']}
				},
				expected:LOCALES['a dimension']+" "+comp_w+" x "+comp_h+" (width±"+tol_w+"/height±"+tol_h+")",
				dont_inspect_expected:true,
				after_if_failure:{positif:LOCALES['it is']+obj_larg+" x "+obj_haut, negatif:null}
			}))
		}
	},
	"class"	:{
		value:function(classe){
			var obj_class = this.obj.attr('class')
			if(undefined == obj_class) afterfailpos = LOCALES['no class for element']
			else afterfailpos = LOCALES['its class contains']+"`"+obj_class+"`"
			return _estime(this.obj.hasClass(classe), data_estimation_jq(this, {
				test:'have.class',
				result:{
					positif:{success:LOCALES['has'], failure:LOCALES['should have']},
					negatif:{success:LOCALES['doesnt have'], failure:LOCALES['should not have']}
				},
				expected:LOCALES.if_fr['la']+" class `"+classe+"`",
				dont_inspect_expected:true,
				after_if_failure:{positif:afterfailpos, negatif:null}
			}))
		}
	},
}
Object.defineProperties(_jq.prototype.should.have, 			HumanProperties_JQ_Should_Have)
Object.defineProperties(_jq.prototype.should_not.have, 	HumanProperties_JQ_Should_Have)