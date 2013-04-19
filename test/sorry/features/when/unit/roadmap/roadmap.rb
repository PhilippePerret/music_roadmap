when /je charge la roadmap #{STRING}( comme propriétaire)?/ then
  # Charge la roadmap définie par STRING, qui doit être "nom-mdp"
  # 
  # Si "comme propriétaire", alors on identifie l'utilisateur comme propriétaire
  # avant de procéder au chargement.
  # 
  # @note: ce chargement est en unitaire, on ne passe pas par les formulaires et
  # autre, mais directement par javascript.
  # --
  require_model 'roadmap'
  require_model 'user'
  
  nom, mdp = $1.split('-')
  raise "Il faut le nom et le mdp de la roadmap à charger" if nom.nil? || mdp.nil?
  rm = Roadmap.new nom, mdp
  raise "La roadmap “#{nom}-#{mdp}” est inconnue" unless rm.exists?
  owner_mail = rm.mail
  user = User.new owner_mail
  
  # On s'identifie comme possesseur de la roadmap en question
  "User.set({mail:'#{user.mail}',md5:'#{user.md5}',nom:'#{user.nom}'})".js
  # Et on charge finalement la roadmap
  "Roadmap.set('#{nom}','#{mdp}')".js
  "Roadmap.open()".js
  Browser wait_while{ "Roadmap.opening".js }
  screenshot "roadmap-open"
  