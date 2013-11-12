# Conception des scripts de test

## Emplacement

Les scripts de test doivent être placés dans `./tests/user_tests/`, soit à la racine, soit dans un dossier.

## Lancement d'un test

* Charger l'application de test en invoquant la méthode `tests()` (si elle a été définie comme l'explique le manuel).
* Dans le champ `Fichier test`, indiquer le path relatif à partir de `./tests/user_tests/`(le nom seul si le script se trouve à la racine).
* Cliquer sur le bouton `LANCER LE TEST`.

Noter que puisque ce test sera chargé à la volée, on peut le modifier sans avoir à recharger l'application.


## Rédiger un test simple

Un «&nbsp;test simple&nbsp;» est un test qui n'utilise pas de formules d'attente. Il est simplement composé d'une suite d'instructions et de tests qui sont exécutés successivement et renvoient un résultat.

Dans sa forme la plus simple, on peut imaginer que l'application testée possède :

* Un window.name (réglé à "Le nom de mon application")
* Un objet `MonObjet`
* Une liste `MaListe` (Array, mais défini comme un Object)
* Une fonction `MaFunction`

On veut tester l'existence de ces trois éléments. Le script de test aura juste à contenir ces lignes de test :

    "name".should.be.equal_to("Le nom de mon application")
    "MonObjet".should.be.defined
    "MonObjet".should.be.an_object
    "MaFunction".should.be.defined
    "MaFunction".should.be.a_function
    "MaListe".should.be.an_array
    "Maliste".should_not.be.an_object

Noter que les premiers membres sont des strings. Ils seront toujours évalués dans les méthodes de test, ils doivent être obligatoirement des strings.

Noter que ces variables seront cherchées dans l'application testée. Ainsi, lorsqu'on écrit `name`, en vérité, c'est `APP.name` qui sera évalué, `APP` étant l'application testée elle-même. Pour être tout à fait exact, c'est même `APP.window.name` qui sera évalué.

##Écriture du fichier

Pour essayer ce script, on crée donc un fichier `premier_test.js` dans le dossier :

    <app>/tests/user_tests/

Dans ce fichier, on écrit :

```javascript

function premier_test(){ // Le nom de la fonction reprend le nom du fichier
  
  I = premier_test // raccourci pratique
  
  if(undefined == APP.MonObjet){
    // On peut définir les valeurs de l'application à la volée
    APP.name = "Le nom de mon application"
    APP.MonObjet = {un: "objet"}
    APP.MaFunction = function(){return false}
    APP.MaListe = [4, 3, 2, 1]
  }
  
  // -- Tests --
  "name".should.be.equal_to("Le nom de mon application")
  "MonObjet".should.be.defined
  "MonObjet".should.be.an_object
  "MaFunction".should.be.defined
  "MaFunction".should.be.a_function
  "MaListe".should.be.an_array
  "Maliste".should_not.be.an_object
  
  I.end

}

```