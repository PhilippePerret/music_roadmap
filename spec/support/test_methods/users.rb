#  Méthodes tests pour les utilisateurs

# => Return l'instance {User} de Benoit
def benoit
  @benoit ||= ( User::new data_benoit[:mail] )
end
def user_data umail
  data_of "./user/data/#{umail}", 'msh'
end
