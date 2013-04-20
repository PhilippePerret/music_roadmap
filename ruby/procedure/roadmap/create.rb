=begin

  Création de la roadmap
  
  @note:  pas de méthode ajax car la roadmap se crée depuis la procédure
          save
=end
require_model 'user'
require_model 'roadmap'

def roadmap_create data
  begin
    # puts "-> roadmap_create avec : #{data.inspect}"
    # Présence des données
    raise unless data.has_key?(:nom) && data[:nom] != nil
    raise unless data.has_key?(:mail) && data[:mail] != nil
    raise unless data.has_key?(:md5) && data[:md5] != nil
    raise unless data.has_key?(:salt) && data[:salt] != nil
    raise unless data.has_key?(:partage) && data[:partage] != nil
    # Check de l'Owner
    owner = User.new data[:mail]
    raise unless owner.md5 == data[:md5]
    # Unicité de la roadmap
    rm = Roadmap.new data[:nom], data[:mail]
    raise if rm.exists?
  rescue Exception => e
    return "ERRORS.Roadmap.cant_create"
  end
  
  begin
    # Tout est OK, on peut créer la feuille de route
    rm.build_folders
    # Le fichier data.js
    now = Time.now.to_i
    data = data.merge(
      :created_at => now, :updated_at => now, :ip => Params::User.ip
    )
    File.open(rm.path_data,'wb') { |f| f.write data.to_json }
    data = {
      :created_at => now, :updated_at => now, :ordre => []
    }
    File.open(rm.path_exercices,'wb') { |f| f.write data.to_json }
    # On ajoute cette roadmap à l'utilisateur
    owner.add_roadmap "#{rm.nom}-#{rm.mail}"
    # @note: les autres fichiers doivent être créés par la procédure save
    return nil # important
  rescue Exception => e
    return "# [Procédure roadmap/create] FATAL ERROR: #{e.message}"
  end
end