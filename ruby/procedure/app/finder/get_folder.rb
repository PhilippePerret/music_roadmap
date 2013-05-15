=begin
  Retourne la liste des dossiers ou fichiers du dossier 'folder'
  où 'folder' doit être un chemin relatif depuis la racine de l'application
  Retourne la liste (seulement les noms) dans RETOUR_AJAX['folder_list']
=end

def ajax_app_finder_get_folder
  # RETOUR_AJAX[:error]="ICI"
  folder = File.expand_path(File.join(APP_FOLDER, param(:folder)))
  only_folders = param(:only_folders) == "true"
  liste = []
  Dir["#{folder}/*"].each do |path|
    next if only_folders && ! File.directory?(path)
    liste << File.basename(path)
  end
  RETOUR_AJAX[:folder]      = param(:folder)
  RETOUR_AJAX[:folder_list] = liste
end