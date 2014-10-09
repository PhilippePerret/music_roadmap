#Pour passer du mode développement au mode production

Une fois que tous les tests passent, on peut actualiser le site. Il suffit de :

* modifier la valeur de `:dis_root` dans le fichier `./data/secret/rftp_data` (ATTENTION : pas `data_rftp` qui sert pour CMD+U)&nbsp;;
* Lancer RFtp à l'aide du script `rftp.sh` de ce dossier.

**Remettre le :dis_root à la valeur de développement après l'opération.**

##Rappel

En mode développement, c'est l'application se trouvant dans le dossier `development` (en online) qui est utilisé.

Tous les tests d'intégration et d'acceptance sont exécutés en ONLINE.