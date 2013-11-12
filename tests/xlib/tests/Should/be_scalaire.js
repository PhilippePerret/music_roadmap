function new_should(poursuivre){

	specs("Tous ces tests doivent retourner des succès si les tests `should` et"+
				" `should_not` de Pure-JS-Tests sont opérationnels et valides.")
	specs("@note	Il reste à tester quelques messages d'erreur")
				
	// --- Propriétés complexes ---
	// Null
	w("\nNull", BLUE)
	w('APP._ma_variable_test = null')
	APP._ma_variable_test = null
	w('"_ma_variable_test".should.be.null')
	"_ma_variable_test".should.be.null
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should_not.be.null')
	"_ma_variable_test".should_not.be.null
	
	// True
	w("\nTrue", BLUE)
	w('APP._ma_variable_test = true')
	APP._ma_variable_test = true
	w('"_ma_variable_test".should.be.true')
	"_ma_variable_test".should.be.true
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should_not.be.true')
	"_ma_variable_test".should_not.be.true
	w('APP._ma_variable_test = ""')
	APP._ma_variable_test = ""
	w('"_ma_variable_test".should_not.be.true')
	"_ma_variable_test".should_not.be.true	
	w('APP._ma_variable_test = {something:"Quelque chose"}')
	APP._ma_variable_test = {something:"Quelque chose"}
	w('"_ma_variable_test".should_not.be.true')
	"_ma_variable_test".should_not.be.true	
	
	// False
	w("\nFalse", BLUE)
	w('APP._ma_variable_test = false')
	APP._ma_variable_test = false
	w('"_ma_variable_test".should.be.false')
	"_ma_variable_test".should.be.false
	w('"_ma_variable_test".should.be.false = false')
	"_ma_variable_test".should.be.false = false
	w('"_ma_variable_test".should.be.false = true')
	"_ma_variable_test".should.be.false = true
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should_not.be.false')
	"_ma_variable_test".should_not.be.false
	w('"_ma_variable_test".should_not.be.false = true')
	"_ma_variable_test".should_not.be.false = true
	w('APP._ma_variable_test = ""')
	APP._ma_variable_test = ""
	w('"_ma_variable_test".should_not.be.false')
	"_ma_variable_test".should.be.false
	w('"_ma_variable_test".should_not.be.false = true')
	"_ma_variable_test".should_not.be.false = true
	
	// Defined
	w("\nDefined", BLUE)
	w('APP._ma_variable_test = true')
	APP._ma_variable_test = true
	w('"_ma_variable_test".should.be.defined')
	"_ma_variable_test".should.be.defined
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should.be.defined')
	"_ma_variable_test".should.be.defined
	w('APP._ma_variable_test = ""')
	APP._ma_variable_test = ""
	w('"_ma_variable_test".should.be.defined')
	"_ma_variable_test".should.be.defined	
	w('APP._ma_variable_test = {something:"Quelque chose"}')
	APP._ma_variable_test = {something:"Quelque chose"}
	w('"_ma_variable_test".should.be.defined')
	"_ma_variable_test".should.be.defined	
	w('APP._ma_variable_test = null')
	APP._ma_variable_test = null
	w('"_ma_variable_test".should_not.be.defined')
	"_ma_variable_test".should_not.be.defined
	w('"_ma_variable_qui_nexiste_pas_______".should_not.be.defined')
	"_ma_variable_qui_nexiste_pas_______".should_not.be.defined
	
	// Undefined
	w("\nUndefined", BLUE)
	w('APP._ma_variable_test = true')
	APP._ma_variable_test = true
	w('"_ma_variable_test".should_not.be.undefined')
	"_ma_variable_test".should_not.be.undefined
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should_not.be.undefined')
	"_ma_variable_test".should_not.be.undefined
	w('APP._ma_variable_test = ""')
	APP._ma_variable_test = ""
	w('"_ma_variable_test".should_not.be.undefined')
	"_ma_variable_test".should_not.be.undefined	
	w('APP._ma_variable_test = {something:"Quelque chose"}')
	APP._ma_variable_test = {something:"Quelque chose"}
	w('"_ma_variable_test".should_not.be.undefined')
	"_ma_variable_test".should_not.be.undefined	
	w('APP._ma_variable_test = null')
	APP._ma_variable_test = null
	w('"_ma_variable_test".should.be.undefined')
	"_ma_variable_test".should.be.undefined
	w('"_ma_variable_qui_nexiste_pas_______".should_not.be.undefined')
	"_ma_variable_qui_nexiste_pas_______".should.be.undefined
	
	
	// A String
	w("\nA String", BLUE)
	w('APP._mon_string_test = "Un string"')
	APP._mon_string_test = "Un string"
	w('"_mon_string_test".should.be.a_string')
	"_mon_string_test".should.be.a_string
	w('APP._not_a_string = 12')
	APP._not_a_string = 12
	w('"_not_a_string".should_not.be.a_string')
	"_not_a_string".should_not.be.a_string
	w('APP._ceci_est_une_erreur_normale = {}')
	APP._ceci_est_une_erreur_normale = {}
	w('"_ceci_est_une_erreur_normale".should.be.a_string')
	"_ceci_est_une_erreur_normale".should.be.a_string
	w('APP._ceci_est_une_erreur_normale = "Et pourtant c\'est un string"')
	APP._ceci_est_une_erreur_normale = "Et pourtant c'est un string"
	w('"_ceci_est_une_erreur_normale".should_not.be.a_string')
	"_ceci_est_une_erreur_normale".should_not.be.a_string
		
	// A Number
	w("\nA Number", BLUE)
	w('APP._ceci_est_un_nombre = 12')
	APP._ceci_est_un_nombre = 12
	w("'_ceci_est_un_nombre'.should.be.a_number")
	'_ceci_est_un_nombre'.should.be.a_number
	w("APP._ceci_nest_pas_un_nombre = \"une chaine\"")
	APP._ceci_nest_pas_un_nombre = "une chaine"
	w("'_ceci_nest_pas_un_nombre'.should_not.be.a_number")
	'_ceci_nest_pas_un_nombre'.should_not.be.a_number
	w("APP._ceci_est_une_erreur_normale = 12")
	APP._ceci_est_une_erreur_normale = 12
	w("'_ceci_est_une_erreur_normale'.should_not.be.a_number")
	'_ceci_est_une_erreur_normale'.should_not.be.a_number
	w("APP._ceci_est_une_erreur_normale = \"une chaine\"")
	APP._ceci_est_une_erreur_normale = "une chaine"
	w("'_ceci_est_une_erreur_normale'.should.be.a_number")
	'_ceci_est_une_erreur_normale'.should.be.a_number

	// A Function
	w("\nA Function", BLUE)
	w('APP._ceci_est_une_fonction = function(){return false}')
	APP._ceci_est_une_fonction = function(){return false}
	w("'_ceci_est_une_fonction'.should.be.a_function")
	'_ceci_est_une_fonction'.should.be.a_function
	w("APP._ceci_nest_pas_une_fonction = {un:'hash'}")
	APP._ceci_nest_pas_une_fonction = {un:'hash'}
	w("'_ceci_nest_pas_une_fonction'.should_not.be.a_function")
	'_ceci_nest_pas_une_fonction'.should_not.be.a_function
	w("APP._ceci_est_une_erreur_normale = function(){return false}")
	APP._ceci_est_une_erreur_normale = function(){return false}
	w("'_ceci_est_une_erreur_normale'.should_not.be.a_function")
	'_ceci_est_une_erreur_normale'.should_not.be.a_function
	w("APP._ceci_est_une_erreur_normale = \"une chaine\"")
	APP._ceci_est_une_erreur_normale = "une chaine"
	w("'_ceci_est_une_erreur_normale'.should.be.a_function")
	'_ceci_est_une_erreur_normale'.should.be.a_function

	// An Object
	w("\nAn Object", BLUE)
	w('APP._ceci_est_un_pur_objet = {un:"objet"}')
	APP._ceci_est_un_pur_objet = {un:"objet"}
	w("'_ceci_est_un_pur_objet'.should.be.an_object")
	'_ceci_est_un_pur_objet'.should.be.an_object
	w("APP._ceci_nest_pas_un_pur_objet = [1, 2, 12]")
	APP._ceci_nest_pas_un_pur_objet = [1, 2, 12]
	w("'_ceci_nest_pas_un_pur_objet'.should_not.be.an_object")
	'_ceci_nest_pas_un_pur_objet'.should_not.be.an_object
	w("APP._ceci_est_une_erreur_normale = {un:\"objet\"}")
	APP._ceci_est_une_erreur_normale = {un:"objet"}
	w("'_ceci_est_une_erreur_normale'.should_not.be.an_object")
	'_ceci_est_une_erreur_normale'.should_not.be.an_object
	w("APP._ceci_est_une_erreur_normale = \"une chaine\"")
	APP._ceci_est_une_erreur_normale = "une chaine"
	w("'_ceci_est_une_erreur_normale'.should.be.an_object")
	'_ceci_est_une_erreur_normale'.should.be.an_object

	
	// An Array
	w("\nAn Array", BLUE)
	w('APP._ceci_est_un_pur_array = [1, 2, 4]')
	APP._ceci_est_un_pur_array = [1, 2, 4]
	w("'_ceci_est_un_pur_array'.should.be.an_array")
	'_ceci_est_un_pur_array'.should.be.an_array
	w("APP._ceci_nest_pas_un_pur_array = {un:'object'}")
	APP._ceci_nest_pas_un_pur_array = {un:'object'}
	w("'_ceci_nest_pas_un_pur_array'.should_not.be.an_array")
	'_ceci_nest_pas_un_pur_array'.should_not.be.an_array
	w("APP._ceci_est_une_erreur_normale = [1, 2, 4]")
	APP._ceci_est_une_erreur_normale = [1, 2, 4]
	w("'_ceci_est_une_erreur_normale'.should_not.be.an_array")
	'_ceci_est_une_erreur_normale'.should_not.be.an_array
	w("APP._ceci_est_une_erreur_normale = \"une chaine\"")
	APP._ceci_est_une_erreur_normale = "une chaine"
	w("'_ceci_est_une_erreur_normale'.should.be.an_array")
	'_ceci_est_une_erreur_normale'.should.be.an_array
	
	
	
	// A Boolean
	w("\nA Boolean", BLUE)
	w('APP._ceci_est_un_boolean = true')
	APP._ceci_est_un_boolean = true
	w("'_ceci_est_un_boolean'.should.be.a_boolean")
	'_ceci_est_un_boolean'.should.be.a_boolean
	w("APP._ceci_nest_pas_un_boolean = {un:'object'}")
	APP._ceci_nest_pas_un_boolean = {un:'object'}
	w("'_ceci_nest_pas_un_boolean'.should_not.be.a_boolean")
	'_ceci_nest_pas_un_boolean'.should_not.be.a_boolean
	w("APP._ceci_est_une_erreur_normale = false")
	APP._ceci_est_une_erreur_normale = false
	w("'_ceci_est_une_erreur_normale'.should_not.be.a_boolean")
	'_ceci_est_une_erreur_normale'.should_not.be.a_boolean
	w("APP._ceci_est_une_erreur_normale = \"une chaine\"")
	APP._ceci_est_une_erreur_normale = "une chaine"
	w("'_ceci_est_une_erreur_normale'.should.be.a_boolean")
	'_ceci_est_une_erreur_normale'.should.be.a_boolean

	
	if('function'==typeof poursuivre) poursuivre();
	else Test.end();
}



