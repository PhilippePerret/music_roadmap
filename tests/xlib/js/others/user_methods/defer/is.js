// Propriétés/méthodes se trouvant dans l'objet <String>._is (pour `is` et `is_not`)
const _StringIs_ComplexProperties = {
	"value":{get:function(){return this.super.value}},
	"equal_to":{value:function(value){ 
		return this.positif === (this.value == value)}
	},
	"eq":{value:function(value){return this.equal_to(value)}},
	"between":{
		value:function(min,max,strict){
			if(undefined == strict) strict = false
			var val = this.value, res;
			if(strict) 	res = val > min && val < max
			else 				res = val >= min && val <= max
			return this.positif === res
		}
	},
	// La valeur
	"true":{get:function(){return this.positif == (this.value === true)}},
	"false":{get:function(){return this.positif == (this.value === false)}},
	"null":{get:function(){return this.positif == (this.value === null)}},
	"defined":{get:function(){return this.positif == (undefined != this.value)}},
	"undefined":{get:function(){return this.positif == (undefined == this.value)}},
	
	// Les types
	"a_string":{get:function(){return this.positif == ('string' == typeof this.value)}},
	"a_number":{get:function(){return this.positif == ('number' == typeof this.value)}},
	"an_array":{get:function(){return this.positif == ('array' == _exact_type_of(this.value))}},
	"an_object":{get:function(){return this.positif == ('object' == this.super.exact_type)}},
	"a_boolean":{get:function(){return this.positif == ('boolean' == typeof this.value)}},
	"a_function":{get:function(){return this.positif == ('function' == typeof this.value)}},
}

Object.defineProperties(String.prototype, {

	// --- Méthodes de retour ---

	// Retourne la valeur 
	"value":{
		get:function(){return eval("APP."+this.toString())},
		set:function(value){ eval("APP."+this.toString()) = value }
	},
	
	// --- Méthodes d'interrogation ---
	// Définit l'objet `_is' qui va comporter toutes les méthodes
	"define_is":{get:function(){
		this._is 					= {}
		Object.defineProperties(this._is, _StringIs_ComplexProperties)
		this._is.super 		= this
	}},
	"is":{
		get:function(){
			if(undefined == this._is){this.define_is}
			this._is.positif = true
			return this._is
		}
	},
	"is_not":{
		get:function(){
			if(undefined == this._is){this.define_is}
			this._is.positif = false
			return this._is
		}
	}
})