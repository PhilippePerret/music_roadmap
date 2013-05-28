proprio='www' # Pour l'utilisation normale
# proprio='philippeperret' # pour les tests

echo "Propriétaire et permission de tous les éléments de user/doc mis à $proprio et 0777"
# On boucle sur tous les dossiers/fichiers du dossier user
# cd /Users/philippeperret/Sites/cgi-bin/brins/user/doc
# cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/
# cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/javascript/
# cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/user
# cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/user/roadmap
# cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/user/data
cd /Users/philippeperret/Sites/cgi-bin/music_roadmap/data/db_exercices/piano/heller
find . |
while read line; do
  if [[ "$line" == *git* ]]; then
    continue
  fi

  # Passer les fichiers Marshal
  if [[ "$line" == *msh ]]; then
    continue
  fi
  
  echo "$line"
  sudo chown "$proprio" "$line"
  sudo chmod 0777 "$line"
done
cd ./roadmap
ls -l
