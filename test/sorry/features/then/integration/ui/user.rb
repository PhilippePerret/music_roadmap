when "la boite d'identification doit s'afficher" then
  # Test de l'affichage à l'écran de la boite d'identification
  Browser should display div :id => 'user_signin_form'

when "la boite d'inscription doit s'afficher" then
  # Vérifie que la boite d'inscription soit bien affichée. Attend un peu le cas
  # échéant.
  # --
  Browser should display table :id => 'user_signup_form'

when /la boite d'inscription ne doit (plus|pas) être affichée/ then
  # Vérifie que la boite d'inscription ne soit plus ouverte
  # --
  Browser should not contain table :id => 'user_signup_form'
  
when /la boite d'identification ne doit (pas|plus) être (affichée|ouverte)/ then
  Browser should not contain div :id => 'user_signin_form'
  
when "la boite d'identification doit contenir les bons éléments" then
  # Test du contenu de la boite d'identification
  # @note: elle doit avoir été affichée par une spec, mais on attend ici qu'elle soit
  # bien affichée (si elle doit l'être)
  # --

  odiv = Browser get div( :id => 'user_signin_form', :wait => true )
  
  # Un titre
  odiv should contain td :id => 'signin_label_titre'
  otd = odiv.td(:id => 'signin_label_titre')
  otd.html should contain "LOCALE_UI.User.Signin.TITRE".js
  odiv should contain input :type => 'text', :id => 'user_mail'
  odiv should contain input :type => 'password', :id => 'user_password'
  odiv should contain a :id => 'btn_signin'
  odiv should contain a :id => 'btn_want_signup'
  odiv should contain a :id => 'btn_cancel_signin'

when "la boite d'inscription doit contenir les bons éléments" then
  # Vérifie que la boite d'inscription contienne bien les bons éléments
  # 
  # L'ouverture doit avoir été demandée par une autre spec sentence, mais on attend ici
  # que la boite soit bien ouverte pour commencer à checker
  # --
  
  otable = Browser get table( :id => 'user_signup_form', :wait => true)
  
  # Un titre
  otable should contain td :id => 'signup_label_titre'
  otd = otable.td(:id => 'signup_label_titre')
  otd.html should contain "LOCALE_UI.User.Signup.TITRE".js
  
  otable should contain input :type => 'text', :id => 'user_nom'
  otable should contain input :type => 'text', :id => 'user_mail'
  otable should contain input :type => 'text', :id => 'user_mail_confirmation'
  otable should contain input :type => 'password', :id => 'user_password'
  otable should contain input :type => 'password', :id => 'user_password_confirmation'
  otable should contain input :type => 'text', :id => 'user_instrument'
  otable should contain textarea :id => 'user_description'
  
  otable should contain a :id => 'btn_signup'
  otable should contain a :id => 'btn_cancel_signup'
  
# fin
end
