when /Détruire (?:le nouvel |l')exercice(?: #{STRING})?/ then
  # Procède à la destruction complète d'un exercice de la roadmap
  # courante.
  # 
  # Si STRING est fourni, c'est l'identifiant de l'exercice entre guillements.
  # Sinon, l'identifiant est pris dans @data_exercice qui doit être défini.
  # 
  # @note: On passe par javascript et la méthode `Exercices.delete` pour
  # procéder à cette suppression, afin d'être certain de bien tout détruire.
  # 
  # --
  id  = $1
  rm  = get_current_roadmap
  dex = get_data_exercice id
  id  = id || dex[:id] || dex[:exercice_id]
  pex = rm.path_exercice(id)
  File pex should exist
  "Exercices.delete('#{id}',destroy=true)".js
  Browser wait_while{ "Exercices.deleting".js }
  File pex should not exist