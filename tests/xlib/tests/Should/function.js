function Should_function(poursuivre){

	// Fonctions autres que `be`
	
	// return
	w("\nReturn", BLUE)
	w('Soit la fonction :')
	w('APP._test_retourne_longueur = function(valeur){')
	w('	return "La longueur de "+valeur+" est "+valeur.length')
	w('}')
	APP._test_retourne_longueur = function(valeur){
		return "La longueur de "+valeur+" est "+valeur.length
	}
	w('\'_test_retourne_longueur("Mon string")\'.should.return("La longueur de Mon string est 10")')
	'_test_retourne_longueur("Mon string")'.should.return("La longueur de Mon string est 10")
	w('APP._une_erreur_normale_de_retour = APP._test_retourne_longueur')
	APP._une_erreur_normale_de_retour = APP._test_retourne_longueur
	w('\'_une_erreur_normale_de_retour("Mon string")\'.should.return(10)')
	'_une_erreur_normale_de_retour("Mon string")'.should.return(10)
	
	// Contain
	w("\nContain", BLUE)
	w('APP._ma_string_test = "Je suis un texte contenant quelque chose"')
	APP._ma_string_test = "Je suis un texte contenant quelque chose"
	w('\'_ma_string_test\'.should.contain("un texte contenant")')
	'_ma_string_test'.should.contain("un texte contenant")
	w('\'_ma_string_test\'.should_not.contain("pas contenu par la chaine")')
	'_ma_string_test'.should_not.contain("pas contenu par la chaine")
	w("Générer une erreur avec :", GREEN)
	w('APP._cette_erreur_est_normale = "Je suis un texte contenant quelque chose"')
	APP._cette_erreur_est_normale = "Je suis un texte contenant quelque chose"
	w('\'_cette_erreur_est_normale\'.should_not.contain("un texte contenant")')
	'_cette_erreur_est_normale'.should_not.contain("un texte contenant")
	w("Générer une erreur avec :", GREEN)
	w("'_cette_erreur_est_normale'.should.contain(\"pas contenu par la chaine\")")
	'_cette_erreur_est_normale'.should.contain("pas contenu par la chaine")

	// Respond
	w("Respond", BLUE)
	w('APP._mon_objet_test = {}')
	APP._mon_objet_test = {}
	w('APP._mon_objet_test.une_function = function(){return true}')
	APP._mon_objet_test.une_function = function(){return true}
	w('"_mon_objet_test".should.respond_to("une_function")')
	"_mon_objet_test".should.respond_to("une_function")
	w('"_mon_objet_test".should_not.respond_to("une_fonction_inconnue")')
	"_mon_objet_test".should_not.respond_to("une_fonction_inconnue")
	w('APP._mon_objet_test.cette_erreur_est_normale = function(){return true}')
	APP._mon_objet_test.cette_erreur_est_normale = function(){return true}
	w('"_mon_objet_test".should_not.respond_to("cette_erreur_est_normale")')
	"_mon_objet_test".should_not.respond_to("cette_erreur_est_normale")
	w('APP._cette_erreur_est_normale = {}')
	APP._cette_erreur_est_normale = {}
	w('"_cette_erreur_est_normale".should.respond_to("une_function")')
	"_cette_erreur_est_normale".should.respond_to("une_function")
	
	if('function'==typeof poursuivre) poursuivre();
	else Test.end();
	
}