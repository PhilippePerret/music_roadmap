READ ME DATABASE EXERCICES
===========================


# Actualisation de la variable javascript DB_EXERCICES

Pour le moment, on force l'actualisation en supprimer le fichier :

    music_roadmap/javascript/locale/fr/db_exercices.js

… et en rechargeant la page de music roadmap


# Liste des types d'exercices

On la trouve définie dans le fichier :


    music_roadmap/javascript/locale/fr/constants.js

# Fabrication des images

@note: Un script peut être lancé, qui indique les choses à faire :
Se placer dans le dossier de Music Roadmap :

    $ cd ~/Sites/cgi-bin/music_roadmap

lancez la commande :

    $ ruby utils/score/make.rb

Si le temps devient trop long, on peut ajouter la durée de pause au bout (20 secondes
par défaut, ce qui est bien pour commencer) :

    $ ruby utils/score/make.rb 15


# Extrait (pour affichage dans database par exemple)

- Ouvrir le pdf qui contient la partition dans Gimp
- Choisir la page qui contient le début de l'extrait
- Rogner au maximum (MAJ + C)
- Régler la taille du canevas à 500 x 300 (pixels) (Image > Taille du canevas)
- Modifier l'échelle de l'image pour que le début tienne dans l'image (MAJ + T)
- Exporter au format .jpg en qualité 60
  En nommant l'image "<id image>-extrait.jpg"
- Placer l'image à côté de son fichier data
  (puis passer à la fabrication de la vignette)
- On peut fermer sans enregistrer

# Vignette

- Ouvrir le fichier extrait (<id ex>-extrait.jpg) dans Gimp
- Régler la taille du canevas à 200 x 100 (pixels) (Image > Taille du canevas)
- Placer l'extrait pour voir le début (touche M)
- Exporter l'image avec le nom "<id exercice>-vignette.jpg"
- On peut fermer sans enregistrer

## Actualisation online

Une fois les fichiers préparés, on peut les updater online en lançant la commande :

    $ rftp sync