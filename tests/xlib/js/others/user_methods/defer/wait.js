/*
    Méthodes d'attente
    ------------------
    
    Wait.until(function(){
        // Mettre ici le code qui doit renvoyer true pour interrompre l'attente
      },
      <function pour suivre || options >
      )
    Wait.until_file_exists(path, options)
      Attend jusqu'à ce que le fichier path existe
    Wait.while_file_exists(path, options)
      Attend que le fichier +path+ n'existe plus
    Wait.while(function(){
        // Le code qui doit renvoyer false pour interrompre l'attente
      },
      <function pour suivre || options >
      )
    Wait.for(
      <nombre secondes d'attente>,
      <function pour suivre || point d'arrêt || options>
      )

		Avec :

			options		Les options éventuelles :
                arg         Les arguments à renvoyer au script d'appel (if any)
                next_stop_point   Le point d'arrêt suivant (if any)
                                  Note : la valeur peut être donnée seule si aucune autre option
								message			Le message à afficher au début de l'attente
														@note: Si <options> est un string, c'est le message seul.
                failure_message   Message de remplacement pour l'échec
                success_message   Message de remplacement pour le succès
								laps				Le laps de temps en millisecondes entre chaque test. Par défaut,
														C'est un dixième de seconde.
								max_time		Le temps maximum d'attente, en MILLISECONDES. Cette valeur
														surclassera la valeur MAX_WAITING_TIME par défaut.
								failure			Une méthode à appeler en cas d'échec, c'est-à-dire quand le
														temps maximal est atteint.
														DOIT recevoir en premier argument le résultat de l'opération, ici
														FALSE (utile si failure et success sont les mêmes méthodes)
								success			Une méthode à appeler en cas de réussite.
														DOIT recevoir en 1er argument le résultat, ici TRUE (même remarques
														que pour `failure`).
                suivre      La méthode pour suivre (si +failure+ et +success+ ne sont pas définis)

		@note : On peut obtenir le résultat (true ou false) par +Wait.resultat+. Si la boucle d'attente
						s'est bien déroulée, Wait.resultat est à TRUE, sinon à FALSE

*/


window.Wait = {
  MAX_WAITING_TIME: 20,       // en secondes
  // MAX_WAITING_TIME: 5,     // en secondes (pour essai court)
  LAPS_INTER_TEST : 10*10,    // en millième de secondes
  test        :null,  // La fonction de test
  timer       :null,
  start_time  :null,
	
	options			:null,	// Les options éventuelles 

  reset:function(){
    this.options = {}
  },
  
	// --------------------------------------------------------
	// 	Méthodes appelables
	// 
	// 	@note		Chaque fois qu'une méthode Wait est appelée, la fonction qui l'appelle définit
	// 					`Wait.attached_script` qui est le script portant la fonction. C'est la méthode
	// 					`run' de ce script qui doit être appelée en fin de boucle.
	// 
  // @noter   Si aucune option, le message peut être mis en deuxième. Ça sera traité dans
  //          traite_options
  // 
  for:function(nombre_secondes, options, message){
    this.pause_script_if_any()
    this.reset()
    if(undefined != message) this.options = {message:message}
		this.traite_options(options);
		var s = nombre_secondes > 1 ? "s" : ""
    if(nombre_secondes > 0)
    {
      w((this.options.message || LOCALES.messages['wait for']+nombre_secondes+LOCALES['second']+s)+"…",SYSTEM);
    }
    this.timer = setTimeout("Wait.fin_ok()", nombre_secondes * 1000)
    return this.suite
  },
  until:function(fct_test, options){
    this.pause_script_if_any()
    this.run_wait(fct_test, options, 'true')
    return this.suite
  },
  while:function(fct_test, options){
    this.pause_script_if_any()
    this.run_wait(fct_test, options, 'false')
    return this.suite
  },
	// Fin des méthodes appelables
	// --------------------------------------------------------
  
  // Met la Main Test Fonction en "pause" si un script
  // est attaché à l'appel de Wait
  // @note: Cela consiste à mettre fonction.waiting à true
  //        fonction.waiting sera remis à false à la fin du 
  //        check de Wait.
  // Note:  Mais cet appel est un peu vain, puisqu'on est obligé de le régler aussi
  //        dans la fonction elle-même, sinon j'ai l'impression que ça ne va pas
  //        assez vite et que la fonction se poursuit quand même (ça doit être autre
  //        chose, mais ça reste à éclaircir)
  pause_script_if_any:function()
  {
    if(undefined == this.attached_script) return
    this.attached_script.fonction.pause
  },
  

	// Traite les options envoyées à la méthode
  // TODO: DOIT DEVENIR OBSOLÈTE AVEC LES MÉTHODES MAGIQUES
	traite_options:function(opts){
		switch(_exact_type_of(opts)){
			case 'function' :	opts = {suivre: opts}           ; break
			case 'integer'	: opts = {next_stop_point: opts}  ; break
      case 'object'   : break
      case 'string'   : opts = {message:opts}           ; break
      default: opts = {}
		}
		this.options = $.extend(this.options, opts)
	},
  run_wait:function(test,options,condition){
    this.reset()
		this.traite_options(options)
    this.test       = test;
    this.start_time = (new Date()).valueOf();
		// Le temps d'attente maximum.
		// @note	Le placer avant `calcule_stop_time` qui en a besoin !
		this.max_waiting_time	=	(this.options.max_time || this.MAX_WAITING_TIME)*1000
		this.calcul_stop_time();
    this.condition  = condition;
		this.laps				= this.options.laps || this.LAPS_INTER_TEST
    this.timer      = setTimeout("Wait.check("+this.condition+")", this.laps );
    if(undefined!=this.options.message) w(this.options.message+"…",SYSTEM);
  },
  
  // run_wait_for_file:function(path, options, condition)
  // {
  //   if(undefined == this.tested_file)
  //   {
  //     this.reset()
  //     this.traite_options(options)
  //     this.condition    = condition
  //     this.tested_file  = file(path)
  //     this.start_time   = (new Date()).valueOf()
  //     this.test = LOCALES.wait['wait for file ' + (condition?'existence':'non existence')] +"`"+ path+"`";
  //     this.calcul_stop_time()
  //     // On check le fichier
  //     this.tested_file._script = {}
  //     this.tested_file.seek_poursuivre = $.proxy(this.run_wait_for_file, this)
  //     this.tested_file.seek
  //   }
  //   else
  //   {
  //     clearTimeout(this.timer)
  //     if( this.condition == this.tested_file.exists )
  //     { 
  //       delete this.tested_file
  //       this.fin_ok()
  //     }
  //     else
  //     {
  //       if((new Date()).valueOf() >= this.stop_time )
  //       { 
  //         delete this.tested_file
  //         return this.waiting_too_long()
  //       }
  //       else this.tested_file.seek
  //     }
  //   }
  // },
	// Calcul le temps de fin en fonction des options
	calcul_stop_time:function(){
		this.stop_time = this.start_time + this.max_waiting_time;
	},
  check:function(condition){
    var retour;
    try{
      if( this.test() === condition ) 
        return this.fin_ok();
      else{
        if((new Date()).valueOf() >= this.stop_time ) return this.waiting_too_long()
        else this.poursuit_wait();
      }
    }catch(erreur){
			// if('object'==typeof erreur && erreur.type == 'regular_error')
      throw erreur
    }
  },
  waiting_too_long:function()
  {
    var mess ;
    if (undefined != this.options.failure_message) mess = this.options.failure_message
    else mess = LOCALES.errors['waiting too long on']+
                this.test.toString()+" (> "+(parseInt(this.max_waiting_time/1000,10)) +
                " secondes)"
    return this.fin_not_ok(mess, WARNING+" SFP");
  },
  poursuit_wait:function(){
    clearTimeout(this.timer);
    this.timer = setTimeout("Wait.check("+this.condition+")", this.laps);
  },
	// Fin successful. Si une méthode `options.success` est définie, on la joue avant de
	// poursuivre.
  fin_ok:function(){
    // w("-> Wait.fin_ok")
    if(false == this.suite.onresultat(true))
    {
  		if('function' == typeof this.options.success) this.options.success(true)
      else if (undefined != this.options.success_message) w(this.options.success_message, GREEN+" SFP")
  		this.stop_check( true )
    } 
    else
    {
      this.poursuit_script
    }
	},
  fin_not_ok:function(mess, type){
    if(false == this.suite.onresultat(false))
    {
  		if('function'==typeof this.options.failure){
  			this.options.failure(false);
  		} else {
  	    w(mess,type);
  		}
      this.stop_check(false);
    }
    else
    {
      this.poursuit_script
    }
  },
	// Méthode appelée en toute fin d'attente pour redonner la main au script de test
	// Ou à la méthode pour suivre lorsqu'elle doit être différente du script portant la
	// fonction appelante (this.attached_script)
  // TODO: L'utilisation des `options` ci-dessous doit devenir OBSOLÈTE avec l'utilisation
  // des fonctions magiques `_` et son alias `and`
  stop_check:function( bool_resultat ){
    clearTimeout(this.timer);
		this.resultat = bool_resultat
    this.poursuit_script
    //     if('function' == typeof this.options.suivre) this.options.suivre();
    // else{ 
    //       if('object' == typeof this.attached_script){
    //         if('undefined' != typeof this.options.next_stop_point){ 
    //           this.attached_script.arg = this.options.next_stop_point}
    //         else if('undefined' != typeof this.options.arg ) this.attached_script.arg = this.options.arg
    //         this.poursuit_script
    //       }
    // }
  }
  
}
/* 
 * Propriétés complexes pour Wait
 *
 */
Object.defineProperties(Wait, {
  // Pour poursuivre le script (après l'attente)
  "poursuit_script":{
    get:function(){
      this.script.fonction.stop_pause
			this.script.run
    }
  }
})
/*
 * Ajout des traitements pour les méthodes magiques `_` et son alias `and`
 *
 */
_SuiteTestPourMethodesWait = {
  "suite":{
    get:function()
    {
      this.define_suite_if_necessary
      return this._suite
    }
  },
  "script":{
    get:function()
    {
      return window.CURRENT_SCRIPT
      // return this.attached_script
    }
  },
  "define_suite_if_necessary":{
    get:function()
    {
      if(undefined == this._suite) this._suite = new _SuiteTest_(this)
    }
  }
}
Object.defineProperties(Wait, _SuiteTestPourMethodesWait)

/*  Méthodes permettant d'utiliser les tournures :
 *
 *    <fct>.wait.until.file(<path>).exists[.and(...)]
 *    <fct>.wait.while.file(<path>).exists[.and(...)]
 *
 */
Wait.until.file = function(path){return Wait.until_or_while_file(path, true)}
Wait.while.file = function(path, options){return Wait.until_or_while_file(path, false)}
Wait.until_or_while_file = function(path, condition)
{
  this.path = path
  var obj       = _ObjetWaitUntilFile
  obj.path      = path
  obj.condition = condition
  return obj
}
_ObjetWaitUntilFile = {}
Object.defineProperties(_ObjetWaitUntilFile,{
  // Utile à _SuiteTest_ (méthodes magiques)
  "script":{
    get:function(){return window.CURRENT_SCRIPT}
  },
  "define_suite_or_reset":{
    get:function(){
      if(undefined == this._suite)
      {
        this._script  = window.CURRENT_SCRIPT
        this._suite   = new _SuiteTest_(this)
      }
      this._suite.reset
    }
  },
  "suite":{
    get:function(){return this._suite}
  },
  // La première méthode atteinte par :
  //  <fct>.wait.until.file(...).exists
  "exists":{
    get:function()
    {
      this.define_suite_or_reset
      this.tested_file  = file(this.path)
  		this.stop_time    = (new Date()).valueOf() + 20 * 1000
      this.wait_and_seek
      return this.suite
    }
  },
  // Méthode appelée par File.seek après avoir été voir si le fichier
  // existait.
  "retour_exists":{
    value:function()
    {
      clearTimeout( this.timer )
      if( this.condition == this.tested_file.exists )
      { 
        // OK
        delete this.tested_file
        this.suite.onresultat(true)
        Wait.fin_ok()
      }
      else
      {
        if((new Date()).valueOf() >= this.stop_time )
        { 
          // Échec
          delete this.tested_file
          failure(LOCALES.wait['wait for file ' + (this.condition?'existence':'non existence')] +"`"+ this.path+"`")
          this.suite.onresultat(false)
          Wait.fin_not_ok()
        }
        else this.wait_and_seek
      }
    }
  },
  // Pour attendre un peu avant de refaire le test
  "wait_and_seek":{
    get:function()
    {
      me = this
      this.timer = setTimeout(function(){
        me.tested_file.seek_poursuivre = $.proxy(me.retour_exists, me)
        me.tested_file.seek
      }, 1000)
    }
  }
})
