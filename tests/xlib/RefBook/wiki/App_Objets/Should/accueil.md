# Fonction de test `should` / `should_not`

##Un point capital

Il est capital de comprendre deux ou trois choses à propos de l'utilisation de ces méthodes de test :

* Le premier membre est obligatoirement un string. Si l'on doit tester la méthode `ma_methode` de l'objet `MonObjet` de l'application à tester, l'argument sera OBLIGATOIREMENT `"MonObjet.ma_methode"` (avec guillemets doubles ou simples).
* Il ne faut pas ajouter `window.` devant les objets. Ce préfixe sera systématiquement ajouté au cours de l'évaluation&nbsp;;
* Tous les tests se font dans l'application elle-même, pas dans Pure-Js-Tests. Donc si des propriétés de PJsT sont à évaluer avec ces méthodes, il faut obligatoirement les passer à l'application au préalable (à l'aide de la tournure `APP.<ma variable> = <valeur>;`).
* Les méthodes de test sans argument ne comportent jamais de parenthèses :

      "MonObjet.ma_property".should_not.be.null
  
Des parenthèses ne sont à utiliser que lorsqu'il y a des valeurs à passer :
  
      "MonObjet.ma_property".should.be.greater_than_or_equal_to(10)

* Les tests d'égalité se font avec un seul `=`, pas deux&nbsp;:

      "MonObjet.property".should = "Cette valeur"
      // => produit un succès si la valeur de `MonObjet.property` est "Cette valeur"
      // => produit un échec dans le cas contraire
      

##Liste des méthodes

*Noter que toutes ces méthodes peuvent être “inversées” en utilisant `should_not` au lieu de `should`.*

###`"<foo>".should = <valeur>`
  
Produit un succès si `<foo>` a la valeur `<valeur`. C'est un raccourci de `"<foo>".should.be.equal_to(<valeur>)`.

###`"<objet>".should.respond_to("<method>")`

Génère un succès si `method` est bien une méthode de `objet`. Un échec dans le cas contraire.

###`"<method>[(<args>)]".should.return(<expected value>)` 

Produit un succès si l'appel à la méthode `method` (avec optionnellement les arguments `args`) retourne la valeur `expected`. Un échec dans le cas contraire.

Remarque : si la méthode doit être appelée sans argument, les parenthèses peuvent être omises (elles sont rajoutées par la méthode de test.). Par exemple :

    "Film.titre".should.return("Le titre du film");

… sera transformé en :

    "Film.titre()".should.return("Le titre du film");
    
Donc comprendre que cette méthode de test ne concerne QUE les fonctions, pas les propriétés, même les propriétés complexes.

###`should.be.<something>...`

Permet de vérifier qu'une soit “comparable” à une autre.

####`"<foo>".should.be = <valeur>`
  
Produit un succès si `<foo>` a la valeur `<valeur>`.

####`"<foo>".should.be.equal(<compare>[, <strict>])`
  
Produit un succès si `<foo>` est égal à `<compare>` (égalité simple, sauf si `<strict>` est true, dans lequel cas il faut une égalité parfaite).
  
Noter la tournure raccourci bien plus rapide :

    `"<foo>".should = <compare>`

… ou :

    `"<foo>".should.be = <compare>`

  
####`"<foo>".should.be.true`
  
Produit un succès si `<foo>` est true. Un échec dans le cas contraire.

####`"<foo>".should.be.false`

Produit un succès si `<foo>` est false. Un échec dans le cas contraire.

####`"<foo>".should.be.null`

Produit un succès si `<foo>` est null. Un échec dans le cas contraire.
  
####`"<foo>".should.be.defined`

Produit un succès si `<foo>` est défini. Un échec dans le cas contraire.

####`"<foo>".should.be.undefined`

Produit un succès si `<foo>` est indéfini. Un échec dans le cas contraire.

####`"<foo>".should.be.greater_than(<comp>)`

Produit un succès si `<foo>` est plus grand que `<comp>`. Un échec dans le cas contraire.

####`"<foo>".should.be.less_than(<comp>)`

Produit un succès si `<foo>` est plus petit que `<comp>`. Un échec dans le cas contraire.
  
####`"<foo>".should.be.between(<min>, <max>[, <strict>])`
  
Produit un succès si `<foo>` est entre `<min>` et `<max>`. Si `<strict>` est TRUE (FALSE par défaut), `<foo>` doit être *strictement* entre ces deux valeurs. Sinon, elle peut être égale à l'une des deux.
  
```javascript

APP.valeur_a_tester = 12

'valeur_a_tester'.should.be.between(11, 13)         // => true
'valeur_a_tester'.should.be.between(11, 12)         // => true
'valeur_a_tester'.should.be.between(11, 12, true)   // => false

```
  
####`"<foo>".should.be.a_string`

Produit un succès si `<foo>` est une chaine de caractère. Un échec dans le cas contraire.

####`"<foo>".should.be.a_number`

Produit un succès si `<foo>` est un nombre. Un échec dans le cas contraire.

####`"<foo>".should.be.an_array`

Produit un succès si `<foo>` est une liste. Un échec dans le cas contraire.

Attention : dans cette méthode, et contrairement à javascript quand une liste est définie sans passer par le construction `Array`, on fait la distinction entre une liste et un objet (hash, tableau associatif). 

Donc :

    APP.un_hash = {mon:"Mon", obj:"Objet"};
    APP.une_liste = [1, 11, 111];
    'un_hash'.should.be.an_array;     // => Failure
    'une_liste'.should.be.an_object;  // => Failure
    'un_hash'.should.be.an_object;    // => Succès
    'une_liste'.should.be.an_array;   // => Succès

####`"<foo>".should.be.an_object`

Produit un succès si `<foo>` est un objet. Un échec dans le cas contraire.

Lire la note à propos de `an_array` ci-dessus.

####`<foo>".should.be.a_function`

Produit un succès si `<foo>` est une fonction/méthode. Un échec dans le cas contraire.



