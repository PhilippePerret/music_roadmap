window.LOCALES = {
	'STEP'									: " ÉTAPE ",
	'at'										: " à ",
	'or'					 					: " ou ",
	'of'										: " de ",
  'and'                   : " et ",
  'any'                   : " aucun ",
  'any_e'                 : " aucune ",
	'after'									: " après ",
	'before'								: " avant ",
  'between'               : " entre ",
	
	'has'										: " possède ",
	'has not'								: " ne possède pas ",
	'doesnt have'						: " ne possède pas ",
	'should have'						: " devrait posséder ",
	'should not have'				: " ne devrait pas posséder ", 
		
	'exists'								: " existe ",
	'not exists'						: " n'existe pas ",
	'should exist'					: " devrait exister ",
	'should not exist'			: " ne devrait pas exister",
	'in the DOM'						: " dans le DOM",
	
	'stands'								: " se trouve ",
	'doesnt stand'					: " ne se trouve pas ",
	'should stand'					: " devrait se trouver ",
	'should not stand'			: " ne devrait pas se trouver ",
	'it stands in'					: "il se trouve dans ",
	
	'is' 					 					: " est bien ",
	'is not' 					 			: " n'est pas ",
	'should be'		 					: " devrait être ",
	'should not be'					: " ne devrait pas être ",
	
	'contains'							: " contient ",
	'doesnt contains'				: " ne contient pas ",
	'it contains'						: "il contient ",
	'should contain'				: " devrait contenir ",
	'should not contain'		: " ne devrait pas contenir ",
	
	'no class for element'	: "aucune class pour cet élément",
	'its class contains'		: "sa classe contient ",
	
	'responds to'						: " répond à ",
	'not responds to'				: " ignore bien la méthode ",
	'should respond to'			: " devrait répondre à ",
	'should not respond to'	: " ne devrait pas répondre à ",
	'strictly'							: "strictement ",
	'different'							: " différent ",
	'from'									: " de ",
	'it is'									: "il vaut ",
	
  'throw'                 : " produit l'erreur ",
  'should throw'          : " devrait produire l'erreur ",
  'doesnt throw'          : " ne produit pas l'erreur ",
  'should not throw'      : " ne devrait pas produire l'erreur ",
  
	'strict visual mode'		: " (mode visuel strict — non jQuery) ",
	'jquery mode'						: " (mode jQuery)",
	
	// things
	'property'							: " une propriété ",
  'properties'            : " les propriétés ",
  'expected properties'   : " les propriétés attendues ",
	'a dimension'						: " une dimension ",
  'an instance of'        : " une instance de ",
  'second'                : " seconde",
  'error'                 : " l'erreur ",
	'an error'              : " une erreur ", 
  'any_error'             : " d'erreur ",
  'value'                 : " la valeur ",
	
	// adjectifs
  'expected'              : " attendu ",
  'good'                  : " bon ",
  'goods'                 : " bons ", // pluriel
  'good-es'               : " bonnes ", // pluriel + féminine
  'bad'                   : " mauvais ", 
  'bads'                  : " mauvais ", // pluriels
  'bad-es'                : " mauvaises ", // pluriels + féminine
	'empty'									: " vide ",
	'visible'								: " visible ",
	'checked'								: " coché ",
	'equal to'							: " égal à",
	'egal'									: " égal ",
	'greater'								: " supérieur ",
	'less'									: " inférieur ",
	'than'									: " à ",
	
  // Autres verbes
  'cant be'               : " ne peut pas être ",
  
	// types
  'undefined'             : "indéfini",
  'undefined_e'           : "indéfinie",
	'UNDEFINED'							: "UNDEFINED (indéfini)",
	'DEFINED'								: "DEFINED (défini)",
	'A STRING'							: "une chaine de caractère (String)",
	'A NUMBER'							: "un nombre (Number)",
	'A FUNCTION'						: "une fonction/méthode (Function)",
	'AN OBJECT'							: "un tableau associatif (Object)",
	'but an array'					: " (mais pas une liste Array)",
	'AN ARRAY'							: "une liste (Array)",
	'A BOOLEAN'							: "un booléen",
	
	'case'									: " cas",
	'success'								: " succès ",
	'failure'								: " échec",
	'pending'								: " test en attente",
	'pendings'							: " tests en attente",
	
	messages:{
    'run'                 : "Lancement de ",
    'running'             : "Lancement de ",
		'run test'						: "Lancement du test ",
		'wait for method'			: "Attente de la méthode ",
    'wait for'            : "Attente de ",
		'test aborted'				: "INTERRUPTION VOLONTAIRE DU TEST",
		'end already called'	: "La fin du test (Test.end()) a déjà été appelé. Retirer son appel superfétatoire.",
		'contains method cant be applied to'	: "La méthode `contains` ne peut s'appliquer à ",
		'unabled to evaluate' : "Impossible d'évaluer ",
		'for a hash'					: " pour un tableau associatif (Hash)",
    'loading sandbox'     : "Chargement de votre bac à sable…",
		'cant be stringify'		: " n'a pas pu être stringifié par JSON ",
    
    'no error thrown'     : "aucune erreur produite"
    
		
	},
	errors:{
    'must be call before'             : " doit être appelé avant ",
    'data must be provided'           : " Des données doivent être fournies ",
    'path (relative) required'        : " Un chemin d'accès (relatif) doit être fourni ",
    'script folder path required'     : " Le chemin d'accès au dossier du script est requis ",
  
    'ERROR_NEW_TSCRIPT'       : "### IMPOSSIBLE D'INSTANCIER UN NOUVEAU TSCRIPT : ",
		'errors encountered'			: "ERREURS RENCONTRÉES",
		'error during test'				: " ERREUR EN COURS DE TEST ",
    'need_step_list'          : "Vous devez définir la liste des étapes au début de la fonction de test !"+
                                "\n(`I.set_step_list_to([...])`",
		'no step supplied'				: "Aucune étape fournie",
		'function unfound'				: "est introuvable. C'est elle que je dois pourtant appeler pour lancer le test…",
    'waiting too long on'     : "Attente trop longue dans Wait avec ",
    'need_sandbox_ready_code' : "Il faut remettre le code `Test.SANDBOX_READY = true` tout en bas de votre fichier `_sandbox_.js`.",
    jq:{
      'jq_unfound_element'    : "Élément introuvable dans le DOM",
      'at_pos_but_unfound'    : " à la position donnée, mais il est introuvable",
      'create_need_data'      : "Il faut fournir des données, pour créer un élément jQ",
      'id_required_to_create' : "Un ID est requis, pour créer un élément jQ",
      'id_or_class_required_to_create': "Un ID ou une CLASS sont requis, pour créer un élément jQ",
      'id_must_be_unique'     : "L'ID pour créer un élément jQ doit être unique (il existe dans le document)"
    },
    // Erreur avec File
    file:{

    }
    
	},
	
	ui:{
		'test file'						: "Fichier test",
		'run test'						: "LANCER LE TEST",
		'stop test'						: "STOPPER LE TEST",
		'verbose'							: "Affichage complet",
		'run'									: "Joue",
		'keep in report'			: "Garder les messages du rapport",
		'back to top'					: "Remonter",
		'sandbox'             : "Bac à sable",
		'title_sandbox'       : "Si cette case est cochée, le code de votre fichier _sandbox_.js sera joué.",
    'help'                : "Aide"
	},
	
	if_fr:{
		'la'									: " la "
	},
	if_en:{
	}
	
}
