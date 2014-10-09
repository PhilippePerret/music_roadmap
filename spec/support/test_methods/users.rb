#  Méthodes tests pour les utilisateurs

def user_data umail
  data_of "./user/data/#{umail}", 'msh'
end

# => Return Array des noms de roadmaps de l'utilisateur de mail +umail+
def roadmaps_of umail
  user_data(umail)[:roadmaps]
end