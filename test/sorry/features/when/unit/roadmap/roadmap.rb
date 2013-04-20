when /je charge la roadmap #{STRING}( comme propriétaire)?/ then
  # Charge la roadmap définie par STRING, qui doit être "nom-umail"
  # 
  # Si "comme propriétaire", alors on identifie l'utilisateur comme propriétaire
  # avant de procéder au chargement.
  # 
  # @note: ce chargement est en unitaire, on ne passe pas par les formulaires et
  # autre, mais directement par javascript.
  # --
  require_model 'roadmap'
  require_model 'user'
  
  nom, umail = $1.split('-')
  raise "Il faut le nom et le umail de la roadmap à charger" if nom.nil? || umail.nil?
  rm = Roadmap.new nom, umail
  raise "La roadmap “#{nom}-#{umail}” est inconnue" unless rm.exists?
  owner_mail = rm.mail
  user = User.new owner_mail
  
  # On s'identifie comme possesseur de la roadmap en question
  "User.set({mail:'#{user.mail}',md5:'#{user.md5}',nom:'#{user.nom}'})".js
  # Et on charge finalement la roadmap
  "Roadmap.set('#{nom}','#{umail}')".js
  "Roadmap.open()".js
  Browser wait_while{ "Roadmap.opening".js }
  screenshot "roadmap-open"
  