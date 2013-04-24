=begin

  Class Seance
  -------------
  
  Gestion des séances de travail

  Class qui en tout premier lieu :
    - Tient à jour les séances de travail
    - confectionne une séance de travail pour le musicien
  
  # Enregistrement des sessions de travail
    Chaque session est enregistré dans un FICHIER DU JOUR, au format json
    Dès qu'un exercice est joué suffisamment longtemps, il est enregistré
    @noter que le même exercice peut être joué plusieurs fois le même jour. Il sera
    enregistrer comme un nouvel exercice, et rentrera dans les calculs
  
  # Confection d'une séance de travail
    L'instance se sert d'un maximum de 50 séances précédentes pour connaitre les
    durées de travail des exercices et les exercices joués.
    
=end
require_model 'user'
require_model 'roadmap'

class Seance
  
  # Params session sent
  # 
  attr_reader :params
  
  # Initialize a new instance Seance
  # 
  def initialize
    
  end
  
  # Build a working session according to params
  def build_with_params params
    # * OPTIONS
    # :same_exercices:: Permet de répéter un exercice (pour se concentrer sur une difficulté)
    
    # * RETURN
    # Doit retourner le message de départ dans :message
  end
  
  # return User of the session (instance User)
  def user
    @user ||= User.new @params[:mail]
  end
  
  # Return the Roadmap of the working session (instance Roadmap)
  def roadmap
    @roadmap ||= Roadmap.new @params[:rm_nom]
  end
end