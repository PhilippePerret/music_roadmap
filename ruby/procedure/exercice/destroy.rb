=begin

  Procédure de destruction complet d'un exercice (et ses fichiers affiliés)
  
=end

def ajax_exercice_destroy
  rm = Roadmap.new param(:roadmap_nom), param(:user_mail)
  RETOUR_AJAX[:error] = exercice_destroy rm, param(:exercice_id), {:mail => param(:user_mail), :md5 => param(:user_md5)}
end

# Enregistrement de l'exercice défini par +data+ dans la feuille de route
# +rm+
# @param  rm      Instance Roadmap de la feuille de route
# @param  data    Les data de l'exercice
# @param  owner   Hash des données du propriétaire: mail et md5
def exercice_destroy rm, id, owner
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? owner
    raise "Exercices.Edit.id_required" if id.nil?
  rescue Exception => e
    return "ERRORS.#{e.message}"
  end
  # -- Tout est OK, on peut détruire l'exercice --
  
  # On détruit tous les fichiers d'affixe <id>
  Dir["#{rm.folder_exercices}/#{id}.*"].each do |path|
    File.unlink path
  end
  
  # @FIXME: Noter que pour le moment, rien n'est fait à propos des rapports et
  # autres statistiques. C'est-à-dire que si l'exercice appartient à des
  # données de la roadmap, on s'expose à de graves problèmes (entendu que l'id
  # devenant "libre", il pourra être remplacé par un autre ID, faussant tous 
  # les calculs).
  # En d'autres termes, cette destruction est vraiment à utiliser pour le
  # moment avec des pincettes.

  return nil # => pas d'erreur
end

