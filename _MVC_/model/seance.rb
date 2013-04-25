=begin

  Class Seance
  -------------
  
  Gestion des séances de travail

  Class qui en tout premier lieu :
    - Tient à jour les séances de travail
    - confectionne une séance de travail pour le musicien
  
  # Enregistrement des sessions de travail
    Chaque session est enregistré dans un FICHIER DU JOUR, au format json
    Dès qu'un exercice est joué suffisamment longtemps, il est enregistré
    @noter que le même exercice peut être joué plusieurs fois le même jour. Il sera
    enregistrer comme un nouvel exercice, et rentrera dans les calculs
  
  # Confection d'une séance de travail
    L'instance se sert d'un maximum de 50 séances précédentes pour connaitre les
    durées de travail des exercices et les exercices joués.
    
=end
require 'date'
require_model 'user'    unless defined?(User)
require_model 'roadmap' unless defined?(Roadmap)
require_model 'seance/building'

class Seance
  
  # Roadmap of the instance Seance (instance Roadmap)
  # 
  attr_reader :roadmap
  
  # User of the instance Seance (instance User)
  # 
  attr_reader :user
  
  # Params session sent
  # 
  attr_reader :params
  
  # Day of the seance -- A String "YYMMDD"
  # 
  attr_reader :day
  
  # Initialize a new instance Seance
  # 
  # * PARAMS
  #   :rm::         Roadmap (instance Roadmap) of the working session
  #   :options::    Hash containing:
  #                 :day     Date of the seance. A String "YYMMJJ"
  # 
  def initialize rm, options = nil
    @roadmap  = rm
    @user     = rm.user
    unless options.nil?
      @day = options[:day] if options.has_key?( :day )
    else
      @day = Date.today.strftime("%y%m%d")
    end
  end
  
  # Add a working time for exercice +ex+ (instance of Exercice)
  # 
  # * PARAMS
  #   :iex::      Instance Exercice of the exercice (or ID String)
  #   :dwork::    Work data:
  #                 :time   => Number of seconds of working time (Fixnum)
  #                 :tempo  => Tempo (Fixnum)
  # 
  # * NOTES
  #   - Shortcut for <seance>.file.add_working_time
  # 
  # @return:    NIL
  # 
  def add_working_time iex, dwork, options = nil
    file.add_working_time iex, dwork, options
  end
  
  # Build a working session according to params
  # 
  # * RETURN
  #   - Message (before start working)
  #   - Exercice list
  #   - Scale of the day
  #   - Harmonic sequence
  # 
  def build_with_params params
    Building.new(self, params).data
  end
  
  # Return the Roadmap of the working session (instance Roadmap)
  def roadmap
    @roadmap ||= Roadmap.new @params[:rm_nom]
  end

  # Return User of the session (instance User)
  def user
    @user ||= User.new @params[:mail]
  end
  
  # Return sfile of the session (instance Seance::SFile - @see below)
  # 
  def file
    @file ||= SFile.new self
  end
  
  # Return seance folder of the Roadmap
  # 
  # @note: Build it if needed
  # 
  def folder
    @folder ||= begin
      p = File.join(roadmap.folder, 'seance')
      Dir.mkdir(p, 0777) unless File.exists? p
      p
    end
  end
  
  # -------------------------------------------------------------------
  #   Seance::SFile Subclass
  #   ----------------------
  #   Working Session File management
  # -------------------------------------------------------------------
  class SFile
    
    # -------------------------------------------------------------------
    #   SFile Class
    # -------------------------------------------------------------------
    class << self
    
      # Instance Seance::SFile of the current day
      # 
      attr_reader :today
      
    end
    
    # Return the working session files of the day (instance of Seance::SFile)
    # 
    # @note: The file may exist or not
    # 
    def self.today
      @today ||= begin
        path = File.join(Seance::roadmap.folder, 'seance', Date.today.strftime("%y%m%d"))
        new path
      end
    end
    
    # Return the +x+ last working session files, if they exist.
    # 
    # * RETURN
    # 
    #   An sorted Array of Seance::SFile instances
    #   First is the oldest
    # 
    def self.get_last x = 50
      
    end
    
    
    # -------------------------------------------------------------------
    #   SFile Instance
    # -------------------------------------------------------------------
    
    # Seance of the file
    # 
    attr_reader :seance
    
    # Initialize a Seance::SFile file
    # 
    def initialize seance
      @seance = seance
    end
    
    # Save updated data
    # 
    def save
      File.open(path, 'wb'){|f| f.write @data.to_json}
      File.open(path_marshal, 'wb'){|f| f.write Marshal.dump(@data)}
    end
    
    # Add a working time +time+ (Fixnum, number of seconds) for exercice 
    # +iex+ (instance Exercice)
    # 
    # * PARAMS
    #   :iex::      Instance Exercice of the exercice
    #   :dwork::    {:time => Working time on the exercice, :tempo => tempo}
    #   :options::  Some options:
    #               :scale::      (optional) Scale used to work now
    #               :config::     (optional) General configuration of the day
    # 
    def add_working_time iex, dwork, options = nil
      data[:id_exercices] << iex.id unless data[:id_exercices].include? iex.id
      dwork = dwork.merge :id => iex.id
      unless options.nil?
        [:scale, :config].each do |key|
          dwork = dwork.merge key => options[key] if options.has_key?(key)
        end
      end
      data[:exercices] << dwork
      save
      true
    end
    
    # Return data for this Seance::SFile from file
    # 
    def data
      @data ||= begin
        if File.exists? path_marshal
          Marshal.load(File.read(path_marshal))
        elsif File.exists? path
          JSON.parse(File.read(path)).to_sym
        else
          data_init
        end
      end
    end
    
    # Return a Hash for initial data of a Seance::SFile
    # 
    def data_init
      {
        :day          => seance.day,
        :exercices    => [],  # Exercices list (Array of simple Hashes)
        :id_exercices => [],  # Just a Array of exercices Ids of seance
        :scale        => nil, # Scale of the day (e.g. "A#", "Bb")
        :harmonic_seq => nil  # String (e.g. "whitekey" or "harmonic" (1))
      }
      # (1) As defined in Javascript
    end
    
    # Return path for this Seance::SFile
    # 
    def path
      @path ||= File.join(seance.folder, seance.day)
    end
    
    # Return path for marshal file
    def path_marshal
      @path_marshal ||= File.join(seance.folder, "#{seance.day}.msh")
    end
  end
end