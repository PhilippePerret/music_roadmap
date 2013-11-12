/*
 *	Sous objet Test.Messages
 *	------------------------
 *	Pour le traitement des messages
 */
function tostring(exp){
  switch(exp){
    case null:      return "NULL"
		case false: 		return "FALSE"
		case true: 			return "TRUE"
    case undefined: return "UNDEFINED"
		case "DEFINED": return exp
    default:
			switch(typeof exp){
				case 'string': return '“'+exp+'”';
				default: return exp.toString();
			}
  }  
}

window.Test.Messages = {
	
	// Méthode qui permet d'écrire à l'écran les spécificités d'un test, par exemple ce qu'on
	// attend d'une méthode testée
	// @param		message		Le message à afficher
	// @param		options		Unused.
	specs:function(message, options){
		if(Test.SILENCE) return
		Test.write_in_rapport('div', message, 'specs')
	},
	
  // Écriture d'un "message bleu" dans le rapport
	blue:function(message){
	  w("\n"+message, BLUE)
	},
  
	// Construit le message de résultat du test en fonction de :
	// 		* La réussite ou l'échec
	// 		* L'ajout de données (p.e. `after_if_failure`)
	// 		* La définition de messages customisés
	build_message_test:function(ok, options){
		var mesres;
		options.test = (this.positif?'should':'should_not') + '.' + options.test
		// Existe-t-il des messages personnalisés pour la méthode de test courante ?
		if(this.table = this.get_table_customized_messages(options)){
			mesres = this.message_propre_au_test(ok, options);
			(undefined == mesres) && (mesres = this.message_defaut_of_test(ok, options));
		}
		mesres = mesres || this.get_regular_message(ok, options)
		mesres = this.correct_templates_in(mesres, options)
		
		// Retourner le message préparé
		return mesres;
	},
	
	// Méthode qui regarde si une table de messages personnalisés existe pour la
	// méthode de test courante.
	// Si oui, elle renvoie cette table, sinon elle renvoie FALSE
	get_table_customized_messages:function(options){
		try{return eval("UMessages."+options.test)}
		catch(erreur){return false}
	},
	
	// Regarde si des messages customisés propre au test précis existe et les
	// renvoie. Retourne UNDEFINED dans le cas contraire
	message_propre_au_test:function(ok, options){
		if(undefined != this.table[options.args[0]]){
			return this.table[options.args[0]][ok?'success':'failure'];
		}
	},
	
	// Regarde si des messages customisés par défaut existent pour la fonction de
	// test.
	message_defaut_of_test:function(ok, options){
		if(undefined != this.table.default) return this.table.default[ok?'success':'failure'];
	},
	
	// Nouvelle tournure avec les nouvelles propriétés
	// 
	// @note		Pour ne pas afficher la valeur 'expected', mettre `no_expected_result` à true :
	// 							no_expected_result:true
	// 
	// @note		Si `dont_inspect_expected' est true, la propriété expected_result est
	// 					inscrite telle quelle
	// 
	get_regular_message:function(ok, options){
		// Nouvelle tournure
		var ksens = options.positif ? 'positif' : 'negatif' ;
		var kresu	= ok ? 'success' : 'failure' ;
		return (options.before || "") +
						options.sujet + ' ' +
						(options._before_result ? options._before_result[ksens][kresu] : "") +
						options.result[ksens][kresu] + " " +
						this.build_texte_expected(options) +
						this.build_texte_after(ok, options);
						
	},
	// Construire ce qui doit être écrit "_after"
	build_texte_after:function(ok, options){
		var ajout_after = "" ;
		var ksens = options.positif ? 'positif' : 'negatif' ;
		(options._after_result) && (ajout_after += options._after_result);
		(!ok && options.after_if_failure && options.after_if_failure[ksens]) && (ajout_after += " ("+options.after_if_failure[ksens]+")");
		return ajout_after
	},
	
	// Construire le texte de la valeur attendue (expected)
	build_texte_expected:function(options){
		if( options.no_expected_result  	) return ""
		if( options.dont_inspect_expected ) return options.expected_result
		return inspect(options.expected_result)
	},
	
	// Correction des templates dans le messages +mes+
	// Retourne le texte apprêté
	correct_templates_in:function(mes, options){
		var iarg, reali, val_arg;
		if (mes.indexOf('#{') < 0) return mes;
		for(iarg = 0, len=options.args.length; iarg<len; ++iarg){
			reali = 1 + parseInt(iarg,10);
			if(mes.indexOf("#{"+reali+"}") < 0) continue;
			val_arg = options.args[iarg];
			if(iarg > 0) val_arg = tostring(val_arg);
			mes = mes.replace(
							new RegExp('\\#\\{'+reali+'\\}', 'g'), 
							val_arg
						);
		}
		if(mes.indexOf("#{value}") > -1 ){
			mes = mes.replace(
				new RegExp('\\#\\{value\\}', 'g'), 
				tostring(options.eval_result)
				);
		} 
		if(mes.indexOf("#{subject}") > -1){
			mes = mes.replace(
				new RegExp('\\#\\{subject\\}', 'g'), 
				options.sujet
				);
		}
		return mes;
	},
  
  correct_code_in:function(messa)
  {
    // console.log(messa.match(/\`([^\`\n]+)\`/g))
    return messa.replace(/\`([^\`\n]+)\`/g, function(tout, code, index){
      return '<code>' + code.replace(/\</g,'&lt;').replace(/\>/g, '&gt;') + '</code>'
    })
  }
	
}
window.specs      = Test.Messages.specs
window.blue       = Test.Messages.blue