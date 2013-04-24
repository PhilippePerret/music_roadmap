# Procédure de chargement d'un texte d'aide
# 
# Cf. l'objet JS Aide (aide.js dans les librairies générales pour le détail)
# 
require_model 'locale'

def ajax_aide_load
  id = param(:aide_id)
  RETOUR_AJAX[:aide_id]   = id
  RETOUR_AJAX[:aide_text] = locale( id, param(:lang), in_help = true )
end