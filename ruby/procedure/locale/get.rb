=begin

  Retourne un texte localisé
  
  Les textes localisés se trouvent dans le dossier 'data/locale/<lang>'
  Ne pas les confondre avec les textes d'aide localisés, qui s'affichent toujours dans la
  fenêtre d'aide.
  
=end
require_model 'locale'

def ajax_locale_get
  RETOUR_AJAX[:locale]          = locale( param(:locale_id), param(:lang), in_help = false )
  RETOUR_AJAX[:locale_id]       = param(:locale_id)
  RETOUR_AJAX[:paths_searched]  = Locale.instance.paths_searched
  RETOUR_AJAX[:path_found]      = Locale.instance.path_found
end