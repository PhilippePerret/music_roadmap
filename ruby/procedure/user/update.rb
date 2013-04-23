=begin

  Procédure d'actualisation de l'utilisateur.
  
  Pas encore utilisé, mais je l'implémente pour se souvenir qu'il faut surveiller le
  paramètre 'roadmaps' qui, si la liste est vide, n'est pas transmis par Ajax.
  
=end

def ajax_user_update
  
end

def user_update data
  
  data = data.merge('roadmaps' => []) unless data.has_key?('roadmaps')
  
end