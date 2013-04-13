when "je veux créer une feuille de route"
  # => Ouverture du formulaire spec
  
when /je donne le nom #{STRING} et le mdp #{STRING} à la roadmap/
  roadmap_nom = $1
  roadmap_mdp = $2
  pending "Donner le nom #{roadmap_nom} à la feuille de route"