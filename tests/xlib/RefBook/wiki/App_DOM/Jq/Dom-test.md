#Méthodes de test du DOM

##Quick list des méthodes

* [should.exist](#should_exist)
* [should.contain](#should_contain)
* [should = ](#should_egal)
* [should.be = ](#should_be_egal)
* [should.be.visible](#should_be_visible)
* [should.be.empty](#should_be_empty)
* [should.be.checked](#should_be_checked)
* [should.be.at](#should_be_at)
* [should.be.after](#should_be_after)
* [should.be.before](#should_be_before)
* [should.have.class](#should_have_class)
* [should.have.attr](#should_have_attr)
* [should.have.dimension](#should_have_dimension)

##Introduction
*Note : Contrairement aux [Méthode d'interrogation du DOM](./Interrogation-dom) qui ne font que retourner une valeur booléenne, ces méthodes de test produisent un échec ou un succès au cours du test.*

*Note : Toutes ces méthodes peuvent être “inversées” en utilisant `should_not` (“ne devrait pas”) au lieu de `should` (“devrait”).*

Dans les méthodes ci-dessous, le `<jQ>` désigne un élément DOM testable obtenu par :
  
    jq('<tag>[#|.]<identifiant ou class>')
  
*(Ou tout autre “désignant” jQuery)*

Par exemple :

    jq('div#mon_div').should.exist

##Méthodes `should` simples *(et `should_not`)*

<a name="should_exist"></a>
###`<jQ>.should.exist`
  
Produit un succès si l'objet `<jQ>` existe (même invisible). Une failure dans le cas contraire.

<a name="should_contain"></a>
###`<jQ>.should.contain(<value>)`
  
Produit un succès si `<jQ>` contient `<value>`. Un échec dans le cas contraire.
  
“Contenir” signifie deux choses différentes suivant qu'il s'agit d'un élément d'édition (un input text par exemple) ou d'un élément d'affichage normal (un DIV par exemple). Pour le premier, c'est la valeur (`value`) qui sera testée tandis que pour le second c'est le contenu HTML.

  
<a name="should_egal"></a>
###`<jQ>.should = <value>`
  
Raccourci de la méthode [`<jQ>.should.contain`](#should_contain).

Noter le `=` seul. Pas de `==`.


##Méthodes `should.be` *(et `should_not.be`)*

<a name="should_be_egal"></a>
###`<jQ>.should.be = <value>`
  
Raccourci de la méthode [`<jQ>.should.contain`](#should_contain).
  
Noter le `=` seul. Pas de `==`.

<a name="should_be_visible"></a>
###`<jQ>.should.be.visible`
  
Produit un succès si l'objet `<jQ>` est visible. Un échec dans le cas contraire.

Noter un point important&nbsp;: contrairement à la méthode `is(':visible')` de jQuery, cette méthode ne renvoie TRUE que si l'objet est véritablement visible. Quand bien même il prendrait une place dans le DOM, la méthode ne renverra TRUE que si `visibility` est `visible`.


<a name="should_be_empty"></a>
###`<jQ>.should.be.empty`
  
Produit un succès si l'objet `<jQ>` est vide. Un échec dans le cas contraire.
  
Note : Un objet est considéré vide lorsqu'il n'a pas de valeur, si c'est un élément de formulaire , ou s'il ne contient aucun code si c'est un autre élément.


<a name="should_be_checked"></a>
###`<jQ>.should.be.checked`
  
Produit un succès si l'objet `<jQ>` est coché (checkbox ou radio).
  
<a name="should_be_at"></a>
###`<jQ>.should.be.at(x, y, tol_x, to_y)`
  
Produit un succès si l'objet DOM `<jQ>` se trouve à la position x (abcisse) et y (ordonnée) avec une tolérance de `tol_x` pour l'abcisse et `tol_y` pour l'ordonnée.
  
Toutes les valeurs sont optionnelles. Un appel sans argument produit un succès et retourne dans le message la position de l'élément.
  
Exemple pour vérifier seulement la position verticale :

    jq('div#mon_div').should.be.at(null, 120)
    // => Produit un succès si l'objet se trouve verticalement à 120 (± 2)

Exemple pour vérifier seulement la position horizontale :

    jq('div#mondiv').should.be.at(56, null, 10)
    // => Produit un succès si l'objet se trouve horizontalement entre 46 et 66.
  
  
<a name="should_be_after"></a>
###`<jQ>.should.be.after(<autrejQ>)`

Produit un succès si l'objet `<jQ>` se trouve après l'objet `<autrejQ>`. Un échec dans le cas contraire.

<a name="should_be_before"></a>
###`<jQ>.should.be.before(<autrejQ>)`

Produit un succès si l'objet `<jQ>` se trouve avant l'objet `<autrejQ>`. Un échec dans le cas contraire.



##Méthodes `should.have` *(et `should_not.have`)*

<a name="should_have_class"></a>
###`<jQ>.should.have.class(<classe>)`

Produit un succès si l'objet `<jQ>` possède la class `<classe>`. Un échec dans le cas contraire.

<a name="should_have_attr"></a>
###`<jQ>.should.have.attr(<attr>,[<valeur>])`

Produit un succès si l'objet `<jQ>` possède l'attribut `<attr>`. Si `<valeur>` est fourni, cet attribut doit en plus avoir la valeur donnée. Un échec est produit dans le cas contraire.
  
Exemples :

    jq('div#mon_div').should.have.attr('id')
    // => succès car le div contient l'attribut 'id'

    jq('div#mon_div').should.have.attr('id', 'mon_div')
    // => succès car le div contient l'attribut 'id' et il a bien la valeur 'mon_div'

    jq('div#mon_div').should_not.have.attr('badattr')
    // => succès si le div ne contient pas l'attribut 'badattr'

    jq('div#mon_div').should_not.have.attr('badattr', 'valeur de bad')
    // => succès si le div ne contient pas l'attribut 'badattr'
    //    Ou si sa valeur est différente de 'valeur de bad'

<a name="should_have_dimension"></a>
###`<jQ>.should.have.dimension(w, h, tol_w, to_h)`
  
Produit un succès si l'objet `<jQ>` fait bien les dimensions spécifiées, avec les tolérances spécifiées. Produit un échec dans le cas contraire.
  
Arguments :

        w   Largeur attendue (ou NULL/UNDEFINED)
        h   Hauteur attendue (ou NULL/UNDEFINED)
    tol_w   Tolérance admise en largeur. L'objet pourra faire la largeur
            attendu + ou - la tolérance.
            Par défaut, la tolérance est de 2
    tol_h   Tolérance admise en hauteur. L'objet pourra faire la hauteur attendue + ou -
            la tolérance donnée.
            Par défaut, la tolérance est égale à la tolérance en largeur.

