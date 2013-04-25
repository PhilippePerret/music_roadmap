=begin
  Class Seance::Building
  
  Create a working session
  
=end
class Seance
  class Building
  
    # Seance mother
    # 
    attr_reader :seance
    
    # Init params provided by user
    # 
    attr_reader :params
    
    # Working time for the session (defined by user)
    # 
    attr_reader :time
    
    # Options for the session built (defined by user)
    # 
    attr_reader :options
    
    # Difficulty types (defined by user)
    # 
    attr_reader :types
    
    # Id of all exercices of the roadmap (in play, get in 'ordre')
    # 
    attr_reader :ids_exercices
    
    # Array of Hashes of the 50th last seance
    # 
    # MIND! It's not Seance instances, but Hash of data saved in files
    # @see Seance.data_init to see all properties and classes
    # 
    attr_reader :seances
    
    
    # Initialize the building seance with +params+ set by the musician
    # for the current +seance+ (instance Seance)
    # 
    def initialize seance, params
      @seance = seance
      @params = params
      analyze_params
    end
    
    # Data returned for the seance returned
    # 
    def data
      # get all data required
      # ---------------------
      # Set a @ids_exercices Array with exercices of roadmap ('ordre')
      # Set a @seances Array with Hashes of up to 50 last seance.
      etat_des_lieux
      
      
      # Randomize order
      # ----------------
      # Take the Exercices IDs in @ids_exercices and blender them
      shuffle_order
      
      # Build the message
      # -----------------
      # This message is displayed for musician before to run working
      # session. It's a summary of this working session.
      message = <<-EOM
  Temps de travail : #{time}
  Types : #{types.inspect}
  Options : #{options.inspect}
  Exercices retenus : #{@ids_exercices.join(', ')}
      EOM
  #     # * RETURN
  #     # Doit retourner le message de départ dans :message
  #     {
  #       :message => message.to_html
  #     }
      {
        :message => message.to_html
      }
    end
    
    # Randomize order of exercices
    # 
    def shuffle_order
      @ids_exercices = @ids_exercices.shuffle
    end
    
    # Etat des lieux -- Get all required data
    # 
    def etat_des_lieux
      @ids_exercices = roadmap.ordre_exercices
      @seances       = roadmap.get_last 50 # Array of Hash (not instances)
    end
    # Search what to use
    # 
    def confectionne
      # On a besoin de :
      #   - La liste des exercices de la roadmap
      #   - Le rapport des précédentes séances, si elles existent, et à concurence de
      #     50 séances.
      
      # Sous quelle forme présenter la données à traiter ?
      # Comme ça, je dirais qu'on a déjà besoin d'un hash avec en clé les id des exercices
      # et en valeur des données telles que :
      #   - le nombre de fois où l'exercice a été joué
      #   - le temps de travail sur l'exercice
      # 
      
    end
    
    # Analyze params provided by musician
    # 
    def analyze_params
      @params = @params.to_sym

      # # * WORKING TIME
      # #   params[:working_time]     In seconds
      @time  = params[:working_time]

      # # * DIFFICULTIES (= exercice types)
      # #   params[:difficulties]
      @types = params[:difficulties].split(',')

      # # * OPTIONS
      # #   params[:options]:
      # #     :same_ex::        Enable to repeat a same ex (if difficulties)
      # #     :next_config::    Set next general config
      # #     :new_scale::      New scale (take last or 0 for "C")
      # #     :obligatory::     Include obligatory exercices
      @options = {}
      params[:options].each do |key,val|
        val = case val
        when "true"   then true
        when "false"  then false
        when "null"   then nil
        end
        @options = @options.merge key.to_sym => val
      end
    end
    
    # Return Roadmap session
    # 
    # Shortcut for seance.roadmap
    # 
    def roadmap
      @roadmap ||= seance.roadmap
    end
    
  end # /end Building subclass
end