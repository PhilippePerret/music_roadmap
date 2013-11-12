# Définir des messages customisés

On peut définir des messages customisés dans le dossier :

		./tests/user_lib/messages/

En renseignant la variable :
		
		UMessages // pour "Messages utilisateur" ("User Messages")

##Explication par l'exemple

Un exemple vaut mieux qu'un long discours.

Soit dans l'application un objet :

		Film

Soit une méthode de cet objet `Film` :

		Film.titre = function(){…}

On veut tester le retour de cette méthode `Film.titre`, mais en renvoyant en console un message personnalisé. On veut tester que cette méthode ne retourne jamais une valeur nulle&nbsp;:

		'Film.titre'.should_not.return(null);

Par défaut, le message de résultat sera :

		En cas de succès : "`Film.titre` n'a pas retourné la valeur NULL (valeur retournée : <une autre valeur>)"
		En cas d'erreur  : "`Film.titre` a retourné NULL"

Or, on voudrait que le message soit :

		En cas de succès : "`Film.titre` retourne bien une valeur non null."
		En cas d'erreur  : "Houps !… `Film.titre` a retourné NULL !"

On se sert donc de `UMessages` pour modifier ces messages.

Puisque ces messages concernent la méthode de test `should_not`, on doit définir les messages dans :

		UMessages.should_not

Puisqu'il s'agit de la sous-méthode `return` (on a utilisé la méthode test `should_not.return`), on doit définir les messages dans :

		UMessages.should_not.return

Noter qu'au lancement de Pure-Js-Tests, si vous n'avez encore défini aucun message personnalisé, `UMessages` a la valeur d'un hash vide :

		UMessages = {}

Il ne faut donc pas utiliser la tournure :

		UMessages.should_not.return = ... ; // => erreur `UMessages.should_not` undefined

… mais la tournure :

		UMessages.should_not = {
			return:{}
		}

Le plus judicieux est de créer le fichier :

		./tests/user_lib/messages/should_shouldnot.js

… dans lequel on définira tous les messages concernant les tests `should` et `should_not`.

Au début de ce fichier :

		# Dans ./tests/user_lib/messages/should_shouldnot.js
		
		//Initialisation des tables
		UMessages.should = {
			return:{},
			be:{},
			etc. (toutes les méthodes propres devant avoir des messages personnalisés)
			};
		UMessages.should_not = {
			return:{},
			be:{},
			etc.
			};
		};

		// Définitions propres
		...
		
Ces définitions propres vont utiliser comme clé le “sujet” de la méthode de test (par exemple ici : `"Film.titre"`), qui doit TOUJOURS être un string (qui sera évalué), ou l'identifiant jID (par exemple le `"div#mon_div"` du test `jq("div#mon_div").should_not.be.empty`). Il suffit donc de définir dans notre fichier de messages customisés :

		// Définitions propres
		UMessages.should_not.return['Film.titre'] = {
			success: "`Film.titre()` retourne bien une valeur non null (#{value})",
			failure: "Houps !… `Film.titre()` a retourné NULL !"
		}

Noter le `#{value}`. Il permet d'écrire dans les messages customisés le résultat obtenu par l'évaluation de l'expression envoyée (ici `Film.titre` — noter que dans un test `return`, l'expression à tester est toujours considérée comme un appel à une fonction/méthode, donc si les parenthèses manquent elles sont ajoutées. Quand on veut tester une méthode en lui envoyant des arguments, ces parenthèses sont obligatoires. P.e. : `Film.titre('un nouveau titre')`).

Noter qu'on peut faire référence aux arguments envoyés à la méthode de test à l'aide de :

		#{<indice argument>}
	
Par exemple, le `null` étant le premier argument de notre appel de la fonction de test :

		'Film.titre'.should_not.return(null);

… plutôt que d'écrire NULL «&nbsp;en dur&nbsp;» dans le message, on aurait pu tout à fait faire&nbsp;:

		UMessages.should_not.return['Film.titre'] = {
			success: "`Film.titre()` retourne bien une valeur non null (#{value})",
			failure: "Houps !… `Film.titre()` a retourné #{1} !" // "1" car 1er argument
		}

C'est inutile dans ce cas, mais ça peut l'être dès que des arguments sont créés de façon dynamique.

Par exemple, maintenant, nous voulons tester que la méthode retourne bien le titre du film, et qu'un message personnalisé soit affiché. La méthode de test est appelée par :

		'Film.titre'.should.return(APP.Film.data.titre /* Une propriété définie dans mon application à tester */);

*Noter, ci-dessus, que dès qu'on veut obtenir une valeur de l'application, on doit utiliser l'objet `APP`, qui est l'application testée.*

Nos messages personnalisés, encore une fois définis dans le fichier `should_shouldnot.js`, pourraient ressembler à :

		UMessages.should.return['Film.titre'] = {
			success: "`Film.titre()` a bien retourné #{1}",
			failure: "Houps !… `Film.titre()` aurait dû retourner #{1} ! (valeur retournée : #{value})"
		}

Ou même (en indiquant dynamiquement l'expression testée, qui est le “sujet” (subject) de l'appel à la méthode-test, donc `#{1}`) :

		UMessages.should.return['Film.titre'] = {
			success: "`#{subject}` a bien retourné #{1}",
			failure: "Houps !… `#{subject}` aurait dû retourner #{1} ! (valeur retournée : #{value})"
		}

Ce qui nous conduit à l'idée de modifier tous les messages d'une fonction de test particulière, en utilisant la clé `default`. Dans ce cas, tous les tests appelant cette méthode utiliseront ce message personnalisé (d'où l'utilité du `#{subject}` ci-dessus) :

		UMessages.should.return = {
			default: {
				success: "YES ! `#{subject}` a bien retourné #{1}",
				failure: "HOUPS !… `#{subject}` aurait dû retourner #{1} ! (valeur retournée : #{value})"
			},
			// Mais je peux tout de même garder un message personnalisé pour le test particulier
			// de 'Film.titre', s'il doit vraiment être particulier :
			'Film.titre': {
				success: "Yeah dude ! `#{subject}` a bien retourné le titre “#{1}”",
				failure: "Hou la la !… `#{subject}` aurait dû retourner #{1} ! (valeur retournée : #{value})"
			},
			// ... Ici d'autres définitions personnalisés
		}

Noter pour finir que si vous utilisez les messages personnalisés, il est IMPÉRATIF de définir les deux messages, celui en cas de succès (avec la clé `success`) et celui en cas d'échec (avec la clé `failure`).