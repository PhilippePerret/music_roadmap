#Méthode d'interrogation : `contains`/`not_contains`

Renvoie TRUE si le premier membre contient la valeur donnée en argument, en fonction de son type.

Pour un string, le texte donné en argument doit être contenu dans la chaine string. Pour un pur Array, la valeur doit être contenu dans la liste. Pour un Object, la valeur doit exister en tant que clé si seul un string est envoyé, sinon, si un `{key => value}` est donné en argument, cherche cette valeur exacte dans le tableau.

##Syntaxe

		"<something from APP>".contains(<valeur>[, <strict>])

`<strict>` est utile pour les chaines, pour déterminer si la comparaison doit être entière (chaine == comparaison) ou si la comparaison doit simplement appartenir à la chaine (chaine.indexOf(comparaison) > -1). Notez qu'il est préférable, pour le premier cas, d'utiliser :
	
		"<ma string>".is.eq(<valeur comparaison>)
	
	
##Exemples

Soit une variable `mon_string` dans l'application :

mon_string = "Ma chaine application"

Alors :

'mon_string'.contains("application") //