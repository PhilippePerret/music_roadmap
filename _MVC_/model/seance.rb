=begin

  Class Seance
  -------------
  
  Gestion des séances de travail

  Class qui en tout premier lieu confectionne une séance de travail pour le musicien
  
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