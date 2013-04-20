when /Détruire les exercices créés après #{STRING}$/ then
  # Détruit tous les exercices créés après le time stamp fourni.
  # 
  # @usage: Par exemple : placer avant, dans un Before all: `Do $depart = Time.now.to_i`
  #         puis `Détruire les exercices créés après "$depart"`
  #         @note: bien le mettre entre guillemets
  # --
  from = eval($1).to_i
  raise "Le temps ne peut être inférieur à l'heure" if from < Time.now.to_i - 3600
  rm  = get_current_roadmap
  Dir["#{rm.folder_exercices}/*.js"].each do |path|
    id = File.basename(path, File.extname(path))
    next if File.stat(path).mtime.to_i < from
    next if "'undefined' == typeof EXERCICES['#{id}']".js
    "Exercices.delete('#{id}',destroy=true)".js
    Browser wait_while{ "Exercices.deleting".js }
  end
  
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