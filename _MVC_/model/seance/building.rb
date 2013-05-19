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
      debug "*** PRÉPARATION DE LA SÉANCE DU #{@seance.day} ***"
      debug "Paramètres envoyés : #{params.inspect}"
      analyze_params
    end
    
    # Pour suivre le programme
    # On sort en offline un fichier assez conséquent contenant les informations 
    # du traitement effectué
    def debug text
      return if @no_debug ||= Params::online?
      prepare_debug if @debug_ready.nil?
      text = "<div>#{text}</div>" unless text.start_with?('<')
      File.open(@path_debug, 'a'){|f| f.write "#{text}\n"}
    end
    def prepare_debug
      folder_debug = File.join(APP_FOLDER,'tmp','debug')
      Dir.mkdir(folder_debug, 0777) unless File.exists?(folder_debug)
      @path_debug = File.join(folder_debug,"prepare_seance_#{@seance.day}.html")
      File.unlink(@path_debug) if File.exists?(@path_debug)
      @debug_ready = true
    end
    def entete_debug
      <<-EOC
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Préparation séance #{@seance.day}</title>
  <style type="text/css">
div#div_operations{
  height:300px;max-height:300px;overflow-y:scroll;
}
div#div_operations > div {margin-bottom:8px;}
div#div_operations div.operation {
  border:1px solid #999;
  margin-bottom:1em;
  border-radius:0.5em;
  padding:1em;
}
div#div_operations div.operation > span {font-weight:bold;font-size:1.1em;}
div#div_operations div.operation span.idval{
  display:inline-block;width:80px;
}
  </style>
</head>
<body>
      EOC
    end
    # À la fin du debug, on prend le contenu du document HTML, on le place dans un
    # div avec scrollbar et on place au-dessus les informations sur les exercices pour
    # une meilleure vision.
    # Et on finalise le document
    def end_debug
      return if @no_debug
      code =  '<div id="div_operations">'+
              File.read(@path_debug) +
              debug_end_report.gsub(/\n/,'<br>') +
              '</div>' + 
              debug_infos_exercices
      File.open(@path_debug, 'wb') do |f| 
        f.write entete_debug + code + "</body></html>"
      end
    end
    def debug_end_report
      props = [:working_time, :real_nb_fois, :number_of_times, :seances_working_time]
      dataexos = exercices.collect do |idex, iex|
        props_str = props.collect do |prop|
          valprop = iex.send(prop)
          "#{prop}: #{valprop}"
        end.join(', ')
        "#{debug_id_linked(idex)} = #{props_str}"
      end.join("\n")
      <<-EOC
***
Temps de travail obtenu  : #{@seance_duration.to_i.as_horloge}
Exercices retenus : #{debug_ids_exercices_with_anchor}
Configuration générale: #{@config_generale.inspect}
GAMME CHOISIE POUR LA SÉANCE : #{ISCALE_TO_HSCALE[config_generale[:tone]]}
Gammes inutilisées: #{@unused_tones.join(', ')}
***
DONNÉES DES EXERCICES (quelques données récupérées de l'instance Exercice) : 
#{dataexos}
***
DONNÉES TOTALES DES SÉANCES : 
#{seances.collect{|v| "#{v[:day]} => #{v.inspect}"}.join("\n")}
***
      EOC
    end
    def debug_infos_exercices
      require 'module/exos_seance_to_table.rb'
      build_table_exos( roadmap, nil, {:sort => :by_numero} )
    end
    # Prend la liste d'identifiant d'exercices +liste+ et en fait une liste où on peut
    # cliquer sur les exercices pour les afficher dans la table de données
    # Retourne la liste à afficher
    # @param  liste   Array des exercices. Par defaut : @ids_exercices
    #                 OU Hash où la clé est l'identifiant et la valeur une valeur
    #                 Si option[:method_value] est défini, on applique cette méthode
    #                 à la valeur pour l'afficher (avec send)
    # @param  options Options
    #                 :sort_by_value    Si liste est un Hash et que cette option est
    #                                   TRUE, on classe la liste.
    # @return String de la liste des identifiants liés
    def debug_ids_exercices_with_anchor liste = nil, options = nil
      liste ||= @ids_exercices
      options ||= {}
      if liste.class == Array
        ("(#{liste.count}) ") + liste.collect do |id|
          "<a href=\"#exo-#{id}\">#{id}</a>"
        end.join(' ')
      else
        method_value = options.has_key?(:method_value) ? options[:method_value] : 'to_s'
        if options[:sort_by_value]
          ("(#{liste.count})<br>") + liste.sort_by{|id,val| val}.collect do |id,value|
            value = case value
            when nil then "null"
            else value.send(method_value) end
            debug_id_et_value id, value
          end.join(' ')
        else
          ("(#{liste.count})<br>") + liste.collect do |id, value|
            debug_id_et_value(id, value.send(method_value))
          end.join(' ')
        end
      end
    end
    # @param id   Obligatoirement un identifiant d'exercice
    def debug_id_et_value id, value
      '<span class="idval">'+"#{debug_id_linked(id)}: #{value}</span>"
    end
    # Return exercice ID linked to its data
    def debug_id_linked id
      "<a href=\"#exo-#{id}\">#{id}</a>"
    end
    
    # Data returned for the seance returned (main function)
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
      # average working time in last seances. Worth to note that the value can
      # be nil.
      # Set a @nb_fois_per_exercice Hash where key is exercice ID and value if the
      # number of user works on the exercice
      etat_des_lieux
      unless @no_debug
        debug "<div class=\"operation\"><span>ÉTAT DES LIEUX</span>"
        debug "ids_exercices : #{debug_ids_exercices_with_anchor}"
        debug "Le <b>temps moyen par exercice</b> (@average_working_time - classée ci-dessous par ordre croissant) :"
        debug debug_ids_exercices_with_anchor(
                @average_working_time,
                {:method_value => 'as_short_horloge', :sort_by_value => true}
                )
        debug "Le <b>Nombre de fois par exercice</b> (@nb_fois_per_exercice - classée ci-dessous par ordre croissant) :"
        debug debug_ids_exercices_with_anchor(@nb_fois_per_exercice, {:sort_by_value => true})
        debug "</div>"
      end
      
      # Get exercices working time
      # 
      # @time_per_exercice
      # ------------------
      # The absolute duration of the exercice, calculated with tempo and
      # number of measures and number of beats per measure
      # An Hash where key is exercice ID and value is the time as number of seconds.
      # 
      # @nb_fois_per_exercice
      # ---------------------
      # Le nombre de fois calculé où l'exercice a été joué. Ce nombre correspond à 
      # la moyenne entre :
      #   - le nombre de fois réelles où l'exercice a été joué
      #   - le nombre de fois calculé par rapport au temps de travail sur l'exercice
      #     et sa durée absolue.
      work_time_per_exercice
      unless @no_debug
        debug "<div class=\"operation\"><span>WORK TIME PER EXERCICE</span>"
        debug "Le <b>Time par exercice</b> (@time_per_exercice / temps absolu des exercices):"
        debug debug_ids_exercices_with_anchor(
                @time_per_exercice,
                {:method_value => 'as_short_horloge', :sort_by_value => true}
                )
        debug "Le <b>Nombre de fois par exercice</b> (@nb_fois_per_exercice, moyenne entre le nombre de fois réelle où l'exercice a été joué et le nombre de fois calculée par le temps de travail):"
        debug debug_ids_exercices_with_anchor(
                @nb_fois_per_exercice, {:sort_by_value => true})
        debug "</div>"
      end

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
      unless @no_debug
        debug "<div class=\"operation\"><span>FILTRAGE DES OBLIGATOIRES</span>"
        debug "- Liste des <b>exercices obligatoires</b> :"
        debug debug_ids_exercices_with_anchor(@mandatories)
        debug "- <b>Temps consumé</b> par ces exercices obligatoires : #{@time_for_mandatories.as_horloge}"
        debug "@ids_exercices sans les obligatoires : #{debug_ids_exercices_with_anchor}"
        debug "</div>"
      end
      
      # Filter exercices per required difficulties (if any)
      # -> @ids_exercices   (with only exercices required)
      # -> @others_idex     (exercices whose not fit the difficulties
      #                      required -- but if option :same_ex is not true, 
      #                      these exercices can be used)
      # ----------------------------------------------------
      # 
      # Retire les mauvais ids de @ids_exercices
      filter_exercices_per_difficulties
      unless @no_debug
        debug "<div class=\"operation\"><span>FILTRAGE PAR DIFFICULTÉS</span>"
        if types.count == 0
          debug "Aucun type requis."
        else
          debug "Exos correspondant aux difficultés choisis (nouvelle @ids_exercices):"
          debug debug_ids_exercices_with_anchor
          debug "Exos ne correspondant pas aux difficultés choisies (@others_idex) :"
          debug debug_ids_exercices_with_anchor(@others_idex)
        end
        debug "</div>"
      end
      
      # Get general config
      # ------------------
      # We change for next config if required
      @config_generale = get_general_config
      
      # Replace tone with an unused tone
      @config_generale[:tone] = choose_a_tone
      
      # So we can choose the exercices
      # -> @ids_exercices
      # -> @seance_duration
      # --------------------------------------------------------
      
      debug "<div class=\"operation\"><span>SÉLECTION DES EXERCICES</span>"
   
      select_exercices
   
      unless @no_debug
        debug "@ids_exercices après select_exercices (non mélangés ni classés) :"
        sans_obligatories = @ids_exercices[0..-@mandatories.count]
        debug debug_ids_exercices_with_anchor(sans_obligatories) +
              " + #{debug_ids_exercices_with_anchor(@mandatories)} (obligatoires)"
        debug "</div>"
      end

      # Randomize order or put id at the right place
      # ---------------------------------------------
      # Take the Exercices IDs in @ids_exercices and blender them
      if @ids_exercices != nil
        debug("<div class=\"operation\"><span>RECLASSEMENT OU MÉLANGE</span>")
        if options[:aleatoire]
          shuffle_order
          unless @no_debug
            debug "@ids_exercices après shuffle_order :"
          end
        elsif options[:obligatory]
          right_placize
          debug "@ids_exercices après right_placize :"
        else
          # Nothing to do
        end
        debug debug_ids_exercices_with_anchor unless @no_debug
        
        # On supprime les doublons
        dedoublonne_ids_exercices
        
        unless @no_debug
          debug "@ids_exercices après dédoublonnage (liste finale) :"
          debug debug_ids_exercices_with_anchor
          debug "</div>"
        end
      end
      
      # Build the message
      # -----------------
      # This message is displayed for musician before to run working
      # session. It's a summary of this working session.
      # message = ""
      end_debug
      seance_data = @config_generale.dup
      seance_data = seance_data.merge(
        :working_time     => @seance_duration,
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
      unless @no_debug
        debug "Exercices <b>classés par le nombre de fois</b> (du moins au plus joué)"
        debug debug_ids_exercices_with_anchor(less_worked)
      end
      # On récolte les exercices, jusqu'au temps voulu
      @ids_exercices  = []
      duree_required  = time.to_i
      seance_duration = @time_for_mandatories
      unless @no_debug
        debug "État des lieux des <b>temps avant recherche jusqu'au temps donné</b>"
        debug "seance_duration : #{seance_duration.as_horloge}"
        debug "Durée attendue  : #{time.as_horloge}"
        debug "Durée des obligatoires : #{@time_for_mandatories.as_horloge}"
        debug "Durée à trouver : #{duree_required.as_horloge}"
      end
      less_worked.each do |idex|
        ex_working_time = @time_per_exercice[idex]
        # Si ça dépasse trop le temps, on ne prend pas cet exercice
        if (seance_duration + ex_working_time) > (duree_required + (10 * 60))
          debug "-> l'exercice #{debug_id_linked(idex)} est passé car la durée exéderait de plus de 10 minutes le temps demandé"
          next
        end
        # Sinon, on prend cet exercice
        @ids_exercices << idex
        seance_duration += ex_working_time
        break if seance_duration >= duree_required
      end
      
      unless @no_debug
        debug "Après un premier tour"
        debug "seance_duration : #{seance_duration.as_horloge}"
        debug "Durée attendue  : #{time.as_horloge}"
      end
      
      # Maybe the required duration (duree_required) is not reached (not enough exercice)
      # In that case, if :same_ex option is true, we add exercices already choosed, or
      # we add other exercices.
      while seance_duration < duree_required
        pioches_ids = options[:same_ex] ? @ids_exercices : @others_idex
        pioches_ids = pioches_ids.sort_by{|idex| @nb_fois_per_exercice[idex]}
        while seance_duration < duree_required && ! pioches_ids.empty?
          id = pioches_ids.pop
          ex_working_time = @time_per_exercice[id]
          
          # On ne prend pas un exercice qui produirait une séance débordant de plus
          # de 10 minutes.
          if (seance_duration + ex_working_time) > (duree_required + (10 * 60))
            debug "-> l'exercice #{debug_id_linked(idex)} est passé car la durée exéderait de plus de 5 minutes le temps demandé"
            next
          end
          
          @ids_exercices << id
          seance_duration += ex_working_time
        end
      end
      
      # We finaly add the mandatory exercices (if any)
      @ids_exercices += @mandatories
 
      unless @no_debug
        debug "À la fin de select_exercice"
        debug "seance_duration : #{seance_duration.as_horloge}"
        debug "Durée attendue  : #{time.as_horloge}"
        debug "Durée des obligatoires : #{@time_for_mandatories.as_horloge}"
        debug "Durée à trouver : #{duree_required.as_horloge}"
      end
      
      @seance_duration = seance_duration
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
        array_nbfois = hash_by_nbfois.keys.sort # Array contenant les nombres de fois trouvées
        unless @no_debug
          debug "Hash par nombre de fois. La clé est le nombre de fois, la valeur la liste des exercices joués ce nombre de fois"
          debug "hash_by_nbfois = #{hash_by_nbfois.inspect}"
          debug "Liste des nombres de fois trouvés (classée) : #{array_nbfois.join(', ')}"
        end
        # Shuffle
        ary_by_nbfois_shuffled = []
        array_nbfois.each do |nbfois|
          ary_by_nbfois_shuffled += hash_by_nbfois[nbfois].shuffle
        end
        unless @no_debug
          debug "Liste des ids classés par nb fois, après mélange des exercices ayant été joués le même nombre de fois :"
          debug debug_ids_exercices_with_anchor(ary_by_nbfois_shuffled)
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
        nbf = nbf.merge idex => ((iex.real_nb_fois + iex.number_of_times) / 2 ).to_i
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
      debug "Temps de travail demandé : #{@time.as_horloge}"

      # * DIFFICULTIES (= exercice types)
      #   params[:difficulties]
      @types = params[:difficulties].split(',')
      debug "Types recherchés : #{@types.inspect}"

      # * OPTIONS
      #   params[:options]:
      #     :same_ex::        Enable to repeat a same ex (if difficulties)
      #     :next_config::    Set next general config
      #     :new_tone::      New tone (take last or 0 for "C")
      #     :obligatory::     Include obligatory exercices
      # 
      @options = params[:options].values_str_to_real
      debug "Options : #{@options.inspect}"
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