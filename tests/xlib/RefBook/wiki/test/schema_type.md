#Schéma type d'un test (fonction principale)

Trouvez ci-dessous, dans un premier temps, le schéma type sans explication détaillée. Par la suite, les différentes lignes seront détaillées.

```javascript
function Dossier_test_mon_test(){

  var I = Dossier_test_mon_test
  
  if(I.dont_know_step_list){
    
    specs("Les spécificités de ce test.")
    
    I.set_step_list_to([
      "Première étape", 
      "Deuxième étape",
      // "Troisième étape"  // étape passée
      "Quatrième étape"
      ])
    
  } 
  
  I.define_work 
  
  if(I.run_step(
    
    
    "Première étape"
    
    
  )){
    
    ... Some stuff (test a faire)...
    

    I.end_step
  }
  else if( I.run_step(
    
    
    "Deuxième étape"
    
  )){
  
    ... Test à faire ensuite / Some stuff ...
    
  
    I.wait.for(4)
  }
  else if ( I.step_is(
    
    
    "Troisième étape"
    
    
  )){
    ... Some stuff ...
    
    I.wait.until(function(){ return jq('input#mon_bouton').is.visible })
  }
  else if ( I.end_step(
    
    
    "Quatrième étape"
    
    
  )){
    
    
    if(I.must_stop_at( 0 )){
      ... some stuff ...
      I.end_step_with( 1 )
    }
    else if( I.must_stop_at( 1 )){
      ... some stuff ...
    
      I.wait.for(4, 2)
    }
    else if( I.must_stop_at( 2 )){
      ... some stuff ...
    
      I.wait.while(function(){return <condition>}, 3)
    }
    else if( I.must_stop_at( 3 ))
      ... some stuff ...
      I.end_step
    }
      
  }
  
  
}
```

##Explicitation du code

###Définition de la Fonction Principale de Test

```javascript

function Dossier_test_mon_test(){

```
Définit la **Fonction Principale de Test**. C'est elle qui contient les tests à effectuer.

Ici, le fichier qui la contient se trouve dans :

    <app>/tests/user_tests/Dossier_test/mon_test.js

Le nom de la fonction se calcule par rapport au chemin relatif à partir de `<app>/tests/user_tests` :
  
    [dossier relatif/] Dossier_test/mon_test.js

… en remplaçant les “/” par des traits plats (“_”) et en supprimant l'extension :

    Dossier_test/mon_test.js => fonction “Dossier_test_mon_test”

###Lancement du test

Noter que pour lancer ce test, il suffit d'indiquer le path relatif au fichier, sans extension, dans le formulaire de l'interface de Pure-Javascript-Test en renseignant le champ “Fichier Test” puis en cliquant le bouton de lancement du test.

![Formulaire Pure-Javascript-Tests](https://github.com/PhilippePerret/PureJavascriptTests/raw/master/images/fr/app/formulaire.png)


###Raccourci

```javascript

  var I = Dossier_test_mon_test

```

La ligne ci-dessus définit un raccourci faisant référence à la fonction de test.

La lettre “I” (i majuscule) est idéale, mais si vous êtes français vous pouvez aussi utiliser :

```javascript

  var Je = Dossier_test_mon_test
  
```

Noter qu'il n'y a pas de `this.` devant le nom de la fonction, contrairement à ce que l'on pourrait attendre.

###Initialisation de la fonction principale de test

Le départ du test peut se repérer lorsque les étapes ne sont pas encore définies :

```javascript

  if(I.dont_know_step_list){

```
####Définition des spécificités du test

On peut, pour commencer définir les spécificités générales du test grâce à la méthode `specs` :

```javascript

        specs("Les spécificités de ce test.")

```

####Définition de la liste des étapes du test

Ensuite vient la définition des étapes.

```javascript
  
     I.set_step_list_to([
      "Première étape", 
      "Deuxième étape",
      // "Troisième étape"  // étape passée
      "Quatrième étape"
      ])
  }
  
```

Ce bloc de code permet de définir la liste des étapes. Elle n'est définie qu'au premier appel de la fonction de test.

Pour simplifier à l'extrême, un test, c'est :

    Une FONCTION DE TEST principale…
      … qui contient des ÉTAPES de test
        … qui peuvent contenir des POINTS D'ARRÊT (STOP POINTS)


L'avantage de cette liste située en haut de fonction est de permettre de supprimer des étapes de test très facilement, simplement en les mettant en commentaires.

###Défintion du test courant

```javascript

  I.define_work 

```

Le principe général de ces tests javascript est d'appeler la Fonction Principale de Test après chaque étape de test. Notez que cela n'est utile que lorsqu'il y a des tests asynchrones.

Ces tests asynchrones ne concernent pas seulement Ajax, mais peuvent concerner aussi le fonctionnement du DOM qui peut être plus ou moins long à effectuer une tâche.

Ce `I.define_work` permet de définir le travail courant, et notamment l'étape de test à jouer.

Bien entendu, si vous avez défini le raccourci de la Fonction Principale de Test par `Je`, il vous faut utiliser `Je.define_work`.


###Définition d'une étape de test

```javascript

if(I.run_step( "Première étape" )){
  
  ... Some stuff (test a faire)...
  

  I.end_step
}
  
```

Ci-dessus le schéma classique de la définition d'une ÉTAPE DE TEST. Toutes les étapes sont définies par une suite de :


```javascript

if(... etape ...){

}
else if( ... etape ...){

}
else if( ... etape ... )

etc.

```

Le test de l'étape courante est faite par `I.run_step(<nom de l'étape>)` (“Je joue l'étape(<nom de l’étape>)”).

La marque de la fin de l'étape, si aucune autre formule d'attente n'est utilisée (comme une attente `Wait` par exemple), doit OBLIGATOIREMENT comporter :

    I.end_step // = "Je finis l'étape"

C'est la ligne qui permet à la fonction principale de test d'être rappelée et de passer à l'étape suivante.

Une autre possibilité, plus sybillique, consisterait à faire :

    return I()

… ou même simplement `I()` si la suite des IF / ELSE IF a bien été respectée (et que donc ce `I()` atteindra la fin de la Fonction Principale de Test sans rencontrer d'autre code).


```javascript

else if( I.run_step(
  
  
  "Deuxième étape"
  
)){
  
  //... Test à faire ensuite / Some stuff ...
    
```

C'est donc la définition de la deuxième étape de test.

Les retours de chariot permettent de rendre très claire l'étape dans le code.


###Définition d'une formule d'attente

```javascript

  ...
  
  I.wait.for(4)

}

```

C'est notre première formule d'attente. Elle demande simplement au test d'attendre 4 secondes (premier argument).

Cette attente peut être utile lorsqu'on sait qu'il faut un minimum de temps avant qu'une opération se fasse (par exemple le rafraichissement d'un formulaire) et qu'on estime inutile de faire un test plus précis.

*Noter que contrairement aux apparences, tout comme `I.end_step`, cette attente va rappeler la Fonction Principale de Test qui passera, grâce au `I.define_work`, à l'étape suivante (ou au point d'arrêt suivant).*

```javascript

else if ( I.step_is( "Troisième étape" )){
  ... Some stuff ...
  
  I.wait.until(function(){ return jq('input#mon_bouton').is.visible })
}

```

Ci-dessus, nous pouvons voir une deuxième formule d'attente. Explicitement, le test va attendre que l'élément DOM `input#mon_bouton` soit visible dans la page. Lorsqu'il le sera, le test pourra se poursuivre.

Pour le détail sur les méthodes Wait (`I.wait` est une référence à Wait), cf. la page [Les formules d'attente](./wiki/Wait).

Pour le détail sur `jQ` (qui permet une interaction aisée avec le DOM de l'application), cf. la page [Manipulation et test du DOM avec jQ](./wiki/jQ).


###Définition d'une étape de test avec points d'arrêt

```javascript

...

else if ( I.end_step( "Quatrième étape" )){
  
  if(I.must_stop_at( 0 )){
    ... some stuff ...
    I.end_step_with( 1 )
  }
  else if( I.must_stop_at( 1 )){
    ... some stuff ...
    
    I.wait.for(4, 2)
  }
  else if( I.must_stop_at( 2 )){
    ... some stuff ...
    
    I.wait.while(function(){return <condition>}, 3)
  }
  else if( I.must_stop_at( 3 ))
    ... some stuff ...
    I.end_step
  }
  
}

```

Cette quatrième étape de test nous permet d'inaugurer les POINTS D'ARRÊT (STOP POINTS).

Ce qu'il faut comprendre, c'est que ces points d'interêt fonctionnent exactement comme les étapes de test. Leur seul avantage est :

* De pouvoir subdiviser une étape en plusieurs sous-étapes sans avoir à les définir dans la liste des étapes de test,
* Et plus important, de passer directement à l'étape suivante si un échec fatal est rencontré (par exemple la nom présence d'un formulaire dans la page, qui rendrait obsolètes les tests suivants).

Notez que les POINTS D'ARRÊT doivent obligatoirement être des nombres (entiers ou flottants). C'est de cette seule manière que Pure-Javascript-Tests distingue un point d'arrêt d'une étape.

Le test du point d'arrêt courant se fait par :

```javascript

if(I.must_stop_at( <indice du stop-point> )){ ... }
  
```

L'appel d'un point d'arrêt suivant, à la fin de cette condition et s'il n'y a pas de formule d'attente, se fait par :

```javascript

I.end_step_with( <indice du stop-point suivant>)
  
```


###Définition d'une formule d'attente dans un point d'arrêt

S'il y a une formule d'attente ([Wait](./wiki/Wait), [TFile](./wiki/TFile), etc.), on renseigne simplement son deuxième argument avec l'indice de l'étape suivante :

```javascript

I.wait.for(5, 3) // => attente de 5 secondes puis passage au point d'arrêt 3

```

Ou :

```javascript

I.wait.until(function(){return 'ObjApp.prop'.is.greater_than(12)}, 4)

```

Le code ci-dessus signifie : “Attendre que la propriété `prop` de l'objet `ObjApp` de l'application soit plus grand que 12, puis passer au point d'arrêt 4”.


###Définition de la fin d'une étape avec points d'arrêt

Le dernier appel (dernier point d'arrêt) doit être le même que pour une étape :

```javascript

I.end_step

```

… ou, si le dernier stop-point de l'étape s'achève par une formule d'attente, la formule habituelle, avec un seul argument :

```javascript

I.wait.for(5) // attente de 5 secondes avant de poursuivre

```