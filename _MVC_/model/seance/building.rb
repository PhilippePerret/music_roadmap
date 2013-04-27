=begin
  Class Seance::Building
  
  Create a working session
  
=end
require_model 'roadmap' unless defined?(Roadmap)

class Seance
  class Building
  
    DEBUG = false
    
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
    
    # Hash containing exercices
    # 
    # key: Exercice ID
    # value: instance Exercice of the exercice
    # 
    attr_reader :exercices
    
    # Array of Hashes of the 50th last seance
    # 
    # MIND! It's not Seance instances, but Hash of data saved in files
    # @see Seance.data_init to see all properties and classes
    # 
    attr_reader :seances
    
    # General configuration of exercices
    # 
    attr_reader :config_generale
    
    
    # Initialize the building seance with +params+ set by the musician
    # for the current +seance+ (instance Seance)
    # 
    def initialize seance, params
      @seance = seance
      @params = params
      @debug  = []
      analyze_params
    end
    
    # Pour suivre le programme
    def debug text
      @debug << text
    end
    
    # Data returned for the seance returned
    # 
    def data
      # get some data required
      # -> @ids_exercices
      # -> @exercices
      # -> @seances
      # -> @average_working_time_in_seances
      # -> @nb_fois_per_exercice
      # ---------------------
      # Set a @ids_exercices Array with exercices of roadmap ('ordre')
      # Set a @exercices Hash with instance Exercice of exercices in 'ordre'
      #       (key is exercice ID — String)
      # Set a @seances Array with Hashes of up to 50 last seance.
      # Set a @average_working_time_in_seances Hash where key is exercice ID and value is
      # average working time in last seance. Worth to note that the value can
      # be nil.
      # Set a @nb_fois_per_exercice Hash where key is exercice ID and value if the
      # number of user works on the exercice
      etat_des_lieux
      debug "ids_exercices après etat_des_lieux: #{@ids_exercices.inspect}"
      
      # Get exercices working time => @time_per_exercice
      # Products @time_per_exercice where key is exercice ID and value
      # the working time for the exercice, calcultated either with the working
      # time recorded previously in previous seances (priority) or with tempo and
      # number of measures and number of beats per measure
      # @time_per_exercice is the ultimate data used to build the working time
      # of the current session.
      work_time_per_exercice
      debug "ids_exercices après work_time_per_exercice: #{@ids_exercices.inspect}"
      debug "@nb_fois_per_exercice après work_time_per_exercice : #{@nb_fois_per_exercice.inspect}"
      # Filter exercices per required difficulties (if any)
      # -> @ids_exercices   (with only exercices required)
      # -> @others_idex     (exercices whose not fit the difficulties
      #                      required -- but if option :same_ex is not true, 
      #                      these exercices can be used)
      # ----------------------------------------------------
      # 
      # Retire les mauvais ids de @ids_exercices
      filter_exercices_per_difficulties
      debug "ids_exercices après filter_exercices_per_difficulties: #{@ids_exercices.inspect}"
      debug "@others_idex après filter_exercices_per_difficulties: #{@others_idex.inspect}"

      # Get general config
      # ------------------
      # We change for next config if required
      @config_generale = get_config_generale
      
      # Replace scale with an unused scale
      @config_generale[:scale] = choose_a_scale
      
      # So we can choose the exercices
      # -> @ids_exercices
      # -> @total_working_time
      # --------------------------------------------------------
      select_exercices
      debug "ids_exercices après select_exercices: #{@ids_exercices.inspect}"

      # Randomize order
      # ----------------
      # Take the Exercices IDs in @ids_exercices and blender them
      shuffle_order unless @ids_exercices.nil?
      debug "ids_exercices après shuffle_order: #{@ids_exercices.inspect}"
      
      # Build the message
      # -----------------
      # This message is displayed for musician before to run working
      # session. It's a summary of this working session.
      message = ""
      if DEBUG
        message = <<-EOM
Paramètres envoyés : #{params.inspect}
Temps de travail demandé : #{time}
Types : #{types.inspect}
Options : #{options.inspect}
Gammes inutilisées: #{@unused_scales.join(', ')}
Exercices ne correspondant pas au type: #{@others_idex.inspect}
Temps moyen de travail dans les séances : #{@average_working_time_in_seances.inspect}
Temps moyen calculé : #{@time_per_exercice.inspect}
Nombre de fois par exercice : #{@nb_fois_per_exercice.inspect}
***
Temps de travail obtenu  : #{@total_working_time}
Exercices retenus : #{@ids_exercices.join(', ')}
Configuration générale: #{@config_generale.inspect}
GAMME CHOISIE POUR LA SÉANCE : #{ISCALE_TO_HSCALE[config_generale[:scale]]}
***
DEBUG
<pre>
#{@debug.join("\n")}
</pre>
      EOM
      end
      seance_data = @config_generale.dup
      seance_data = seance_data.merge(
        :message          => message.to_html,
        :working_time     => @total_working_time,
        :suite_ids        => @ids_exercices
      )
    end

    # Set @ids_exercices to contain only the exercices to work on.
    # 
    def select_exercices
      # @nb_fois_per_exercice
      # On classe les exercices par le nombre de fois qu'ils ont été joués au cours
      # des dernières séances. Les premiers exercices sont les moins travaillés, en 
      # nombre de fois
      # @note: cependant, un exercice peut avoir été travaillé peu de fois, mais 
      # longtemps. Que faire ? Car je pourrais aussi classer par durée de travail, puisqu'elle
      # est définie.
      # less_worked = @nb_fois_per_exercice.sort_by{|e,nbfois| nbfois}.collect{|idex,nb| idex}
      less_worked = @ids_exercices.sort_by{|idex| @nb_fois_per_exercice[idex]}
      debug "less_worked in select_exercices : #{less_worked.inspect}"
      # On récolte les exercices, jusqu'au temps voulu
      @ids_exercices = []
      rest_working_time   = time.to_i
      total_working_time  = 0
      less_worked.each do |idex|
        ex_working_time = @time_per_exercice[idex]
        @ids_exercices << idex
        rest_working_time   -= ex_working_time
        total_working_time  += ex_working_time
        break if rest_working_time < 0 || total_working_time >= time
      end
      while rest_working_time > 0 && total_working_time < time
        # Il reste du temps pour occuper la séance. Soit on ajoute des exercices parmi
        # ceux qui ne correspondaient pas aux difficultés à travailler (si l'option 
        # :same_ex est false) soit on répète des exercices déjà prévus.
        pioches_ids = options[:same_ex] ? @ids_exercices : @others_idex
        pioches_ids = pioches_ids.sort_by{|idex| @nb_fois_per_exercice[idex]}
        pioches_ids = pioches_ids.shuffle
        while rest_working_time > 0 && pioches_ids.count > 0
          @ids_exercices << pioches_ids.pop
          rest_working_time   -= @time_per_exercice[other_id]
          total_working_time  += @time_per_exercice[other_id]
        end
        break if pioches_ids.count == 0
      end
      @total_working_time = total_working_time
    end
    
    # Get the working time of each exercice
    # 
    # * PRODUCTS
    # 
    #   @time_per_exercice where key is the exercice ID and value the working
    #   time of the exercice
    # 
    # * NOTES
    # 
    #   Working time is defined either on the number of measures and number of
    #   beats per measure (if defined) or on the working times recorded for the
    #   exercice in last sessions (@seances)
    # 
    def work_time_per_exercice
      @time_per_exercice = {}
      exercices.each do |idex, iex|
        nb_mesures  = iex.data['nb_mesures']
        nb_temps    = iex.data['nb_temps']
        tempo       = iex.data['tempo'].to_i
        duree = 
          if @average_working_time_in_seances[idex] != nil
            @average_working_time_in_seances[idex]
          elsif !(nb_mesures.nil? || nb_temps.nil?)
            # Calculated with mesure, beats and tempo
            (60.0 / tempo) * nb_temps * nb_mesures
          else
            # default value
            120
          end
        @time_per_exercice = @time_per_exercice.merge idex => duree
      end
    end
    
    # Define the average working time of exercice +idex+ in last seances
    # 
    # * PRODUCTS
    #   - @average_working_time_in_seances where key is the exercice ID and
    #   value is the average working time of the exercice
    #   - @nb_fois_per_exercice : the number of times per exercices (note all
    #     exercices defined in @ids_exercices has a key, and maybe the 0 value if
    #     exercice has not been worked yet)
    # 
    def average_working_time_per_exercice_in_last_seances
      @average_working_time_in_seances = {}
      @nb_fois_per_exercice = {}
      @ids_exercices.each{|idex| @nb_fois_per_exercice = @nb_fois_per_exercice.merge( idex => 0)}
      return nil if @seances.empty?
      getted = {}
      @seances.each do |hseance|
        hseance[:exercices].each do |hex|
          idex = hex[:id]
          unless getted.has_key?(idex)
            getted = getted.merge(idex => []) 
          end
          getted[idex] << hex[:time]
          @nb_fois_per_exercice[idex] += 1
        end
      end
      getted.each do |idex, ary_times|
        moyenne = ary_times.inject(:+) / ary_times.count
        @average_working_time_in_seances = @average_working_time_in_seances.merge(idex => moyenne)
      end
    end

    # Filter @ids_exercices to keep only the exercices of required difficulties
    # 
    # * PRODUCTS
    #   @ids_exercices    Liste of exercices of difficulties
    #   @others_idex      Other ids (if option :same_ex is false, we'll need this
    #                     exercice to fit the time)
    def filter_exercices_per_difficulties
      @others_idex      = [] 
      return if types.empty?
      new_ids_exercices = []
      ids_exercices.each do |idex|
        typesex = exercices[idex].data['types']
        if typesex.nil?
          @others_idex << idex
        else
          type_found = false
          types.each do |type|
            if typesex.include? type
              new_ids_exercices << idex
              type_found = true
              break
            end
          end
          @others_idex << idex unless type_found
        end
      end
      @ids_exercices = new_ids_exercices
    end
    
    # Choose a scale
    # 
    # If :scale of config_generale is not in the scales used in the 23 past
    # sessions, we choose it.
    def choose_a_scale
      if @unused_scales.empty?
        rand(24)
      elsif @unused_scales.include?( config_generale[:scale] )
        config_generale[:scale]
      else
        @unused_scales.shuffle.first.to_i
      end
    end
    
    # Return general configuration
    # 
    # If options[:next_config] is true, then we take the next configuration
    # saving it.
    # 
    def get_config_generale
      if options[:next_config]
        roadmap.next_config_generale
      else
        roadmap.config_generale
      end
    end
    
    # Randomize order of exercices
    # 
    def shuffle_order
      @ids_exercices = @ids_exercices.shuffle
    end
    
    # Etat des lieux -- Get all required data
    # 
    def etat_des_lieux
      @ids_exercices  = roadmap.ordre_exercices
      @exercices = {}
      @ids_exercices.each do |idex|
        @exercices = @exercices.merge idex => roadmap.exercice( idex )
      end
      @seances        = roadmap.get_last 50 # Array of Hash (not instances)
      @last_scales    = get_last_scales 23
      @unused_scales  = get_unused_scales
      average_working_time_per_exercice_in_last_seances
    end
    
    # Return scales unused during the last sessions
    # 
    # @note: needs to know @last_scales
    # 
    def get_unused_scales
      (0..23).collect do |sca|
        next if @last_scales.include?(sca)
        sca
      end.reject{|e|e.nil?}
    end
    # Get up to +upto+ last scales (default: 23)
    # 
    # @return an Array of scales (as Fixnum with 0-start = "C")
    # 
    # @note: @seances should have been defined and contain up to 50 last seances, from
    # youngest to oldest
    # 
    def get_last_scales upto = 23
      upto = [upto, @seances.count].max - 1
      scales = []
      @seances[0..upto].each do |hseance|
        next if hseance[:scale] === nil
        scales += hseance[:scale]
      end
      scales
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
      @time  = params[:working_time].to_i * 60

      # # * DIFFICULTIES (= exercice types)
      # #   params[:difficulties]
      @types = params[:difficulties].split(',')

      # # * OPTIONS
      # #   params[:options]:
      # #     :same_ex::        Enable to repeat a same ex (if difficulties)
      # #     :next_config::    Set next general config
      # #     :new_scale::      New scale (take last or 0 for "C")
      # #     :obligatory::     Include obligatory exercices
      @options = params[:options].values_str_to_real
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