# Procédure de chargement d'un texte d'aide
# 
# Cf. l'objet JS Aide (aide.js dans les librairies générales pour le détail)
# 

def ajax_aide_load
  id = param(:aide_id)
  RETOUR_AJAX[:aide_id]   = id
  RETOUR_AJAX[:aide_text] = aide_load id
end


# Charge le texte d'aide d'identifiant +id+
def aide_load id
  id += ".html" if id.index('.') === nil
  path = File.join(APP_FOLDER, 'data', 'aide', id)
  if File.exists? path
    texte = File.read path
    texte = eval(texte) if File.extname(path) == ".rb"
    texte
  else
    "Le texte d'aide d'ID #{id} est introuvable (dans #{path})"
  end
end