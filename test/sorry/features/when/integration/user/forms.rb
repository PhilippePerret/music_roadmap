when "je remplis le formulaire d'identification" then
  # Remplissage du formulaire d'identification
  # 
  # @user_mail et @user_password doivent avoir été définis avant, dans une
  # spec-clause `Si ...'
  # --
  Browser should display 'div#user_signin_form'
  Browser set :user_mail      => @user_mail
  Browser set :user_password  => @user_password
  
when "je remplis le formulaire d'inscription" then
  # Remplis le formulaire d'inscription avec les données fournies
  # 
  # Les data doivent impérativement se trouver dans @data_user. Elles peuvent être
  # correctes ou erronés
  # Le formulaire doit avoir été ouvert précédemment
  # 
  # --
  raise "@data_user doit impérativement être défini" if !defined?(@data_user) || @data_user.nil?
  # On essaie en attendant 5 secondes
  @data_user.each do |prop,val|
    Browser set "user_#{prop}".to_sym => val
  end
  
# fin du fichier
end 