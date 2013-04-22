when "visiteur identifié", "user identified"
  # Identify un visiteur quelconque (ici benoit ackerman)
  # --
  dbenoit = get_data_benoit
  SUser identify dbenoit[:mail], dbenoit[:password]

when "visiteur non identifié", "user not identified"
  # Logout le visiteur s'il y en a un d'identifié
  # --
  SUser logout

when "les données d'utilisateur sont correctes" then
  # Mets dans @user_mail et @user_password des données correctes, c'est-à-dire
  # les données d'un utilisateur existant.
  # --
  @user_mail      = dbenoit[:mail]
  @user_password  = dbenoit[:password] 

when "les données d'utilisateur ne sont pas correctes" then
  @user_mail      = "nimportequoi"
  @user_password  = "du pipeau"