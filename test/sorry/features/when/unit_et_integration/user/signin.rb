when /je m'identifie (par le formulaire|par javascript|par JS)? (avec des codes invalides|comme testeur|comme admin)$/ then
  # Procédure d'identification complète, soit en mode intégration (si la
  # sentence contient `par le formulaire') soit en mode javascript dans le
  # cas contraire
  # Test avec des codes valides ou invalides au choix
  # 
  # @usages:
  #   je m'identifie [par JS | par javascript | par le formulaire] comme testeur
  #   je m'indentifie [par ...] comme [admin | testeur]
  #   je m'identifie [par ...] avec des codes invalides
  # --
  par = $1
  par_js = par == nil || ["par javascript","par JS"].include?(par)
  comme = $2
  @mail, @password = case comme.strip
  when "comme testeur"            then 
    ["benoit.ackerman@yahoo.fr", "testeur"]
  when "comme admin"              then 
    [DATA_PHIL[:mail], DATA_PHIL[:password]]
  when "avec des codes invalides" then 
    ["pasbon", "paspropre"]
  else
    raise "Il faut spécifier l'utilisateur (`comme testeur', `comme admin', `avec des codes invalides')"
  end
  SUser identify @mail, @password, par_js

  
when "j'apelle la méthode d'identification" then
  # Force l'affichage du formulaire d'identification
  # Maintenant, il vaut mieux passer par la sentence qui clique sur
  # le lien "S'identifier/S'inscrire"
  # --
  Browser call "User.need_to_signin()"