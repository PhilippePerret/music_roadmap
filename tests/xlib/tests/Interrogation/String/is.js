Object.defineProperties(this,{

	// Retourne le contenu HTML de la dernière ligne de rapport écrite
	get_last_div_rapport:{
		get:function(){return $('div#rapport').children().last().html()},
		configurable:true
	}
})

function eval_and_result(code, expected) {
	res = eval(code)
	if(res === expected) success("`"+code+"` renvoie bien "+tostring(expected))
	else failure("`"+code+"` devrait renvoyer "+tostring(expected)+", il renvoie : "+res)
}

function Interrogation_String_is() {
	
	specs("Test de `'<string>'.is.<method/prop>`. Permet de tester la valeur de <string> dans l'application.")

	// === Propriétés ===
	
	// @TODO: POURSUIVRE ICI AVEC LE TEST DE is.null, is.defined etc.
	
	// Is.a_string
	w("\nIs.a_string", BLUE)
	APP.valeur = "Ma valeur"
	db('APP.valeur = "Ma valeur"')
	eval_and_result("'valeur'.is.a_string", true)
	eval_and_result("'valeur'.is_not.a_number", true)
	eval_and_result("'valeur'.is.a_number", false)
	
	// Is.an_array
	w("\nIs.an_array", BLUE)
	eval_and_result("'valeur'.is_not.an_array", true)
	eval_and_result("'valeur'.is.an_array", false)
	APP.valeur = [3, 1, 12]
	db('APP.valeur = [3, 1, 12]')
	eval_and_result("'valeur'.is.an_array", true)
	eval_and_result("'valeur'.is_not.an_array", false)
	
	// Is.a_function
	w("\nIs.a_function", BLUE)
	eval_and_result("'valeur'.is_not.a_function", true)
	eval_and_result("'valeur'.is.a_function", false)
	APP.valeur = function(){return true}
	db('APP.valeur = function(){return true}')
	eval_and_result("'valeur'.is_not.a_function", false)
	eval_and_result("'valeur'.is.a_function", true)
	
	// Is.a_number
	w("\nIs.a_number", BLUE)
	eval_and_result("'valeur'.is_not.a_number", true)
	eval_and_result("'valeur'.is.a_number", false)
	APP.valeur = 0
	db('APP.valeur = 0')
	eval_and_result("'valeur'.is_not.a_number", false)
	eval_and_result("'valeur'.is.a_number", true)

	// Is.a_boolean
	w("\nIs.a_boolean", BLUE)
	eval_and_result("'valeur'.is_not.a_boolean", true)
	eval_and_result("'valeur'.is.a_boolean", false)
	APP.valeur = true
	db('APP.valeur = true')
	eval_and_result("'valeur'.is_not.a_boolean", false)
	eval_and_result("'valeur'.is.a_boolean", true)

	// Is.an_object
	w("\nIs.an_object", BLUE)
	eval_and_result("'valeur'.is_not.an_object", true)
	eval_and_result("'valeur'.is.an_object", false)
	APP.valeur = {un:"objet", deux:true}
	db('APP.valeur = {un:"objet", deux:true}')
	eval_and_result("'valeur'.is_not.an_object", false)
	eval_and_result("'valeur'.is.an_object", true)

	// === Méthodes ===
	// Is.equal_to / Is.eq
	w("\nIs.eq / Is.equal_to", BLUE)
	APP.valeur = "Ma valeur"
	db('APP.valeur = "Ma valeur"')
	eval_and_result('"valeur".is.eq("Ma valeur")', true)
	eval_and_result('"valeur".is.equal_to("Ma valeur")', true)
	eval_and_result('"valeur".is_not.equal_to("Une autre valeur")', true)
	eval_and_result('"valeur".is_not.eq("Une autre valeur")', true)
	eval_and_result('"valeur".is_not.equal_to("Ma valeur")', false)
	eval_and_result('"valeur".is_not.eq("Ma valeur")', false)
	
	
	w("\nIs.between",BLUE)
	APP.valeur_nombre = 12
	db('APP.valeur_nombre = 12')
	eval_and_result('"valeur_nombre".is.between(8, 14, strict=false)', true)
	eval_and_result('"valeur_nombre".is.between(8, 12)', true)
	eval_and_result('"valeur_nombre".is_not.between(8, 11, strict=false)', true)
	eval_and_result('"valeur_nombre".is.between(11, 14, strict=true)', true)
	eval_and_result('"valeur_nombre".is_not.between(8, 11, strict=false)', true)
	
	eval_and_result('"valeur_nombre".is.between(14, 18)', false)
	eval_and_result('"valeur_nombre".is.between(12, 14, strict=true)', false)
	eval_and_result('"valeur_nombre".is_not.between(8, 14)', false)
	
	
	
	Test.end()
}
