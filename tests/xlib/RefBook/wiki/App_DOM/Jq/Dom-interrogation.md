# Méthode d'interrogation du DOM

*Note : Contrairement aux [Méthodes de tests du DOM](./Test-dom) qui produisent un échec ou un succès, ces méthodes d'interrogation ne font que retourner une valeur booléenne.*

Pour la définition des objets `<jQ>`, cf. la page [Manipulation du DOM](./Manipulation-dom).
	
##Liste des méthodes

###`<jQ>.exists`
	
Retourne TRUE si l'objet `<jQ>` existe dans le DOM. FALSE dans le cas contraire.
	
*Note : Comme précisé en haut de page, ce test ne produit aucun succès ni aucune failure. Pour produire un résultat de test, il faut utiliser les [Méthodes de tests du DOM](./Test-dom), par exemple ici `<jQ>.should.exist`.*

<a name="is_visible"></a>
###`<jQ>.is.visible`

Retourne TRUE si l'objet `<jQ>` est visible dans la page.
		
Noter un point important&nbsp;: contrairement à la méthode `is(':visible')` de jQuery, cette méthode ne renvoie TRUE que si l'objet est véritablement visible. Quand bien même il prendrait une place dans le DOM, la méthode ne renverra TRUE que si `visibility` est `visible`.

Pour un contrôle “à la jQuery”, utiliser simplement `<jQ>.obj.is(':visible')`.
	
###`<jQ>.is.hidden`
	
Retourne TRUE si l'objet `<jQ>` est masqué dans la page ou n'existe pas.
	
Même remarque pour [is.visible](#is_visible) ci-dessus.

###`<jQ>.is.checked`
	
Retourne TRUE si `<jQ>`, une case à cocher (input[type="checkbox"]) ou un bouton radio (input[type="radio"]) est coché. False dans le cas contraire.
	
Retourne UNDEFINED si l'élément n'existe pas.

###`<jQ>.is.after(<jId>)`
	
Retourne TRUE si l'objet `<jQ>` se trouve après l'élément DOM d'identifiant jQuery `<jId>`.
	
Noter qu'on peut aussi fournir un autre objet `jq` à la méthode. Donc les deux formules ci-dessous sont équivalentes :

		monjq 	= jq('div#le_premier_element')
		jqapres	= jq('div#le_second_element')

		jqapres.is.after('div#le_premier_element') // => true
		jqapres.is.after(monjq) // => true

###`<jQ>.is.before(<jId>)`
	
Retourne TRUE si `<jQ>` se trouve avant `<jId>` qui peut être soit un autre objet `<jQ>` soit un identifiant jQuery.
	
Exemple :

		monjq 	= jq('div#le_premier_element')
		jqapres	= jq('div#le_second_element')

		jqapres.is_not.before('div#le_premier_element') // => true
		jqapres.is_not.after(monjq) // => true

###`<jQ>.contains(<code>)`
	
Renvoie TRUE si l'élément `<jQ>` contient le code ou la valeur `<code>`.
	
Par exemple pour tester le contenu d'un input de type `text` :

		jq('input#mon_titre).contains("Le beau titre")
		// Retourne TRUE si "Le beau titre" se trouve dans le champ `input#mon_titre`

Pour tester de le contenu d'un DIV :

Soit dans la page de l'application le div :

		<div id="mon_div">
			Il contient ce texte
		</div>	

Alors le test :

		jq('div#mon_div').contains("contient ce te") // => true

Noter à nouveau qu'il s'agit de méthodes *d'interrogation*, pas des méthodes *de test*, donc elles renvoient simplement une valeur booléenne mais ne produise aucun résultat de test (succès ou échec). Pour produire un résultat, utiliser les mêmes méthodes mais avec `should` ou `should_not`.

		jq('div#mon_div').should.contain("contient ce te") // => un succès
		

###`<jQ>.not_contains(<valeur>)`
	
Retourne TRUE si `<jQ>` ne contient pas la valeur `<value>`. Comme pour la méthode d'interrogation `contains`, le contenu checké est différent en fonction du type de l'élément DOM. C'est le contenu HTML pour un élément de type DIV ou SPAN, c'est la valeur pour un champ de saisie ou le menu pour un SELECT, etc.
	
###`<jQ>.contains_element(<jId>)`
	
Return TRUE si `<jQ>` contient l'objet défini par `<jId>`.
	
Avec `<jId>` qui peut être soit un énumérateur jQuery, un identifiant jQuery (p.e. "div#monDiv") ou un objet jQ (défini par `jq(<jId>)`).
	
Note : Ne pas confondre avec la méthode `contains` qui interroge le contenu HTML (en temps que String) ou la valeur d'un élément.

###`<jQ>.is.contained_by(<jId>)`

Returne TRUE si le parent direct de `<jQ>` est `<jId>`.
	
Avec `<jId>` qui peut être soit un énumérateur jQuery, un identifiant jQuery (p.e. "div#monDiv") ou un objet jQ (défini par `jq(<jId>)`).
	