
## Rédiger un test complexe

La complexité d'un test se présente lorsqu'on doit attendre sur des actions asynchrones, comme la fin d'une requête ajax.

Dans ce cas, il y a deux principes :

* Utiliser les méthodes `Wait.until` ou `Wait.while`
* Découpe le script en étapes pour tenir compte des attentes.

Voilà la forme générale d'un script (qui appelé avec une méthode pour suivre, c'est-à-dire un script qui s'inscrit dans une chaine de scripts).

    // Noter que le function doit être exactement le nom du fichier dans lequel
    // elle est définie, sans ".js". Ici, cette fonction de test est donc définie
    // dans le fichier `mon_script_test.js`
    // Dans le cas constraire, rien ne se passerait.
    
    function mon_script_test(etape)
    
			// Pour tout interrompre en cas de stop forcé.
			if(Test.stop)return;
    
			// Raccourci à cette fonction
			var my = this.mon_script_test
			
      // Si `etape` est de type function, c'est la fonction pour suivre, c'est
      // donc le démarrage du test `mon_script_test`
      // On mémorise la méthode pour suivre et on définit le nom de la première
      // étape.
      // Noter que si c'est le tout premier appel de la fonction par Test, 
      // cet argument n'est pas défini. Mais il peut l'être si on utilise une
      // autre fonction d'appel (cf. "Autre fonction d'appel" ci-dessous)
      
      if(undefined == etape || 'function' == typeof etape){
        my.poursuivre = etape;
        etape = "Ma première étape";
				// @note: Ne pas définir `etape` si on utilise la liste des étapes comme
				// 				ci-dessous.
				
				// [Optionnel]
				// LISTE DES ÉTAPES
				// ----------------
				// Définir la liste des étapes de telle sorte que :
				//	1. 	On puisse n'en faire jouer que quelques unes au cours des tests
				//  2. 	Qu'il suffise de rappeler la fonction courante (ici `mon_script_test`)
				//			pour que l'étape suivante soit automatiquement choisie.
				my.etape_list = [
					"Ma première étape",
					// "La deuxième étape", // <- une étape passée
					"La troisième étape",
					"La quatrième étape"
				];
				
				// [Optionnel]
				// Dans le cas où la liste des étapes est définie ci-dessus, on doit indiquer
				// l'indice de l'étape courante.
				my.current_etape = -1; // pour commencer à 0
      }
			
			// [Optionnel]
			// Si la liste des étapes est utilisée, on peut choisir l'étape courante
			// avec :
			if(null == etape){
				++ this.mon_script_test.current_etape;
				etape = this.mon_script_test.etape_list[this.mon_script_test.current_etape];
			}
			
			// [Optionnel]
			// Pour pouvoir interrompre le test en cliquant sur le bouton "STOPPER"
	    if(Test.stop) return false;
     
		  // On peut ajouter la ligne suivante pour écrire automatiquement les
      // étapes parcourues
      if('string'==typeof etape) step(etape);
        
      // On commence avec la première étape qui doit OBLIGATOIREMENT être
      // égale à l'étape ci-dessus
      if(etape == "Ma première étape"){
        //... Tests à entreprendre
        //... Ici une requête Ajax, puis :
        return Wait.while(
          function(){ return <code à évaluer> },
          $.proxy(mon_script_test, window, "La deuxième étape")
																						// Argument inutile si la liste des étapes
																						// a été définie.
          );
        // Noter ci-dessus le `return` (`return Wait.while`). Il faut absolument s'en
        // retourner, ou définir toutes les étapes dans des `else if`
        // Noter également le second argument de la méthode `Wait.while` qui doit préciser
        // la méthode à exécuter en fin d'attente. Ici, on rappelera ce script, mais avec
        // l'étape "La deuxième étape"
      }
      
      // Quand on revient dans `mon_script_test`, `etape` vaut "La deuxième étape"
      if(etape == "La deuxième étape"){
        // ... code test
        // Puis on définit une nouvelle étape juste pour l'écriture
        // Noter que cela ne redéfinit en rien la valeur de la variable `etape`.
        step("D'autres tests à faire.");
        // ... autres tests
        // ... ici encore une attente
        return Wait.until(
          function(){ return <code à évaluer/quand true => fin de wait> },
          $.proxy(mon_script_test, window, "La troisième étape")
          );
      }
      
      // Une troisième étape
      if(etape == "La troisième étape"){
        //... tests de la troisième étape
        // Ici, on fait appel à un synopsis chargé (cf. les synopsis dans le
        // manuel)
        // Noter qu'on lui donner la méthode pour suivre (le synopsis doit la
        // gérer).
        return load_app(
          $.proxy(mon_script_test, window, "Et on va finir par ces tests")
          )
      }
      
      // Noter que celle-ci n'a pas de Wait, elle se poursuit normalement
      // après la fin du if{…}
      if(etape == "Et on va finir par ces tests"){
        // ... Les derniers tests
      }
      
      // Pour appeler la méthode pour suivre
      // Noter que si `poursuivre` a été définie à l'aide d'un $.proxy, elle
      // peut très bien elle aussi contenir une méthode pour suivre.
      // Par exemple :
      //    mon_script_test($.proxy(Ob.methode, Ob, autre_methode_pour_suivre));
      // Dans ce cas, à la fin de `mon_script_test` (ici), on va appeler la
      // méthode `methode` de l'objet `Ob` en lui envoyant en premier argument
      // la méthode pour suivre `autre_methode_pour_suivre`.
      if('function'==typeof this.poursuivre) this.poursuivre();
      // Si c'est vraiment la fin du test (pas de méthode pour suivre) il faut
      // penser à demander la fin du test.
      else Test.end();
    
    } // fin du script

## Autre fonction d'appel

On peut utiliser une fonction principale autre que la fonction qui porte le nom tiré du nom du fichier. Dans ce cas, il suffit de faire :

Note : c'est le fichier script 'essais_divers/appel.js' qui a été demandé

    // La méthode qui sera appelé par Test.run est obligatoire dans le fichier
    function essais_divers_appel(){
      // Elle appelle la méthode principale avec une méthode pour suivre
			Test.load_and_run('<path/test/a/jouer/sans/js>', this.essais_divers_appel)
    }
    