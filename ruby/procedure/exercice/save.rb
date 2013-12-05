=begin

  Procédure d'enregistrement d'un exercice
  
=end
require_model 'roadmap'

def ajax_exercice_save
  rm = Roadmap.new param(:roadmap_nom), param(:mail)
  RETOUR_AJAX[:error] = exercice_save rm, param(:data).to_sym, {:mail => param(:mail), :md5 => param(:md5)}
end

# Enregistrement de l'exercice défini par +data+ dans la feuille de route
# +rm+
# @param  rm      Instance Roadmap de la feuille de route
# @param  data    Les data de l'exercice
# @param  owner   Hash des données du propriétaire: mail et md5
def exercice_save rm, data, owner
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Exercices.Edit.data_required" if data.nil?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? owner
    raise "Exercices.Edit.id_required" unless data.has_key?(:id) && data[:id] != nil
  rescue Exception => e
    return "ERROR.#{e.message}"
  end
  # -- Tout est OK, on peut sauver l'exercice --
  
  # > Current data
  now     = Time.now.to_i
  expath  = rm.path_exercice( data[:id] )
  
  # Tranformer les valeurs string imparfaites
  data.each do |k,v|
    data[k] = 
      case v
      when "false"            then false
      when "true"             then true
      when "null", "nil", ""  then nil
      else
        # Ensuite ça dépend de la clé
        case k
        when :tempo, :tempo_min, :tempo_max then v.to_i
        when :updated_at, :created_at       then v.to_i
        when :started_at, :ended_at         then v.to_i
        else v
        end
      end
  end

  # > Ajout des données utiles
  if File.exists?( expath )
    # Exercice existant
    old_data  = App::load_data expath
    data      = old_data.merge data
  else
    # Une création (on doit actualiser l'id de dernier exercice)
    rm.update_last_id_exercice data[:id]
  end
  
  if !data.has_key?(:created_at) || data[:created_at].nil?
    # New exercice or error
    data = data.merge :created_at => now
  end
  data = data.merge :updated_at => now
  
  # > Création du fichier
  rm.build_folder_exercices # au cas où
  App::save_data expath, data

  return nil # => pas d'erreur
end

