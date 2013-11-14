window.LOCALES = {
	'STEP'									: " STEP",
	'at'										: " at ",
	'or'					 					: " or ",
	'of'										: " of ",
  'and'                   : " and ",
  'any'                   : " any ",
  'any_e'                 : " any ",
	'after'									: " after ",
	'before'								: " before ",
  'between'               : " between ",
	
	'has'										: " has ",
	'has not'								: " hasn't ",
	'doesnt have'						: " hasn't ",
	'should have'						: " should have ",
	'should not have'				: " should not have ", 
	
	'exists'								: " exists ",
	'not exists'						: " doesn't exist ",
	'should exist'					: " should exist ",
	'should not exist'			: " should not exist",
	'in the DOM'						: " in DOM",
	
	'stands'								: " stands ",
	'doesnt stand'					: " doesn't stand ",
	'should stand'					: " should stand ",
	'should not stand'			: " should not stand ",
	'it stands in'					: "it stands in ",

	'is' 					 					: " is ",
	'is not' 					 			: " is not ",
	'should be'		 					: " should be ",
	'should not be'					: " should not be ",
	'contains'							: " contains ",
	'doesnt contains'				: " doesn't contain ",
	'it contains'						: "it contains ",
	'should contain'				: " should contain ",
	'should not contain'		: " should not contain ",
	
	'no class for element'	: " no class for this element ",
	'its class contains'		: "its class contains ",
	
	'responds to'						: " responds to ",
	'not responds to'				: " ignore ",
	'should respond to'			: " should respond to ",
	'should not respond to'	: " should not respond to ",
	'strictly'							: " strictly ",
	'different'							: " different ",
	'from'									: " from ",
	'it is'									: "it is ",

  'throw'                 : " throw ",
  'should throw'          : " should throw ",
  'doesnt throw'          : " does'nt throw ",
  'should not throw'      : " should'nt throw ",

	'strict visual mode'		: " (strict visual mode — unlike jQuery) ",
	'jquery mode'						: " (jQuery-like mode)",

	// things
	'property'							: " a property ",
  'properties'            : " properties ",
  'expected properties'   : " expected properties ",
	'a dimension'						: " a dimension ",
  'an instance of'        : " an instance of ",
  'second'                : " second",
  'error'                 : " error ",
	'an error'              : " an error ", 
  'any_error'             : " any errors ",
  'value'                 : " value ",
  
  // Autres verbes
  'cant be'               : " can't be ",
  
	// Adjectifs
  'expected'              : " expected ",
  'good'                  : " good ",
  'goods'                 : " good ", // pluriel
  'good-es'               : " good ", // pluriel + féminine
  'bad'                   : " bad ", 
  'bads'                  : " bad ", // pluriels
  'bad-es'                : " bad ", // pluriels + féminine
	'empty'									: " empty ",
	'visible'								: " visible ",
	'checked'								: " checked ",
	'equal to'							: " equal to",
	'egal'									: " equal ", 
	'greater'								: " greater ",
	'less'									: " less ",
	'than'									: " than ",

	// Types
  'undefined'             : "undefined",
  'undefined_e'           : "undefined",
	'UNDEFINED'							: "UNDEFINED",
	'DEFINED'								: "DEFINED",
	'A STRING'							: "a String",
	'A NUMBER'							: "a Number",
	'A FUNCTION'						: "a Function",
	'AN OBJECT'							: "an Object",
	'but an array'					: " (but an Array)",
	'AN ARRAY'							: "an Array",
	'A BOOLEAN'							: "a boolean",
	
	'case'									: " example",
	'success'								: " success ",
	'failure'								: " failure",
	'pending'								: " pending",
	'pendings'							: " pendings",

	messages:{
    'run'                 : "Run ",
    'running'             : "Running ",
		'run test'						: "Run test ",
		'wait for method'			: "Waiting for method ",
    'wait for'            : "Waiting for ",
		'test aborted'				: "TEST ABORTED",
		'end already called'	: "End test already called (Test.end()). Please remove the unnecessary call.",
		'contains method cant be applied to'	: "`contains` method can't be applied to ",
		'unabled to evaluate' : "Unable to evaluate ",
		'for a hash'					: " with an Object",
    'loading sandbox'     : "Loading your sandbox…",
		'cant be stringify'		: " can't be stringified with JSON ",
    
    'no error thrown'     : "no error thrown",
		
	},
  wait:{
    'wait for file existence':"Waiting for file to exist ",
    'wait for file inexistence':"Waiting for file not to exist "
  },
	errors:{
    'must be call before'             :" must be called before ",
    'data must be provided'           : " Some data must be provided ",
    'path (relative) required'        : " A path (relative) is required ",
    'script folder path required'     : " Folder path of the script is required ",

    'ERROR_NEW_TSCRIPT'       : "### CAN'T INSTANTIATE NEW TSCRIPT : ",
		'errors encountered'			: "ERRORS ENCOUNTERED",
		'error during test'				: " ERROR UNDER TEST ",
    'need_step_list'          : "You must define step list at the top of the main test function!"+
                                "\n(`I.set_step_list_to([...])`",
		'no step supplied'				: "no step supplied",
		'function unfound'				: " is unfound. Unable to run test…",
    'waiting too long on'     : "I wait for too long with ",
    'need_sandbox_ready_code' : "Maybe you loose the `Test.SANDBOX_READY = true` code at the bottom of your `_sandbox_.js` file",
    jq:{
      'jq_unfound_element'    : "Element is unfound",
      'at_pos_but_unfound'    : " at position, but it is unfound",
      'create_need_data'      : "To create de jQ element, data are provided",
      'id_required_to_create' : "A ID is required to create a jQ element",
      'id_or_class_required_to_create': "A ID or a CLASS is required to create a jQ element",
      'id_must_be_unique'     : "ID must be unique, to create a jQ element (it exists in DOM)"
      
    },
    file:{
      'need call load before content':"`<file>.load` must be called before `<file>.content` (in a previous step)",
      'need call load before loaded':"`<file>.load` must be called before `<file>.loaded` (in a previous step)",
      'need call seek before exists' :"`<file>.seek` must be called before `<file>.exists` (in a previous step)",
      'need call delete before deleted':"`<file>.delete` must be called before `<file>.deleted` (in a previous step)",
      'need call write before written':"`<file>.write` must be called before `<file>.written` (in a previous step)",
    }
    
	},                                                  	
	                                                    	
	ui:{                                                	
		'test file'						: "Test File",
		'run test'						: "RUN TEST",
		'stop test'						: "ABORT TEST",
		'verbose'							: "Verbose",
		'run'									: "Run",
		'keep in report'			: "Keep messages in report",
		'back to top'					: "Back to top",
		'sandbox'             : "Sandbox",
		'title_sandbox'       : "If this checkbox is checked, I run your _sandbox_.js file each time.",
    'help'                : "Help"
	},
	
	if_fr:{
		'la'									: ""
	},
	if_en:{
	}
	
}
