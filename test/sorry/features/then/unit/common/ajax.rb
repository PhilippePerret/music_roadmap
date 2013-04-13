when "aucune erreur ne doit être remontée par ajax" then
  RETOUR_AJAX[:error] should be nil

when /l'erreur #{STRING} doit être remontée par ajax/ then
  err_expected = $1
  RETOUR_AJAX[:error] should be err_expected
  
when /le retour ajax doit contenir (.+)$/ then
  # Pour tester ce que doit contenir le retour ajax
  # 
  # Chaque élément attendu, exprimé explicitement, doit être défini dans 
  # une clause when ci-dessous
  # 
  # Pour certaines clauses, il est nécessaire de définir @mail avant, qui
  # doit être le mail de l'utilisateur.
  # ---
  foo = $1
  case foo.strip
  when "les données de l'utilisateur"
    user = User.new @mail
    RETOUR_AJAX[:user] should not be nil
    RETOUR_AJAX[:user] should be user.data_mini
  when "la liste des roadmaps de l'utilisateur"
    user = User.new @mail
    RETOUR_AJAX[:roadmaps] should not be nil
    RETOUR_AJAX[:roadmaps] should be user.roadmaps
  end
  

# Pour les blocs ci-dessus
end