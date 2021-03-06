# encoding: UTF-8

=begin
  Class Seance::Building
  
  Create a working session
  
=end
require 'params'
require_model 'roadmap' unless defined?(Roadmap)

class Seance
  class Building
  
    # DEBUG = Params::offline?
    DEBUG = true
    
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
    
    # Id of all exercices of the roadmap (in play, get in :ordre)
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
    
    # Pour débugger
    # 
    attr_accessor :no_debug
    
    # Initialize the building seance with +params+ set by the musician
    # for the current +seance+ (instance Seance)
    # 
    def initialize seance, params
      @seance = seance
      @params = params
      debug "*** PRÉPARATION DE LA SÉANCE DU #{@seance.day} ***"
      debug "Paramètres envoyés : #{params.inspect}"
    end
    
    # Pour suivre le programme
    # On sort en offline un fichier assez conséquent contenant les informations 
    # du traitement effectué
    def debug text
      @no_debug = Params::online? if @no_debug === nil
      return if @no_debug
      prepare_debug if @debug_ready.nil?
      text = "<div>#{text}</div>" unless text.start_with?('<')
      text.gsub!(/\n/,'<br>')
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
      dbg "-> Building::end_debug"
      dbg "   @path_debug:#{@path_debug}"
      dbg "   debug_end_report:#{debug_end_report}:#{debug_end_report.class}"
      code =  '<div id="div_operations">'+
              # File.read(@path_debug) +
              File.open(@path_debug, 'r', :encoding => 'UTF-8'){|f| f.read} +
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
      '<br />' + if liste.class == Array
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
    
                 
    # (main function)
    # 
    # 
    # Principe
    # --------
    #   * On fait le total de temps d'une séance si on jouait TOUS les exercices
    #   * On remonte les séances, à commencer pas la dernière
    #   * En "remontant" les séances, on supprime de la liste des exercices potentiels ceux 
    #     qui ont été joués JUSQU'À atteindre un temps restant correspondant au temps demandé.
    #     ATTENTION : on ne retire pas le temps d'un exercice déjà traité, dans ce process, on
    #     n'étudie que des éléments uniques.  
    #   * On se retrouve alors avec forcément la liste des exercices joués les plus lointains.
    #   * Mais dans le cas où l'ORDRE ALÉATOIRE est choisi, pour brouiller un peu les cartes,
    #     on fait la chose suivante :
    #     - Parmi les exercices lointains, on ne prend que la moitié du temps attendu
    #     - Ensuite on relève dans la liste des récents, parmi les derniers (donc les plus
    #       lointains), le nombre d'exercices pour couvrir la moitié du temps manquante.
    #     - Enfin on les mélange deux fois.
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
    #   exercices_obligatoires      => Jouer les exercices obligatoires
    #   ordre_aleatoire             => Ordre aléatoire des exercices
    #   options[:difficulties]      => Liste des difficultés à prendre en compte.
    # 
    def data
      analyze_params
      etat_des_lieux
      debug " --- État des lieux ---" +
            "\nNombre d'exercices de la roadmap : #{@ids_exercices.count}" +
            "\nDurée totale de la roadmap : #{@total_duree_roadmap.as_horloge}"
      
      @config_generale = get_general_config
      
      debug "\n===========================================================\n"
      
      # Liste de TOUS les exercices dans l'ordre où ils ont été dernièrement
      # joués au cours des dernières séances.
      # Note: Quand il n'y a pas eu encore de session, on prend toute la liste
      #       des exercices de la roadmap
      # On doit essayer d'avoir TOUS les exercices de la roadmap, uniques dans la
      # liste.
      # Le premier est celui joué le plus récemment, le dernier le plus lointamment
      # Produit :
      # 
      #   @idexs_in_ordre_jeu     Liste des IDs d'exercice, du plus récent au plus lointain
      # 
      get_exercices_in_ordre_in_last_seances
              
      # Exercices obligatoires 
      # ----------------------
      # S'ils doivent être joués, les mettre de côté, en gardant leur temps.
      # 
      # Produit :
      #   @duree_mandatories      Durée consumée par les exercices obligatoires
      #   @mandatories            IDentifiants des exercices obligaoires.
      # 
      # Modifie :
      #   @idexs_in_ordre_jeu     Retire de la liste les exercices obligatoires
      #                           s'il faut les prendre
      # 
      filter_mandatories
      debug "Liste des exercices obligatoires (@mandatories) : #{debug_ids_exercices_with_anchor(@mandatories)}"
      debug "Exercices non obligatoires : #{debug_ids_exercices_with_anchor(@ids_exercices)}"
      
      # Les temps à ce niveau de la relève
      @duree_searched = @expected_time - @duree_mandatories
      debug  "Temps consumé par les obligatoires (@duree_mandatories) : #{@duree_mandatories.as_horloge}"+
             "\nTemps à combler par les autres (@duree_searched) : #{@duree_searched.as_horloge}"
      
      
      # Filtrer les exercices par difficultés
      # 
      # Modifie
      # -------
      #   @idexs_in_ordre_jeu       Retire de la liste les exercices ne correspondant pas
      #                             aux difficultés choisies
      # 
      filter_exercices_per_difficulties
      
      
      # À ce niveau, si aucun exercice ne correspond aux choix, on peut
      # s'arrêter
      if @mandatories.count == 0 && @idexs_in_ordre_jeu.count == 0
        seance_data = @config_generale.dup
        return seance_data.merge(
          :working_time         => 0,
          :suite_ids            => [],
          :duree_moyenne_par_ex => nil
        )
      end
      
      # Séparation des exercices en listes :
      # 
      # - @idexs_retenus
      #   Préparation de la liste des IDs d'exercices qui vont servir pour la 
      #   séances. Ce sont les exercices parmi les plus anciens, à concurrence de
      #   la moitié du temps de la séance requis.
      #   NOTE : On ne prend que la moitié du temps pour mélanger encore plus les
      #   exercices (quand option :aléatoire).
      # 
      # - @idexs_recents
      #   Liste des IDex les plus récents, jusqu'à ce qu'il ne
      #   reste plus que le temps requis pour la séance (@expected_time)
      #   Cette liste ne servira pas. C'est juste pour le débug.
      # 
      # - @idexs_anciens
      #   Liste des IDex restants dont la somme de temps représente la durée de séance
      #   voulue.
      # 
      separe_recents_et_anciens
      debug "Liste des exercices “retenus” (@idexs_retenus — durent la moitié de la durée recherchée) : #{debug_ids_exercices_with_anchor(@idexs_retenus)}"+
            "\nDurée : #{duree_of(@idexs_retenus).as_horloge}"
      debug "Liste des exercices “anciens” (@idexs_anciens) : #{debug_ids_exercices_with_anchor(@idexs_anciens)}"+
            "\nDurée : #{duree_of(@idexs_anciens).as_horloge}"
      debug "Liste des exercices “récents” (@idexs_recents) : #{debug_ids_exercices_with_anchor(@idexs_recents)}"+
            "\nDurée : #{duree_of(@idexs_recents).as_horloge}"
      
      # ICI, @idexs_retenus contient les exercices les plus anciens (du plus ancien
      # au plus récent), à concurrence de la moitié du temps cherché.
      # Il va donc falloir ajouter des exercices pour atteindre le temps voulu.
      # 
      # Pour mieux mélanger les exercices, on ajoute quelques anciens des récents aux
      # anciens, on les mélange et on choisit jusqu'au temps recherché
      # 
      # Rappel : @idexs_recents est dans l'ordre du plus récent au plus lointain
      # 
      ajouter_anciens_des_recents
      debug "Liste des exercices “retenus” (@idexs_retenus) après ajout : #{debug_ids_exercices_with_anchor(@idexs_retenus)}"+
            "\nDurée : #{(duree_of @idexs_retenus).as_horloge}"
      
      # ICI, la liste des exercices retenus est établie.
      # SAUF QUE si la roadmap ne contient pas suffisamment d'exercices par
      # rapport au temps cherché, on n'a pas atteint le temps voulu.
      # Dans ce cas, deux solutions : si la répétition des exercices est possible,
      # alors on en ajoute à concurrence du temps voulu. Sinon, on en reste là,
      # avec une séance trop courte.
      # 
      # NOTE
      # 
      #   La méthode `duree_correcte?' produit la valeur @duree_des_retenus qui contient
      #   la durée actuelle des exercices retenus.
      # 
      if !duree_correcte? && repetition_exercices
        ajouter_exercices_up_to_time_searched 
        debug "Liste des exercices “retenus” (@idexs_retenus) après ajout pour atteindre le temps désiré : #{debug_ids_exercices_with_anchor(@idexs_retenus)}"+
              "\nDurée : #{(duree_of @idexs_retenus).as_horloge}"
      end
      
      # Ajout des obligatoires
      # ----------------------
      @idexs_retenus      += @mandatories
      @duree_des_retenus  += @duree_mandatories
      
      # Mélanger les exercices si l'option :aleatoire a été choisie
      # Ou les classer dans l'ordre dans le cas contraire
      if ordre_aleatoire
        @idexs_retenus.shuffle!
      else
        classe_liste_des_retenus
      end
      debug "LISTE FINALE (#{ordre_aleatoire ? 'MÉLANGÉE' : 'CLASSÉE' }) à travailler au cours de la séance : #{debug_ids_exercices_with_anchor(@idexs_retenus)}"+
            "\nTemps obtenu (sera vérifié ci-dessous) : #{@duree_des_retenus.as_horloge}"
      
      # On produit @time_per_exercice qui doit renvoyer à l'application les
      # durée de jeu par exercice
      # 
      # + Ultime vérification pour voir si on a bien le temps voulu
      @duree_session      = 0
      @time_per_exercice  = {}
      @idexs_retenus.each do |idex|
        @duree_session            += (duree_of idex)
        @time_per_exercice[idex]  =  (duree_of idex)
      end
      
      # Non nécessaire mais sympa, pour indiquer les exercices rejoués
      # de la session précédente (dans l'idéal, il ne devrait y en avoir aucun, si les exercices
      # sont assez nombreux, mais le mélange fait dans `ajouter_anciens_des_recents` a permis
      # d'en mettre quand même).
      liste_exercices_rejoues_de_derniere_session      
      debug "Liste des exercices rejoués (de la dernière session) : #{debug_ids_exercices_with_anchor(@idexs_des_rejoues)}"
      
      
      debug "DURÉE TOTALE CALCULÉE à partir des exercices retenus : #{@duree_session.as_horloge}"
      debug "\n\n\n =========================================================== \n\n\n"
      
      # Fermer le rapport, si le débuggage était demandé
      end_debug unless @no_debug
      
      seance_data = @config_generale.dup
      seance_data.merge(
        :working_time         => @duree_session,
        :suite_ids            => @idexs_retenus,
        :idexs_rejoues        => @idexs_des_rejoues,
        :mandatories          => @mandatories,
        :duree_moyenne_par_ex => @time_per_exercice
      )
    end
    
    # Analyse des paramètres envoyés à la construction de la séance.
    # 
    # PRODUIT
    # -------
    #   @expected_time      Durée de la séance escompté
    #   @types              Les types de difficulté (filtre)
    #   @options            Les options exercices obligatoires, répétition, etc.
    # 
    def analyze_params
      @params = @params.to_sym

      # TEMPS DE SÉANCE VOULU
      # ---------------------
      #   params[:working_time]     In seconds
      @expected_time  = params[:working_time].to_i * 60
      debug "Temps de travail demandé : #{@expected_time.as_horloge}"

      # * DIFFICULTIES (= exercice types)
      #   params[:difficulties]
      @types = params[:difficulties].split(',')
      debug "Types recherchés : #{@types.inspect}"

      # OPTIONS
      # -------
      #   params[:options]:
      #     :same_ex::        Enable to repeat a same ex (if difficulties)
      #     :next_config::    Set next general config
      #     :new_tone::       New tone (take last or 0 for "C")
      #     :obligatory::     Include obligatory exercices
      # 
      @options = params[:options].values_str_to_real
      debug "Options : #{@options.inspect}"
    end
    
     
    # Produit
    # -------
    # 
    #     @idexs_in_ordre_jeu
    # 
    #     Liste des IDs de TOUS les exercices dans l'ordre où ils ont été dernièrement
    #     joués au cours des dernières séances, du plus RÉCENT au plus LOINTAIN
    #   
    def get_exercices_in_ordre_in_last_seances
      
      # La liste globales produite des IDexs
      @idexs_in_ordre_jeu = []
      
      nombre_total_exercices      = @ids_exercices.count
      exs_passes_en_revue         = {}
      nombre_exs_passes_en_revue  = 0
  
      # De la séance la plus récente à la séance la plus ancienne
      @seances.each do |dseance|
        seance_debug = "- Étude séance du #{dseance[:day]}"+
              "\n  exercices joués pendant la séance : #{debug_ids_exercices_with_anchor(dseance[:id_exercices])}"
        if dseance[:id_exercices].nil?
          unless @no_debug
            debug "### PROBLEME SEANCE SANS id_exercices……"
            debug "dseance: #{dseance.inspect}"
          end
          next
        end
        # De l'exercice le plus récent (de la séance) à l'exercice le plus ancien
        @list_for_debug  = []
        dseance[:id_exercices].reverse.each do |idex|
          if exs_passes_en_revue[idex].nil?
            exs_passes_en_revue[idex]   =  true
            nombre_exs_passes_en_revue  += 1
            @idexs_in_ordre_jeu         << idex
            @list_for_debug             << idex
            # A-t-on passé tous les exercices en revue ?
            if nombre_exs_passes_en_revue == nombre_total_exercices
              debug seance_debug+"\n  Retenus de cette séance : #{debug_ids_exercices_with_anchor(@list_for_debug )}"
              debug "-- Tous les exercices ont été passés en revue --"
              debug "Ordre des exercices dans les séances précédentes : #{debug_ids_exercices_with_anchor(@idexs_in_ordre_jeu)}"
              return
            end
          end
        end
        debug seance_debug+"\n  Retenus de cette séance : #{debug_ids_exercices_with_anchor(@list_for_debug )}"
        
      end
      
      
      if @idexs_in_ordre_jeu.count == 0

        # En cas d'absence totale de séance, on prend la liste de tous les
        # exercices

        @idexs_in_ordre_jeu = @ids_exercices
        debug "Aucune session de travail trouvée, j'utilise la liste des tous les exercices : #{debug_ids_exercices_with_anchor(@idexs_in_ordre_jeu)}"

      else
      
        # On passe également ici quand un exercice n'a pas du tout été trouvé
        # Par exemple un tout nouvel exercice. Il faut donc finaliser la liste
        # en ajoutant ces exercices introuvables dans les sessions.
        @list_for_debug  = []
        @ids_exercices.each do |idex|
          if exs_passes_en_revue[idex].nil?
            exs_passes_en_revue[idex]   =  true
            @idexs_in_ordre_jeu         << idex
            @list_for_debug             << idex
          end
        end
        debug "Exercices jamais joués, ajoutés à la liste : #{debug_ids_exercices_with_anchor(@list_for_debug)}"
        
      end
      
    end

    
    # Putting aside the mandatory exercices and calcultate consumed time
    # (@note: only if :obligatory option is true)
    # 
    # Produit
    # -------
    #   @mandatories              Liste des IDs des exercices obligatoires
    #   @duree_mandatories        Temps consumé par les exercices obligatoires
    # 
    # Modifie
    # -------
    #   @idexs_in_ordre_jeu       IDs des exercices dans l'ordre de jeu restants (sans
    #                             les obligatoires)
    def filter_mandatories
      @duree_mandatories = 0
      @mandatories       = []
      return unless exercices_obligatoires
      new_idexs = []
      @idexs_in_ordre_jeu.each do |idex|
        if @exercices[idex].nil?
          # Cela peut arriver lorsqu'un exercice a été retiré de la liste
          next
        end
        if @exercices[idex].obligatory?
          @mandatories        << @ids_exercices.delete(idex)
          @duree_mandatories  += (duree_of idex)
        else
          new_idexs << idex
        end
      end
      @idexs_in_ordre_jeu = new_idexs
    end

    # Produit
    # -------
    # 
    #   @idexs_retenus
    # 
    #     Liste des IDs d'exercices les plus plus anciens, à concurrence de la
    #     moitié du temps de la séance requis.
    # 
    #   @idexs_recents
    # 
    #     Liste des IDs d'exercices les plus récents (du plus récent au plus ancien).
    #
    #   @idexs_anciens
    # 
    #     Liste des IDs des exercices les plus anciens, jusqu'à la durée requise.
    #     Note : du plus anciens au plus récent, celle-là.
    # 
    def separe_recents_et_anciens
      cur_duree           = 0
      @idexs_retenus      = []
      @idexs_recents      = @idexs_in_ordre_jeu + []
      @idexs_anciens      = []
      moitie_duree_totale = @duree_searched / 2

      # Rappel :  @idexs_recents (copie de @idexs_in_ordre_jeu) contient la liste des 
      #           exercices dernièrement joués, du plus récent au plus lointain
      while idex = @idexs_recents.pop
        if cur_duree < moitie_duree_totale
          # On retient cet exercice jusqu'à atteindre la moitié de la durée
          # requise
          @idexs_retenus << idex
        else
          @idexs_anciens << idex
        end
        if cur_duree + (duree_of idex) > @duree_searched
          # On passe ici lorsque le temps des exercices lointains représente un temps
          # supérieur au temps recherché. On peut donc s'arrêter
          return
        else
          cur_duree += (duree_of idex)
        end
      end
      
      # @note On peut passer ici lorsque le nombre d'exercices est insuffisant pour
      # atteindre le temps demandé. Dans ce cas, @idexs_recents sera vide et @idexs_anciens
      # contiendra tous les exercices.
      
    end
    
    # Ajoute à @idexs_retenus des exercices jusqu'à atteindre le temps cherché (ou
    # la fin de la liste)
    def ajouter_anciens_des_recents
      # Temps 1 : prendre parmi les récents un certain nombre d'IDs
      #           et les ajouter aux anciens restants
      #           Question : combien ? Sur quel critère ?
      #           Réponse : pour un durée égale à un tiers du temps des
      #           anciens.
      duree_anciens = (duree_of @idexs_anciens)
      debug "Durée des anciens : #{duree_anciens.as_horloge}"
      duree_a_atteindre = duree_anciens + (duree_anciens/3)
      debug "Durée à atteindre en ajoutant des récents (les plus anciens) : #{duree_a_atteindre.as_horloge}"
      while @idexs_recents.count > 0 && duree_anciens < duree_a_atteindre
        id_vieux_recent = @idexs_recents.pop
        @idexs_anciens  << id_vieux_recent
        duree_anciens   += (duree_of id_vieux_recent)
      end
      debug "Liste d'anciens auxquels ont été ajoutés des vieux récents : #{debug_ids_exercices_with_anchor @idexs_anciens}"
      # Temps 2 : Mélanger la liste obtenue
      @idexs_anciens.shuffle!
      debug "La même mélangée : #{debug_ids_exercices_with_anchor @idexs_anciens}"
      # Temps 3 : Prendre dans cette liste à concurrence du temps cherché
      # Note : on est obligé d'arriver au temps recherché puisque normalement
      # les anciens seuls (avec les retenus) durent le temps recherché (c'est comme ça
      # qu'ils ont été choisis). Mais il se peut que la roadmap ne contienne pas assez
      # d'exercice (ils seront ajoutés, si la répétition est possible, plus tard)
      add_to_retenus_from_up_to_duree_searched @idexs_anciens
    end
    
    # Ajoute à la liste @idexs_retenus (exercices retenus) les exercices
    # tirés du bout de la liste des IDs +from_list+
    # 
    # @param  from_list   Liste d'IDs d'exercices
    # 
    def add_to_retenus_from_up_to_duree_searched from_list
      cur_duree = duree_of @idexs_retenus
      while idex = from_list.pop
        duree_tested = cur_duree + (duree_of idex)
        if duree_tested > @duree_searched + dix_minutes
          # On passe cet exercice trop long
        else
          # Sinon, on ajoute l'exercice et on regarde si on
          # atteind le temps voulu
          cur_duree = duree_tested
          @idexs_retenus << idex
          return true if (cur_duree + cinq_minutes) > @duree_searched 
        end
      end
      return false
    end
    
    # Si le temps voulu (@duree_searched) n'est pas atteint, et que la répétition
    # d'exercices est autorisée il faut ajouter des exercices jusqu'au concurrence du
    # temps voulu.
    # 
    # Note :  ici, @duree_des_retenus contient la durée des exercices retenus
    #         (calculé par duree_correcte?)
    # Note :  On cherche ces exercices aussi bien dans les obligatoires que les
    #         autres. Noter quand même que le filtre difficultés s'applique, les
    #         "mauvais" exercices ont été retirés de @ids_exercices.
    # 
    def ajouter_exercices_up_to_time_searched
      peek_list = (@mandatories + @ids_exercices).shuffle
      peek_list.each do |idex|
        duree_tested = @duree_des_retenus + (duree_of idex)
        if duree_tested > (@duree_searched + dix_minutes)
          # on le passe car il est trop long
        else
          @idexs_retenus      << idex
          @duree_des_retenus  = duree_tested
          return if @duree_des_retenus >= @duree_searched
        end
      end
      
      # Si on passe ici, c'est qu'on n'a pas encore atteint la durée voulue
      # On rappelle cette méthode
      ajouter_exercices_up_to_time_searched
    end
    
    # Quand l'ordre aléatoire n'est pas demandé, on doit reclasser les
    # exercices dans l'ordre de la roadmap.
    # 
    def classe_liste_des_retenus
      ordre_roadmap = roadmap.ordre_exercices
      @idexs_retenus.sort! do |idx, idy| 
        ordre_roadmap.index(idx) <=> ordre_roadmap.index(idy) 
      end
    end
    
    # On relève la liste des exercices de cette session qui ont déjà été
    # joués à la session précédente. Juste pour les mettre en exergue dans
    # la présentation de la session.
    def liste_exercices_rejoues_de_derniere_session
      idexs_last_seance = @seances.count > 0 ? @seances[0][:id_exercices] : []
      @idexs_des_rejoues = []
      @idexs_retenus.each do |idex|
        next if idexs_last_seance.index(idex) === nil
        @idexs_des_rejoues << idex
      end      
    end
    
    # -------------------------------------------------------------------
    #   Handy Methods
    # -------------------------------------------------------------------
    
    # Return TRUE si la durée actuelle des exercices retenus (@idexs_retenus) est
    # suffisante mais pas trop grande
    def duree_correcte?
      @duree_des_retenus = (duree_of @idexs_retenus)
      debug "Dans duree_correcte ? "+
            "\n@duree_searched : #{@duree_searched.as_horloge}"+
            "\n@duree_des_retenus : #{@duree_des_retenus.as_horloge}"
      return @duree_des_retenus >= @duree_searched && @duree_des_retenus < (@duree_searched + dix_minutes)
    end
    
    def cinq_minutes
      @cinq_minutes ||= 5 * 60
    end
    def dix_minutes
      @dix_minutes ||= 10 * 60
    end
    
    # Handy méthode pour obtenir la durée d'un exercice
    # Ou d'une liste d'exercices
    def duree_of idex
      dbg "-> duree_of(#{idex.inspect})"
      if idex.class == Array
        idex.collect{|id| duree_of_exercice id}.inject(:+) || 0
      else
        duree_of_exercice idex
      end
    end
    def duree_of_exercice idex
      # dbg "-> duree_of_exercice(#{idex}:#{idex.class})"
      @durees_des_exercices ||= {}
      if @durees_des_exercices[idex].nil?
        @durees_des_exercices[idex] = @exercices[idex].seances_working_time
      end
      @durees_des_exercices[idex]
    end
    # Méthodes pour retourner les options voulues
    # 
    def repetition_exercices
      @repetition_allowed ||= @options[:same_ex]
    end
    def exercices_obligatoires
      @exercices_obligatoires ||= @options[:obligatory]
    end
    def ordre_aleatoire
      @ordre_aleatoire ||= @options[:aleatoire]
    end
    
    

    # Filter @ids_exercices to keep only the exercices of required difficulties
    # 
    # PRODUIT
    # -------
    #   @others_idex      Other ids (if option :same_ex is false, we'll need this
    #                     exercice to fit the time)
    # MODIFIE
    # -------
    #   @idexs_in_ordre_jeu     Liste des IDs exercices en cours de traitement
    #   @ids_exercices          Liste des IDs exercices (qui serviront à combler le temps)
    # 
    def filter_exercices_per_difficulties
      @others_idex      = [] 
      return if types.empty?
      new_ids_exercices = []
      @idexs_in_ordre_jeu.each do |idex|
        typesex = @exercices[idex].data[:types]
        type_found = false
        unless typesex.nil?
          types.each do |type|
            if typesex.include? type
              type_found = true
              break
            end
          end
        end
        if type_found
          new_ids_exercices << idex
        else
          @others_idex << idex 
        end
      end
      @idexs_in_ordre_jeu = new_ids_exercices
      @ids_exercices      = new_ids_exercices
      debug "Exercices filtrés par catégories : #{debug_ids_exercices_with_anchor(@idexs_in_ordre_jeu)}"
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
      dbg "-> Building::etat_des_lieux"
      @total_duree_roadmap  = 0
      @ids_exercices        = roadmap.ordre_exercices
      @exercices            = {}
      index = 0
      @ids_exercices.each do |idex|
        iex                   = roadmap.exercice( idex )
        @exercices            = @exercices.merge idex => iex
        @total_duree_roadmap  += duree_of idex
        iex.index             = (index += 1)
      end
      hseances = Seance::lasts(roadmap)
      @seances = hseances[:sorted_days].collect{|jour|hseances[:seances][jour]}
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