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
      File.open(@path_debug, 'wb'){|f| f.write entete_debug}
      @debug_ready = true
    end
    def entete_debug
      <<-EOC
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <title>Rapport de préparation de séance - #{@seance.day}</title>
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
        f.write code + "</body></html>"
      end
    end
    def debug_end_report
      <<-EOC
***
Configuration générale: #{@config_generale.inspect}
GAMME CHOISIE POUR LA SÉANCE : #{ISCALE_TO_HSCALE[config_generale[:tone]]}
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
    
                
    # Define the average working time of exercice +idex+ in last seances
    # 
    # TODO: VOIR SI CETTE MÉTHODES EST VRAIMENT ENCORE NÉCESSAIRE
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
    
    # (main function)
    # 
    # 
    # Principe
    # --------
    #   * On fait le total de temps d'une séance si on jouait TOUS les exercices
    #   * On remonte les séances, à commencer pas la dernière
    #   * En "remontant" les séances, on supprime de la liste des exercices potentiels ceux 
    #      qui ont été joués JUSQU'À atteindre un temps restant correspondant au temps demandé.
    #      ATTENTION : on ne retire pas le temps d'un exercice déjà traité.
    #   * On se retrouve alors avec forcément la liste des exercices joués les plus lointains.
    #   * Mais dans le cas où l'ORDRE ALÉATOIRE est choisi, pour brouiller un peu les cartes,
    #     on fait la chose suivante :
    #     - On prend 20% des tous derniers exercices non joués, qu'on jouera de toute façon.
    #     - On récupère 20% des exercices joués récemments (mais les plus lointains)
    #     - On ajoute ces 20% à la liste des exercices à choisir
    #     - On les mélange et on prend les premiers qui sortent jusqu'au temps restant à occuper
    # 
    # Notes
    # -----
    #   * Le temps pris en considération ici est le temps corrigé suivant les options. Par
    #     exemple, si les exercices obligatoires sont demandés, on doit retirer leur durée du
    #     temps cherché ici.
    # 
    # Variables utiles
    # ----------------
    # - @expected_time
    #   Le temps de travail demandé (en secondes)
    #   Récupéré par `analyze_params'
    # - @duree_mandatories
    #   Le temps consummé par les exercices obligatoires
    #   Calculé par `filter_mandatories'
    # - @mandatories
    #   Liste des IDs des exercices obligatoires.
    #   Note: On peut savoir si un exercice est obligatoire par iex.obligatory?
    # - @ids_exercices
    #   Liste des ID des exercices de la roadmap, dans l'ordre
    #   Peut avoir été filtrée (ou sera filtrée ici) par `filter_exercices_per_difficulties`
    # - @total_duree_roadmap
    #   Durée totale de la roadmap si tous les exercices étaient joués (d'après leurs dernières 
    #   durées de jeu).
    #   Calculé par `etat_des_lieux`
    # - @seances
    #   Les x dernières séances, classées dans l'ordre (de la plus ancienne à la plus récente)
    #   Pour les données de la séance, cf. Seance::lasts.
    #   Chaque séance contient notamment :
    #     id_exercices  : liste des ID des exercices joués au cours de la séance (dans l'ordre)
    #     exercices     : Même chose mais avec un Hash de quelques données (dont tempo et tone)
    # 
    # DEBUG
    # -----
    # unless @no_debug
    #   debug "Exercices <b>classés par le nombre de fois</b> (du moins au plus joué)"
    #   # Pour faire une liste d'exercices reliée aux données. L'argument doit être
    #   # une liste d'ID
    #   debug debug_ids_exercices_with_anchor(less_worked)
    #   # Pour lier un exercice à sa donnée
    #   "- Exercice #{debug_id_linked(idex)}"
    # 
    # 
    # OPTIONS UTILES
    # --------------
    # options[:obligatory]    => Jouer les exercices obligatoires
    # options[:aleatoire]     => Ordre aléatoire des exercices
    # options[:difficulties]  => Liste des difficultés à prendre en compte.
    
    # NOTE
    # ----
    # J'essaie de faire que cette fonction soit la principale appelée.
    def data
      analyze_params
      etat_des_lieux
      @config_generale = get_general_config
      
      debug "\n\n\n =========================================================== \n\n\n"
      debug "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-> méthode `remonte_seance_en_cherchant_non_played`"
 
      # Exercices obligatoires. Les mettre de côté, en gardant
      # leur temps
      @duree_mandatories = 0
      @mandatories       = []
      filter_mandatories
      
      debug "Liste des exercices obligatoires (@mandatories) :"
      debug debug_ids_exercices_with_anchor(@mandatories)
      debug "Temps consumé par les obligatoires (@duree_mandatories) : #{@duree_mandatories.as_horloge}"
      
      # Le temps recherché
      @duree_searched = @expected_time - @duree_mandatories
      debug "Temps à combler par les autres exercices (@duree_searched) : #{@duree_searched.as_horloge}"
      
      # Liste des IDs d'exercices dans l'ordre de leur dernier jeu
      # En premier les exercices joués le plus récemment, en dernier les plus lointains
      @idexs_in_ordre_jeu = []
      
      # On récupère la liste de TOUS les exercices dans l'ordre où ils ont été dernièrement
      # joués au cours des séances.
      # Le premier est celui joué le plus récemment, le dernier le plus lointamment
      # La méthode produit :
      #   @idexs_in_ordre_jeu
      get_exercices_in_ordre_in_last_seances
      
      # On va produire deux listes :
      # - La liste des identifiants d'exercices les plus récents, jusqu'à ce qu'il ne
      #   reste plus que le temps requis pour la séance (@expected_time)
      #   -> @idexs_recents
      # - La liste des identifiants restants.
      #   -> @idexs_lointains
      #  TODO:  ICI, IL RESTE À PASSER LES EXERCICES OBLIGATOIRES S'ILS SONT CHOISIS
      #         ON LE FAIT SIMPLEMENT EN TESTANT instance_ex.obligatory?
      # 
      separe_exercices_recents_et_lointains
      debug "Liste des exercices “récents” (@idexs_recents - jusqu'à la durée demandée)"
      debug debug_ids_exercices_with_anchor(@idexs_recents)
      debug "Liste des exercices “lointain” (@idexs_lointains - représentant la durée demandée)"
      debug debug_ids_exercices_with_anchor(@idexs_lointains)
      
      # On pourrait se contenter de prendre en compte @idexs_lointains, puisque la
      # liste représente le temps recherché.
      # Cependant, pour mélanger encore les choses, on va : 
      #   * ne va garder que 20% des exercices les plus lointains (en les retirant de 
      #     @idexs_lointains)
      #       -> @idexs_les_plus_lointains
      #     qui sont sûrs d'être joués
      #   * reprendre 10 des exercices récents en les ajoutant à la liste
      #     @idexs_lointains. On mélange la liste.
      #     C'est dans cette liste qu'on prendre le temps qui manque pour atteindre
      #     le temps demandé.

      @idexs_lointains.reverse!
      
      # Prendre le cinquième des exercices les plus lointains
      @idexs_les_plus_lointains = @idexs_lointains.slice!(0, @idexs_lointains.count / 5)
      debug "Liste des 20% les plus lointains, sûrs d'être joués"
      debug debug_ids_exercices_with_anchor(@idexs_les_plus_lointains)
      debug "Nouvelle liste des lointains, amputés des ids ci-dessus"
      debug debug_ids_exercices_with_anchor(@idexs_lointains)
      
      # Ajouter à la liste des lointains les 10 exercices les plus lointains des
      # exercices récents, et mélanger cette liste.
      @idexs_lointains += @idexs_recents.reverse.slice(0, 10)
      unless @no_debug
        debug "Nouvelle liste des lointains, auxquels ont été ajoutés 10 récents (les - récents)"
        debug debug_ids_exercices_with_anchor(@idexs_lointains)
      end
      
      # On shuffle la liste des lointains
      @idexs_lointains.shuffle!
      unless @no_debug
        debug "Liste des lointains, shufflée"
        debug debug_ids_exercices_with_anchor(@idexs_lointains)
      end
      
      # Pour compte la durée courante de la session de travail
      current_duree = 0
      @idexs_les_plus_lointains.each do |idex|
        current_duree += @exercices[idex].seances_working_time
        break if current_duree > @duree_searched # ça ne doit pas pouvoir arriver
      end
      unless @no_debug
        debug "Temps consommé par les plus lointains : #{current_duree.as_horloge}"
        debug "Temps restant à trouver : #{(@duree_searched - current_duree).as_horloge}"
      end
      
      # On prend des exercices dans les lointains jusqu'au temps recherché
      while current_duree < @duree_searched
        idex = @idexs_lointains.shift
        duree_exercice = @exercices[idex].seances_working_time
        @idexs_les_plus_lointains << idex
        # S'assurer qu'on ne dépasse pas trop (on ne doit pas dépasser de + de 10 minutes)
        if (current_duree + duree_exercice) > @duree_searched + (10 * 60)
          unless @no_debug
            excedant = (current_duree + duree_exercice) - @duree_searched
            debug "Je ne prends pas l'exercice #{idex}, ça exèderait de + de 10 minutes (excédant : #{excedant.as_horloge})"
          end
          break
        else
          current_duree += duree_exercice
        end
      end
      
      unless @no_debug
        debug "Temps final obtenu (sera vérifié ci-dessous) : #{current_duree.as_horloge}"
      end
      
      # Ici doit se trouver dans @idexs_les_plus_lointains tous les exercices
      # à jouer à cette séance. On les met dans @ids_exercices
      @ids_exercices = @idexs_les_plus_lointains
      
      # On lui ajoute les obligatoires (@todo: A REMETTRE)
      @ids_exercices += @mandatories
      
      unless @no_debug
        debug "Liste finale des @ids_exercices à travailler au cours de la séance :"
        debug debug_ids_exercices_with_anchor(@ids_exercices)
      end
      
      # Mélanger les exercices si l'option :aleatoire a été choisie
      if options[:aleatoire]
        @ids_exercices.shuffle!
        unless @no_debug
          debug "Liste finale (@ids_exercices) mélangée :"
          debug debug_ids_exercices_with_anchor(@ids_exercices)
        end
      end
      
      # On produit @time_per_exercice qui doit renvoyer à l'application les
      # durée de jeu par exercice
      # 
      # + Ultime vérification pour voir si on a bien le temps voulu
      duree_session       = 0
      @time_per_exercice  = {}
      @ids_exercices.each do |idex|
        iex = @exercices[idex]
        duree_session += iex.seances_working_time
        @time_per_exercice[idex] = iex.seances_working_time
      end
      debug "Durée totale calculée à partir des exercices retenus : #{duree_session.as_horloge}"
      debug "\n\n\n =========================================================== \n\n\n"
      
      # Fermer le rapport, si le débuggage était demandé
      end_debug unless @no_debug
      
      seance_data = @config_generale.dup
      seance_data = seance_data.merge(
        :working_time         => @seance_duration,
        :suite_ids            => @ids_exercices,
        :duree_moyenne_par_ex => @time_per_exercice
      )
    end
    
    # Putting aside the mandatory exercices and calcultate consumed time
    # (@note: only if :obligatory option is true)
    # @produit :
    #   @mandatories    
    #       Liste des IDs des exercices obligatoires
    #   @duree_mandatories
    #       Temps consumé par les exercices obligatoires
    # 
    def filter_mandatories
      return unless options[:obligatory]
      @exercices.each do |idex, iex|
        next unless iex.obligatory?
        @mandatories << @ids_exercices.delete(idex)
        @duree_mandatories += iex.seances_working_time
      end
    end
    
    # La méthode va produire deux listes :
    # - La liste des identifiants d'exercices les plus récents, jusqu'à ce qu'il ne
    #   reste plus que le temps requis pour la séance (@expected_time)
    #   -> @idexs_recents
    # - La liste des identifiants restants.
    #   -> @idexs_lointains
    # 
    # @note Elle s'appuie pour ce faire sur :
    #       * la liste :
    #         @idexs_in_ordre_jeu 
    #       produite par la méthode `get_exercices_in_ordre_in_last_seances`
    #       * Le temps total de jeu (de tous les exercices) :
    #         @total_duree_roadmap (calculé dans `etat_des_lieux`)
    #       * Le temps recherché : 
    #         @duree_searched
    #       … qui tient compte des exercices obligatoires si demandé
    #       par les options.
    def separe_exercices_recents_et_lointains
      current_duree     = 0
      @idexs_recents    = []
      @idexs_lointains  = @idexs_in_ordre_jeu
      while idex = @idexs_lointains.shift
        duree_exercice = @exercices[idex].seances_working_time
        if @total_duree_roadmap - (current_duree + duree_exercice) < @duree_searched
          # On remet ce dernier identifiant et on s'en retourne
          @idexs_lointains.unshift( idex )
          return
        else
          @idexs_recents << idex
          current_duree += duree_exercice
        end
      end
    end
    
    # Produit la liste de TOUS les exercices dans l'ordre où ils ont été dernièrement
    # joués au cours des séances.
    # Le premier est celui joué le plus récemment, le dernier le plus lointamment
    # La méthode produit :
    #   @idexs_in_ordre_jeu
    def get_exercices_in_ordre_in_last_seances
      
      # LA LISTE PRODUITE
      @idexs_in_ordre_jeu = []
      
      nombre_total_exercices = @ids_exercices.count
      exs_passes_en_revue = {}
      nombre_exs_passes_en_revue = 0
  
      @seances.reverse.each do |dseance|
        if dseance[:id_exercices].nil?
          unless @no_debug
            debug "### PROBLEME SEANCE SANS id_exercices……"
            debug "dseance: #{dseance.inspect}"
          end
          next
        end
        dseance[:id_exercices].reverse.each do |idex|
          if exs_passes_en_revue[idex].nil?
            # debug "--> idex:#{idex}" unless @no_debug
            exs_passes_en_revue[idex] = true
            nombre_exs_passes_en_revue += 1
            @idexs_in_ordre_jeu << idex
            
            # A-t-on passé tous les exercices en revue ?
            if nombre_exs_passes_en_revue == nombre_total_exercices
              debug "-- Tous les exercices ont été passés en revue --" unless @no_debug
              return
            end
          else
            # debug "(déjà traité : #{idex})" unless @no_debug
          end
        end
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
        
    # Etat des lieux -- Get all required data
    # 
    # PRODUIT
    # -------
    # @ids_exercices
    #     Liste Array des ID des exercices dans l'ordre de la roadmap
    # @exercices
    #     Hash avec en clé l'ID de l'exercice et en value son instance Exercice
    # @seances
    #     Liste Array des dernières séances, classées par date (les plus anciennes en premier)
    # @total_duree_roadmap
    #     La durée totale de temps de jeu de TOUS les exercices. En d'autres termes, correspond
    #     à la durée d'une session de travail si tous les exercices de la roadmap était joués.
    #     Note: Le temps pris en référence est la moyenne du durée de jeu de chaque exercice au
    #     cours des dernières sessions de travail.
    # 
    def etat_des_lieux
      @total_duree_roadmap  = 0
      @ids_exercices        = roadmap.ordre_exercices
      @exercices            = {}
      index = 0
      @ids_exercices.each do |idex|
        iex = roadmap.exercice( idex )
        @total_duree_roadmap += iex.seances_working_time
        iex.index   = (index += 1)
        @exercices  = @exercices.merge idex => iex
      end
      hseances = Seance::lasts(roadmap)
      @seances = hseances[:sorted_days].collect{|jour|hseances[:seances][jour]}
      average_working_times
    end
    
    # Analyze params provided by musician
    # 
    def analyze_params
      @params = @params.to_sym

      # * WORKING TIME
      #   params[:working_time]     In seconds
      @expected_time  = params[:working_time].to_i * 60
      debug "Temps de travail demandé : #{@expected_time.as_horloge}"

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