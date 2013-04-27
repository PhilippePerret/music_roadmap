when /le menu des roadmaps doit contenir (.+)$/ then
  # Vérifie que le menu select#roadmaps contienne bien les options
  # avec les paramètres fournis en fin de sentence, qui est une liste
  # des nom-umail des roadmaps qu'on compte trouver
  # ---
  rms = eval($1)
  rms.each do |nomumail|
    nom, umail = nomumail.split('-')
    Browser should contain option(:value => nomumail, :text => nom)
  end
  
when /la roadmap #{STRING} doit être chargée/ then
  # Vérification des informations javascript conforme pour la roadmap
  # spécifiée. C'est purement un test unitaire.
  # 
  # #{STRING} doit contenir le `nom-umail' de la feuille de route chargée par
  # une autre sentence.
  # 
  # @note: cette sentence attend d'abord que Roadmap.opening soit mis à false
  # --
  nomumail     = $1
  nom, umail  = nomumail.split('-')
  require_model 'roadmap'
  rm = Roadmap.new nom, umail
  
  Watir::Wait.until{ "Roadmap.opening".js == false }
  # Roadmap doit définir le nom/umail correct
  "Roadmap.loaded" should be true
  "Roadmap.nom" should be nom
  "User.mail" should be umail
  Flash should contain :notice => "MESSAGE.Roadmap.loaded"
  # Les exercices doivent être définis
  ordex = rm.ordre_exercices
  if ordex.count > 0
    ordex.each do |idex|
      "'undefined' != typeof EXERCICES['#{idex}']".js should be true
    end
  else
    raise "Il faut ajouter des exercices à la feuille de route #{nomumail} pour pouvoir vraiment la tester"
  end
  
when /la roadmap #{STRING} doit être affichée/ then
  # Vérification de l'affichage conforme d'une roadmap. C'est ici que doivent
  # être ajoutés tous les éléments à vérifier.
  #
  # #{STRING} doit contenir le `nom-umail' de la feuille de route chargée par
  # une autre sentence.
  # 
  # @note: cette clause expectation ne vérifie que l'affichage, pas le 
  # chargement correcte de la roadmap. Il convient donc d'utiliser la clause
  # précédente (la roadmap ... doit être chargée) pour s'assurer que la
  # roadmap a été chargée.
  # --
  nomumail  = $1
  nom, umail  = nomumail.split('-')
  # Pour avoir les infos de la roadmap
  Watir::Wait.until{ "Roadmap.opening".js == false }
  require_model 'roadmap'
  rm = Roadmap.new nom, umail
  ordex = rm.ordre_exercices
  ul_exercices = Browser get ul :id => 'exercices'
  raise "Il faut ajouter des exercices à la feuille de route #{nomumail} pour pouvoir vraiment la tester" if ordex.empty?
  # Présence du li de chaque exercice
  ordex.each { |idex| 
    ul_exercices should contain li :id => "li_ex-#{idex}"
  }
  
  # Les specs doivent contenir le nom et le umail
  wel = Browser get input :id => 'roadmap_nom'
  wel.value should be nom
    
  # La configuration des exercices doit être visible
  Browser should display div :id => 'config_generale'
  
  # Les boutons roadmap/exercices doivent être affichés
  Browser should display a :id => 'btn_exercice_create'
  Browser should display a :id => 'btn_seance_play'
  Browser should display a :id => 'btn_exercices_move'

when "les specs de la roadmap doivent être masquées" then
  Browser should not display div :id => 'roadmap_specs-specs'

# Pour le dernier block (if any)
end