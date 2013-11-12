# Méthodes d'interrogation `is` et `is_not`


##`'<var>'.is.eq(<valeur>[, <strict>])`
	
Raccourci pour [`is.equal_to`](#is_equal_to).

<a name="is_equal_to"></a>
##`'<var>'.is.equal_to(<valeur>[, <strict>])`
	
Retourne true si la valeur de `<var>` dans l'application est égale à `<valeur>`. Si `<strict>` est true (false par défaut), il faut que les deux valeurs soient strictement identiques.
	
Par exemple :

Soit `ma_variable` une variable définie dans l'application par :

		window.ma_variable = "Valeur de ma variable"

Alors :

		'ma_variable'.is.equal_to("Valeur de ma variable") // => true
		'ma_variable'.is.equal_to("Une autre valeur") // => false

Noter que dans le cas où une propriété (ou autre) doit être interrogée, il peut être plus rapide de définir une variable dans le test renvoyant à cette propriété (ou autre). Dans ce cas, cette variable testée doit être un string, de la même façon :

		ref_var_app = 'ma_variable'
		ref_var_app.is.equal_to("Valeur de ma variable") // => true
		ref_var_app.is.equal_to("Une autre valeur") // => false

L'avantage de cette tournure est qu'une nouvelle instance d'une référence à la propriété (ou autre) de l'application n'est pas à chaque fois instancié.

##`'<var>'.is.true`
		
Retourne True si la variable ou la propriété `<var>` de l'application est true.
		
Exemple :
		
		APP.MonObjet.proprio = true
		'MonObjet.proprio'.is.true // => true
		APP.MonObjet.proprio = 1
		'MonObjet.proprio'.is.true // => false
		
##`'<var>'.is.false`
		
Retourne True si la variable ou la propriété `<var>` de l'application est FALSE.
		
##`'<var>'.is.null`
		
Retourne True si `<var>` est null.
		
##`'<var>'.is.defined`
		
Retourne True si `<var>` est définie.
		
##`'<var>'.is.undefined`
		
Retourne True si `<var>` est indéfinie.
		
## Interrogation du type

###`'<var>'.is.a_number`
	
Retourne True si `<var>` est de type nombre.

###`'<var>'.is.a_string`
	
Retourne True si `<var>` est de type string (chaine de caractères).
	
Exemple :
	
		APP.mavar = "Une chaine"
		'mavar'.is.a_string      // => true
		APP.mavar = 12
		'mavar'.is.a_string     // => false
		'mavar'.is_not.a_string // => true
	
###`'<var>'.is.an_object`
	
Retourne True si `<var>` est de type object.
	
Exemple : 
	
		APP.mavar = {un:"object"}
		'mavar'.is.an_object // => True
		APP.mavar = [1, 2, 12]
		'mavar'.is.an_object // => False (c'est un 'array', dans PureJsTests)

###`'<var>'.is.an_array`
	
Retourne True si `<var>` est une liste.
	
Exemple :
	
		APP.mavar = [4, 3, 3, 1]
		'mavar'.is.an_array // => true

###`'<var>'.is.a_function`
	
Retourne True si `<var>` est une fonction ou une méthode.
	
Exemple :
	
		APP.mavar = function(){return true}
		'mavar'.is.a_function // => true
	
###`'<var>'.is.a_boolean`
	
Retourne True si `<var>` est un booléen.
	
Exemple :
	
		APP.mavar = true
		'mavar'.is.a_boolean // => true
		APP.mavar = 1
		'mavar'.is.a_boolean // => false (`mavar` est un nomber)
