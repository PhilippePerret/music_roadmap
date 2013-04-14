when "je veux créer une feuille de route"
  # => Ouverture du formulaire spec
  
when /je donne le nom #{STRING} et le mdp #{STRING} à la roadmap/
  roadmap_nom = $1
  roadmap_mdp = $2
  pending "Donner le nom #{roadmap_nom} à la feuille de route"

when /je choisis la roadmap #{STRING}/ then
  # Simule le choix d'une roadmap dans le menu des roadmaps
  # 
  # Cette roadmap doit se trouver dans le menu #roadmaps, donc doit être une
  # roadmap de l'utilisateur courant identifié.
  # 
  # Le STRING peut contenir soit le nom seul de la roadmap (le texte de
  # l'itemp de menu) soit le "nom-mdp" (dont le value de l'option). Pour un
  # traitement plus rapide, on peut mettre plutôt le nom seul, c'est lui
  # qui est cherché en premier.
  # 
  # @note: La when-clause attend que la roadmap soit effectivement chargée. 
  # Mais ce contrôle ne se fait que sur Roadmap.opening, donc peut-être que
  # des traitements ultérieurs ne seront pas encore pris en compte. Rester
  # prudent.
  # 
  # --
  nomdp = $1.strip
  opt = Browser get option :text => nomdp
  opt = Browser get option :value => nomdp if opt.nil?
  # Ouvrir la roadmap
  opt.select
  Browser wait_while { "Roadmap.opening".js }
  screenshot "Ouverture roadmap"