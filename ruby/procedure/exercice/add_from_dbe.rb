require_model 'roadmap'
require_model 'user'
require_model 'db_exercice'

def ajax_exercice_add_from_dbe
  rm    = Roadmap.new param(:roadmap), param(:mail)
  duser = {:mail => param(:mail), :md5 => param(:md5)}
  exs   = param(:bde_exs).split(',')
  opts  = { :lang => param(:lang) }
  res = exercice_add_from_dbe( rm, duser, param(:instrument), exs, opts )
  RETOUR_AJAX[:error] = res unless res.nil?
end

# Add BDE Exercices in roadmap
# 
# * PARAMS
#   :rm::       Instance Roadmap of the roadmap
#   :duser::    User data (:mail and :md5)
#   :inst_id::  Instrument ID (p.e. "piano", "violin")
#   :exs::      Array of "<instrument>-<auteur>-<recueil>-<id ex>"s
#   :opts::     Options (Hash). :lang expected.
# 
# * PRODUCTS
#   - Make a data file for each ex in the roadmap
# 
def exercice_add_from_dbe rm, duser, inst_id, exs, options
  # Security control
  begin
    raise "Roadmap.unknown" unless rm.exists?
    user = User.new duser
    raise "User.unknown" unless user.exists?
    raise "unknown.bad_owner" unless rm.owner_or_admin? duser
    raise "Instrument.should_be_defined" if inst_id.nil?
  rescue Exception => e
    return "ERRORS.#{e.message}"
  end

  # DBExercice needs to know the language and the instrument
  begin
    DBExercice::set_lang options[:lang]
    DBExercice::set_instrument inst_id
  rescue Exception => e
    return e.message + '<br />' + e.backtrace.join('<br>')
  end
  
  rm.build_folder_exercices # au cas où
  
  # We can add exercices
  errors        = []
  list_new_ids  = []
  id = rm.last_id_exercice.to_i
  begin
    exs.each do |idtotal|
      iex = DBExercice.new idtotal
      res = iex.duplicate_in rm, (id += 1)
      list_new_ids << id.to_s
      errors << res unless res.nil?
    end
  rescue Exception => e
    return e.message + '<br />' + e.backtrace.join('<br>')
  end
  
  
  unless list_new_ids.empty? # => aucun exercice n'a pu être enregistré
    # Actualiser le dernier id d'exercice
    rm.update_last_id_exercice list_new_ids.last
    # Ajouter à l'ordre des exercices de la roadmap
    # @note: on passe par la procédure, pour actualiser tout ce qui doit l'être (et 
    # notamment la date de dernière modification de la roadmap)
    require 'procedure/roadmap/save'
    data_exercices = rm.data_exercices
    data_exercices = data_exercices.merge 'ordre' => [] unless data_exercices.has_key?('ordre')
    data_exercices['ordre'] += list_new_ids
    roadmap_save 'exercices', data_exercices, rm
  end
  
  return errors.empty? ? nil : errors.join('<br>')
end