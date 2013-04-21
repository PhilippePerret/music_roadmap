require_model 'roadmap'
require_model 'user'
require_model 'db_exercice'

def ajax_exercice_add_from_dbe
  rm    = Roadmap.new param(:roadmap), param(:mail)
  duser = {:mail => param(:mail), :md5 => param(:md5)}
  exs   = param(:bde_exs).split(',')
  opts  = { :lang => param(:lang) }
  res = exercice_add_from_dbe( rm, duser, exs, opts )
  RETOUR_AJAX[:error] = res unless res.nil?
end

# Add BDE Exercices in roadmap
# 
# * PARAMS
#   :rm::       Instance Roadmap of the roadmap
#   :duser:     User data (:mail and :md5)
#   :exs:       Array of "<instrument>-<auteur>-<recueil>-<id ex>"s
#   :opts:      Options (Hash). :lang expected.
# 
# * PRODUCTS
#   - Make a data file for each ex in the roadmap
# 
def exercice_add_from_dbe rm, duser, exs, options
  # Security control
  begin
    raise "Roadmap.unknown" unless rm.exists?
    user = User.new duser
    raise "User.unknown" unless user.exists?
    raise "unknown.bad_owner" unless rm.owner_or_admin? duser
  rescue Exception => e
    return [false, "ERRORS.#{e.message}"]
  end
  
  # We can add exercices
  errors        = []
  list_new_ids  = []
  DBExercice::set_lang options[:lang]
  id = rm.last_id_exercice.to_i
  res = nil # SUPPRIMER (JUSTE POUR LE DEBUG)
  exs.each do |idtotal|
    iex = DBExercice.new idtotal
    res = iex.duplicate_in rm, (id += 1)
    list_new_ids << id.to_s
    errors << res unless res.nil?
  end
  
  unless list_new_ids.empty? # => aucun exercice n'a pu être enregistré
    # Actualiser le dernier id d'exercice
    rm.update_last_id_exercice list_new_ids.last
    # Ajouter à l'ordre des exercices de la roadmap
    # @note: on passe par la procédure, pour actualiser tout ce qui doit l'être (et 
    # notamment la date de dernière modification de la roadmap)
    require 'procedure/roadmap/save'
    data_exercices = rm.data_exercices
    data_exercices['ordre'] += list_new_ids
    roadmap_save 'exercices', data_exercices, rm
  end
  
  return errors.empty? ? nil : errors.join('<br>')
end