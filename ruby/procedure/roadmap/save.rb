# Procédure d'enregistrement des data complètes de la roadmap

require_model 'user'
require_model 'roadmap'

# Méthode Ajax
def ajax_roadmap_save
  
  nom = param(:roadmap_nom)
  mdp = param(:roadmap_mdp)
  rm = Roadmap.new nom, mdp
  for_creation = param(:creating).to_s == 'true'

  begin
    user_mail  = param(:mail)
    raise "ERRORS.User.mail_required" if user_mail.to_s == ""
    user_md5 = param(:md5)
    raise "ERRORS.User.md5_required" if user_md5.to_s == ""
    owner = User.new user_mail
    raise "ERRORS.User.unknown" unless owner.exists?
    
    unless for_creation
      # Update
      # ------
      raise "ERRORS.Roadmap.unknown"    unless rm.exists?
      is_owner_or_admin = rm.owner_or_admin?(user_mail, nil, user_md5)
      raise "ERRORS.Roadmap.bad_owner"  unless is_owner_or_admin
    else
      # Création
      # --------
      require 'procedure/roadmap/create'
      data = {
        :nom      => rm.nom, 
        :mdp      => rm.mdp, 
        :mail     => user_mail, 
        :md5      => user_md5,
        :salt     => owner.salt,
        :partage  => 0
      }
      puts "data: #{data.inspect}"
      res = roadmap_create(data)
      raise res if res != nil
    end
  rescue Exception => e
    errmess = e.message
    errmess = "# [Procédure roadmap/save] FATAL ERROR: #{errmess}" unless errmess.start_with?('ERRORS')
    RETOUR_AJAX[:error] = errmess
    return
  end

  # Sauvegarde possible
  unless param(:config_generale).nil?
    roadmap_save 'config_generale', param(:config_generale), rm
  end
  unless param(:data_exercices).nil?
    roadmap_save 'exercices', param(:data_exercices), rm
  end
  # RETOUR_AJAX[:error] = "pour voir"
end

# Méthode générale enregistrant la donnée +data+ dans le fichier de clé 
# +keypath+
# 
#   @WARNING ! IL FAUT S'ASSURER AVANT L'APPEL DE CETTE MÉTHODE QUE 
#   L'UTILISATEUR PEUT SAUVER
# 
# @return NIL en cas de succès et l'identifiant du message d'erreur (ou 
# l'erreur) en cas d'échec.
# 
# @param  keypath   Le fichier à traiter
# @param  data      Les data à enregistrer
# @param  rm        Instance Roadmap de la feuille de route courante
# 
def roadmap_save keypath, data, rm
  return "ERRORS.Roadmap.unknown" unless rm.exists?
  now = Time.now.to_i
  begin
    if data.class == Hash
      # --- Traitement à faire sur les data ---
      data.each do |k,v|
        v = case v
        when 'false'  then false
        when 'true'   then true
        when 'null'   then nil
        else v
        end
        data[k] = v
      end 
      # Actualisation des temps
      data = data.merge('created_at' => now) unless data.has_key?('created_at')
      data = data.merge('updated_at' => now)
    end
  
    # --- Enregistrement ---
    rm.build_folder
    File.open( rm.send("path_#{keypath}"), 'wb' ){ |f| f.write data.to_json }
    
    # On indique toujours la date de dernière modification de la roadmap
    rm.set_last_update
    
    return nil
  rescue Exception => e
    return e.message
  end
end