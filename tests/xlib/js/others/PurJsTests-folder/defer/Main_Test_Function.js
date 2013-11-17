/*
 *  Propriétés définies (defineProperties) pour la fonction principale d'un test
 *  (propriété `fonction' — avec un "o" — du test)
 *
 *  Ces propriétés complexes, qui sont pour la plupart des pseudo-méthodes, servent :
 *    - Dans la Main Test Function pour définir les tests et les gérer
 *    - Au fonctionnement interne de la fonction, par exemple pour définir l'étape
 *      courante ou la fin de la fonction de test.
 *
 *  NOTES
 *  -----
 *  Cet Object est utilisé dans la méthode `prepare_fonction' de TScript qui permet
 *  de préparer la Main Test Function pour le test (cf. PurJsTests-folder/TScript_class.js).
 *
 */
_PropertiesMainTestFunction = {
  
  // Méthode appelée par le script pour appelée la Test Main Function
  // -------------------------------------------------------------------
  // Elle passe par trois étapes :
  //  - Définition du travail à faire
  //    Soit passer simplement à l'étape suivante, soit jouer un point d'arrêt
  //  - Appel de la fonction proprement dite
  //  - Appel de la fin de l'étape, qui, dans le processus normal,
  //    provoque un throw.
  // 
	"run":{
	  get:function(){
      
      if(this.waiting) return

      // Définition de l'étape à jouer (ou fin)
      if( false == this.define_work )
      { 
        // w("Dans MainTestFunction.run, j'appelle this.end")
        return this.end
      }
      
      // if(this.waiting) return
      
      // Si un before_each est défini, on le joue
      this.before_each

      if(this.waiting) return
      
      // On joue soit l'étape courante (si elles ont été définies), soit
      // on appelle simplement la Fonction Principale de Test.
      if(this.curstep)
      {
        this.curstep.run
      }
      else
      { 
        this.script.fonction()
      }
      if(this.waiting) return
      
      // Après avoir joué l'étape ou la fonction, on finit l'étape
      // Dans la marche courante, cela provoquera un throw qui rappellera la méthode
      // `run' du script de test.
      this.end_step()
	  }
	},
  // Méthode appelée par la méthode `run` du script TScript, juste avant d'appeler
  // la Fonction Principale de Test pour la lancer. Principalement, il se met donc
  // à l'étape suivante de la courante (si elles sont définies, sinon il ne fait
  // rien et s'en retourne).
	"define_work":{
		get:function(){
      // w('-> define_work')
			// Interruption forcée du test
			if(Test.stop){
				this.script.stop_point 	= -1
				this.curstep = null
				Test.force_stop_test()
				return false
			}

      // Si aucune étape n'est encore définie, on s'en retourne simplement,
      // la Fonction Principale de Test sera jouée, qui définira, normalement,
      // la liste des étapes du test.
      // Sauf si c'est la deuxième fois qu'on passe ici (ce qu'on sait grâce à
      // `this.script.step_list_must_have_been_defined_or_not`)
      if(undefined == this.script.number_of_steps)
      {
        return false == this.script.step_list_must_have_been_defined_or_not
      }
      
      
			if('number' == typeof this.script.arg) 
      {
        // Si un argument de type nombre a été passé, c'est un point d'arrêt.
        // On le mémorise pour qu'il soit utilisé par l'étape courante.
        // Noter que dans ce cas on ne passe pas à l'étape suivante.
				this.script.stop_point = this.script.arg
        delete this.script.arg
			}
			else
      {
        if('function' == typeof this.script.arg)
        {
          // Si un argument de type fonction a été passé, c'est la fonction pour suivre
          // le script. C'est utile lorsque l'on se trouve dans une chaine de scripts
          // qui s'appellent à la suite.
          if(this.step_list_is_not_defined)
            this.script.function_after = this.script.arg
          else
          {
            this.script.arg()
            delete this.script.arg
            // return false
          }
  			}
        if(false == this.define_current_step) return false // dernière étape
        this.init_step
      }
      return true // pour jouer effectivement l'étape (ou son stop point)
		}
	},

  // Définit ou joue le code à exécuter avant de jouer les tests du script
  "before_all":{
    set:function(fct)
    {
      if(this._before_all) return ; // rien à faire si on repasse par là
      // Sinon, on joue forcément la fonction puisque c'est l'arrivée dans le test
      this._before_all = fct
      fct()
    }
  },
  // Code à jouer en fin de ce test. Sera appelé par la méthode `end'
  "after_all":{
    set:function(fct)
    {
      if(this._after_all) return
      this._after_all = fct
    },
    get:function()
    {
      if('function' == typeof this._after_all) this._after_all()
    }
  },
  
  // Définit et exécute le code avant et après chaque étape
  "before_each":{
    get:function()
    {
      // TODO: Ici, il faut ajouter le test pour savoir si c'est un
      // stop-point qui doit être joué => pas de before each
      if(this._before_each && !this.script.stop_point) this._before_each()
    },
    // Définition du before_each
    // @note: On la joue aussi tout de suite, puisqu'on arrive dans le test
    set:function(fct)
    {
      if(this._before_each) return // pour ne pas redéfinir chaque fois
      this._before_each = fct
      fct()
    }
  },
  "after_each":{
    get:function()
    {
      if(this._after_each && !this._after_each_ok)
      {
        this._after_each()
        this._after_each_ok = true // Pour ne pas répéter (car deux appels)
          // Note:  Ces deux appels sont nécessaires pour gérer le cas des waiting.
          //        TODO: Mais je trouve tout ça lourd, c'est à repenser (en tenant
          //              bien compte du fait que la difficulté vient de la gestion
          //              des stop-points qui ne doivent pas générer de after_each)
      } 
    },
    set:function(fct)
    {
      if(this._after_each)
      {
        this._after_each_ok = false // réinitialisation chaque fois
        return // pour ne pas redéfinir chaque fois
      }
      this._after_each = fct
    }
  },
  // Écrit une marque de stop point dans le rapport
  // 
  // Cette méthode est appelée de façon automatique quand un argument (arg) nombre est
  // passé, mais peut être aussi forcé (par exemple pour le premier)
  "mark_stop_point":{
    value:function(indice_stop_point){
      if(undefined == indice_stop_point) indice_stop_point = this.script.stop_point
      w("•"+indice_stop_point, BLUE)
    }
  },
  // Définit l'étape à jouer
  // -----------------------
  "define_current_step":{
    get:function(){
      
      // Incrémentation de l'indice d'étape (0-start)
      ++ this.script.curstep_indice
      
      if(this.script.curstep_indice > 0)
      {
        // Si un after_each est défini, on le joue
        // Question: Ne devrait-on pas le mettre dans `end_step' ?
        this.after_each
      
      }
      
      if (this.script.curstep_indice >= this.script.number_of_steps)
      {
        // Si l'indice d'étape (0-start) est supérieur ou égale au nombre d'étapes,
        // C'est la fin du test de la Fonction Principale de Test courante
        // On écrit la fin de la fonction est on arrête
        if (this.script.curstep_indice == this.script.number_of_steps)
        {
  				step("FIN DU TEST `" + this.script.function_name + "`")
  			}
        return false //this.end
			}
			else
      { 
        // --- Cas normal : étape naturelle suivante ---
        // On la définit et on écrit son titre dans le rapport
        this.curstep = this.script._step_list[this.script.curstep_indice]
        this.curstep.write
			}
      return true      
    }
  },
  
  "init_step":{
    get:function(){
			delete this.script.stop_point
			delete this.script.arg
      // On initialise la variable `waiting' qui permet de ne pas "thrower" en fin
      // d'étape, achevant simplement l'étape en attendant d'être relancé par
      // un autre script ou une fonction.
      this.waiting = false
    }
  },
  
  
	// Forcer le passage à une autre étape
	// -----------------------------------
	// @param		i_or_name		
  //          Soit l'indice de l'étape à laquelle il faut passer, soit son nom.
  //          Noter que l'indice est ici 1-start, donc il faut le décrémenter
  //          pour connaitre l'indice réel. Puis, comme la méthode appelle la
  //          définition de l'étape courante qui incrémente l'indice courant, il faut
  //          encore le baisser d'1.
	// 
	"next_step":{
		value:function(i_or_name){
			
			if( 'number' == typeof i_or_name)
      {
        // Définition forcée de l'étape à jouer par son indice
				this.script.curstep_indice = i_or_name - 2 // cf. la note ci-dessus
		 	}
			else 
      {
        // Définition forcée de l'étape à jouer par son nom (`name')
        var step_indice = this.STEP_NAME_TO_INDICE[i_or_name]
        if( undefined != step_indice )
        {
          this.script.curstep_indice = step_indice - 1 // cf. note ci-dessus
          this.script.run // est-ce vraiment ce qu'il faut faire ?
        }
        else 
        {
          // Erreur fatale : pas d'étape trouvée
          force_db("### Impossible de trouver l'étape `"+i_or_name+"`… Je dois continuer normalement.", WARNING)
        }
		 	}
      // Et on throw pour forcer l'étape suivante à se jouer
      this.throw
    }
  },
	"set_step_list_to":{
		value:function(list){
      if(this.script.number_of_steps > 0) return
      this.script._step_list = []
			this.script.number_of_steps	= list.length
      this.STEP_NAME_TO_INDICE = {}
      for(var i = 0; i < this.script.number_of_steps ; ++i){
        var step = list[i]
        var data_step = {
          script    :this.script,   // Le script courant (instance TScript)
          name      :null,          // le nom de l'étape
          indice    :i,             // L'indice 0-start de l'étape
          fonction  :null,          // La fonction appelée par l'étape (if any)
          test      :null           // Le script de test joué par l'étape (if any)
        }
        switch(_exact_type_of(step)){
        case 'string':
          data_step.name = step
          break
        case 'array':
          data_step.name      = step[0]
          data_step.fonction  = step[1]
          break
        case 'object':
          data_step = $.extend(data_step, step)
          break
        default:
        force_db("L'étape " + inspect(step) + " est de type inconnu…")
        }
        this.script._step_list.push(new TStep(data_step))
        this.STEP_NAME_TO_INDICE[data_step.name] = data_step.indice
      }
			this.script.curstep_indice 		= -1
      this.script.NOMBRE_MAX_APPELS = list.length + 50 // verrou anti-boucle infinie
      this.throw // pour relancer en prenant en compte la première étape
		}
	},
  // Retourne l'indice de l'étape +step+ dans la fonction
  // @note : La même méthode existe pour le script
  "indice_of_step":{
    value:function(step){return this.STEP_NAME_TO_INDICE[step]}
  },
  // Définit ou retourne la liste des étapes (raccourci pour `set_step_list_to`)
  // S'utilise avec `<fonction>.step_list = [...]`
  "step_list":{
    set:function(liste){this.set_step_list_to(liste)},
    get:function(){return this.script._step_list}
  },
  
  // Retourne LE NOM de l'étape courante
  // Utile dans une formule en switch/case (`switch(my.step)`)
  "step":{
    get:function()
    {
      return this.curstep.name
    }
  },
  
  // Écrit le STOP POINT dans le rapport et le retourne
  // 
  // @noter que c'est cette méthode qui doit être appelée par la fonction (l'étape)
  // pour connaitre le stop point courant.
  "stop_point":{
    get:function(){
      if(!this.script.stop_point) this.script.stop_point = 1
      this.mark_stop_point(this.script.stop_point)
      return this.script.stop_point
      // --- Remettre le code ci-dessous s'il ne faut pas redéfinir le stop point ---
      // this.mark_stop_point(this.script.stop_point || 1)
      // return this.script.stop_point || 1
    }
  },
  // Return TRUE si c'est la dernière étape
  "is_last_step":{
    get:function(){return this.script.curstep_indice + 1 == this.script.number_of_steps}
  },
  
	// Retourne TRUE si l'étape courante est l'étape donnée en argument
	// @param		step		SOIT le nom de l'étape, SOIT l'indice 1-start
  // 
  // @note  Utile seulement si on utilise la formule en IF ELSE IF (déconseillée)
  //        Sinon, la formule conseillée en switch utilise simplement `step' plus haut.
	"run_step":{
		value:function( step ){
			if('number' == typeof step) return step == this.script.curstep_indice + 1;
			else 												return step == this.curstep.name;
		}
	},
	// Permet de tester si on se trouve sur le point d'arrêt à jouer
	"must_stop_at":{
		value:function( tested_point ){
      
			var is_this_point = (tested_point == this.script.stop_point)
			if( is_this_point ) db("<i>•> " + tested_point + '</i>', BLUE)
			return is_this_point
		}
	},
  // // Permet de rappeler la fonction principale de test avec un argument.
  // // @note:   Pour le moment, cet argument doit être unique
  // //           Soit un nombre     => point d'arrêt (stop_point)
  // //           Soit une méthode   => définition de la méthode pour suivre le test
  // //           Soit un string    => l'étape à prendre
  //   // @todo: DOIT DEVENIR OBSOLÈTE
  // "as_proxy":{
  //   value:function(arg){return $.proxy(this.script.fonction, this.script, arg)}
  // },
  // Return true lorsque la liste des étapes n'est pas encore défini
  // 
  // @note:   Normalement, on n'a pas besoin de ce test puisque la méthodes `set_step_list_to'
  //          et `step_list' sont suffisante pour gérer la définition sans la répéter à chaque
  //          appel de la fonction de test. Mais parfois, il peut être utile de faire un travail
  //          de préparation de la liste des étapes (par exemple lorsqu'on met toutes les méthodes
  //          à tester dans une liste et qu'on fabrique une étape pour chaque méthode.
  "step_list_is_not_defined":{
    get:function(){return undefined == this.script._step_list}
  },
  // Définit les specs et les écrit, mais seulement si la liste des étapes n'est pas encore
  // définie
  // Noter qu'elles ne s'écrivent pas si NO_TEST est à true. C'est utile pour les appels
  // de synopsis quand ils doivent rester invisibles.
  // 
  // @usage       <fonction>.specs = "Les spécificités du test"
  // 
	"specs":{
	  set:function(specs){
      if(this._specs_ok || Test.NO_TEST) return
	    window.specs(specs)
      this._specs_ok = true
	  }
	},
  // La méthode est appelée de façon automatique. On doit vérifier
  // si c'est la dernière étape ou si un processus d'attente est enclenché (par exemple avec
  // I.wait.for).
  // 
  // Les processus d'attente doivent régler la propriété `waiting` de cette fonction à true
  // 
	"end_step":{
		value:function(arg){

      // Je ne joue le AFTER_EACH (si défini) que si on ne se trouve pas dans
      // un switch de stop-point.
      // NOTE:  Mais la condition ci-dessous est assez lourde puisque l'on utilise
      //        un test sur `Wait' pour le savoir. Mais quid si un jour j'utilise 
      //        un autre objet d'attente ? Ou alors, imposer au programme d'utiliser
      //        `Wait', systématiquement, comme objet d'attente (comme je le fais pour
      //        les fichiers — Wait.until.file(path).exists)
      // NOTE:  Un deuxième appel existe (chercher `this.after_each` dans ce document),
      //        mais il est zappé par les `this.waiting`.
      if(!(Wait.options && Wait.options.next_stop_point))
      { 
        this.after_each
      }
      
      if(this.waiting) return
      
      if(undefined == this.script._step_list){
        // Si aucune étape n'a été définie, c'est un script à étape unique
        // w(LOCALES.errors['need_step_list'], WARNING)
        // return Test.end()
        return this.end
      }
      if(undefined == arg)
      { 
        // w("Dans undefined == arg")
        delete this.script.arg
      }
      else
      { 
        // w("Dans this.script.arg = arg")
        this.script.arg = arg
      }
      
      if(this.is_last_step)
      {
        // Fin du script
        this.end
      } 
			else
      { 
        // w("Ici vraiment une fin d'étape ?")
        this.throw
      }
		}
	},
  // Retourne l'argument passé
  "arg":{
    get:function(){return this.script.arg}
  },
	// La même que la précédente mais avec un argument (p.e. le stop-point)
  // @note:   Maintenant, la précédente est quand même appelée.
	"end_step_with":{
		value:function(arg){ this.end_step(arg) }
	},
	// Raccourci pour end_step_with
	"go_to_stop_point":{
		value:function(stop_point){ return this.end_step(stop_point) }
	},
	
	// Appeler la fin du test courant
	// ------------------------------
  // 
  // NOTES
  // -----
  //    * Appelle la méthode "after all" si elle est définie.
  // 
	//    *	À la fin d'un script, on remet toujours Test.NO_TEST à true. Cela oblige à dire
	// 			quels scripts on veut faire jouer sans les tester.
  // 
	// 
	"end":{
		get:function(){
      Test.NO_TEST = false
			Test.SILENCE = false
      
      // La méthode after-all si elle est définie
      this.after_all
      
			if(this.script.function_after)
      { // Une fonction pour suivre a été définie
				if('function' == typeof this.script.function_after) this.script.function_after()
				else force_db("Impossible de savoir comment prendre `"+this.script.function_after+"`… Je ne peux rien lancer.")
			}
      else if(this.script.script_after)
      { // Un script pour suivre a été défini
        this.script.script_after.fonction.waiting = false
        this.script.script_after.run
      }
			else Test.end()
		}
	},
	
	/* -------------------------------------------------------------------
   *
	 *    Méthodes pour les tests
   *
	 ------------------------------------------------------------------- */
	// Pour pouvoir utiliser `<fct>.wait` au lieu de `Wait`
	"wait":{
		get:function(){
      // Mais si Wait s'en charge aussi, il faut le faire tout de suite
      // pour interrompre la fonction
      this.waiting = true
			window.Wait.attached_script = this.script
      return window.Wait
		}
	},
  
  "suite":{
    get:function(){ this.wait.for(0) }
  },
  "suite_with":{
    value:function(arg)
    { 
      arg = [0, arg]
      this.wait.for.apply(Wait, arg) 
    }
  },
	// Pour lancer un synopsis en librairie
  // @param   synopsis          Path relatif depuis user_lib/js/synopsis (avec ou sans extension)
  // @param   own_argument      L'argument optionnel à conserver pour le retour. Par exemple
  //                            le nom d'une étape ou le numéro d'un stop point.
  // @param   script_argument   L'argument à envoyer au script. Par exemple l'étape qu'il doit
  //                            jouer.
  // @param   no_test           Si false, jouera les tests du synopsis (true par défaut)
	"run_synopsis":{
		value:function(synopsis, own_argument, script_argument, no_test){
      this.define_verbosity( no_test, true)
      this.waiting = true // pour empêcher `end_step' de fonctionner
      this.script.arg = own_argument
			UTest.Synopsis.run(synopsis, this.script, script_argument)
		}
	},
	// Pour jouer un autre test et revenir finir celui-là
  // @params  Cf. `run_synopsis'
  "run_test":{
		value:function(test, own_argument, script_argument, no_test){
      this.define_verbosity( no_test, false)
      this.waiting    = true // pour empêcher `end_step' de fonctionner
      this.script.arg = own_argument
			Test.run_a_test(test, this.script, script_argument)
		}		
	},
  // Pour lancer tous les scripts d'un dossier (a besoin d'Ajax)
  "run_folder":{
    value:function(folder, own_argument, folder_argument, no_test){
      this.define_verbosity( no_test, false)
      // this.waiting = true // pour empêcher `end_step' de fonctionner
			db("run_folder N'EST PAS ENCORE IMPLÉMENTÉ", WARNING)
    }
  },
  // Pour obtenir un fichier associé au script
  // 
  // @note: Normalement, on peut appeler directement `file(...)`. Mais si on ne se
  // trouve pas dans la fonction principale de test, il faut faire appel à cette méthode
  // pour que le fichier soit associé à cette fonction principale de test (puisque l'instanciation
  // de `file' se fait en utilisant `caller')
  "file":{
    value:function(path, argument)
    {
      var ifile = file(path, argument)
      // ifile._script = this.script
      return ifile
    }
  },
	// Pour charger un fichier et revenir dans ce test
	"load_file":{
		value:function(test, argument){
      // this.waiting = true // pour empêcher `end_step' de fonctionner
			db("load_file N'EST PAS ENCORE IMPLÉMENTÉ", WARNING)
		}
	},
	
  "define_verbosity":{
    value:function(no_test, defaut){
      if(undefined == no_test) no_test = defaut
      Test.NO_TEST = no_test
    }
  },
	"throw":{
		get:function(){
			throw {type:'regular_error'}
		}
	},
  "pause":{
    get:function()
    { 
      this.waiting = true
    }
  },
  "stop_pause":{
    get:function(){this.waiting = false}
  }

	
}