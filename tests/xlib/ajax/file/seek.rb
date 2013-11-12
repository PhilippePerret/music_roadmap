=begin

  Vérifie l'existence d'un fichier/dossier

=end

path = param( :path )
RETOUR_AJAX[:file_path]   = path
file_exists = File.exists?(param :path)
RETOUR_AJAX[:file_exists] = file_exists
if file_exists
  stats = File.stat(path)
  RETOUR_AJAX[:file_mtime]  = stats.mtime
  RETOUR_AJAX[:file_size]   = stats.size
end