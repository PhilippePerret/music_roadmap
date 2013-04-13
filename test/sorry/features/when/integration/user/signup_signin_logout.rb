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
  par_js = $1 == nil || ["par javascript ","par JS "].include?($1)
  comme = $2
  @mail, @password = case comme.strip
  when "comme testeur"            then ["benoit.ackerman@yahoo.fr", "testeur"]
  when "comme admin"              then [DATA_PHIL[:mail], DATA_PHIL[:password]]
  when "avec des codes invalides" then ["pasbon", "paspropre"]
  end
  User identify @mail, @password, par_js

  
when "j'apelle la méthode d'identification" then
  # Force l'affichage du formulaire d'identification
  # Maintenant, il vaut mieux passer par la sentence qui clique sur
  # le lien "S'identifier/S'inscrire"
  # --
  Browser call "User.need_to_signin()"

when "je remplis le formulaire d'identification" then
  # Remplissage du formulaire d'identification
  # 
  # @user_mail et @user_password doivent avoir été définis avant, dans une
  # spec-clause `Si ...'
  # --
  Browser should display 'div#user_signin_form'
  Browser set :user_mail      => @user_mail
  Browser set :user_password  => @user_password