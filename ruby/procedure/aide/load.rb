# Procédure de chargement d'un texte d'aide
# 
# Cf. l'objet JS Aide (aide.js dans les librairies générales pour le détail)
# 

def ajax_aide_load
  id = param(:aide_id)
  RETOUR_AJAX[:aide_id]   = id
  RETOUR_AJAX[:aide_text] = aide_load id, param(:lang)
end


# Charge le texte d'aide d'identifiant +id+ dans la lang +lang+ si elle est fournie
# 
# * PRODUCTS
#   - Search for a file in ./data/aide/ folder. This file name can be:
#     * just id:  ./data/aide/<id>.<rb/html>
#     * id with lang:   ./data/aide/<id>-<lang>.<rb/html>
#     * Any extension:  this method search either a .rb file or a .html file.
# 
# * RETURN
# 
#   Text String of the aide
# 
# * PARAMS
#   :id::       Relative path from ./data/aide/ folder to the help file
#               If not extension is provided, look for .html then .rb. Otherwise look only
#               with extension provided
#   :lang::     String or Symbol, two letters, of the required language (default: :en/english)
# 
def aide_load id, lang = :en
  ext  = File.extname(id)
  id   = File.join(File.dirname(id), File.basename(id, ext))
  path = search_file_for id, lang, ext
  return "Unfound help text for #{id}" if path.nil?
  texte = File.read path
  texte = eval(texte) if File.extname(path) == ".rb"
  texte
end

# Return relative path found in ./data/aide/ folder with relative path +id+
# 
# @param    id      A path id to file, WITHOUT EXTENSION, from ./data/aide/
# @param    lang    Language ID in 2 letters
# @param    ext     Extension required, or nil, or blank
# 
def search_file_for id, lang, ext = nil
  root_help_folder = File.join(APP_FOLDER, 'data', 'aide')
  extensions = ext.to_s == "" ? ['.html', '.rb'] : [ext]
  # Les relatives possibles
  ["#{id}-#{lang}", id].each do |rel|
    extensions.each do |ext|
      path = File.join( root_help_folder, "#{rel}#{ext}" )
      return path if File.exists? path
    end
  end
  return nil # I know dude…
end