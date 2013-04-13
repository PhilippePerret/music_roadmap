
# Retourne les données de l'exercice d'ID +id+ dans la roadmap +rm+
# @param  rm    Instance Roadmap de la feuille de route
# @param  id    Identifiant de l'exercice
def data_exercice_in_file rm, id
  path = rm.path_exercice(id)
  raise "Exercice introuvable" unless File.exists? path
  JSON.parse(File.read(path))
end