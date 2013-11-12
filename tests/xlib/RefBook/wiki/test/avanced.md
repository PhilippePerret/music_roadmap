# Conception avancée d'un script

On peut utiliser les méthodes ajoutée au script test principale pour faciliter la rédaction du code.

**Note importante**

Si cette conception avancée est utilisée, il est IMPÉRATIF de faire les appels récursifs à la fonction principale avec :

		$.proxy(<fonction principale>, this);

Noter qu'un raccourci a été créé, permettant d'utiliser simplement :

		<fonction principale>.proxy

Si on utilise une suite de ELSE IF (déconseillé), les `return` sont inutiles. Ils sont obligatoires dans le cas contraire.

Exemple avec des ELSE IF :

		function montest(etape){
		
			var my = this.montest
			
			if( undefined == etape ){
				$.proxy(montest, this, "Deux")()
			}
			else if ( "Deux" == etape){
				my.proxy("Trois")
			}
			else if ( "Trois" == etape){
				my.proxy("Fin")
			}
			else {
				my.end
			}
		}


Exemple sans ELSE IF :

		function montest(etape){

			if( undefined == etape ){
				return $.proxy(montest, this, "Deux")();
			}
			
			if( "Deux" == etape ){
				return $.proxy(montest, this, "Trois")();
			}
			
			if ( "Trois" == etape ){
				return $.proxy(montest, this, "Fin")();
			}
			
			Test.end();
		}

Exemple (avec une attente de 3 secondes):

		function monscripttest(){
		
			etape = monscripttest.next_step();
			if( etape == "1"){
				Wait.for(3, $.proxy(this.monscripttest, this));
			}
			else if( etape == "2"){
				db("Tout s'est bien déroulé.")
			}
		}

## Liste des méthodes ajoutées

*Note : on appelle ces méthodes grâce à :*

		function mon_script_test(){
		
			mon_script_test.<methode>(<arg>);
			
			// Si le nom de la fonction est long (dans un dossier de dossier…), on peut
			// marquer en début de script :
			var my = this.mon_script_test;
			// puis utiliser :
			my.<methode>(<arg>);
		}

<a name="set_step_list"></a>
###`<fonction test>.set_step_list(<liste array des titres d'étapes>)`
	
Définit la liste de toutes les étapes du script-test.

Exemple :

		function mon_script_test(){
			var me = this.mon_script_test;
			
			if(null == me.step_list){
				me.set_step_list([
					"Première étape",
					"Deuxième étape",
					"Troisième étape",
					… etc.
					])
			}
		}

Noter que si la liste des étapes n'est pas définie, les méthodes suivantes pourront être utilisée mais le nom de l'étape sera simplement "<indice étape>".

<a name="next_step"></a>
###`<fonction test>.next_step()`

Permet de faire passer à l'étape suivante et retourne le nom de l'étape.

@note: 	Cette méthode ajoute une ligne de nouvelle étape dans le suivi du test, donc il est inutile d'utiliser `step(<nom de l'étape>)` dans le script-test.

Exemple :

		function mon_script(){
		
			…
			… définitions préliminaires, notamment la liste des étapes
			…
		
			var etape = mon_script.next_step();
			
		}
		
###`<fonction test>.step_is(<nom étape>)`
	
Retourne TRUE si l'étape courante est `<nom étape>`. Permet de gérer les conditions IF.
	
Exemple :

		function scripttest(){
		
			… Ici la définition des étapes (*)`
			
			// Passage à l'étape suivante dès qu'on rappelle ce script principal.
			// @note: ici, la variable `etape` n'est plus nécessaire
			scripttest.next_step();
			
			if(scripttest.step_is("Ma première étape")){
				... test à exécuter à la première étape
				
				return $.proxy(this.scripttest, this);
			}
			else if (scripttest.step_is("Ma seconde étape")){
				... Test à exécuter à la deuxième étape
				
				return $.proxy(this.scripttest, this);
			}
			else scripttest.end // fin du test (noter : pas de parenthèses)
		}

(*) cf. [Définition des étapes](#set_step_list).

<a name="curstep_name"></a>
###`<fonction test>.curstep_name` ou `<fonction test>.step`
	
Retourne le nom de l'étape courante. 

@Noter que ce n'est pas une méthode mais une propriété (par de parenthèses pour l'utiliser).

Exemple :

		function scripttest(){
		
			... définitions préalables ...
			
			db("Mon étape courante est "+ scripttest.curstep_name);
			
			if(scripttest.curstep_name == "Ma première étape"){
				db("Je joue les tests de la première étape");
			}
			else if (scripttest.step == "Ma deuxième étape"){
				db("Je joue les tests de la seconde étape");
			}
			else scripttest.end // fin du test
		}

<a name="current_indice"></a>
###`<fonction test>.current_indice` ou `<fonction test>.indice`
	
Retourne l'indice 1-start de l'étape courante.

@note: `1-start` signifie que la première étape portera l'indice `1`, la deuxième étape l'indice `2`, etc.

@note: Comme [`curstep_name` et `step`](#curstep_name), il s'agit d'une propriété, donc à appeler sans parenthèses.

Exemple :

		function mon_test(){
		
			... définitions préalables ...
			
			if(mon_test.current_indice == 1){
				db("C'est la première étape");
			}
			else if (mon_test.indice == 2){
				db("C'est la deuxième étape");
			}
			else mon_test.end // fin de ce test
		}

##Exemple de script complet

*Note : il peut être copié-collé dans un fichier de nom `essai.js` dans le dossier `./tests/user_tests/` de votre application et être lancé en indiquant «&nbsp;essai&nbsp;» comme script test dans le formulaire de Pure Javascript Tests*

		// La fonction de test principale.
		// * Si c'est elle qui est appelée par le test, l'argument `poursuivre` pourrait ne
		// servir à rien. 
		// Mais il faut toujours penser qu'un test peut s'insérer dans d'autres tests (ne serait-ce
		// que si un test rassemble tous les autres pour les jouer séquentiellement). Donc, par
		// habitude, il vaut mieux toujours mettre ce `poursuivre` et le traiter au début de la
		// fonction.
		// * Pour ce qui est de `point_arret`, il sera expliqué plus loin, à la deuxième étape.
		//
		function essai(poursuivre, point_arret){
		  var etape;
			
			// Toujours penser à mettre cette ligne pour pouvoir interrompre le test à tout moment.
			if(Test.stop)return;

			// Raccourci `me` pour faire référence à cette fonction de test
			// *  Noter qu'il n'y a pas de `var me`. Avec un `var`, la variable `me` serait 
			//		"attaché" à cette fonction courante, et il serait difficile de l'utiliser
			//		ailleurs. Un `$.proxy(me,this)`, par exemple, génèrerait une erreur de `me`
			//		inconnu.
			my = this.essai;
			
			// On regarde si une méthode pour suivre a été donnée, et on la mémorise le cas échéant.
		  if('function' == typeof poursuivre){ 
				my.poursuivre = poursuivre
			}
			// Les trois lignes suivantes ne sont pas utiles si on décide d'utiliser `next_step` et
			// toutes les méthodes afférantes. L'utilisation de `next_step` et de `step_is` (cf.
			// plus loin) permet de n'avoir rien à envoyer au rappel de cette fonction de test.
		  else{ 
		    etape = poursuivre;
		  }			
			
			// Définition de la liste des étapes (seulement première fois)
			
			if(null == my.step_list){
				db("== Définition de la liste des étapes ==");
				my.set_step_list([
					"Première étape", 
					"Deuxième étape", 
					"Troisième étape", 
					// "Une étape qu'on passe",
					// "Une autre étape passée",
					"Quatrième étape",
					"Cinquième étape", 
					"Sixième étape", 
					"Septième étape", 
					"Huitième étape"
				]);
				// *	La liste des étapes doit correspondre exactement aux conditions qui
				//		seront rencontrées plus bas. Dans le cas contraire, le test risquerait
				//		de s'arrêter sans atteindre sa fin.
				// *	L'avantage de cette présentation en liste (au lieu d'un test de `etape`)
				//		permet de passer très rapidement certains tests, lorsqu'on est en train
				//		d'en rédiger d'autres, comme c'est le cas ci-dessus avec les deux méthodes
				//    qui suivent la troisième.
			}

			// Passer automatiquement à l'étape suivante
			// *	(sauf si un point d'arrêt a été transmis, dans lequel cas on garde le même test
			//  	(i.e. la même étape) mais en passant au point d'arrêt suivant)
			// *	Noter que le `etape = ' (définition de la variable `etape') n'est nécessaire que
			// 		si on l'utilise par la suite, ce qui n'est pas obligatoire. Cf. la suite.
			// 		Donc on peut se contenter d'un `my.next_step()`.
			(undefined == point_arret) && my.next_step();
	
			// Simplement pour voir ici ce qui se passe
			db("Étape courante : "+my.step);
			db("Indice courant : "+my.indice);

			// Utilisation simple (sans faire appel aux méthodes ajoutées)
			// * 	Il vaut mieux éviter cet usage, plus lourd.
			if( etape == "Première étape" ){
			// Ou avec l'indice (noter qu'il est 1-start) :
			// if( my.step_is(1) ){
				db("La première étape est jouée");
				return Wait.for(1, my.proxy);
				// *	ce `return` n'est nécessaire que parce qu'on interrompt plus bas
				// 		la suite des ELSE IF. Mais si cette fonction principale de test ne
				// 		contenait que des ELSE IF, ce `return` ne serait pas nécessaire
				// *	Noter qu'il est préférable d'éviter les ELSE IF et de prendre l'habitude
				//		du format :
				//
				//			if(<condition sur étape>){
				//				... traitement de l'étape ...
				//				return my.proxy()
				//			}
				//			if(<condition sur étape>){
				//				... traitement de l'étape ...
				//				return my.proxy()
				//			}
			}
			
			// On peut également utiliser la méthode `step_is` pour voir si
			// c'est l'étape courante. 
			// *	Noter que dans ce cas, la variable `etape` devient
			// 		tout à fait inutile.
			else if ( my.step_is("Deuxième étape") ){
				db("La deuxième étape est jouée, elle va permettre d'utiliser les points d'arrêt");
				
				// POINT D'ARRET
				// -------------
				if(undefined == point_arret){
					// Ici il y a des tests nécessitant un arrêt (par exemple il faut attendre que la
					// fenêtre se rafraichisse)
					// On appelle la temporisation (on pourrait faire un test sur l'existence d'un
					// élément DOM, mais c'est déjà assez compliqué comme ça ;-). Donc là, on dit
					// juste d'attendre 4 secondes, avant de rappeler cette fonction de test.
					return Wait.for(4, $.proxy(my, this, poursuivre = null, point_arret = 2));
							// *	Noter ci-dessus la méthode pour suivre :
							// 			> Le 1er argument (poursuivre) est mis à null pour ne pas en tenir compte
							//  		> Le 2e argument est la définition du prochain point d'arrêt.
							//				C'est-à-dire qu'au lieu de passer à l'étape suivante (`next_step` plus
							//				haut), on garde la même étape (donc on repasse dans ce IF), mais avec
							//				un point d'arrêt défini.
							// *	Souvenez-vous que plus haut, on ne passe pas à l'étape suivante si ce point
							//		d'arrêt est défini, donc on reviendra dans cette condition ("Deuxième étape").
				}
				if(point_arret == 2){
					db("Je passe dans le point d'arrêt 2 du test Deuxième étape.");
					// On rappelle la même étape avec le point d'arrêt suivant.
					return Wait.for(3, $.proxy(my, this, poursuivre = null, point_arret = 3));
				}
				if(point_arret == 3){
					// Cette fois, on va jouer tout un script de test avant de passer à la suite
					// grâce à la méthode `Test.load_and_run`
					return Test.load_and_run('dossier/de/mon/autre_test.js', $.proxy(my,this));
							// On passe simplement à la méthode `load_and_run` le path relatif du test
							// (path depuis `./tests/user_tests/`) et la méthode pour-suivre, ici l'appel
							// de cette fonction de test.
				}
				db("ON NE DEVRAIT JAMAIS PASSER PAR ICI", WARNING);
			}
			
			// On peut également utiliser la méthode `step_is` mais en lui passant l'indice (1-start)
			// de l'étape à considérer. NOTER que les indices commencent à 1. Donc pour la 3e étape => 3.
			// Cette version est cependant moins claire au niveau du code puisque le nom de l'étape
			// n'apparait plus. En revanche, il permet de changer le nom de l'étape plus facilement,
			// puisqu'il suffit de le changer dans la liste, pas dans cette condition.
			else if ( my.step_is(3) ){
				db("La troisième étape est jouée");
				return Wait.for(1, my.proxy);
						// *	Le `return` est OBLIGATOIRE ci-dessus parce qu'on interrompt la suite des
						// 		ELSE IF.
			}
			
			// En utilisant la propriété `step`
			// @note: on peut aussi utiliser `my.curstep_name`
			else if( my.step == "Quatrième étape"){
				return Wait.for(2, my.proxy);
			}
			
			// En utilisant l'indice courant
			// @note: on peut aussi utiliser `my.current_indice`
			// @rappel: les indices sont 1-start
			else if( my.indice == 5){
				db("Je joue la cinquième étape de nom « "+my.curstep_name+" »");
				// On peut passer l'étape suivante si une condition n'est pas remplie
				if ( 12 > 24 ){
					my.next_step(); 	// Pour "sauter" simplement l'étape suivante
				}
				// Ou définir de passer directement à une étape donnée, différente de la
				// suite des étapes définie plus haut (en général une étape ultérieur)
				// Ça peut arriver dans certains tests, quand un contexte fait qu'une étape
				// n'est pas nécessaire ou serait impossible à réaliser.
				else if ( 12 > 2 ){
					db("Une condition fait que je dois passer directement à la 8e étape");
					my.next_step(8); 	// On passe directement à l'étape 8 en sautant 6 et 7
									// *	Cet indice est 1-start
									// * 	On peut aussi passer le nom de l'étape, mais c'est
									//		un peu plus long et plus risqué (erreur de nom).
									// *	Noter que la méthode `next_step` dans cette utilisation va
									// 		se placer sur l'étape précédente, anticipant l'appel 
									// 		`next_step()` qui se trouve normalement au début de la fonction
									// 		Donc il est nécessaire de repasser par un appel à `my`.
									//		Si on veut simplement poursuivre, il faut alors appeler la
									// 		méthode avec un second argument à TRUE :
									// 		`my.next_step(8, true)`.
				}
				return Wait.for(2, my.proxy);
			}
			
			// Cette étape sera "sautée" par la condition ci-dessus (l'appel à next_step())
			else if( my.step == "Sixième étape"){
				db("Si je joue la SIXIÈME étape, c'est qu'il y a un BUG", WARNING);
				return Wait.for(2, my.proxy);
			}
			
			// Cette étape sera aussi "sautée" par la condition ci-dessus (cf. l'appel à
			// next_step() dans la condition de la 5e étape)
			else if( my.step == "Septième étape"){
				db("Si je joue la SEPTIÈME étape, c'est qu'il y a un BUG", WARNING);
				return Wait.for(2, my.proxy);
			}
	
			// On met ça juste pour l'exemple suivant utilisant `++current_indice`. Mais
			// rappelez-vous que ça n'a strictement rien à voir avec le fait qu'on ait passé
			// des étapes ci-dessus.
			var current_indice = 7;
	
			// Enfin, on peut opter pour un numérotage automatique en utilisant 
			// AVANT CHAQUE condition :
			++current_indice;
			// `current_indice` va prendre la valeur 8. 
			// *	Noter qu'il n'a rien à voir avec my.current_indice qui est l'indice 
			// 		courant de l'étape à jouer.
			// 
			// *	Noter que pas de `else if` dans ce cas-là, seulement des IF et des
			// 		RETURN en fin de chaque étape.
			// *	Il faut alors définir `current_indice = 0` en début de fonction et se
			// 		souvenir que les indices envoyés à `step_is` sont 1-start (1 pour la première étape).
			// *	Cette tournure permet d'insérer facilement de nouvelles étapes, mais est beaucoup
			// 		moins claire que les précédentes, puisqu'il est impossible de faire un rapprochement
			// 		rapide entre l'étape courante (current_indice est opaque) et la liste des étapes.
			if( my.step_is( current_indice )){
				// Si la variable `etape` n'est pas utilisée, on peut obtenir le nom de l'étape
				// courante par `curstep_name()' ou simplement `step` :
				return Wait.for(1, my.proxy); 
							// Une erreur de "no more step" doit être donnée (il n'y a plus d'étape)
			} 
			else {
				
				// Appel de la fin du test. Soit une fonction pour suivre a été définie à l'appel de
				// cette fonction et on l'appelle, soit on stoppe le test (Test.end)
			  my.end
			}
	
		}
