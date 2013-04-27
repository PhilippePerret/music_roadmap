
require_model 'roadmap'
require_model 'file_duree_jeu'

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
  
  # Index de l'exercice dans la première ligne du fichier de données de jeu.
  # Rappel: cette première ligne contient simplement l'index de l'exercice associé à la
  # longueur de sa ligne de données dans le fichier, et elle est transformée en array de
  # "<id exercice>:<longueur ligne data>"
  # 
  attr_accessor :index_in_first_line
  
  # Durée actuelle de la donnée de l'exercice dans le fichier de données de jeux
  # 
  attr_accessor :len_init_in_duree_jeu
  
  # Offset du début de la ligne de code de l'exercice dans le fichier de données de jeux
  # 
  # NIL si l'exercice ne s'y trouve pas encore
  # 
  # OBSOLÈTE
  attr_accessor :offset_in_duree_jeu
    
  # Data dans le fichier .js de l'exercice
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
  
  # Return le Hash des données de l'exercice (les clés restent des Strings, PAS des Symbols)
  # 
  def data
    @data_js ||= JSON.parse(File.read(path))
  end
  
  # Retourne le path à l'exercice 
  # 
  def path
    @path ||= @roadmap.path_exercice( id )
  end
  
  # # Relève la ligne de code de l'exercice dans le fichier de données des data pour
  # # dispatcher les données ici, afin de pouvoir les traiter (par exemple ajouter une
  # # durée de jeu sur cet exercice)
  # # 
  # # OBSOLETE
  # def get_data_in_duree_jeu
  #   @line = @roadmap.file_duree_jeu.line_code_exercice self
  #   explode_line unless @line.to_s == ""
  # end
  
  # Ajoute un jeu de l'exercice 
  # 
  # Cette méthode est appelée lorsque l'exercice a été joué assez longtemps et que donc ce
  # temps de travail peut être inscrit dans les données des exercices joués.
  # 
  # * PARAMS
  #   :hdata::    Un Hash qui définit :
  #               :date::   Le jour au format "AAMMJJ"
  #               :duree::  La durée du jeu de l'exercice (Fixnum, nombre de secondes)
  # 
  # * PRODUCTS
  #   L'actualisation des données de l'instance Exercice, prête pour que la ligne soit
  #   actualisée dans le fichier
  # OBSOLETE
  # def add_new_jeu hdata
  #   get_data_in_duree_jeu
  #   @line_code = nil # pour forcer la reformation de la ligne de code de l'exercice.
  #   if @exercices_str.to_s == ""
  #     @exercices_str = ""
  #   else
  #     @exercices_str = @exercices_str.strip
  #     @exercices_str += ":"
  #   end
  #   @exercices_str << "#{hdata[:date]}#{hdata[:duree]}"
  #   # Incrémentation des valeurs de l'exercice
  #   @fois           += 1
  #   @duree_totale   += hdata[:duree]
  #   @duree_moyenne  =  @duree_totale / @fois
  #   # On actualise le fichier de données de durée de jeu
  #   @roadmap.file_duree_jeu.update self
  # end

  # Analyse et "explose" dans les propriétés de l'instance les données tirées de la ligne
  # enregistrée dans le fichier de données de jeu des exercices.
  # 
  # À titre de rappel, cette ligne est composée de :
  #   <id exercice>TAB<nombre fois joué>TAB<durée totale de jeu>TAB<durée moyenne>TAB<exercices>
  #   Où <exercices> ci-dessus est composé de données duo "AAMMJJ<duree>", séparés par des ":"
  #   Par exemple "13010155" pour 55 secondes jouées le 01 janvier 2013
  # 
  def explode_line
    @id, foi, tot, moy, @exercices_str = @line.split("\t")
    @fois           = foi.to_i
    @duree_totale   = tot.to_i
    @duree_moyenne  = moy.to_i
    # @exercices      = per_day.nil? ? [] : per_day.split(':').collect{|ex| date_duree_to_h ex}
  end
  
  # Implose la ligne, pour enregistrement
  def implode_line
    "#{@id}\t#{@fois}\t#{@duree_totale}\t#{@duree_moyenne}\t#{@exercices_str}\n"
  end
  
  # Line de code (doit être remis à nil dès la modification des données)
  def line_code
    @line_code ||= implode_line
  end
  
  # Retourne la longueur de la ligne de code
  def len
    line_code.length
  end
  
  # Renvoie le code à enregistrer dans le fichier des données de jeu pour les fois où les
  # exercices ont été joués.
  # 
  def exercices_to_data
    @exercices.collect do |ex| "#{ex[:date]}#{ex[:duree]}" end.join(':')
  end
  
  # Reçoit la durée-date (tout collé dans le fichier de données) et return un Hash
  # contenant {:date => "AAMMJJ", :duree => <nombre de secondes>}
  def date_duree_to_h this
    {
      :date   => this[0..5],
      :duree  => this[6..-1].to_i
    }
  end
  
  # Return l'identifiant absolu ou NIL s'il n'existe pas
  def abs_id
    @abs_id ||= data['abs_id']
  end
  
  # Return the Instrument ID or NIL if it doesn't exist
  # 
  # @note: Instrument ID exists only for exercices from DB Exercices
  # 
  def instrument
    @instrument ||= data['instrument']
  end
  
  # Return TRUE si l'exercice provient de la Database Exerice (DBE)
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
  
  # Return le vrai path à la vignette, soit propre, soit tirée de la BD Exercices
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
