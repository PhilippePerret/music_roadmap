when "visiteur identifié", "user identified"
  # Identify un visiteur quelconque (ici benoit ackerman)
  # --
  User identify "benoit.ackerman@yahoo.fr", "testeur"

when "visiteur non identifié", "user not identified"
  # Logout le visiteur s'il y en a un d'identifié
  # --
  User logout

when "les données d'utilisateur sont correctes" then
  # Mets dans @user_mail et @user_password des données correctes, c'est-à-dire
  # les données d'un utilisateur existant.
  # --
  @user_mail      = "benoit.ackerman@yahoo.fr"
  @user_password  = "testeur" 

when "les données d'utilisateur ne sont pas correctes" then
  @user_mail      = "nimportequoi"
  @user_password  = "du pipeau"