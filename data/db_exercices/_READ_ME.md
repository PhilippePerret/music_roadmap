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

# Extrait (pour affichage dans database par exemple)

- Ouvrir le pdf qui contient la partition dans Gimp
- Choisir la page qui contient le début de l'extrait
- Rogner au maximum
- Régler la taille du canevas à 500 x 300 (pixels) (Image > Taille du canevas)
- Modifier l'échelle de l'image pour que le début tienne dans l'image (MAJ + T)
- Exporter au format .jpg en qualité 60
  En nommant l'image "<id image>-extrait.jpg"
- Placer l'image à côté de son fichier data
  (puis passer à la fabrication de la vignette)
- On peut fermer sans enregistrer

# Vignette

- Ouvrir le fichier extrait (<id ex>-extrait.jpg) dans Gimp
- Régler la taille du canevas à 200 x 100 (pixels)
- Placer l'extrait pour voir le début (MAJ + M)
- Exporter l'image avec le nom "<id exercice>-vignette.jpg"
- On peut fermer sans enregistrer