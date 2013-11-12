const NOTICE  = 'NOTICE';
const WARNING = 'WARNING';
const SYSTEM  = 'SYSTEM';
const GREEN   = 'GREEN';
const BLUE    = 'BLUE';
const RED     = 'RED';
const ORANGE  = 'ORANGE';

window.Test = {
  failure_list  :null,        // Liste des échecs
  verbose         :false,     // Si FALSE, des astéristiques, sinon le
                              // message complet
  running         :false,
  stop            :false,     // Cf. manual (interruption tests)
  test_filename   :null,
  test_fctname    :null,      // Le nom de la fonction (d'après le path du fichier)
  nb_success      :null,
  nb_failures     :null,
  nb_pendings     :null,
  nb_exemples     :null,
  
  rapport_fin_ok     :false,     // Mis à true quand le rapport de fin est écrit.
  
	SILENCE							:false,			// Si mis à true, les éléments textuels du script (specs, step, 
																	// etc.) ne seront pas affichés. Utilisé souvent lors d'appel de
																	// synopsis ou d'autres tests.
  NO_TEST             :false,     // Si mis à True, les tests ne sont plus pris
                                  // en compte. Cela permet de les passer lorsque
                                  // l'on fait appel à un synopsis, etc.
  VERBOSE_ONLY_IF_FAILED  :false, // Si true, et que le mode est silencieux, n'affichera les 
                                  // messages qu'en cas d'échec. Utile pour les scripts de routine
                                  // sous les tests (p.e. les initialisations) qui doivent exécuter
                                  // certaines opérations invisibles, mais signaler une erreur
                                  // lorsqu'un problème survient.
            // Pour la verbosité, cf. les méthodes `set_silence' et `reset_verbose' qui 
            // peuvent être utilisées pour mettre provisoirement le test dans un autre mode.
  
  // Pour passer provisoirement en mode silencieux
  // Si +sauf_si_failure+ est true (false par défaut), le programme affichera quand même
  // l'échec en cas de failure
  // @note    Appeler la méthode Test.reset_verbose pour repasser en mode défini préalablement
  set_silence:function(sauf_si_failure){
    if(undefined == sauf_si_failure) sauf_si_failure = false
    this.old_no_test = true && this.NO_TEST
    this.old_silence = true && this.SILENCE
    this.NO_TEST = true
    this.SILENCE = true
    if(sauf_si_failure)
    {
      this.old_only_if_failed = true && this.VERBOSE_ONLY_IF_FAILED
      this.VERBOSE_ONLY_IF_FAILED = true
    }
  },
  // Pour repasser dans le mode de verbosité précédent lorsque `set_silence' 
  // a été utilisé (cf.ci-dessus).
  reset_verbose:function() {
    this.NO_TEST = this.old_no_test
    delete this.old_no_test
    Test.SILENCE = this.old_silence
    delete this.old_silence
    if(undefined != this.old_only_if_failed)
    {
      Test.VERBOSE_ONLY_IF_FAILED = this.old_only_if_failed
      delete this.old_only_if_failed
    }
  },
	// Reset avant de lancer un test
	reset:function(){
    // Pour empêcher certaines boites de dialogue au cours des tests
    APP.NO_MESSAGES_DURING_TESTS = true;
    Dom.clean_rapport();
		this.set_visu_btn_to_top('hidden');
    this.verbose 		 		= document.getElementById('cb_verbose').checked;
    this.running 		 		= true;
    this.stop 					= false;
    this.current_step 	= null;
		this.reset_values();
	},
  
	reset_values:function(){
    this.failure_list  	= [];
    this.nb_success  		= 0;
    this.nb_failures 		= 0;
    this.nb_pendings 		= 0;
    this.nb_exemples 		= 0;
    this.rapport_fin_ok = false;
		this.indice_current_success	= 0;
		this.indice_current_failure = 0;
		this.indice_current_pending = 0;
	},
	
  // Lance la Fonction Principale de Test courant
  // --------------------------------------------
  // 
  // @note  Si la sandbox doit être chargée, on attend la fin de son chargement
  //        pour lancer le script.
  run:function(){
    if(this.running) return this.force_stop_test()
		this.reset()
		this.new_instance_of_tscript()
		this.init_tests()
    if(this.sandbox_on){ 
      force_db(LOCALES.messages['loading sandbox'], SYSTEM)
      Wait.until(
        function(){ return Test.SANDBOX_READY }, 
        {
          success:$.proxy(this.run_right_now,this),
          failure:$.proxy(this.unable_to_load_sandbox, this)
        }
      )}
    else this.run_right_now()
  },
  run_right_now:function(){
		this.current_script.first_run
  },
  
  // Lance un test depuis un test
  // ----------------------------
  // 
  // @param test      Le path relatif du test à jouer
  // @param script    Le script qui demande le jeu de ce test (instance TScript)
  // @param arg       L'argument (unique) éventuel (rare)
  run_a_test:function(test, script, arg){
    var tscript = this.new_tscript({
      relative_path : test,
      folders       : 'user_tests',
      script_after  : script,
      arg           : arg
    })
    tscript.first_run
  },
  
  unable_to_load_sandbox:function(){
    force_db(LOCALES.errors['need_sandbox_ready_code'], WARNING)
    this.end()
  },
	
	// Joue le test tapé en console
	run_console:function(){
		var keep_rapport = $('input#console_cb_keep')[0].checked
		if(false == keep_rapport) Dom.clean_rapport()
		var code = $('textarea#console').val()
		this.reset_values();
		this.verbose = true
		this.db("db('"+code.replace(/'/g, '\'')+"')")
		eval(code)
	},
	
	
	// Instancie un nouveau TScript pour le test
  new_instance_of_tscript:function(){
		this.new_script_courant(document.getElementById('test_filename').value, undefined, undefined)
	},
	
	new_script_courant:function(path, poursuivre, argument){
    this.current_script = this.new_tscript({
			relative_path	: path,
			folders				: 'user_tests',
			poursuivre		: poursuivre,
			argument			: argument
		})
	},
  
  // Retourne une instance de TScript avec les informations fournies
  new_tscript:function(data){
    try{
      if(undefined == data)               throw LOCALES.errors['data must be provided']
      if(undefined == data.relative_path) throw LOCALES.errors['path (relative) required']
      if(undefined == data.folders)       throw LOCALES.errors['script folder path required']
    }catch(err){ 
      force_db(LOCALES.errors['ERROR_NEW_TSCRIPT'])
      return null }
    return new TScript(data)
  },
	
	// Initialisation au départ des tests
	init_tests:function(){
    $('input#btn_run_stop').val(LOCALES.ui['stop test'])
    if('undefined'!=typeof UTest && 'function'==typeof UTest.initialize) UTest.initialize()
		if('function'==typeof UTest.before_test) UTest.before_test()
    // Faut-il jouer le code du bac à sable ?
    if(this.sandbox_on = document.getElementById('cb_sandbox').checked) this.load_sandbox()
  },
  
  LOADED_SCRIPTS:{},
  script_loaded:function(script_id){
    this.LOADED_SCRIPTS[script_id] = true
  },
  load_script:function(path, script_id){
    if(this.LOADED_SCRIPTS[path]) delete this.LOADED_SCRIPTS[path]
    $('head script#'+script_id).remove()
    var sc = document.createElement('script')
    sc.setAttribute('type','text/javascript')
    sc.setAttribute('id', script_id)
    sc.setAttribute('src', path)
    document.getElementsByTagName('head')[0].appendChild(sc);
    if (sc.addEventListener)
        sc.addEventListener('load', $.proxy(this.script_loaded, this, script_id), false);
  },

  // Chargement du bac à sable (à chaque lancement des tests)
  load_sandbox:function(){
    Test.SANDBOX_READY = false
    this.load_script('./tests/user_tests/_sandbox_.js', 'script_sandbox')
  },

  force_stop_test:function(){
		this.force_db("<br /><br />"+LOCALES.messages['test aborted'], WARNING);
    this.stop = true;
    this.end();
  },
  
	// Erreur fatale survenu dans un script. On bloque tout
	fatal_error:function(erreur){
		w("### "+LOCALES.errors['error during test']+" : "+ erreur, WARNING);
		return Test.end // réf. à la fonction, car le retour évalue
	},

  // === Fin complet des tests ===
  end:function(){
    if(this.rapport_fin_ok){
      return w(LOCALES.messages['end already called'])
    }
		if('function'==typeof UTest.after_test) UTest.after_test()
    APP.NO_MESSAGES_DURING_TESTS = false;
    this.rapport_fin_ok = true;
    this.running        = false;
    this.verbose        = true;
		var s_cases 		  = (this.UI.LANG == "en") ? (this.nb_exemples > 1 ? 's' : '') : ""
		var s_failures 	  = this.nb_failures > 1 ? 's' : ''
		var kpending 		  = 'pending'+(this.nb_pendings > 1 ? 's' : '')
    var color_result  = this.nb_failures > 0 ? RED : GREEN
    this.write(
        '<br />'+
        this.nb_exemples 	+ LOCALES['case']+s_cases+" - "+
        this.nb_success 	+ LOCALES['success']+" - "+
        this.nb_failures 	+ LOCALES['failure']+s_failures+" - ", 
        color_result)
    this.write(
        this.nb_pendings 	+ LOCALES[kpending],
        this.nb_pendings > 0 ? ORANGE : color_result
    )
    
    // On affiche les messages d'échec
    if(this.nb_failures){
      this.write_ln("\n\n"+LOCALES.errors['errors encountered'], RED);
      this.display_detailled_errors();
    }
    this.write_ln('<br /><br /><br />');
    this.scroll_to_bottom();
    // On remet le nom du bouton run
    $('input#btn_run_stop').val(LOCALES.ui['run test']);
		// On rend visible le bouton pour remonter
		this.set_visu_btn_to_top('visible');
  },
  
	set_visu_btn_to_top:function(visible){
		$('body input#btn_go_to_top').css('visibility', visible);
	},
	
  display_detailled_errors:function(){
    for(var i in this.failure_list){
      var step_failures = this.failure_list[i];
			var istep = parseInt(i,10)+1;
      if(step_failures.errors.length > 0){
        this.write_ln(step_failures.titre, RED);
        this.write_ln(step_failures.errors.join('<br>'), RED);
      }
    }
    this.scroll_to_bottom();
  },
  
  // Définit l'étape courante et l'affiche
  // --------------------------------------
  // Permet de savoir aussi où se passent les erreurs.
  // Dès qu'une étape est définie, elle génère un nouveau Hash dans 
  // this.failure_list dans lequel seront mis les erreurs.
  // 
  // @note  On peut utiliser le raccourci step(…) dans toutes les
  //        méthodes.
  current_step:null,
  step:function(mess){
		if(mess == null){
			mess = "&gt;"+LOCALES.errors['no step supplied']+"&lt;"
		} else {
	    mess = "<br />=== " + mess + " ===";
	    if(this.verbose && !this.SILENCE) w(mess, NOTICE);
		}
    this.failure_list.push({titre:mess, errors:[]});
    this.current_step = this.failure_list[this.failure_list.length-1];
  },
  
  
  // -------------------------------------------------------------------
  //  Méthodes succès, échec et pending
  // -------------------------------------------------------------------
	indice_current_success:null,
  success:function(mess){
    if(this.NO_TEST || this.SILENCE) return;
		++ this.indice_current_success;
		// var mess = this.indice_current_success+') '+mess;
    if(this.verbose) this.write_ln(mess, GREEN+" SFP");
    else this.write("*", GREEN);
    ++this.nb_success;
    ++this.nb_exemples;
  },
	indice_current_failure:null,
  failure:function(mess){
    if((this.NO_TEST || this.SILENCE) && !this.VERBOSE_ONLY_IF_FAILED ) return;
		++ this.indice_current_failure;
		var mess = this.indice_current_failure+') '+mess;
    if(this.verbose || this.VERBOSE_ONLY_IF_FAILED) this.write_ln(mess, RED+" SFP");
    else this.write("*", RED);
    if(this.current_step == null) this.step(null);
    this.current_step.errors.push(mess);
    ++this.nb_failures;
    ++this.nb_exemples;
  },
	indice_current_pending:null,
  pending:function(mess){
    if(this.NO_TEST || this.SILENCE) return;
		++ this.indice_current_pending;
		var mess = this.indice_current_pending+') '+mess;
    if(this.verbose) this.write_ln(mess, ORANGE+" SFP");
    else this.write("*", ORANGE);
    ++this.nb_pendings;
    ++this.nb_exemples;
  },
  
  // Écriture d'un message système à l'écran
  //  @param  forcer    Si true, le message s'affiche même en mode non verbeux
  //                    On peut utiliser aussi la méthode `force_db'
  db:function(mess,type,forcer){
    this.write_in_rapport('div', mess, type, forcer || false);
  },
  force_db:function(mess,type){
    this.write_in_rapport('div', mess, type, forcer=true);
  },
  
	// Méthode qui dans tous les cas reçoit le message à écrire et l'écrit
	// 
	// @note	Les retours-chariot dans +mess+ seront remplacés par des <br>
  // @note  Les textes entre `...` seront considérés comme des codes
  write_in_rapport:function(bal,mess,type,force){
    if(false == this.verbose && force != true){
      if(type != WARNING && mess != "*") return;
    }
		if(bal == 'div' && 'string'==typeof mess)
    {
			mess = mess.replace(/\n/g,'<br />').replace(/\t/g,'&nbsp;&nbsp;&nbsp;');
      mess = this.Messages.correct_code_in(mess)
    }
    if(undefined == type || type== null) type = SYSTEM;
    $('div#rapport').append('<'+bal+' class="'+type+'">'+mess+'</'+bal+'>');
    // On se place toujours en bas de fenêtre
    this.scroll_to_bottom();
    
  },
  
  // Pour aller en bas de la fenêtre : noter qu'on attend toujours
  // une seconde avant de le faire vraiment
  scroll_to_bottom:function(){
    if(this.timer_scroll_bottom){
      // window.scrollTo(0, window.innerHeight + 100);
      window.scrollTo(0,10000000000);
      clearTimeout(this.timer_scroll_bottom);
      delete this.timer_scroll_bottom;
    }else{
      this.timer_scroll_bottom = setTimeout("Test.scroll_to_bottom()",1000); 
    }
    
  },
  
  // Écrit un message dans le rapport
  // @param   mess    Le message
  // @param   type    Le type du message : NOTICE, WARNING, SYSTEM
  write_ln:function(mess, type){this.write_in_rapport('div', mess, type)},
  write:function(mess, type){this.write_in_rapport('span',mess,type)},
	
	/* Chargement et lancement d'un test ne se trouvant pas dans les synopsis.
	 *
	 * Principe		Le principe est le même que pour tout script.
	 *
	 *	REQUIS		Tous les tests appelés de cette façon doivent gérer l'envoi d'un premier
	 *						argument qui soit la méthode pour suivre.
	 *
	 *	@param		path_test			Le path du fichier, à partir de `./tests/user_tests/`
	 *													Avec ou sans ".js"
	 *	@param		poursuivre		La méthode pour suivre ou l'instance TScript du script à poursuivre
	 *	@param		argument			Argument optionnel à envoyer à la méthode.
	 *
	 *	@note			Depuis une fonction de test, on appelle cette méthode avec <fonction>.run_test(...)
	 *						QUESTION : quel est l'avantage de passer par là, hormis le fait de mettre le script
	 *						en script courant, ce qui peut poser des problèmes.
	 */
	load_and_run:function(path_test, poursuivre, argument){
		this.new_script_courant(path_test, poursuivre, argument)
		this.current_script.first_run
	}
}
/*
 *  Méthode à appeler pour donner le résultat d'un test et l'écrire ou
 *  le mémoriser.
 *  Elle gère tous les cas.
 *
 *  @param  ok        (Bool) La condition déjà évaluée.
 *  @param  messages  (Array) [<message positif>, <message négatif>]
 *                    Noter que si +inverse+ est true, le message positif deviendra
 *                    le message d'erreur et le message négatif le message ok.
 *                    Donc ne pas utiliser de formules telles que "devrait contenir...",
 *                    mais un simple "contient". Il sera mis en rouge pour marquer que
 *                    c'est une erreur.
 *  @param  options   (Hash)
 *										test			(STRING) Le test opéré (p.e. "should.return"). Cette valeur
 *															permettra de voir s'il y a des messages personnalisés.
 *										arg			Les arg envoyés à la méthode de test (sauf <options> qui
 * 															sont ajoutées ici même)	
 *                    inverse   Si TRUE, on inverse la valeur de OK.
 *                    before    Le texte à ajouter avant les messages positifs/négatifs
 *                    after     Le texte à ajouter après les messages pos/nég
 *                    after_if_failure    
 *                        Le texte à ajouter en cas d'erreur. Il doit aussi contenir
 *                        [<positif>, <inverse>]
 *										+ Toutes les options envoyées à la méthode de test.
 *  @return   La valeur de OK (sans inversion booléenne)
 */
window._estime = function(ok, options){
  ok = ( ok == options.positif );
	var message_resultat = Test.Messages.build_message_test(ok, options);
	if(ok) 	success(message_resultat);
	else 		failure(message_resultat);
  return ok;
}
// Raccourcis pour Test.
// Cf. aussi les méthodes à la fin de Test.Messages dans './tests/xlib/js/others/PurJsTests/'
window.w          = $.proxy(Test.write_ln,Test);
window.r          = $.proxy(Test.write, Test);
window.db         = $.proxy(Test.db, Test);
window.force_db   = $.proxy(Test.force_db, Test);
window.success    = $.proxy(Test.success,Test);
window.failure    = $.proxy(Test.failure,Test);
window.pending    = $.proxy(Test.pending,Test);
window.step       = $.proxy(Test.step, Test);
