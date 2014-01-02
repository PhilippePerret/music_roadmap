
require_model 'roadmap' unless defined?(Roadmap)
require_model 'seance'  unless defined?(Seance)

# OBSOLETE:
# require_model 'file_duree_jeu'

# Class Exercice gérant les exercices
# 
class Exercice
  
  # Identifiant de l'exercice
  # 
  attr_reader :id
  
  # Roadmap de l'exercice
  # 
  attr_reader :roadmap
  
  # Nombre de fois où l'exercice a été joué (un temps suffisant)
  # 
  attr_reader :fois
  
  # Durée moyenne de jeu de l'exercice
  # 
  attr_reader :duree_moyenne
  
  # Durée totale de jeu de l'exercice
  # 
  attr_reader :duree_totale
  
  # Code pour les jours où l'exercice a été joué
  # 
  # On ne la "désériasile" qu'au besoin
  # 
  # @note: Cette donnée doit toujours être tenue à jour, car c'est elle qui est prise en
  # considération pour reconstituer la ligne de code à écrire (@see `implode`)
  # 
  attr_reader :exercices_str
  
  # Les durées de jeu par date, sous forme de Array de Hash contenant :date et :duree
  # 
  # @note: Cette données n'est calculée que lorsque c'est nécessaire, c'est-à-dire pour les
  # rapports et les confections de séance de travail
  # 
  attr_reader :exercices

  # Index of the exercice in order of its roadmap (R/W)
  # 
  # This attribute is used for building working session (@see roadmap/building.rb)
  # 
  attr_accessor :index
    
  # Data dans le fichier [OBSOLÈTE].js [UPDATED].msh de l'exercice
  # 
  # @note: Utiliser la méthode <exercice>.data pour les récupérer
  # 
  @data_js = nil
  
  # Path au fichier JS de l'exercice
  # 
  # @note: Utiliser la méthode éponyme
  # 
  @path = nil
  
  # Instanciation
  # 
  # @param    line    Peut être la ligne lue dans le fichier de données de durées de jeu
  # 
  def initialize idex, params = nil
    params ||= {}
    @roadmap  = params[:roadmap]
    @id       = idex.to_s
    @fois, @duree_totale, @duree_moyenne = 0, 0, 0
  end
  
  # Return current tempo of the exercice (Fixnum)
  def tempo
    @tempo ||= data[:tempo].to_i
  end
  # Return max tempo of the exercice (Fixnum)
  def tempo_max
    @tempo_max ||= data[:tempo_max].to_i
  end
  # Return min tempo of the exercice (Fixnum)
  def tempo_min
    @tempo_min ||= data[:tempo_min].to_i
  end
  
  # Return true if it's a mandatory exercice
  def obligatory?
    data[:obligatory] === true
  end
  
  # Return Hash Data of the exercices
  # 
  def data
    @data_js ||= (App::load_data path)
  end
  
  # Retourne le temps de travail de l'exercice
  # 
  # La valeur est calculée soit d'après les données de l'exercice (tempo, nombre de
  # mesures etc.) soit, si elles existent, d'après les données des dernières 
  # séances.
  # 
  def working_time
    @working_time ||= duree_at tempo
  end
  
  # Retourne la durée de l'exercice calculée d'après son nombre de mesures, son
  # nombre de temps par mesure et son tempo actuel. Retourne 120 (2mn) par 
  # défaut de ces informations ou un nombre calculé avec les données connues.
  # 
  # Contraitement à la méthode précédente, cette méthode ne se sert que des 
  # données de l'exercice, pas des séances. Si on veut une durée qui soit plus
  # réelle et tienne compte des séances, utiliser `working_time`
  # 
  def duree_exercice
    @duree_exercice ||= ((60.0 / tempo) * nombre_temps * nombre_mesures).to_i
  end
  
  # Retourne la durée maximale du travail sur l'exercice.
  # 
  # Cette durée est calculée par rapport au tempo min de l'exercice, son 
  # nombre de temps par mesure et son nombre de mesures.
  # Si ces informations ne sont pas fournies, on se sert des séances de 
  # travail précédentes pour déterminer ce temps, ou on utilise des valeurs
  # par défaut.
  def duree_max
    @duree_max ||= duree_at tempo_max
  end
  
  # Retourne la durée minimum de travail sur l'exercice
  # 
  # @see `duree_max' ci-dessus pour le détail
  def duree_min
    @duree_min ||= duree_at tempo_min
  end
  
  # Return la durée du travail de l'exercice au tempo fourni en argument.
  # 
  # NOTES
  # -----
  #   @ Si le tempo n'est pas fourni, on prend le tempo courant
  #   @ Si le nombre de mesures n'est pas défini on renvoie 120 (2 minutes).
  # 
  def duree_at this_tempo = nil
    this_tempo ||= tempo
    ((60.0 / this_tempo) * nombre_temps * nb_mesures_calculed).to_i
  end
  
  # {Fixnum} Retourne le nombre de temps définis par mesure dans les
  # données de l'exercice, ou 4 par défaut.
  def nombre_temps
    @nombre_temps ||= (data[:nb_temps] || 4).to_i
  end
  
  # {Fixnum} Retourne le nombre de mesures dans les données de l'exercice
  # ou 60 par défaut
  # Notes
  # -----
  #   * Si on veut un nombre calculé d'après les séances de travail, il convient
  #     d'utiliser `nb_mesures_calculed
  #   * Le nombre de mesures par défaut est calculé pour qu'à un tempo de 120,
  #     avec un nombre de temps par mesure de 4, la durée de l'exercice fasse
  #     2 minutes.
  # 
  # @return {Fixnum} Nombre de mesures ou 60
  def nombre_mesures
    @nombre_mesures ||= (data[:nb_mesures] || 60).to_i
  end
  
  # Return number of measures of exercice (Fixnum)
  # 
  # If number of measures if defined in data, return this value. Otherwise, 
  # evaluate this number according to:
  #   - the average working time of exercice in seances
  #   - the number of beats or 4 (default value)
  #   - the tempo used to play the exercice (may be different for
  #     each time)
  # For example, if the working time is 120 (2 minutes) and the number of
  # beats is 4 (default), and the tempo is 60, then the number of measures
  # is:
  #   nb_mesures = working_time / ( (60.0 / tempo) * nb_beats )
  # So:
  #   nb_mesures = 120 / ( 60.0 / 60 * 4)
  #   nb_mesures = 120 / 4 = 30
  # 
  # If neither data[:nb_mesures] nor seances are defined, working time is
  # set to 120 (2 minutes = default value)
  def nb_mesures_calculed
    @nb_mesures_calculed ||= data[:nb_mesures].nil? ? calc_nombre_mesures : data[:nb_mesures].to_i
  end
  
  
  # Retourne le nombre de fois où l'exercice a été joué en fonction
  # de tempo fourni.
  # 
  # NOTES
  # -----
  #   @ La donnée est enregistrée dans la séance chaque fois que l'exercice
  #     est joué.
  # 
  #   @ Le résultat est un flottant à deux décimales.
  #   
  #   @ Si l'exercice ne définit pas son nombre de mesures ou son nombre de
  #     temps par mesure, cette valeur ne peut être calculée, on renvoie donc
  #     1
  # 
  def real_nbfois_with_time_and_tempo totaltime, curtempo
    nbfois = totaltime.to_f / (duree_at curtempo.to_i)
    if RUBY_VERSION >= "2.0.0"
      nbfois.round(2)
    else
      u,d = nbfois.to_s.split('.')
      "#{u}.#{d[0..1]}"
    end
  end
  
  # Calculate number of measures in exercice
  # 
  # NOTES
  # -----
  #   @ voir `nb_mesures_calculed' above for details
  #   @ seances_working_time renvoie 120 par défaut
  #   @ nombre_temps renvoie 4 par défaut
  #   @ Donc la méthode peut toujours fonctionner, même lorsqu'aucune
  #     séance n'a encore été jouée.
  # 
  def calc_nombre_mesures
    seances_working_time / ( (60.0 / tempo) * nombre_temps )
  end
  
  # Return the average working time of exercice in working sessions, in seconds.
  # Default: 120
  # 
  # NOTE
  # ----
  # Ce temps correspond à une moyenne du temps de jeu des dernières séances, quel
  # que soit leur nombre de mesures, leur temps, etc.
  # 
  def seances_working_time
    @seances_working_time ||= data_in_seances[:average_duration]
  end
  
  # Nombre de fois où l'exercice a été joué
  # 
  def number_of_times
    @number_times_played ||= data_in_seances[:number_of_times]
  end
  
  # Return exercice data in the +x+ last seances
  # 
  def data_in_seances x = 50
    if @data_in_seances == nil || @data_in_seances[:x_last] != x
      @data_in_seances = Seance.exercice( self, x )
    end
    @data_in_seances
  end


  # Retourne la durée en fonction des séances précédentes
  # 
  # * NOTES
  # 
  #   Cette durée est calculée en fonction de la durée de travail enregistrée,
  #   et du tempo enregistré pour cette durée. On extrapole ensuite la durée
  #   avec le tempo min ou max.
  # 
  #   Le code qui appelle cette méthode devrait définir avant la variable
  #   globale $seances contenant les informations sur les séances relevées
  #   pour ne pas avoir à répéter la lecture de ces séances dans le cas d'un
  #   appel intensif (sur tous les exercices par exemple)
  #   Si cette variable globale n'est pas définie, on la détermine la première
  #   fois que le code est appelé.
  # 
  # * RETURN
  # 
  #   Durée max de l'exercice (Fixnum)
  # 
  def duree_max_in_seances
    
  end
  # Retourne la durée min en fonction des séances
  # 
  # @see `duree_max_in_seances' above for details
  def duree_min_in_seances
    
  end
  
  
  # Retourne le path à l'exercice 
  # 
  def path
    @path ||= @roadmap.path_exercice( id )
  end  

  # Return l'identifiant absolu ou NIL s'il n'existe pas
  def abs_id
    @abs_id ||= data[:abs_id]
  end
  
  # Retourne l'instrument de l'exercice ou nil
  # 
  # @note: Instrument ID exists only for exercices from DB Exercices
  # @todo: Mais on pourrait imaginer de mettre l'instrument de l'user, puisqu'il doit
  # le définir. Ou alors, ici, renvoyer l'instrument de l'utilisateur. Mais une instance
  # exercice sera-t-elle forcément toujours liée à un utilisateur ?
  # 
  def instrument
    @instrument ||= data[:instrument]
  end
  
  # Return TRUE si l'exercice provient de la Database Exercices (DBE)
  # 
  def dbe?
    abs_id != nil
  end
  
  # Return le path relatif à la vignette (pour affichage dans le document)
  # 
  # Si la vignette existe dans la roadmap, on la prend
  # Sinon, si l'exercice provient de la Database, on prend sa vignette
  # Sinon, on renvoie NIL
  def relpath_vignette
    @relpath_vignette ||= begin
      rpath = real_path_vignette
      rpath.nil? ? nil : rpath.sub(/#{APP_FOLDER}\//,'')
    end
  end
  # Return le path relatif à l'extrait (pour affichage dans le document)
  # Même note que `relpath_vignette' ci-dessus
  def relpath_extrait
    @relpath_extrait ||= begin
      rpath = real_path_extrait
      rpath.nil? ? nil : rpath.sub(/#{APP_FOLDER}\//,'')
    end
  end
  
  # Return le vrai path à la vignette, soit propre, donc dans le dossier
  # exercices de l'utilisateur, soit tirée de la BD Exercices, donc dans 
  # le dossier data/db_exercices/
  def real_path_vignette
    @real_path_vignette ||= begin
      File.exists?( path_vignette ) ? path_vignette : path_vignette_bde
    end
  end
  # Return le vrai path à l'extrait, soit propre, soit tirée de la BD Exercice, soit NIL
  def real_path_extrait
    @real_path_extrait ||= begin
      File.exists?(path_extrait) ? path_extrait : path_extrait_bde
    end
  end
  
  # Return le path à la vignette propre (dans le dossier exercice)
  def path_vignette
    @path_vignette ||= File.join( roadmap.folder_exercices, "#{id}-vignette.jpg")
  end
  # Return le path de la vignette de l'exercice dans la base de données ou NIL si l'exercice
  # ne vient pas de la database
  def path_vignette_bde
    @path_vignette_bde ||= begin
      if dbe?
        File.join(APP_FOLDER, 'data', 'db_exercices', instrument, abs_id.split('-')) + '-vignette.jpg'
      else
        nil
      end
    end
  end
  # Return le Path de l'extrait image de l'exercice
  def path_extrait
    @path_extrait ||= File.join(roadmap.folder_exercices, "#{id}-extrait.jpg")
  end
  # Return le path à l'extrait dans la Database Exercice ou NIL si l'exercice ne vient pas
  # de la database
  def path_extrait_bde
    @path_extrait_bde ||= begin
      if dbe?
        File.join(APP_FOLDER, 'data', 'db_exercices', instrument, abs_id.split('-')) + '-extrait.jpg'
      else 
        nil
      end
    end
  end
end
