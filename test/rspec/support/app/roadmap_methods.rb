
# => Return le nombre actuel de feuilles de route
def get_nombre_roadmaps
	Dir["#{APP_FOLDER}/user/roadmap/*"].count
end

class Roadmap
  def set_owner mail, options = nil
    require_model 'user'
    owner = User.new mail
    data  = JSON.parse(File.read(path_data))
    data['mail'] = owner.mail
    data['md5']  = owner.md5
    # On en profite pour rectifier certaines valeurs qui ont pu être 
    # modifiées
    data['nom']   = @nom
    data['mdp']   = @mdp
    data.delete('password')
    data.delete('salt')
    begin
      File.open(path_data,'wb'){|f|f.write(data.to_json)}
    rescue Exception => e
      raise "Impossible de changer l'owner de #{nom}-#{mdp} : #{e.message}"
    end
  end
end

# Ouvre le div spec
def open_specs nom = nil, mdp = nil
  JS.run "Roadmap.set_div_specs(true)"
  unless nom.nil?
    onav.text_field(:id => 'roadmap_nom').set nom
  end
  unless mdp.nil?
    onav.text_field(:id => 'roadmap_mdp').set nom
    # pour provoquer le blur du champ :roadmap_mdp et afficher les boutons
    # on passe dans l'autre champ
    onav.text_field(:id => 'roadmap_nom').focus
  end
end
# Définit le possesseur d'une roadmap de test (raccourci)
# 
# @NOTE: si la rm est définie, on peut faire aussi : rm.set_owner mail
# 
# @param  nom   Le nom de la roadmap
# @param  mdp   Le mdp de la roadmap
# @param  mail  Le mail du possesseur (note : qui doit forcément exister)
def set_owner_roadmap nom, mdp, mail
  rm = Roadmap.new nom, mdp
  rm.set_owner mail
end

# (raccourci) Ouvre la roadmap test_as_phil
# @param  options   Même Hash que open_roadmap ci-dessous
#                   par exemple : open_roadmap_phil :as_owner => true
#                   Ajout de :as_phil => true
def open_roadmap_phil options = nil
  if options != nil && options.has_key?(:as_phil)
    options = options.merge :as_owner => options[:as_phil] 
    options.delete(:as_phil)
  end
  open_roadmap('test_as_phil','test_as_phil', options)
end
# Ouvre la roadmap de nom +nom+ et de mot de passe +mdp+
# @note: s'en retourne seulement lorsque la roadmap est chargée
# 
# @param  nom   Le nom de la roadmap String
# @param  mdp   Le mot de passe String
# @param  options   Les options optionnelles :
#                   :specs => :visible      Laisse les specs ouverte
#                   :as_owner     Si true, la méthode règle l'utilisateur au
#                                 possesseur de la roadmap. Si false, change
#                                 le mail/password pour qu'ils ne puissent pas
#                                 correspondre
#                   :modified     Si true, marque la roadmap comme modifiée
def open_roadmap nom, mdp, options = nil
  JS.run "Roadmap.set('#{nom}','#{mdp}')"
  JS.run "Roadmap.open()"
  Watir::Wait.while{ "Roadmap.opening".js }
  unless options.nil?
    if options.has_key?(:specs) && options[:specs] == :visible
      JS.run "Roadmap.set_div_specs(true)"
    end
    if options.has_key?(:modified)
      JS.run "Roadmap.modified = #{options[:modified].inspect}"
    end
    if options.has_key?(:as_owner)
      as_owner = options[:as_owner]
      path = File.join(roadmap_path(nom,mdp), 'data.js')
      if File.exists? path
        datajs  = JSON.parse(File.read(path))
        mail = datajs['mail']
        md5  = datajs['md5']
        mail = "autre#{mail}" unless as_owner
        md5  = "autre#{md5}"  unless as_owner
        # puts "User mis à mail:#{mail}/md5:#{md5}"
        JS.run "User.set({mail:'#{mail}',md5:'#{md5}'})"
        "User.mail".js.should == mail
        "User.md5".js.should  == md5
      else
        raise "La feuille de route #{nom}-#{mdp} n'a pas de fichier data.js. Je ne peux pas régler l'User comme possesseur"
      end
    end
        
  end
end
# retourn le path de la roadmap définie par +nom+ et +mdp+
def roadmap_path nom, mdp
  File.join(APP_FOLDER, 'user', 'roadmap', "#{nom}-#{mdp}")
end

# Return true si la roadmap identifiée par +nom+ et +mdp+ existe
def roadmap_exists? nom, mdp
  File.exists?( roadmap_path(nom,mdp))
end

# =>  Retourne les data du fichier data.js de la roadmap de nom +nom+ et de
#     mdp +mdp+ (ce fichier contient notamment le mail et le mot du passe
#     du owner de la rm)
def data_roadmap_in_file nom, mdp
  path = File.join(roadmap_path(nom,mdp), 'data.js')
  JSON.parse(File.read(path))
end

# =>  Retourne les data des exercices de la roadmap +nom+-+mdp+
def data_exercices nom, mdp
  rm = Roadmap.new nom, mdp
  ids = JSON.parse(File.read(rm.path_exercices))['ordre']
  folder = rm.folder_exercices
  exercices = {}
  errors    = []
  ids.each do |id|
    path_exe = rm.path_exercice(id)
    if File.exists? path_exe
      exercices = exercices.merge id => JSON.parse(File.read(path_exe))
      # Une image ?
      if File.exists?( rm.path_image_png(id) )
        exercices[id]['image'] = "#{id}.png"
      elsif File.exists?( rm.path_image_jpg(id) )
        exercices[id]['image'] = "#{id}.jpg"
      else
        exercices[id]['image'] = ""
      end
    else
      errors << "Exercice #{id} introuvable"
    end
  end
  {
    :ids        => ids,
    :exercices  => exercices,
    :errors     => errors
  }
end

# Lève une erreur Rspec si les boutons propres à la roadmap ne sont pas
# dans le bon état par rapport aux +options+
# 
# @rappel: les boutons roadmap sont les boutons "Créer" (la roadmap), 
# “Ouvrir”, “Init”, etc.
# @note: Ils ne concernent pas les boutons propres aux exercices.
# 
# @param  options   Les options pour déterminer l'état des boutons. Doit
#                   définir :
#                   :loaded         True si la roadmap est chargée
#                   :modified       True si elle est modifiée
#                   :specs_valides  True si les nom/mdp sont valides
#                   :specs_modified True si nom/mdp valides et modifiés
# 
def boutons_roadmap_should_have_bon_etat options
  loaded    = options[:loaded]              || false
  modified  = options[:modified]            || false
  valide    = options[:specs_valides]       || false
  specs_modified = options[:specs_modified] || false
  # A-liens visibles quand l'affixe est valide
  {
    :a => 'btn_roadmap_open', :a => 'btn_roadmap_create'
  }.each do |k, id|
    if valide && !loaded
      raise "#{k}##{id} devrait être visible" unless onav.send( k, :id => id).visible?
    else
      raise "#{k}##{id} NE devrait PAS être visible" if onav.send( k, :id => id).visible?
    end
  end    
  # Boutons "Save"
  # Actif seulement lorsque loaded
  # 'a#btn_save_roadmap'
  # Éléments visibles quand la roadmap est chargée (loaded = true)
  listeo = {
    :div => 'config_generale', :a => 'btn_exercice_create'
  }.each do |k, id|
    if loaded
      raise "#{k}##{id} devrait être visible" unless onav.send( k, :id => id).visible?
    else
      raise "#{k}##{id} NE devrait PAS être visible" if onav.send( k, :id => id).visible?
    end
  end
end

