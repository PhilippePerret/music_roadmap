# Objet Wait (attente)

## Méthodes

###Wait.until

Syntaxe

    Wait.until(<fonction d'attente>[, <options ou argument unique>]);

Ou, de façon plus pratique dans une [Fonction Principale de Test](./Fonction-principale-test) :


```javascript


<fonction>.wait.until(<formule/fonction attente>[, <options ou argument unique>])


```

La fonction d'attente doit renvoyer FALSE jusqu'à ce qu'une condition soit remplie, dans lequel cas elle renverra TRUE et interrompra l'attente.

Exemple pour tester la présence d'un élément dans la page de l'application.

```javascript

Wait.until(
  function(){
    return jq('div#message').exists
  }, 
  $.proxy(fonction_principale, window)

```

Ou dans une fonction principale de test :


```javascript

function mon_test(){

  I = mon_test
  
  ...
  
  I.wait.until(function(){return jq('div#message').exists})
  
}

```

Dès que la page contiendra l'élément `div#message` (peut-être remonté par Ajax), la boucle wait s'interrompra et appellera la fonction `fonction_principale` ou poursuivra la fonction courante de test.


###Wait.while

Fonctionne comme la précédente, mais s'interrompt lorsque la fonction d'attente (premier argument) renvoie FALSE.


```javascript

function mon_test(){

  I = mon_test
  
  ...
  
  I.wait.while(function(){return jq('div#message').exists})
  // S'interrompra quand l'élément `div#message` aura disparu du DOM
  // ... ou pas
  
}

```

###Options des méthodes `Wait.until` et `Wait.while`

Le deuxième argument des méthodes `Wait.until` et `Wait.while` permet de mieux définir la formule d'attente.

Si ce n'est pas un point d'arrêt (Number) ou une méthode pour suivre (Function), c'est un `Object` pouvant définir ces propriétés (toutes sont optionnelles) :

```javascript

{
  laps             :  Le nombre de MILLISECONDES entre chaque tentative 
                       Défaut : un 10e de seconde
  max_time         :  La durée maximale d'attente, en SECONDES. Échec si cette durée est atteinte
                      Défaut : 20 secondes
  success          :  La méthode à appeler en cas de succès
  failure          :  La méthode à appeler en cas d'échec
  message          :  Le message à afficher en début d'attente
  failure_message  :  Le message à afficher en cas d'échec, si +failure+ n'est pas définie
  success_message  :  Le message à afficher en cas de succès, si +success+ n'est pas définie
  next_stop_point  :  Le point d'arrêt suivant (
                      Peut être envoyé comme argument si aucune autre option
  arg              :  Les arguments à renvoyer au script d'appel (if any)
  suivre           :  La méthode pour suivre, si ni +failure+ ni +success+ n'ont été définis
                      Peut être envoyé comme argument si aucune options
}

```

###Wait.for

Permet d'attendre le nombre de secondes spécifiées en premier argument.

Exemple pour attendre 4 secondes et passer ensuite à la méthode `methode_pour_suivre`.


    Wait.for(4[, argument ou methode pour suivre ou message d'attente][, <message d'attente>]);

Un raccourci pratique peut être appelée par la fonction :


```javascript

<fonction>.wait.for(...)

```

Par exemple :

```javascript

function ma_fonction_de_test(){

  I = ma_fonction_de_test
  
  ...
  
  // Simple attente d'un nombre de secondes
  nombre_de_secondes = 4
  I.wait.for(nombre_de_secondes)
  
  
  // Attente d'un nombre de secondes et passage au point d'arrêt suivant
  next_stop_point = 2
  I.wait.for(nombre_de_secondes, next_stop_point)
  
  // Attente avec un message personnalisé
  I.wait.for(5, "Mon message d'attente personnalisé")
  
  // Avec point d'arrêt et message personnalisé
  I.wait.for(nombre_de_secondes, next_stop_point, "Je passerai dans 4 secondes au point 2…")
  
}


```

Ces méthodes peut être utilisée profitablement en conjonction avec les points d'arrêts, lorsqu'un test doit être traité en plusieurs étapes.

    function mon_test(point_arret){

      I = mon_test
  
      ...
  
      I.define_work
  
      if ...
      else if(I.run_step("Une méthode avec des points d'arrêt")){
    
        if(I.must_stop_at(0)){
          // Première arrivée dans l'étape "Une méthode avec des points d'arrêt"
          specs("Cette étape de test utilise les points d'arrêt.")
          ... some stuff
          I.wait.for(
                  1,  // Attente de 1 seconde
                  1   // Suivre en passant au point d'arrêt 1
                  )
        }
    
        else if (I.must_stop_at( 1 )){
          // On passe ici après 1 seconde d'attente
          ... some stuff
          I.wait.for(3, 2 /* on passera au point d'arrêt 2 après 3 secondes */)
        }
    
        else if (I.must_stop_at( 2 )){
          // On passe ici après 3 secondes d'attente
          ... some stuff
          I.end_step  // On a fini les points d'arrêt, on passe à l'étape suivante
        }
      }
      else if ...
  
    }


##Note sur le résultat de la boucle d'attente

On peut parfois avoir besoin du résultat de la boucle d'attente. Ce résultat peut s'obtenir en interrogeant `Wait.resultat`.

Si la boucle s'est achevée correctement, c'est-à-dire sans attendre le temps limite, alors cette propriété `Wait.resultat` est TRUE. Sinon, elle est FALSE.