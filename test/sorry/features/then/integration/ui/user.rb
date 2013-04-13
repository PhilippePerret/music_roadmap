when /la boite d'identification doit être (affichée|ouverte)/ then
  # Test de l'affichage à l'écran de la boite d'identification
  Browser should display div :id => 'user_signin_form'
  
when /la boite d'identification ne doit (pas|plus) être (affichée|ouverte)/ then
  Browser should not contain div :id => 'user_signin_form'
  
when "la boite d'identification doit contenir les bons éléments" then
  # Test du contenu de la boite d'identification
  # @note: elle doit avoir été affichée par une spec
  