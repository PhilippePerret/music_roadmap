# Jouer une suite de tests

On peut faire jouer une suite de tests —&nbsp;ou simplement faire jouer un test dans un autre test&nbsp;— grâce à la méthode :

		Test.load_and_run(<test path>)
	
où `<test path>` est le chemin d'accès RELATIF au fichier de test (contenant la fonction principale de test) depuis le dossier :
		
		<app>/tests/user_tests/


##Exemple de suite
		
Soit les tests :

		<app>/tests/user_tests/film/data.js  			// Check de la propriété `data` de Film
		<app>/tests/user_tests/film/file.js 			// Teste tout ce qui concerne les fichiers
		<app>>/tests/user_tests/images/affiche.js // Teste ce qui concerne l'affiche du film

Chacun de ces tests doit définir une [fonction principale de test](./Fonction-principale-de-test) conforme, c'est-à-dire principalement (exemple donné avec le premier fichier ci-dessus) :
		
		// Définie avec le bon nom de fonction
		function film_data(poursuivre)

		// Enregistrant la méthode pour suivre
		if(undefined != poursuivre) my.poursuivre = poursuivre

		// ... ici les tests ...

		// Traitant poursuivre à la fin du test
		my.poursuivre()

Ensuite, on peut faire un script qui va jouer ces trois tests successivement.

On peut le placer par exemple dans :

		<app>/tests/user_tests/suites/demo.js

Avec le code :

		function suites_demo(poursuivre){
	
			specs("Un test de démonstration du lancement d'une suite de tests.")
	
			my = this.suites_demo
	
			// On définit la liste des étapes (on pourra ex-commenter une ligne pour 
			// supprimer provisoirement un test)
			if(!my.step_list){
				my.set_step_list([
					"film/data",
					"film/files",
					// "Test qui est supprimé provisoirement",
					"images/affiche",
					"Fin suite démo" // ATTENTION ! SURTOUT PAS DE VIRGULE APRÈS ÇA
					])
			}
	
			// Pour faire passer automatiquement à l'étape suivante
			// @note: Sans écrire le titre de cette étape
			my.next_step()
	
			if(false == my.step_is("Fin suite démo"))
				// Charge et joue le test défini
				Test.load_and_run(my.step, my.proxy)
			else
				if(my.poursuivre) my.poursuivre
				else Test.end()
			}
		}