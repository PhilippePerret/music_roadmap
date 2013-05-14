=begin
  Class Seance::Building
  
  Create a working session
  
=end
require 'params'
require_model 'roadmap' unless defined?(Roadmap)

class Seance
  class Building
  
    DEBUG = Params::offline?
    
    # Seance mother
    # 
    attr_reader :seance
    
    # Init params provided by user
    # 
    # @note: contains all parameters, i.e. :options below.
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
      # -> @average_working_time
      # -> @nb_fois_per_exercice
      # ---------------------
      # Set a @ids_exercices Array with exercices of roadmap ('ordre')
      # Set a @exercices Hash with exercices in 'ordre'
      #       key is exercice ID — String, value is an Exercice instance.
      #       Note that `index' attribute is defined, used when :aleatoire is false, to
      #       put mandatory exercices at the right place at the end.
      # Set a @seances Array with Hashes of up to 50 last seance.
      # Set a @average_working_time Hash where key is exercice ID and value is
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

      # Putting aside the mandatory exercices (if :obligatory option is true)
      # 
      # * PRODUCTS
      #   @time_for_mandatories   Seconds consumed by mandatories exercices
      #   @mandatories            Array of exercices IDs
      #   Remove exercice IDs from @ids_exercices
      # 
      # @note: Do nothing if :obligatory option is false
      # 
      filter_mandatories
      
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
      @config_generale = get_general_config
      
      # Replace tone with an unused tone
      @config_generale[:tone] = choose_a_tone
      
      # So we can choose the exercices
      # -> @ids_exercices
      # -> @duree_courante
      # --------------------------------------------------------
      select_exercices
      debug "ids_exercices après select_exercices (non shuffled or sorted):\n#{@ids_exercices.inspect}"

      # Randomize order or put id at the right place
      # ---------------------------------------------
      # Take the Exercices IDs in @ids_exercices and blender them
      if @ids_exercices != nil
        if options[:aleatoire]
          shuffle_order
          debug "ids_exercices après shuffle_order:\n#{@ids_exercices.inspect}"
        elsif options[:obligatory]
          right_placize
          debug "ids_exercices après right_placize:\n#{@ids_exercices.inspect}"
        else
          # Nothing to do
        end
        dedoublonne_ids_exercices
        debug "ids_exercices après dédoublonnage ( = liste finale):\n#{@ids_exercices.inspect}"
      end
      
      # Build the message
      # -----------------
      # This message is displayed for musician before to run working
      # session. It's a summary of this working session.
      message = ""
      if DEBUG
        message = <<-EOM
<div style="clear:both;"></div>
<pre id="pre_debug" style="padding:2em;font-size:11px;">
<a href="#" onclick="$('pre#pre_debug').remove();return false;">REMOVE THIS DEBUG</a>
Paramètres envoyés : #{params.inspect}
Temps de travail demandé : #{time}
Types : #{types.inspect}
Options : #{options.inspect}
Gammes inutilisées: #{@unused_tones.join(', ')}
Exercices ne correspondant pas au type: #{@others_idex.inspect}
Exercices obligatoires: #{@mandatories}
Temps occupé par les exercices obligatoires: #{@time_for_mandatories}
Temps moyen de travail dans les séances : #{@average_working_time.inspect}
Temps moyen calculé : #{@time_per_exercice.inspect}
Nombre de fois par exercice : #{@nb_fois_per_exercice.inspect}
***
Temps de travail obtenu  : #{@duree_courante}
Exercices retenus : #{@ids_exercices.join(', ')}
Configuration générale: #{@config_generale.inspect}
GAMME CHOISIE POUR LA SÉANCE : #{ISCALE_TO_HSCALE[config_generale[:tone]]}
***
DEBUG
#{@debug.join("\n")}
</pre>
      EOM
        RETOUR_AJAX[:debug_building_seance] = message if defined?(RETOUR_AJAX)
      end
      seance_data = @config_generale.dup
      seance_data = seance_data.merge(
        :message          => message.to_html,
        :working_time     => @duree_courante,
        :suite_ids        => @ids_exercices
      )
    end

    # Putting aside the mandatory exercices and calcultate consumed time
    # (@note: only if :obligatory option is true)
    def filter_mandatories
      @time_for_mandatories = 0
      @mandatories = []
      return unless options[:obligatory]
      @exercices.each do |idex, iex|
        next unless iex.obligatory?
        @mandatories << @ids_exercices.delete(idex)
        @time_for_mandatories += @time_per_exercice[idex]
      end
    end
    
    # Keep in @ids_exercices only the exercices to work on.
    # 
    # 
    def select_exercices
      # @nb_fois_per_exercice
      # On classe les exercices par le nombre de fois qu'ils ont été joués au cours
      # des dernières séances. Les premiers exercices sont les moins travaillés, en 
      # nombre de fois
      # 
      # * NOTES
      # 
      #   Un exercice peut avoir été travaillé peu de fois, mais longtemps. Il 
      #   faut donc calculer le nombre de fois réelle en fonction de la durée 
      #   de l'exercice et le temps où il a été joué.
      #   real_nb_fois = working_time / duration_exercice.
      # 
      #   Quand le musicien veut jouer les exercices dans un ordre aléatoire, il 
      #   faut shuffle les exercices par nombre de fois (cf. Issue #80)
      # 
      less_worked = exercices_sorted_by_nb_fois
      debug "less_worked in select_exercices : #{less_worked.inspect}"
      # On récolte les exercices, jusqu'au temps voulu
      @ids_exercices  = []
      duree_required  = time.to_i - @time_for_mandatories
      duree_courante  = 0
      less_worked.each do |idex|
        ex_working_time = @time_per_exercice[idex]
        @ids_exercices << idex
        duree_courante  += ex_working_time
        break if duree_courante >= duree_required
      end
      
      # Maybe the required duration (duree_required) is not reached (not enough exercice)
      # In that case, if :same_ex option is true, we add exercices already choosed, or
      # we add other exercices.
      while duree_courante < duree_required
        pioches_ids = options[:same_ex] ? @ids_exercices : @others_idex
        pioches_ids = pioches_ids.sort_by{|idex| @nb_fois_per_exercice[idex]}
        while duree_courante < duree_required && ! pioches_ids.empty?
          id = pioches_ids.pop
          @ids_exercices << id
          duree_courante += @time_per_exercice[id]
        end
      end
      
      # We finaly add the mandatory exercices (if any)
      @ids_exercices += @mandatories
      
      @duree_courante = duree_courante
    end
    
    # Return the exercice list sorted by number of times (calculated).
    # If :aleatoire option (random) is set to TRUE, we shuffle by nb of time, so
    # the exercices will not be picked up in order.
    def exercices_sorted_by_nb_fois
      if options[:aleatoire]
        hash_by_nbfois = {}
        @ids_exercices.each do |idex| 
          nbfois = @nb_fois_per_exercice[idex]
          hash_by_nbfois = hash_by_nbfois.merge(nbfois=>[]) unless hash_by_nbfois.has_key?(nbfois)
          hash_by_nbfois[nbfois] << idex
        end
        # Shuffle
        ary_by_nbfois_shuffled = []
        hash_by_nbfois.each do |nbfois, ids_list|
          ary_by_nbfois_shuffled += ids_list.shuffle
        end
        return ary_by_nbfois_shuffled
      else
        return @ids_exercices.sort_by{|idex| @nb_fois_per_exercice[idex]}
      end
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
      tpe = {}
      exercices.each { |idex, iex| tpe = tpe.merge idex => iex.working_time }
      @time_per_exercice = tpe
    end
    
    # Define the average working time of exercice +idex+ in last seances
    # 
    # * NOTES
    # 
    #   Since version 0.8.5, the number of times is calculated according to the
    #   worked time on exercice and the real exercice duration. If an exercice of
    #   1 minute has been playing during 3 minutes, we considere it has been played
    #   3 times.
    # 
    # * PRODUCTS
    #   - @average_working_time where key is the exercice ID and
    #   value is the average working time of the exercice
    #   - @nb_fois_per_exercice : the number of times per exercices (note all
    #     exercices defined in @ids_exercices has a key, and maybe the 0.0 value if
    #     exercice has not been worked yet)
    # 
    def average_working_times
      nbf, awk = {}, {}
      exercices.each do |idex, iex|
        nbf = nbf.merge idex => iex.real_nb_fois
        awk = awk.merge idex => iex.seances_working_time
      end
      @nb_fois_per_exercice = nbf
      @average_working_time = awk
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
    
    # Choose a tone
    # 
    # If :tone of config_generale is not in the tones used in the 23 past
    # sessions, we choose it.
    def choose_a_tone
      if @unused_tones.empty?
        rand(24)
      elsif @unused_tones.include?( config_generale[:tone] )
        config_generale[:tone]
      else
        @unused_tones.shuffle.first.to_i
      end
    end
    
    # Return general configuration
    # 
    # If options[:next_config] is true, then we take the next configuration
    # saving it.
    # 
    def get_general_config
      if options[:next_config]
        roadmap.next_general_config(:save => true, :tone => options[:new_tone])
      else
        roadmap.config_generale
      end
    end
    
    # Randomize order of exercices
    # 
    def shuffle_order
      @ids_exercices = @ids_exercices.shuffle
    end
    
    # Or put exercices at the right place
    # 
    # * NOTE
    # 
    #   When an exercice should be played more than once, it is put at the
    #   end of session (deep level when exercice is played two or more times).
    # 
    def right_placize
      @ids_exercices.sort_by{|idex| @exercices[idex].index}
    end
    
    # An exercice played twice should not follow itself
    def dedoublonne_ids_exercices
      final_order = []
      doublons    = @ids_exercices
      until doublons.empty?
        ary, doublons = extract_doublons( doublons )
        debug("ary:#{ary.inspect}\ndoublons:#{doublons.inspect}")
        final_order += ary
      end
      @ids_exercices = final_order
    end
    
    # Put aside the doublons of +ary+
    # @return an Array with [epured ary, doublons]
    def extract_doublons ary
      final, doublons = [], []
      ary.each do |id|
        if final.include?( id ) then doublons << id else final << id end
      end
      return [final, doublons]
    end
    
    # Etat des lieux -- Get all required data
    # 
    def etat_des_lieux
      @ids_exercices  = roadmap.ordre_exercices
      @exercices  = {}
      index       = 0
      @ids_exercices.each do |idex|
        iex = roadmap.exercice( idex )
        iex.index   = (index += 1)
        @exercices  = @exercices.merge idex => iex
      end
      hseances = Seance::lasts(roadmap)
      @seances = hseances[:sorted_days].collect{|jour|hseances[:seances][jour]}
      @last_tones    = get_last_tones 23
      @unused_tones  = get_unused_tones
      average_working_times
    end
    
    # Return tones unused during the last sessions
    # 
    # @note: needs to know @last_tones
    # 
    def get_unused_tones
      (0..23).collect do |sca|
        next if @last_tones.include?(sca)
        sca
      end.reject{|e|e.nil?}
    end
    # Get up to +upto+ last tones (default: 23)
    # 
    # @return an Array of tones (as Fixnum with 0-start = "C")
    # 
    # @note: @seances should have been defined and contain up to 50 last seances, from
    # youngest to oldest
    # 
    def get_last_tones upto = 23
      upto = [upto, @seances.count].max - 1
      tones = []
      @seances[0..upto].each do |hseance|
        next if hseance[:tone] === nil
        tones += hseance[:tone]
      end
      tones
    end

    # Analyze params provided by musician
    # 
    def analyze_params
      @params = @params.to_sym

      # * WORKING TIME
      #   params[:working_time]     In seconds
      @time  = params[:working_time].to_i * 60

      # * DIFFICULTIES (= exercice types)
      #   params[:difficulties]
      @types = params[:difficulties].split(',')

      # * OPTIONS
      #   params[:options]:
      #     :same_ex::        Enable to repeat a same ex (if difficulties)
      #     :next_config::    Set next general config
      #     :new_tone::      New tone (take last or 0 for "C")
      #     :obligatory::     Include obligatory exercices
      # 
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