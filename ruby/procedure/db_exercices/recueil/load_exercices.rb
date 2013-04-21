=begin

  Procédure qui charge les exercices du recueil voulu.
  
=end

require File.join(FOLDER_LIB_RUBY, 'module', 'data_base_exercices.rb')

# Appel ajax
# 
# @param    :auteur_id  dans les paramètres
# @param    :recueil_id dans les paramètres
# 
# @return   Un Hash contenant les données sur les exercices du recueil demandé
def ajax_db_exercices_recueil_load_exercices
  ok, exs = db_exercices_recueil_load_exercices param(:auteur_id), param(:recueil_id), param(:lang)
  if ok
    RETOUR_AJAX[:exercices]   = exs
    RETOUR_AJAX[:auteur_id]   = param(:auteur_id)
    RETOUR_AJAX[:recueil_id]  = param(:recueil_id)
  else
    RETOUR_AJAX[:error] = exs
  end
end

# @return [<ok>, <hash with data exercices or error message>]
def db_exercices_recueil_load_exercices auteur_id, recueil_id = nil, lang = :en
  begin
    exs = DataBaseExercices::exercices_by auteur_id, recueil_id, lang.to_sym
    return [true, exs]
  rescue Exception => e
    return [false, e.message + "<br>" + e.backtrace.join("<br>")]
  end
end
