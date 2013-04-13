when /le menu des roadmaps doit contenir (.+)$/ then
  # Vérifie que le menu select#roadmaps contienne bien les options
  # avec les paramètres fournis en fin de sentence, qui est une liste
  # des nom-mdp des roadmaps qu'on compte trouver
  # ---
  rms = eval($1)
  rms.each do |nomdp|
    nom, mdp = nomdp.split('-')
    Browser should contain option(:value => nomdp, :text => nom)
  end
  
when /la roadmap #{STRING} doit être chargée/ then
  # Vérification des informations javascript conforme pour la roadmap
  # spécifiée. C'est purement un test unitaire.
  # 
  # #{STRING} doit contenir le `nom-mdp' de la feuille de route chargée par
  # une autre sentence.
  # 
  # @note: cette sentence attend d'abord que Roadmap.opening soit mis à false
  # --
  nomdp     = $1
  nom, mdp  = nomdp.split('-')
  require_model 'roadmap'
  rm = Roadmap.new nom, mdp
  
  Watir::Wait.until{ "Roadmap.opening".js == false }
  # Roadmap doit définir le nom/mdp correct
  "Roadmap.loaded" should be true
  "Roadmap.nom" should be nom
  "Roadmap.mdp" should be mdp
  Flash should contain :notice => "MESSAGES.Roadmap.loaded"
  # Les exercices doivent être définis
  ordex = rm.ordre_exercices
  if ordex.count > 0
    ordex.each do |idex|
      puts "*** vérification de l'exercice #{idex}"
      "'undefined' != typeof EXERCICES['#{idex}']".js should be true
    end
  else
    raise "Il faut ajouter des exercices à la feuille de route #{nomdp} pour pouvoir vraiment la tester"
  end
  
when /la roadmap #{STRING} doit être affichée/ then
  # Vérification de l'affichage conforme d'une roadmap. C'est ici que doivent
  # être ajoutés tous les éléments à vérifier.
  #
  # #{STRING} doit contenir le `nom-mdp' de la feuille de route chargée par
  # une autre sentence.
  # 
  # @note: cette clause expectation ne vérifie que l'affichage, pas le 
  # chargement correcte de la roadmap. Il convient donc d'utiliser la clause
  # précédente (la roadmap ... doit être chargée) pour s'assurer que la
  # roadmap a été chargée.
  # --
  nomdp     = $1
  nom, mdp  = nomdp.split('-')
  # Pour avoir les infos de la roadmap
  Watir::Wait.until{ "Roadmap.opening".js == false }
  require_model 'roadmap'
  rm = Roadmap.new nom, mdp
  ordex = rm.ordre_exercices
  if ordex.count > 0
    ordex.each do |idex|
      dex = rm.exercice idex
      puts "*** vérification de l'exercice #{dex.inspect}"
      # @TODO: il doit être affiché
    end
  else
    raise "Il faut ajouter des exercices à la feuille de route #{nomdp} pour pouvoir vraiment la tester"
  end
  
  # Les specs doivent contenir le nom et le mdp
  # Les exercices doivent être affichés
  # La configuration des exercices doit être visible
  # Les boutons roadmap/exercices doivent être affichés
  # La spec de la roadmap doit être fermée
  
# Pour le dernier block (if any)
end