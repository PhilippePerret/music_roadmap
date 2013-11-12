#Méthodes de la Fonction Principale de Test

<!-- Ce fichier doit porter le nom ./Fonction-principale-de-test-methodes -->

*Pour des informations sur cette fonction, visitez la page [Fonction Principale de Test](./Fonction-principale-test).*

Cette page liste toutes les méthodes propres qu'on peut appeler dans la **Fonction Principale de Test**.

##Préambule

Dans toutes les fonctions suivantes, on supposera qu'on a défini le raccourci pratique `I` (i majuscule) pour faire référence à la fonction :

```javascript
	
function ma_fonction_principale_de_test(){

	I = ma_fonction_principale_de_test

```

##Fonctions de définition

###Définition des étapes du test

On peut vérifier que les étapes du test soient définies grâce à :

```javascript


I.dont_know_step_list // => Renvoie FALSE si les étapes ne sont pas définies


```

Pour définir les étapes :

```javascript

	I.set_step_list_to([<liste des etapes>]
	
```

Où `<liste des etapes>` est une liste de Strings (chaînes de caractères quelconques).

###Définition des spécificités du test

Dans le préambule où on définit les étapes, on peut également définir les spécificités du test courant exécuté par la Fonction Principale de Test.

```javascript


	specs("Ici les spécificités du test qui seront affichées en début de rapport.")


```


###Définition du travail courant.

Pour que la Fonction Principale de Test connaisse l'étape courante à jouer (ou le point d'arrêt), il faut utiliser, après la définition des étapes :


```javascript

	I.define_work

```

###Résumé

En résumé, l'entête d'une fonction de test `ma_fonction_de_test` peut ressembler à :


```javascript

function ma_fonction_de_test(){

	I = ma_fonction_de_test
	
	if(I.dont_know_step_list){
	
		specs("Les spécificités du test")
		
		I.set_step_list_to([
			"Première étape à jouer qui fera ceci",
			"Deuxième étape à jouer qui fera cela",
			etc.
			])
	}
	
	I.define_work

	...
	
}

```

###Définition de chaque étape


```javascript

	if(I.run_step( "Le nom exact dans la liste des étapes" )){
		...
	}
	else if( I.run_step( .... )){
	
	}
	
```



##Fonctions d'interruption

###Interruption sans attente

Cette interruption provoquera le passage à l'étape suivante sans attente. Elle est à mettre à l'intérieur de la définition d'une étape.

```javascript

	I.end_step

```

Par exemple :

```javascript

	else if(I.run_step("Une étape dans le flux")){
		... des choses a faire ...
		
		I.end_step // passage direct à "Une étape suivante"
	}
	else if(I.run_step("Une étape suivante")){
	
	...

```

###Interruption avec passage à un point d'arrêt suivant

À placer à la fin d'un bloc définissant un point d'arrêt.

```javascript


	I.end_step_with(<numero stop point>)
	
	OU
	
	I.go_to_stop_point(<numero stop point>)


```

Par exemple :


```javascript

	if(I.run_step("Mon étape avec points d'arrêt")){

		if(I.must_stop_at( 0 )){ // Premier point d'arrêt (0)
		
			...
			
			I.end_step_with( 1 ) // Passage au point d'arrêt 1
		}
		else if( I.must_stop_at( 1 )){
			
			...
			
			I.go_to_stop_point( 2 ) // Passage au point d'arrêt 2
		}
		else if( I.must_stop_at( 2 )){
		
			...
			
			I.end_step // fin de l'étape
		}
	}

```


##Méthodes provoquant une attente

###Jouer un synopsis librairie avant de poursuivre

```javascript

I.run_synopsis(<synopsis>[, <argument>])

```

Pour le détail sur l'utilisation des synopsis, voir la page [Synopsis librairies](./Synopsis-accueil).


###Jouer un autre test


```javascript


I.run_test(<path relatif test>[, <argument>])
	
	
```

###Charger le contenu d'un fichier

```javascript


I.load_file(<path relatif du fichier>[, <options>])
	
	
```

Pour le détail sur le chargement des fichiers, cf. la page [Travail avec des fichiers à charger](./TFile-accueil).

