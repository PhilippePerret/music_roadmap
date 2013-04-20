=begin
  Procédures de chargement de l'utilisateur
  @noter qu'elle n'est pas appelée directement, au bénéfice de :check qui
  vérifie aussi que les données d'identification soient correctes
  
  @note:  On pourrait très bien ne se servir que du mail pour remonter l'user,
          mais dans ce cas il y aurait une grave faille car le hacker pourrait
          invoquer la procédure avec un mail qu'il connait pour remonter le
          md5, ce qui lui permettrait de faker l'user. Donc on demande 
          toujours le password pour cette procédure.
=end
require_model 'user'

def ajax_user_load
  duser = param(:user)
  RETOUR_AJAX[:user]  = user_load duser['mail'], duser['password']
  RETOUR_AJAX[:error] = "ERRORS.User.unknown" if RETOUR_AJAX[:user].nil?
end

def user_load mail, password
  return nil if mail.nil?
  return nil if password.nil?
  user = User.new(mail)
  return nil unless user.exists?
  return nil unless user.valide_with? password
  return user.data_mini
end