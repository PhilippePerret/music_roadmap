when /la liste (des|de mes) roadmaps (?:de #{STRING} )?doit être affichée/ then
  # Vérifie que la liste des roadmaps affichée soit la bonne
  # 
  # Si $1 est "des" alors "de ..." doit être défini avec "mail-password",
  # Si $1 est "de mes" alors on prend @mail et @password qui doivent avoir été
  # définis avant.
  # --
  if $1 == "de mes"
    # nothing to do: we take prend @mail et @password
  else
    @mail, @password = $2.split("-")
  end
  Browser should contain :tag => 'select', :id => 'roadmaps'
  @mail = "phil@atelier-icare.net"
  puts "mail:#{@mail} / password:#{@password}"
  roadmaps = UserTest.new(@mail).roadmaps(:as => :array)
  if roadmaps.count == 0
    raise "Il faudrait choisir un utilisateur qui possède des raodmaps."
  end
  # On doit trouver un item option pour chaque roadmap
  roadmaps.each do |drm|
    opt = Browser get option :value => (drm['nom']+"-"+drm['mdp'])
    opt should exist
    opt.text should be drm['nom']
  end

when /la roadmap #{STRING} doit être créée/
  nom_mdp = $1
  Folder "#{FOLDER_ROADMAP}/#{nom_mdp}" should exist
  
when /la roadmap #{STRING} ne doit pas être créée/
  nom_mdp = $1
  Folder "#{FOLDER_ROADMAP}/#{nom_mdp}" should not exist