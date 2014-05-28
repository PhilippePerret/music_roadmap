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
    enregistré comme un nouvel exercice, et rentrera dans les calculs
  
  # Confection d'une séance de travail
    L'instance se sert d'un maximum de 50 séances précédentes pour connaitre les
    durées de travail des exercices et les exercices joués.
    
=end
require 'date'
require_model 'user'    unless defined?(User)
require_model 'roadmap' unless defined?(Roadmap)
require_model 'seance/building'

class Seance
  
  # -------------------------------------------------------------------
  #   Class Seance
  # -------------------------------------------------------------------
  class << self
    # Current roadmap
    # 
    attr_reader :roadmap
    
    # Hash containing seances data of current roadmad
    # @see self.lasts below
    # 
    attr_reader :seances_data

    def debug str = nil
      return if Params::online?
      nf = File.join('tmp', 'debug','seance_rb_debug.txt')
      File.unlink(nf) if File.exists?(nf) && File.stat(nf).mtime.to_i < (Time.now.to_i - 60)
      File.open(nf, 'a'){|f| f.puts str} unless str.nil?
    end
  
    # Return data of exercice +iex+ in the +x+ last seances
    # 
    # * USAGE
    # 
    #   dex = Seance.exercice iex[, x_last_seances_default_50]
    # 
    # * PARAMS
    #   :iex::      Instance Exercice of the exercice (Exercice)
    #   :x::        Search only the x last seances (Fixnum -- default: 50)
    # 
    # * RETURN
    # 
    #   An Hash containing:
    #     {
    #       :id               => Exercice ID (Fixnum but as String)
    #       :x_last           => The x last seances seached
    #       :number_of_times  => <the exercice has been played this number of times>
    #       :average_duration =>  Average playing time (Fixnum, seconds)
    #                             Réglé sur la durée de l'exercice d'après son tempo et
    #                             ses mesures ou sur 120 si ces informations ne sont
    #                             pas données.
    #       :total_duration   => Total working time
    #       :durations        => Array of working times of exercice
    #       :data             => Array containing Hash-s with something like:
    #                           { :day    => seance day ("YYMMDD"), 
    #                             :time   => Working time (Fixnum, seconds), 
    #                             :tempo  => Tempo used (Fixnum), 
    #                             :tone  => Scale used (Fixnum, 0-11 = C->B, 12-23 = Cm->Bm),
    #                             :id     => Exercice ID
    #                           }
    #       :tempos           => Array of tempi used for the exercice
    #       :tones           => Array of tones used for the exercice
    #       :seances          => Array of seance String days (["YYMMJJ", ...])
    #     }
    # 
  
    def exercice iex, x = 50
      @data_exercices ||= {}
    
      # Les données de l'exercice ont peut-être déjà été relevées
      dex = @data_exercices[iex.id]
      return dex[:data] if data_exercice_of_same_seance?( dex, iex.roadmap, x )
    
      data_exercice = {
        :id               => iex.id,
        :number_of_times  => 0,     # number of times, whatever working time
        :total_duration   => nil,
        :average_duration => iex.duree_exercice,
        :durations        => [],
        :data             => [],
        :tempos           => [],
        :tones            => [],
        :seances          => []
      }
      lasts(iex.roadmap,x)[:seances].each do |jour, dseance|
        next unless dseance[:id_exercices].include?( iex.id )
        data_exercice[:seances] << jour
        dseance[:exercices].each do |dex|
          next unless dex[:id] == iex.id
          data_exercice[:number_of_times] += 1
          nbfois = dex.has_key?(:nbfois) ? dex[:nbfois].to_f : 1.0 # compatibilité anciennes versions
          data_exercice[:data]      << dex.merge(:day => jour)
          data_exercice[:tempos]    << dex[:tempo]
          data_exercice[:tones]     << dex[:tone]
          data_exercice[:durations] << dex[:time]
        end
      end
      if data_exercice[:number_of_times] > 0
        data_exercice[:total_duration] = data_exercice[:durations].inject(:+)
        data_exercice[:average_duration] = 
           data_exercice[:total_duration] / data_exercice[:number_of_times]
      end
      @data_exercices = @data_exercices.merge( iex.id => {
          :x => x, :roadmap => iex.roadmap, :data => data_exercice
        })
      data_exercice
    end
  
    # Return true si les données exercices +dataex+ correspondent à la
    # roadmap de +iex+ et au nombre de séance +nombre_seances+
    def data_exercice_of_same_seance? dataex, roadmap, nombre_seances
      return false if dataex.nil?
      return dataex[:roadmap] == roadmap && dataex[:x] == nombre_seances
    end
  
    # Return the +x+ last seances of roadmap +roadmap+
    # 
    # * PARAMS
    #   :roadmap::    Instance Roadmap of the roadmap
    #   :x::          Number of last seances required (default: 50)
    # 
    # * RETURN
    # 
    #   {
    #     :x            => Number of seances needed,
    #     :sorted_days  => [day list, from earliest to oldest],
    #     :seances      => <Hash of seance> (*)
    #   }
    #   (*) An Hash where key is the seance day ("YYMMDD") and the value
    #   an Hash of seance Data (@note: NOT instance Seance).
    # 
    def lasts roadmap, x = 50
      return @seances_data if @seances_data != nil && @seances_data[:x] == x
      # debug # pour détruire le fichier debug
      @roadmap = roadmap
      hseances = {
        :x            => x,
        :sorted_days  => [],
        :seances      => {}
      }
      if File.exists? roadmap.folder_seances
        last_files( x ).each do |path|
          hseance = Marshal.load File.read( path )
          hseances[:sorted_days] << hseance[:day]
          hseances[:seances] = hseances[:seances].merge hseance[:day] => hseance
        end
      end
      @seances_data = hseances
    end
  
    # Return data of seances from day +from+ (YYMMDD) to day +to+ (YYMMDD) of the 
    # roadmap +rm+.
    # 
    # Return an Hash containing
    #   :from         => from (YYMMDD)
    #   :to           => to   (YYMMDD)
    #   :sorted_days  => Array of days (YYMMDD)
    #   :seances      => Hash of data seances where key is the day (YYMMDD) and
    #                    value is the hash data of the seance as recorded in the file
    #   :rm_first_seance  => Day (YYMMDD) of the very first seance of the roadmap
    #   :rm_last_seance   => Day (YYMMDD) of the very last seance of the roadmap
    # 
    def get_from_to rm, from, to
      dbg "-> Seance.get_from_to(roadmap.class:#{rm.class}, from:#{from}, to:#{to})"
      @roadmap = rm
      hseances = {
        :from             => from,
        :to               => to,
        :sorted_days      => [],
        :seances          => {},
        :rm_first_seance  => all_days[0],
        :rm_last_seance   => all_days[-1]
      }
      all_days.each do |seance_day|
        next  if seance_day < from
        break if seance_day > to
        hseances[:sorted_days] << seance_day
        hseances[:seances] = hseances[:seances].merge seance_day => data_seance(seance_day)
      end
      dbg "<- Seance.get_from_to"
      return hseances
    end
  
    # Return up to +x+ last files of seances of current roadmap (:roadmap)
    # 
    # There can be a lot of seance files (more than 600 for a musician
    # signed up since 2 years). So we first get all filenames (marshal only)
    # then we uprise from today to oldest day until we have +x+ files.
    # 
    # * RETURN
    # 
    #   Sorted list (from youngest to oldest) of the file paths.
    # 
    def last_files x = 50
      # Tous les fichiers séances (Array of file names)
      # 
      return [] if all_days.empty?
      oldest_date = Date.strptime(all_days.first, '%y%m%d')
      # Only the lasts x
      lejour, choosed_files, fold = Date.today, [], @roadmap.folder_seances
      while choosed_files.count < x && lejour >= oldest_date
        day   = lejour.strftime("%y%m%d") 
        nfile = "#{day}.msh"
        choosed_files << File.join(fold, nfile) if all_days.include?( day )
        lejour -= 1
      end
    
      choosed_files
    end
  
    # Return an Array of all seances day of the current roadmap
    # 
    # @note:    Seances are sorted from oldest to earliest
    # 
    def all_days
      @all_days ||= begin
        ary = Dir["#{@roadmap.folder_seances}/*.msh"].collect{|path| File.basename(path, File.extname(path))}
        ary.sort
      end
    end
  
    # Return data of seance of the day +day+ of the current roadmap (@roadmap)
    # 
    def data_seance day
      # Marshal.load File.read(File.join(@roadmap.folder_seances, "#{day}.msh"))
      App::load_data File.join(@roadmap.folder_seances, "#{day}.msh")
    end
  end # << self

  # -------------------------------------------------------------------
  #   Instance Seance
  # -------------------------------------------------------------------
  
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
  
  # Save data of seance
  # 
  def save
    file.data= data
    file.save
  end
  
  # data (in file)
  # 
  def data
    @data ||= file.data
  end
  
  # Start seance
  # 
  # Set the :start attribute. If seance already exists, the :start and :end attributes 
  # becomes Array(s) of starts and ends. Otherwise, a Fixnum of Time.now
  #
  # * NOTES
  # 
  #   :end is also set to now. It's important when :start and :end attributes are 
  #   Array (when multiple seance a day), so the add exercice method can update the 
  #   proper value (the last of the :end Array).
  # 
  def run
    now = Time.now.to_i
    @data = file.data
    if exists? && @data[:start].class == Fixnum
      @data[:start] = [@data[:start]] 
      @data[:end]   = [@data[:end]] 
      @data[:start] << now
      @data[:end]   << now
    else
      @data[:start] = now
      @data[:end]   = now
    end
    save
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
  # @param {Hash} params  Les paramètres de la séance, définis par l'utilisateur, 
  #                       dont la durée, les techniques à aborder, etc.
  def build_with_params params
    # On enregistre toujours les derniers paramètres utilisés pour les remettre
    # à la séance suivante.
    save_params_seance params
    Building.new(self, params).data
  end
  
  def save_params_seance params
    App::save_data path_params_seance, params
  end
  def get_params_last_seance
    if File.exists? path_params_seance
      App::load_data path_params_seance
    else
      {}
    end
  end
  
  def path_params_seance
    @path_params_seance ||= File.join(roadmap.folder, 'params_last_seance.msh')
  end

  # Return the Roadmap of the working session (instance Roadmap)
  def roadmap
    @roadmap ||= Roadmap.new @params[:rm_nom]
  end

  # Return User of the session (instance User)
  def user
    @user ||= User.new @params[:mail]
  end
  
  # Return true if seance exists (file)
  def exists?
    file.exists?
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
    # @note: @roadmap must be defined
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
    
    # Data in file
    # 
    # Use data and data= methods
    # 
    @data = nil 
    
    # Initialize a Seance::SFile file
    # 
    def initialize seance
      @seance = seance
    end
    
    # Return true if seance file exists
    def exists?
      File.exists? path
    end
    
    # Save updated data
    # 
    def save
      File.open(path, 'wb'){|f| f.write Marshal.dump(@data)}
    end
    
    # Add a working time for exercice +iex+ (instance Exercice)
    # 
    # * PRODUCT
    #   - Had data for exercice
    #   - Calculated the virtual number of fois, according to the duration of the work
    #     on the exercice and the calculted duration. This property is usefull to know
    #     how many times the exercices has been played.
    #   - Update de :end attribute of the seance
    #   
    # * PARAMS
    #   :iex::      Instance Exercice of the exercice
    #   :dwork::    {:time => Working time on the exercice, :tempo => tempo}
    #   :options::  Some options:
    #               :tone::       (optional) Scale used to work now
    #               :config::     (optional) General configuration of the day
    # 
    def add_working_time iex, dwork, options = nil
      data[:id_exercices] << iex.id unless data[:id_exercices].include? iex.id
      dwork = dwork.merge(
        :nbfois => iex.real_nbfois_with_time_and_tempo(dwork[:time],dwork[:tempo]),
        :id     => iex.id
        )
      unless options.nil?
        @data[:tone] ||= []
        @data[:tone] << options[:tone] if options.has_key?(:tone)
        @data[:tone].uniq!
        [:config].each do |key|
          @data = @data.merge key => options[key] if options.has_key?(key)
        end
      end
      @data[:exercices] << dwork
      update_end
      save
      true
    end
    
    # Update end time of the seance
    # 
    def update_end
      now = Time.now.to_i
      if @data[:end].class == Array
        @data[:end][-1] = now
      else        
        @data[:end] = now
      end
    end
    
    # Return data for this Seance::SFile from file
    # 
    def data
      @data ||= begin
        if File.exists? path
          Marshal.load(File.read(path))
        else
          data_init
        end
      end
    end
    
    # Set data
    def data= data
      @data = data
    end
    
    # Return a Hash for initial data of a Seance::SFile
    # 
    def data_init
      {
        :day                => seance.day,
        :start              => nil, # Start time (timestamp) of the seance (Fixnum)
                                    # If several seances a day, it's a array of starts
                                    # @note: Set when "START!" is hired by musician, and the 
                                    # "seance/start.rb" procedure
        :end                => nil, # End time (timestamp) of the seance (Fixnum)
                                    # If several seances a day, it's a array of ends
                                    # @note: Set when "STOP!" is hired by musician, and the 
                                    # "seance/stop.rb" procedure
        :working_time       => nil, # Working time, according to :start and :end
        :real_working_time  => nil, # Effective duration of the work, calculated with
                                    # exercice working time, unlike :working_time, calculated
                                    # upon :start and :end.
        :exercices          => [],  # Exercices list (Array of simple Hashes)
                                    # Simple hash contains: {:id => , :tempo => , :time => working time}
        :id_exercices       => [],  # Just a Array of exercices Ids of the seance
        :tone              => nil, # Scale of the day (NIL or a Array of Fixnum-s from 0 — C — to 23 — Bm —)
        :harmonic_seq       => nil, # String (e.g. "WK" or "harmonic" (1))
        :config             => nil  # General configuration of exercices (NIL or Hash containing
                                    # :maj_to_rel, :down_to_up, :first_to_last)
      }
      # (1) As defined in Javascript
    end
    
    # Working time
    # 
    def working_time
      data[:working_time] || calc_working_time
    end
    def calc_working_time
      starts, stops = if data[:end].class == Fixnum
        [[data[:start]], [data[:end]]]
      else
        [data[:start], data[:end]]
      end
      wt = 0
      while start = starts.pop
        stop = stops.pop
        wt  += stop - start
      end
      data[:working_time] = wt
      save
    end

    # Return effective working time
    # 
    def real_working_time
      if data[:real_working_time].nil?
        data[:real_working_time] = data[:exercices].collect{|ex| ex[:time]}.inject(:+)
        save
      end
      data[:real_working_time]
    end
    
    # Return path for marshal file
    def path
      @path ||= File.join(seance.folder, "#{seance.day}.msh")
    end
  end
end