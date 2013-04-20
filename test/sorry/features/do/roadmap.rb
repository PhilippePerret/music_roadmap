when /Détruire la roadmap #{STRING} si elle existe/
  nom_umail = $1
  path    = File.join(FOLDER_ROADMAP, nom_umail)
  FileUtils::rm_rf path if File.exists? path
end