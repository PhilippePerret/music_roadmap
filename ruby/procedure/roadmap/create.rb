=begin

  Création de la roadmap
  
  @note:  pas de méthode ajax car la roadmap se crée depuis la procédure
          save
=end
require_model 'user'
require_model 'roadmap'
require_model 'mail'

def roadmap_create data, lang = 'en'
  begin
    # puts "-> roadmap_create avec : #{data.inspect}"
    # Présence des données
    # Check de l'Owner
    raise unless data.has_key?(:mail) && data[:mail] != nil
    raise unless data.has_key?(:md5) && data[:md5] != nil
    owner = User.new data[:mail]
    raise unless owner.md5 == data[:md5]
    return "ERROR.Roadmap.too_many" if owner.roadmaps.count > 9
    raise unless data.has_key?(:nom) && data[:nom] != nil
    raise unless data.has_key?(:salt) && data[:salt] != nil
    raise unless data.has_key?(:partage) && data[:partage] != nil
    # Unicité de la roadmap
    rm = Roadmap.new data[:nom], data[:mail]
    raise if rm.exists?
  rescue Exception => e
    return "ERROR.Roadmap.cant_create"
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
    owner.add_roadmap rm.nom
    # On envoie un mail à l'user pour lui confirmer la création de la roadmap
    # On peut envoyer un mail à l'utilisateur et à l'administrateur
    Mail::lang( lang )
    Mail.new(
      :message  => 'user/new_roadmap.html',
      :subject  => ( lang=='en' ? "New roadmap" : "Nouvelle feuille de route"),
      :to       => owner.mail,
      :data     => {:pseudo => owner.nom, :roadmap => rm.nom}
    ).send
    # Envoi à l'administration
    Mail.new(
      :message  => "Auteur : #{owner.mail}\nRoadmap : #{rm.nom}\nLangue : #{lang}",
      :subject  => "Création d'une nouvelle feuille de route"
    ).send


    # @note: les autres fichiers doivent être créés par la procédure save
    return nil # important
  rescue Exception => e
    errmes = e.message
    errmes += '<br>'+e.backtrace.join('<br>') if Params::offline?
    return "# [Procédure roadmap/create] FATAL ERROR: #{e.message}"
  end
end