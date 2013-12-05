=begin

  Procédure AJAX de vérification de l'existence d'une roadmap
  
  La procédure doit mettre une erreur dans RETOUR_AJAX[:error] quand la
  roadmap existe (car cette procédure a été initiée pour la création d'une
  nouvelle feuille de route)
  
  @note: Cette procédure NE vérifie PAS la validité des noms envoyés.
  
=end
require 'fileutils'

load_model 'roadmap'

def ajax_roadmap_check
  nom   = param(:roadmap_nom)
  umail = param(:user_mail)
  begin
    # puts "nom:#{nom} / umail:#{umail}"
    if nom.to_s == "" || umail.to_s == ""
      raise "ERROR.Roadmap.Specs.requises"
    end
    fdr = Roadmap.new nom, umail
  rescue Exception => e
    # Sera évalué en retour ajax
    e.message = "\"#{e.message}\"" unless e.message.start_with?("ERROR")
    RETOUR_AJAX[:error] = e.message
  else
    if fdr.exists?      
      RETOUR_AJAX[:error] = "ERROR.Roadmap.existe_deja"
    else
      RETOUR_AJAX[:error] = nil
    end
  end
end