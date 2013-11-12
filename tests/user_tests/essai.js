
function essai(poursuivre){
  var etape;
	if(Test.stop)return;
  if('function'==typeof poursuivre){ 
		this.poursuivre = poursuivre;}
  else{ 
    etape = poursuivre;
  }

	// Définition de la liste des étapes (seulement première fois)
	var me = this.essai;
	if(null == me.step_list){
		db("== Définition de la liste des étapes ==");
		me.set_step_list([
			"Première étape", "Deuxième étape", "Troisième étape", "Quatrième étape",
			"Cinquième étape", "Sixième étape", "Septième étape", "Huitième étape"
		]);
	}

	// Passer automatiquement à l'étape suivante
	// Noter que le `etape = ' (définition de la variable `etape') n'est nécessaire que
	// si on l'utilise par la suite, ce qui n'est pas obligatoire. Cf. la suite.
	// Donc on pourrait se contenter d'un `me.next_step()`.
	etape = me.next_step();
	
	// Simplement pour voir ici ce qui se passe
	db("Étape courante : "+me.step);
	db("Indice courant : "+me.indice);

	// Utilisation simple (sans faire appel aux méthodes ajoutées)
	if( etape == "Première étape" ){
	// Ou avec l'indice (noter qu'il est 1-start) :
	// if( me.step_is(1) ){
		db("La première étape est jouée, elle teste si le fichier ./tests.php existe bien.");
		return Wait.until(function(){
			return TFile.exists('./tests.php');
		}, $.proxy(essai,this));
		return Wait.for(1, $.proxy(essai,this));
		// @note: ce `return` n'est nécessaire que parce qu'on interrompt plus bas
		// 				la suite des ELSE IF. Mais si cette fonction principale de test ne
		// 				contenait que des ELSE IF, ce `return` ne serait pas nécessaire
	}
	// On peut également utiliser la méthode `step_is` pour voir si
	// c'est l'étape courante. Noter que dans ce cas, la variable `etape` n'a pas à 
	// être définie.
	else if ( me.step_is("Deuxième étape") ){
		var titre = jq("head title").obj().html();
		w("Votre application porte le titre “"+titre+"”", BLUE);
		return Wait.for(5, $.proxy(essai,this));
	}
	// On peut également utiliser la méthode `step_is` met en lui passant l'indice (1-start)
	// de l'étape à considérer. NOTER qu'il commence à 1. Donc pour la 3e étape => 3.
	// Cette version est cependant moins claire au niveau du code puisque le nom de l'étape
	// n'apparait plus. En revanche, il permet de changer le nom de l'étape plus facilement,
	// puisqu'il suffit de le changer dans la liste.
	else if ( me.step_is(3) ){
		db("La troisième étape va relever tous les éléments propres de `window`.");
		w("L'application “"+titre+"” contient :");
		for(var foo in APP.window){
			if(false==APP.window.hasOwnProperty(foo))continue;
			w((typeof APP.window[foo])+" "+foo);
		}
		return Wait.for(2, $.proxy(essai,this));
		// Note : le `return` est utilisé ci-dessus parce qu'on interrompt la suite des
		// 				`else if` (pas du tout obligatoire, c'est juste pour l'exemple)
	}
	// En utilisant la propriété `step`
	// @note: on peut aussi utiliser `me.current_step`
	else if( me.step == "Quatrième étape"){
		return Wait.for(2, $.proxy(essai,this));
	}
	// En utilisant l'indice courant
	// @note: on peut aussi utiliser `me.current_indice`
	// @note: les indices sont 1-start
	else if( me.indice == 5){
		db("Je joue la cinquième étape de nom « "+me.current_step+" »");
		// On peut passer l'étape suivante si une condition n'est pas remplie
		if ( 12 > 24 ){
			me.next_step(); 	// Pour "sauter" simplement l'étape suivante
		}
		// Ou définir de passer directement à une étape donnée
		else if ( 12 > 2 ){
			db("Une condition fait que je dois passer directement à la 8e étape");
			me.next_step(8); 	// On passe directement à l'étape 8 en sautant 6 et 7
							// @note: Cet indice est 1-start
							// @note: On peut aussi passer le nom de l'étape, mais c'est
							//				un peu plus long et plus risqué (erreur de nom).
							// @note: Noter que la méthode `next_step` dans cette utilisation va
							// 				se placer sur l'étape précédente, anticipant l'appel 
							// 				`next_step()` qui se trouve normalement au début de la fonction
							// 				Donc il est nécessaire de repasser par un appel à `me`.
							//				Si on veut simplement poursuivre, il faut alors appeler la
							// 				méthode avec un second argument à TRUE :
							// 				`me.next_step(8, true)`.
		}
		return Wait.for(2, $.proxy(essai,this));
	}
	// Cette étape sera "sautée" par la condition ci-dessus (l'appel à next_step())
	else if( me.step == "Sixième étape"){
		db("Cette SIXIÈME étape devrait avoir été passée");
		return Wait.for(2, $.proxy(essai,this));
	}
	// Cette étape sera aussi "sautée" par la condition ci-dessus (cf. l'appel à
	// next_step() dans la condition de la 5e étape)
	else if( me.step == "Septième étape"){
		db("Cette SEPTIÈME étape devrait avoir été passée");
		return Wait.for(2, $.proxy(essai,this));
	}
	
	// On met ça juste pour l'exemple suivant :
	var current_indice = 7;
	
	// Enfin, on peut opter pour un numérotage automatique en utilisant avant CHAQUE
	// condition :
	++current_indice;
	// `current_indice` va prendre la valeur 8. Noter qu'il n'a rien à voir avec
	// me.current_indice qui est l'indice courant de l'étape à jouer.
	// 
	// Noter que pas de `else if` dans ce cas-là, seulement des IF et des RETURN en fin de
	// chaque étape.
	// Noter qu'il faut alors définir `current_indice = 0` en début de fonction et se
	// souvenir que les indices envoyés à `step_is` sont 1-start (1 pour la première étape).
	// Cette tournure permet d'insérer facilement de nouvelles étapes, mais est beaucoup
	// moins claire que les précédentes, puisqu'il est impossible de faire un rapprochement
	// rapide entre l'étape courante (current_indice est opaque) et la liste des étapes.
	if( me.step_is( current_indice )){
		db("Je vais générer une erreur en appelant une étape de test suivante qui n'existe pas.");
		// Si la variable `etape` n'est pas utilisée, on peut obtenir le nom de l'étape
		// courante par `current_step()' :
		return Wait.for(1, $.proxy(essai,this)); 
					// Une erreur de "no more step" doit être donnée (il n'y a plus d'étape)
	} 
	else {
	  if('function'==this.poursuivre)this.poursuivre();
	  else Test.end();
	}
	
}
