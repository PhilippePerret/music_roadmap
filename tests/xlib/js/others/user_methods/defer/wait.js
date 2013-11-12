/*
    Méthodes d'attente
    ------------------
    
    Wait.until(function(){
        // Mettre ici le code qui doit renvoyer true pour interrompre l'attente
      },
      <function pour suivre || options >
      )
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
    this.reset()
    if(undefined != message) this.options = {message:message}
		this.traite_options(options);
		var s = nombre_secondes > 1 ? "s" : ""
    if(nombre_secondes > 0)
    {
      w((this.options.message || LOCALES.messages['wait for']+nombre_secondes+LOCALES['second']+s)+"…",SYSTEM);
    }
    this.timer = setTimeout("Wait.fin_ok()", nombre_secondes * 1000);
  },
  until:function(fct_test, options){
    this.run_wait(fct_test, options, 'true')
  },
  while:function(fct_test, options){
    this.run_wait(fct_test, options, 'false')
  },
	// Fin des méthodes appelables
	// --------------------------------------------------------

	// Traite les options envoyées à la méthode
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
        if((new Date()).valueOf() >= this.stop_time ) {
          var mess ;
          if (undefined != this.options.failure_message) mess = this.options.failure_message
          else mess = LOCALES['waiting too long on']+
                      this.test.toString()+" (> "+(parseInt(this.max_waiting_time/1000,10)) +
                      " secondes)"
          return this.fin_not_ok(mess, WARNING+" SFP");
        }
        else this.poursuit_wait();
      }
    }catch(erreur){
			// if('object'==typeof erreur && erreur.type == 'regular_error')
      throw erreur
    }
  },
  poursuit_wait:function(){
    clearTimeout(this.timer);
    this.timer = setTimeout("Wait.check("+this.condition+")", this.laps);
  },
	// Fin successful. Si une méthode `options.success` est définie, on la joue avant de
	// poursuivre.
  fin_ok:function(){
		if('function' == typeof this.options.success) this.options.success(true)
    else if (undefined != this.options.success_message) w(this.options.success_message, GREEN+" SFP")
		this.stop_check( true )
	},
  fin_not_ok:function(mess, type){
		if('function'==typeof this.options.failure){
			this.options.failure(false);
		} else {
	    w(mess,type);
		}
    this.stop_check(false);
  },
	// Méthode appelée en toute fin d'attente pour redonner la main au script de test
	// Ou à la méthode pour suivre lorsqu'elle doit être différente du script portant la
	// fonction appelante (this.attached_script)
  stop_check:function( bool_resultat ){
    clearTimeout(this.timer);
		this.resultat = bool_resultat
    if('function' == typeof this.options.suivre) this.options.suivre();
		else{ 
      if('object' == typeof this.attached_script){
  			if('undefined' != typeof this.options.next_stop_point){ 
          this.attached_script.arg = this.options.next_stop_point}
        else if('undefined' != typeof this.options.arg ) this.attached_script.arg = this.options.arg
  			this.attached_script.run
      }
		}
  }
  
}