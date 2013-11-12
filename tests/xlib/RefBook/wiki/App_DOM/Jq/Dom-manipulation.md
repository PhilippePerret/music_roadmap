# Manipulation du DOM

##Quick accès aux méthodes

**Méthodes d'information**

* [&lt;jQ&gt;.obj_dom](#obj_dom)
* [&lt;jQ&gt;.obj](#obj)
* [&lt;jQ&gt;.tagname](#tagname)
* [&lt;jQ&gt;.content](#content)
* [&lt;jQ&gt;.val](#val_sans_arg)

**Méthodes de manipulation**

* [&lt;jQ&gt;.content](#content)
* [&lt;jQ&gt;.val](#val)
* [&lt;jQ&gt;.click](#click)
* [&lt;jQ&gt;.press_and_drag](#press_and_drag)


##Définition d'un objet `jQ`

Pour définir un objet `jQ` qui sera manipulable et interrogeable par Pure-Javascript-Tests, il suffit de faire :

    var monjq = jq(<jId>);
  
Où `<jId>` est un “identifiant jQuery” de la forme :
  
    <tag>[#|.]<class ou identifiant>
    // Ou tout autre spécification reconnue par jQuery.
  
Par exemple :

    var monjq = jq('div#mon_div_dans_lapplication_tested');

##Méthodes de manipulation

<a name="content"></a>
###`<jQ>.content = <valeur>`
  
Définit le contenu d'un élément. L'assignation fonctionne différemment suivant le type de l'élément. Pour un champ de saisie, règle la valeur `value`, pour un objet DOM de contenu tel qu'un DIV ou un SPAN, règle le contenu HTML, pour un bouton (`button` ou `input[type="button"]`), règle le nom du bouton.

<a name="val"></a>
###`<jQ>.val()`
  
Raccourci pour `<jQ>.obj.val()`. Sans argument, retourne la valeur de `<jQ>`, avec un argument, la définit. Contrairement à [jQ.content](#content), cette méthode ne fonctionne qu'avec l'attribut `value` de l'élément du DOM.
  
<a name="click"></a>
###`<jQ>.click`
  
Simule un clic sur l'élément `<jQ>` (que ce soit un bouton, un lien ou tout autre type d'élément).
  
Retourne TRUE si le click a pu se faire (élément existant), FALSE dans le cas contraire.

<a name="press_and_drag"></a>
###`<jQ>.press_and_drag(<data>)`
  
Simule une souris pressée sur un élément `<jQ>` (draggable) et son déplacement jusqu'au relâché de la souris.

`<data>` est un hash (Object) pouvant contenir ces propriétés (au choix) :
  

    {
  
      // --- Par définition d'un objet sur/sous lequel se placer ---
      to_obj:   <objet DOM>     Déplace <jQ> jusqu'au centre de cet objet
      offx_obj:   n             Décale de n pixels sur l'axe horizontal par rapport au centre
                                de l'objet +to_obj+
      offy_obj:   n             Décale de n pixels sur l'axe vertical par rapport au centre

      // --- Et/ou par définition des coordonnées exactes d'arrivée (dans le conteneur) ---
      to_x      : n             Se place à l'abcisse  n pixels (axe horizontal)
      to_y      : n             Se place à l'ordonnée n pixels (axe vertical)
  
      // --- Et/ou par définition de l'ampleur du déplacement ---
      for_x     : n             Se déplace de n pixels sur l'axe horizontal
      for_y     : n             Se déplace de n pixels sur l'axe vertical

    }


Les données s'analysent du haut vers le bas, c'est donc la donnée la plus basse qui l'emportera sur les autres.

Par exemple, si un objet est défini (`to_obj`), on partira du principe qu'on doit rejoindre son centre. Mais si `data` définit `to_x`, alors c'est cette coordonnée qui sera prise en considération, au détriment de `to_obj` (idéal pour les alignements). Si enfin `data` définit `for_y`, alors c'est un déplacement de `for_y` pixels sur l'axe vertical qui sera effectué, au détriment de la position de l'objet (dans un tel cas, l'objet `to_obj` ne sert à rien).

Exemple d'utilisation dans les tests :

```javascript

monJq = jq('div#un_dom_draggable')

// On vérifie sa position actuelle
monJq.should.be.at(200, 100)

// On le déplace
monJq.press_and_drag({to_x: 400, for_y:140})

// On vérifie les nouvelles coordonnées
monJq.should.be.at(400, 240)

// Et les effets afférents…
// Comme l'insertion dans une liste, etc.

```

##Méthodes d'information


Ces méthodes obtiennent une information sur l'élément du DOM.

<a name="obj_dom"></a>
###`<jQ>.obj_dom`
  
Retourne le véritable élément DOM, donc pas un objet jQuery.

Retourne UNDEFINED si l'élément n'existe pas dans le DOM.

Par exemple, si `<jQ>` est une case à cocher, on peut la régler avec assurance (ce qui est loin d'être le cas avec jQuery s'il se trouve un `checked="CHECKED"` dans la balise) :
  
    var macb = jq('input[type="checkbox"]#ma_case_a_cocher');
    
    // Coche vraiment le checkbox
    macb.obj_dom.checked;

<a name="obj"></a>
###`<jQ>.obj`

Récupère l'énumérateur jQuery de `<jQ>`. Peut être ensuite manipuler comme n'importe quel élément jQuery.

Par exemple :

    var monjq = jq('div#mon_div_in_tested_app');
    
    // Masque l'objet
    monjq.obj.hide();
    
    // Définit le contenu de l'objet
    monjq.obj.html("À mettre dans le div de l'application testée.");
    
    etc.
    
<a name="tagname"></a>
###`<jQ>.tagName`
  
Retourne le tagname de l'objet `<jQ>`.
  
Par exemple :

    var monmenu = jq('select#mon_menu');
    
    w("Mon menu a une balise "+monmenu.tagName)
    // Va écrire à l'écran : "Mon menu a une balise SELECT"
    
  
<a name="content"></a>
###`<jQ>.content`
  
Retourne le contenu de `<jQ>`. Si c'est un objet contenant une `value` (un champ de saisie, un menu, etc.) la méthode retourne la valeur de cet objet. Dans le cas contraire, la méthode retourne le contenu HTML.
  
Retourne exactement la valeur NULL si l'élément n'existe pas.

Exemple :

Soit le code HTML dans la page :

    <div id="mon_div">Ceci est un texte dans un div</div>
    <select id="mon_menu">
      <option value="option1">La première valeur</option>
      <option value="option2" selected="SELECTED">La deuxième valeur</option>
    </select>

En imaginant que le menu n'ait pas été touché, on aura :


    mondiv = jq('div#mon_div');
    monmenu = jq('select#mon_menu');

    db("Le div contient "+mondiv.content)
    // Produira à l'écran : “Le div contient Ceci est un texte dans un div”
    db("Le menu contient "+monmenu.content)
    // Produira à l'écran : “Le menu contient option2”


<a name="val_sans_arg"></a>
###`<jQ>.val()`
  
Raccourci pour `<jQ>.obj.val()`. Sans argument, retourne la valeur de `<jQ>`.
  