=begin

  Data-Base Exercice
  
  When called, update the db_exercice.js in french and english locale folders.
  
  Build a JS table called DB_EXERCICES:
  
  DB_EXERCICES = {
    <id auteur> => {
      n: <author patronyme>,
      r: => { // "r" for "recueils" ("collections")
          "<id recueil>" => {
            t: "<recueil title",
            e: => [ // "e" for "exercices" (list of exercices)
              {i:"<id>", t:"<ex title>", y:[types list], g:<true if image>}
              ]
          }
        }
      }
    }
  }
=end


# Pour les essais
APP_FOLDER = File.join(Dir.home, 'Sites', 'cgi-bin', 'music_roadmap') unless defined? APP_FOLDER

require 'json'
require 'yaml'


class AuteurExercice
  # -------------------------------------------------------------------
  #   Class
  # 
  #   Main to receive each data to put it in the `@data' hash, which 
  #   will become to JS data
  # -------------------------------------------------------------------
  class << self
    
    # The full Hash with the whole exercices data
    # 
    # @question: Peut-être est-ce trop lourd d'avoir tout ca dans un 
    # seul fichier de donnée ? Il faudrait peut-être utiliser plus Ajax
    # pour venir recharger. Mais bon, pour le moment, je fonctionne comme
    # ça, on verra bien.
    attr_accessor :data_fr
    attr_accessor :data_en
  
  end
  
  # Inaugure a new key for author.
  # 
  # @param    iauteur     Instance AuteurExercice of the auteur
  def self.add_auteur iauteur
    @data_fr = @data_fr.merge iauteur.id => {:n => iauteur.name, :r => {}}
    @data_en = @data_en.merge iauteur.id => {:n => iauteur.name, :r => {}}
  end
  
  # Inaugure a new recueil for author
  # 
  # @param    irecueil    Instance AuteurExercice::RecueilExercice of the collection
  # 
  def self.add_recueil irecueil
    auteur_id = irecueil.auteur.id
    @data_fr[auteur_id][:r][irecueil.id] = {:t => irecueil.titre_fr, :e => []}
    @data_en[auteur_id][:r][irecueil.id] = {:t => irecueil.titre_en, :e => []}
  end
  
  # Add a exercice
  # 
  def self.add_exercice iex
    auteur_id = iex.recueil.auteur.id
    recueil_id = iex.recueil.id
    @data_fr[auteur_id][:r][recueil_id][:e] << {:i => iex.id, :t => iex.titre, :y => iex.types, :g => iex.image?}
  end
  
  # -------------------------------------------------------------------
  #   Instance AuteurExercice
  # -------------------------------------------------------------------
  
  # Full path of folder author in ./data/exercice
  # 
  attr_reader :path
  
  # @param  path    Full path to author folder in ./data/exercice
  def initialize path
    @path = path
    raise "Mauvais dossier auteur (pas de fichier _data.yml)" unless valid?
    self.class.add_auteur self
  end
  
  def valid?
    File.exists? path_data
  end
  
  def data
    @data ||= YAML.load_file(path_data)
  end
  def id; data['id'] end
  def name; data['author'] end
  
  def traite_recueils
    Dir["#{path}/*"].each do |path_recueil|
      next unless File.directory?(path_recueil)
      recueil = RecueilExercice.new self, path_recueil
      self.class.add_recueil recueil
      recueil.traite_exercices
    end
  end
  
  def path_data
    @path_data ||= File.join(path, '_data.yml')
  end
  # -------------------------------------------------------------------
  #   RecueilExercice
  # -------------------------------------------------------------------
  
  class RecueilExercice
    
    # Full path to recueil folder in ./data/exercice/
    # 
    attr_reader :path
    
    # Instance AuteurExercice of exercice's author
    # 
    attr_reader :auteur
    
    def initialize auteur, path
      @auteur = auteur
      @path   = path
      raise "Mauvais recueil d'exercice (pas de fichier _data.yml)" unless valid?
    end
    
    # Return TRUE if recueil folder is valid
    def valid?
      File.exists? path_data
    end
    
    def id; data['id'] end
    def titre_fr; data['recueil_fr'] end
    def titre_en; data['recueil_en'] end
    
    # Treat data of the recueil
    def data
      @data ||= YAML.load_file(path_data)
    end
    
    # Treat exercices of the recueil
    def traite_exercices
      exercice_files = Dir["#{path}/*.yml"].reject{ |e| File.basename(e)[0] == "_"}
      exercice_files.each do |path_ex|
        iex = Exercice.new self, path_ex
        auteur.class.add_exercice iex
      end
    end
    
    # Return (and define) full path to data file
    def path_data
      @path_data ||= File.join(path, '_data.yml')
    end
    
    # -------------------------------------------------------------------
    #   Class AuteurExercice::RecueilExercice::Exercice
    # -------------------------------------------------------------------
    class Exercice
      
      # Full path of the YAML file of the exercice in ./data/exercice/
      # 
      attr_reader :path
      
      # Instance RecueilExercice of the exercice
      # 
      attr_reader :recueil
      
      def initialize recueil, path
        @recueil = recueil
        @path    = path
      end
      
      def id
        @id ||= File.basename(path, File.extname(path) )
      end
      def titre; data['titre'] end
      def types; data['types'] end
      def suite; data['suite'] end
      def tempo_min; data['tempo_min'] end
      def tempo_max; data['tempo_max'] end
      
      def image?
        File.exists? path_image
      end
      
      def data
        @data ||= YAML.load_file( path )
      end
      
      # Return (and define) path image
      def path_image
        @path_image ||= File.join(folder, "#{id}.jpg")
      end
      
      # Return (and define) folder image
      def folder
        @folder ||= File.dirname(path)
      end
    end
  end
end

class DataBaseExercices
  def self.update
    AuteurExercice::data_fr = {}
    AuteurExercice::data_en = {}
    Dir["#{folder_data}/*"].each do |path|
      auteur = AuteurExercice.new path
      auteur.traite_recueils
    end
    File.open(path_fr, 'w'){|f| f.write "DB_EXERCICES = #{AuteurExercice::data_fr.to_json}"}
    File.open(path_en, 'w'){|f| f.write "DB_EXERCICES = #{AuteurExercice::data_en.to_json}"}
  end
  
  # Return full path to JS french data-base file 
  def self.path_fr
    @path_fr ||= File.join(APP_FOLDER, 'javascript', 'locale', 'fr', 'db_exercices.js')
  end
  # Return full path to JS english data-base file
  def self.path_en
    @path_en ||= File.join(APP_FOLDER, 'javascript', 'locale', 'en', 'db_exercices.js')
  end
  # Return full path to exercice folder (data base folder for exercices)
  def self.folder_data
    @folder_data ||= File.join(APP_FOLDER, 'data', 'exercice')
  end
end

DataBaseExercices::update
datafr = AuteurExercice::data_fr
puts "data fr: #{datafr.inspect}"
puts "Poids donnée française : #{datafr.to_json.length} octets"