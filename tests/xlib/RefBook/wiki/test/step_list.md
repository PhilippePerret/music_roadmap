# Liste des étapes de test

[TODO: À documenter]

##Définir l'ordre des étapes

Noter une chose importante : l'ordre des étapes ne respectent pas l'ordre de IF / ELSE IF défini dans la [Fonction Principale de Test](./wiki/Fonction-principale-test). C'est l'ordre défini dans la `step_list` de cette fonction qui sera suivie. Donc il suffit de modifier l'ordre des étapes dans cette liste pour modifier l'ordre des étapes de test sans avoir à modifier le script.

Par exemple :

		function ma_fpt()

			var my = this.ma_fpt

			// Définition de l'ordre des étapes qui sera jouée :
			if(undefined == my.step_list){
				my.set_step_list([
					
				// C'est seulement cet ordre qui importe
				"Première étape",
				"Troisième étape",		// Sera jouée avant la deuxième
				"Deuxième étape"
	
				])
			}
	
			my.next_step()
	
			if(my.step_is("Première étape")){
				...
				return my.proxy()
			}
			else if(my.step_is("Deuxième étape")){
				// Cette étape sera jouée en dernier
				...
				return my.proxy()
			}
			else if(my.step_is("Troisième étape)){
				// Cette étape sera jouée en deuxième, même si elle est définie en dernier
				...
				return my.proxy()
			}
			else my.end
		}