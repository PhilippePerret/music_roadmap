#Écriture de messages

On peut écrire des messages "en console" (c'est-à-dire en vérité dans la page HTML de Pure-Javascript-Tests) utilisant les méthodes définies dans cette page.

Ces méthodes peuvent s'insérer n'importe où dans vos fonctions de test.

Notez que la plupart de ces messages ne s'afficheront pas si la case `Affichage complet` n'est pas cochée dans l'interface de Pure-Javascript-Tests.

##`specs(<message>)`
	
En mode verbose, cette méthode permet d'écrire à l'écran les spécificités attendues. Par exemple ce que doit produire une méthode testée.

		if(me.step_is("Test de la méthode `ecrire`")){
			specs("La méthode `ecrire` doit écrire un texte dans la page, formaté avec le style donné en argument. Si cet argument manque, un style par défaut doit être appliqué.");
			... Ici le test de la méthode ...
		}

##`w(<message>[, <type>])`
  
Écrit une ligne (retour chariot) du type `<type>` (NOTICE, WARNING, etc.).

N'écrit rien en mode non verbose.

##`step(<message>)`
  
Écrit l'étape courante. Si on est en mode non verbeux, aucun message ne sera écrit,
mais l'étape se retrouvera dans le flux des erreurs rencontrées, pour situer l'erreur.

Noter que si vous utilisez la méthode `next_step()` dans votre fonction de test, l'appel
à cette méthode `step(...)` est inutile, elle est déjà appelée par `next_step`.

##`r(<message>[, <type>])`
  
Écrit un texte sans retour chariot. Identique à `w`, mais sans retour chariot.

##`db(<message>[, <type>])`
  
Écriture d'un message "système" à l'écran.

##`force_db(<message>[, <type>])`
	
Identique à `db`, mais affiche le message dans tous les cas, même en mode non verbeux.

Utile si en rédigeant les tests on veut connaitre une valeur particulière, sans afficher tous les autres messages.

# Messages de résultat de tests

La plupart des messages de résultat de tests sont générés automatiquement par les fonctions de test prédéfinies. Il peut arriver cependant qu'on fasse un test propre à l'intérieur de ses fonctions de test.

Par exemple :

		if( ma_valeur > 12) ... générer un succès
		else ... générer une erreur

##`success(<message>)`
	
Non seulement cette méthode écrit le message à l'écran (en vert), mais il incrémente le nombre de succès.

En cas d'affichage non verbeux, produit une astéristique (“*”).

##`failure(<message>)`
	
Non seulement cette méthode écrit le message à l'écran (en rouge), mais il incrémente le nombre d'échec.

En cas d'affichage non verbeux, produit une astéristique (“*”).

Pour revenir à l'exemple donné ci-dessus, on coderait donc dans sa fonction de test :

		if( ma_valeur > 12) success("La valeur est bien supérieur à 12");
		else failure("Malheureusement, la valeur est inférieur à 12…")

	