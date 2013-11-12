function Interrogation_String_divers() {
	APP.valeur = "Ma valeur"
	
	specs("Test de `'<string>'.value`. La propriété doit renvoyer la valeur de la propriété de l'application.")
	
	db("APP.valeur = " + "valeur".value)
	code = "APP.valeur = Ma valeur"
	if(get_last_div_rapport == code) success("<string>.value renvoie bien la valeur de <string> dans l'application")
	else failure("Le retour devrait être `"+ligne+"`")
	

	// === Méthodes ===
	// Contains
	w("\nConstains / Not_contains", BLUE)
	eval_and_result("'valeur'.contains('Ma valeur')", true)
	eval_and_result("'valeur'.contains('valeu', stric=false)", true)
	eval_and_result("'valeur'.contains('valeu')", true)
	eval_and_result("'valeur'.not_contains('Mon autre valeur')", true)
	eval_and_result("'valeur'.not_contains('valeur', strict=true)", true)
	
	eval_and_result("'valeur'.contains('valeur', stric=true)", false)
	eval_and_result("'valeur'.contains('Mon autre valeur')", false)
	eval_and_result("'valeur'.not_contains('Ma valeur')", false)
	


}