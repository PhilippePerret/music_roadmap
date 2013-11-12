# Pré-requis et précautions

##Pré-requis

* L'application à tester (donc le dossier de tests) doit se trouver dans un dossier de site où PHP est activé.

* Ruby doit être installé. Tout au moins si des scripts Ajax ruby sont à utiliser.

##Précautions

###Pas de méthode `window.jq`

L'application à tester ne doit pas définir la méthode `window.jq` si des formules telles que la suivante doivent être employées dans les tests :

		'jq("div#mon_div").exist'.should.be.true

Noter que de telles formules ne devraient être utiles que pour tester l'application, puisque dans une tournure de test normale, pour faire ce test, on utiliserait :

		jq("div#mon_div").should.exist