when /les données d'inscription n'ont pas de (.+)$/ then
  # Définir les données d'inscription avec une données manquante
  # 
  # --
  @data_user = get_data_user_valides unless defined?(@data_user)
  to_delete = $1.to_sym
  @data_user.delete( to_delete )

when /les données d'inscription ont une? mauvaise? (.+)$/ then
  # Met une mauvaise donnée dans les données de l'utilisateur @data_user qui doivent
  # servir plus tard
  # 
  # --
  @data_user = get_data_user_valides unless defined?(@data_user)
  to_badify  = $1.strip
  @data_user =
    case to_badify
    when 'mail' then @data_user.merge :mail => "averybadmail"
    when 'confirmation de mail' then @data_user.merge :mail_confirmation => "bouhhh"
    when 'password' then @data_user.merge :password => "avec des chars impossible !"
    when 'confirmation de password' then @data_user.merge :password_confirmation => "houps"
    end
    
    
# Fin du fichier
end