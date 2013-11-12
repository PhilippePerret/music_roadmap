# Fonction Principale de Test


La “fonction principale de test” est la fonction qui est appelée pour lancer un test. Cette fonction principale peut tout à fait appeler d'autres fonctions principales se trouvant dans d'autres tests (cf. [Chaînage de tests](./Suite-tests))

*Pour voir la liste des toutes les méthodes utilisables dans une Fonction Principale de Test, cf. la page [Méthodes de la Fonction Principale de Test](./Fonction-principale-de-test-methodes).*

##Nom de la fonction

Elle doit impérativement porter comme nom un nom tiré du chemin relatif du fichier qui la contient, chemin relatif à partir du dossier `<app>/tests/user_tests/`.

Par exemple, soit le fichier de test :

		<app>/tests/user_tests/dossier_scripts/mon_script.js

… son chemin relatif est donc :

		dossier_scripts/mon_script.js

… le nom de la fonction principale de test que devra contenir ce fichier devra donc IMPÉRATIVEMENT s'appeller :

		function dossier_scripts_mon_script(){
			...
		}

*Noter comment les séparateurs de path `/` ont été remplacés par des underscores `_` (traits plats).*

##Note

Pour la suite, on considèrera une fonction principale de test de nom `ma_fonction`. Elle serait donc définie dans un fichier à la racine du dossier `./tests/tests_user/` de nom `ma_fonction.js`.

##Variable pratique

Des références fréquente à la fonction étant fait à l'intérieur même de la fonction, on peut définir en haut de fonction :

		function ma_fonction(){
		
			var my = this.ma_fonction
	
			...
	
		}

##Schéma type explicité

Vous pourrez trouver ensuite un format type de script de test (de fonction principale de test) sur la page [Schéma type de test](./Test-schema-type)


##Conclusion

*Pour voir la liste des toutes les méthodes utilisables dans une Fonction Principale de Test, cf. la page [Méthodes de la Fonction Principale de Test](./Fonction-principale-de-test-methodes).*
