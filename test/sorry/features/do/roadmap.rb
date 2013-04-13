when /Détruire la roadmap #{STRING} si elle existe/
  nom_mdp = $1
  path    = File.join(FOLDER_ROADMAP, nom_mdp)
  FileUtils::rm_rf path if File.exists? path
end