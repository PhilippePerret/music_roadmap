=begin

  Data-Base Exercice
  
  @note: To force the update of all files, set FORCE_UPDATE[:db_exercices] to
  true in _force_update.rb file.
  
  When called, update the db_exercices JS files per instrument in french and english locale
  folders.
  
  Each file build a JS table called DB_EXERCICES:
  
  DB_EXERCICES = {
    <id auteur> => {
      n: <author patronyme>,
      r: => { // "r" for "recueils" ("collections")
          "<id recueil>" => {
            t: "<recueil title",
            e: => []  // will be filled later, if recueil title is clicked
                      // @see exercices_of
          }
        }
      }
    }
  };
  DBE_DATA = {
    nombre:{
      exercices: ...,
      auteurs: ...,
      recueils: ...
    }
  }
=end
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
    @data_fr = @data_fr.merge iauteur.id => {:n => iauteur.patronyme, :r => []}
    @data_en = @data_en.merge iauteur.id => {:n => iauteur.patronyme, :r => []}
  end
  
  # Inaugure a new recueil for author
  # 
  # @param    irecueil    Instance AuteurExercice::RecueilExercice of the collection
  # 
  def self.add_recueil irecueil
    auteur_id = irecueil.auteur.id
    # @data_fr[auteur_id][:r][irecueil.id] = {:t => irecueil.titre_fr, :e => []}
    # @data_en[auteur_id][:r][irecueil.id] = {:t => irecueil.titre_en, :e => []}
    @data_fr[auteur_id][:r] << {:i => irecueil.id, :t => irecueil.titre_fr, :e => []}
    @data_en[auteur_id][:r] << {:i => irecueil.id, :t => irecueil.titre_en, :e => []}
  end
  
  # # Add a exercice
  # # NOTER QUE SI ON DOIT RÉ-UTILILSER ÇA, IL FAUT LE RECODER, CAR LA DONNÉES RECUEIL
  # # (:r) N'EST PLUS UN HASH MAIS UN ARRAY, POUR QU'ILS SOIENT AFFICHÉS DANS L'ORDRE
  # def self.add_exercice iex
  #   auteur_id = iex.recueil.auteur.id
  #   recueil_id = iex.recueil.id
  #   @data_fr[auteur_id][:r][recueil_id][:e] << {:i => iex.id, :t => iex.titre, :y => iex.types, :g => iex.image?}
  # end
  
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
  end
  
  def valid?
    File.exists? path_data
  end
  
  def data
    @data ||= YAML.load_file(path_data)
  end
  def id; data['id'] end
  def name; data['name'] end
  def patronyme; data['patronyme'] end

  # Return exercices of recueil +recueil_id+
  # 
  # @param  recueil_id      Name of collection ("recueil") folder (or NIL for all recueils)
  # @param  lang            Lang of the Hash of data returned (DEFAULT: :en)
  # 
  # @return A Hash with data.
  #   If recueil_id is NIL, keys are recueil names and value is the Array data of exercices
  #   Else, only the Array of exercices, sorted by id, with :
  #   [
  #     {i:<id exercice>, t:<exercice title>, y:[<exercice types list>],
  #       g:<true = image exists>, wm:<working time min>, wx:<working time max,
  #       }
  #   ]
  def exercices_of_recueil recueil_id = nil, lang = :en
    @exercices_of_recueil = {}
    @lang = lang
    if recueil_id.nil?
      Dir["#{path}/*"].reject{ |path_recueil| File.directory?(path_recueil) }
    else
      [File.join(path, recueil_id)]
    end.each do |path|
      recueil = RecueilExercice.new self, path # Raise an exception if recueil does not exist
      recueil.traite_exercices
    end
    # Sort exercices by id
    @retour = {}
    @exercices_of_recueil.each do |recueil_id, exs|
      @retour = @retour.merge recueil_id => exs.sort_by{|e| e[:i].to_i}
    end
    return @retour if recueil_id.nil?
    @retour[recueil_id]
  end
  # Add a exercice to the Array of exercice list returned by ajax
  # @see exercices_of_recueil above
  # 
  # @param iex  Instance of AuteurExercice::RecueilExercice::Exercice
  # 
  def exercice_to_data iex
    unless @exercices_of_recueil.has_key?(iex.recueil.id)
      @exercices_of_recueil = @exercices_of_recueil.merge iex.recueil.id => []
    end
    @exercices_of_recueil[iex.recueil.id] << iex.to_js( @lang )
  end
  
  # Add collections to author
  # 
  # @note: We don't treat exercices. The JS DB_EXERCICES table does not contain exercices
  # at starting point.
  def traite_recueils
    liste_recueils.each do |path_recueil|
      next unless File.directory?(path_recueil)
      recueil = RecueilExercice.new self, path_recueil
      self.class.add_recueil recueil
    end
  end
  
  # Return recueil (collection) list sorted
  # 
  def liste_recueils
    Dir["#{path}/*"].sort_by{ |path| File.basename( path )}
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
    
    # Initialize a new RecueilExercice by an +auteur+
    # 
    # @param  auteur    Instance AuteurExercice
    # @param  path      Full path to the collection ("recueil") folder
    # 
    def initialize auteur, path
      @auteur = auteur
      @path   = path
      raise "Mauvais recueil d'exercice (pas de fichier _data.yml)" unless valid?
    end
    
    # Return TRUE if recueil folder is valid
    def valid?
      File.exists? path_data
    end
    alias :exists? :valid?
    
    def id;         @id   ||= data['id']        end
    def opus;       @opus ||= data['opus']      end
    def opus_str
      return "" if opus.nil?
      " op. #{opus}"
    end
    def titre_fr; data['recueil_fr'] + opus_str end
    def titre_en; data['recueil_en'] + opus_str end
    
    # Treat data of the recueil
    def data
      @data ||= YAML.load_file(path_data)
    end
    
    # Treat exercices of the recueil
    # 
    # @param    filter    Unused. Later, let you to filter the exercices returned
    # 
    def traite_exercices filter = nil
      exercice_files = Dir["#{path}/*.yml"].reject{ |e| File.basename(e) == "_data.yml"}
      exercice_files.each do |path_ex|
        iex = Exercice.new self, path_ex
        auteur.exercice_to_data iex
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
      
      # Return a Hash prepared for JS DB_EXERCICES
      def to_js lang = :en
        {
          :i => id, :t => titre(lang), :y => types,
          :wm => working_time_min, :wx => working_time_max, 
          :ie => extrait?, :iv => vignette?,
          :sc => score?
        }
      end
      
      def id
        @id ||= File.basename(path, File.extname(path) )
      end
      def titre lang = :en
        lang == :en ? data['titre_en'] : data['titre_fr'] 
      end
      def types;        data['types']       end
      def suite;        data['suite']       end
      def tempo_min;    data['tempo_min']   end
      def tempo_max;    data['tempo_max']   end
      def nb_mesures;   data['nb_mesures']  end
      # @note: 0=carrée, 1=ronde, 1.5= ronde pointée, 2=blanche, 3=blanche pointée, 4=noire,
      # 6=noire pointée, etc.
      def duree_temps;  data['duree_temps'] end
      def nb_temps;     data['nb_temps']    end
      
      # Return working time max according to number of measures, metrique and tempo min
      # So the LONGEST working time
      # @return Number of seconds
      def working_time_max
        (nb_temps * nb_mesures * duree_temps_tempo_min).to_i
      end
      # Return working time max according to number of measures, metrique and tempo min
      # So the SHORTEST working time
      # @return Number of seconds
      def working_time_min
        if nb_temps.nil? || nb_mesures.nil? || duree_temps_tempo_max.nil?
          raise "nb_temps: #{nb_temps.inspect}:#{nb_temps.class}" +
                "nb_mesures: #{nb_mesures.inspect}:#{nb_mesures.class}" +
                "duree_temps_tempo_max: #{duree_temps_tempo_max.inspect}:#{duree_temps_tempo_max.class}"
        end
        (nb_temps * nb_mesures * duree_temps_tempo_max).to_i
      end
      # Return time duration of a beat according to the tempo min
      def duree_temps_tempo_min
        if tempo_min.nil?
          raise "tempo_min est nil in #{self.inspect}:#{self.class}"
        end
        60.0 / tempo_min
      end
      # Return time duration of a beat at the tempo max
      def duree_temps_tempo_max
        if tempo_max.nil?
          raise "tempo_max est nil in exercice ##{id}/#{recueil.id}/#{recueil.auteur.patronyme} (#{self.inspect}:#{self.class})"
        end
        60.0 / tempo_max
      end
      
      # Return TRUE if score pdf exists
      def score?;     File.exists? path_score     end
      # Return TRUE if whole score image exists
      def image?;     File.exists? path_image     end
      # Return TRUE if excerpt image exists
      def extrait?;   File.exists? path_extrait   end
      # Return TRUE if vignette image exists
      def vignette?;  File.exists? path_vignette  end
      
      def data
        @data ||= YAML.load_file( path )
      end
      
      # Return (and define) path of score pdf
      def path_score
        @path_score ||= File.join(folder, "#{id}.pdf")
      end
      # Return (and define) path image
      def path_image
        @path_image ||= File.join(folder, "#{id}.jpg")
      end
      # Return (and define) path vignette image
      def path_vignette
        @path_vignette ||= File.join(folder, "#{id}-vignette.jpg")
      end
      
      # Return (and define) path excerpt image
      def path_extrait
        @path_extrait ||= File.join(folder, "#{id}-extrait.jpg")
      end
      
      # Return (and define) folder image
      def folder
        @folder ||= File.dirname(path)
      end
    end
  end
end

class DataBaseExercices
  
  class << self

    # Current instrument
    # 
    attr_reader :current_instrument
    
    # Instrument list (Array of Hashs)
    # 
    attr_reader :instruments_list

  end
  
  # Return data of exercices by +auteur_id+. If +recueil_id is not nil, only the exercices
  # of this collection.
  # 
  # @param    inst_id         ID of the instrument (p.e. "piano" or "violin")
  # @param    auteur_id       Name of the author folder
  # @param    recueil_id      Name of the collection folder
  # @param    lang            Lang of the required Hash of data (pe :en, :fr)
  # 
  # @return   A Hash with data of exercices, for display.
  # 
  # @see JS database_exercices.js file
  def self.exercices_by inst_id, auteur_id, recueil_id = nil, lang = nil
    path    = File.join(folder_data, inst_id, auteur_id)
    unless File.exists? path
      raise "Unknow instrument #{inst_id}…" unless File.exists?(File.join(folder_data, inst_id)) 
      raise "Unknow author #{auteur_id} (or instrument #{inst_id})…" 
    end
    auteur  = AuteurExercice.new path
    auteur.exercices_of_recueil recueil_id, lang
  end
  
  # Update JS DBExercices for each instrument
  # 
  # @product  
  #   - Build de JS File for DBExercice for each instrument
  #   - Update `locale/<lang>/instruments.js` file
  # 
  # @see `update_instrument' below for details
  def self.update_each_instrument
    @instruments_list = {:fr => [], :en => []}
    Dir["#{folder_data}/*"].each do |path|
      next unless folder_instrument? path
      # @TODO: Ici, on pourrait regarder si le fichier JS en français existe. Si c'est le
      # cas, on n'actualise pas ce fichier.
      dinstr = YAML.load_file(File.join(path, '_data.yml'))
      @instruments_list[:fr] << {:id => dinstr['id'], :name => dinstr['name_fr']}
      @instruments_list[:en] << {:id => dinstr['id'], :name => dinstr['name_en']}
      @current_instrument = dinstr['id']
      update_instrument
    end
    update_instruments_js_locale_file
  end
  
  # Update `instruments.js' file which contains list of instruments (for sign up)
  # 
  def self.update_instruments_js_locale_file
    [:fr, :en].each do |lang|
      code = "window.DATA_INSTRUMENTS = " + instruments_list[lang].to_json
      path = File.join(APP_FOLDER, 'javascript', 'locale', lang.to_s, 'instruments.js')
      File.open(path,'wb'){|f| f.write code}
    end
  end
  
  # Update JS DB_EXERCICES (with only « initial data », that means without exercices — only 
  # authors and collections)
  # 
  # @param  instid    ID of instrument. If NIL, we get the :current_instrument pseudo-class 
  #                   variable
  # 
  # @product  
  #   - Build de JS File for DBExercice for instrument
  # 
  def self.update_instrument instid = nil
    instid ||= @current_instrument
    AuteurExercice::data_fr = {}
    AuteurExercice::data_en = {}
    folder_instrument = File.join(folder_data, instid)
    liste_auteurs = Dir["#{folder_instrument}/*"].sort_by{ |path| File.basename(path)}
    liste_auteurs.each do |path|
      next unless File.directory?(path)
      auteur = AuteurExercice.new path
      AuteurExercice::add_auteur auteur
      auteur.traite_recueils
    end
    File.open(path_fr(instid), 'wb'){|f| f.write final_code(:fr, instid)}
    File.open(path_en(instid), 'wb'){|f| f.write final_code(:en, instid)}
  end
  
  # Update JS DBE_DATA (only number pour le moment)
  # @note: c'est la méthode `final_code' ci-dessous qui appelle cette méthode
  # @return la table @dbe_data au format JSON
  def self.update_dbe_data instid = nil
    instid ||= @current_instrument
    dbe_data = {
      :nombre => {:auteurs => 0, :recueils => 0, :exercices => 0}
    }
    folder_instrument = File.join(folder_data, instid)
    folders_auteurs = Dir["#{folder_instrument}/*"]
    dbe_data[:nombre][:auteurs] = folders_auteurs.count - 1 # le fichier _data.yml
    folders_auteurs.each do |dauteur|
      next unless File.directory?(dauteur)
      Dir["#{dauteur}/*"].each do |drecueil|
        next unless File.directory?(drecueil)
        dbe_data[:nombre][:recueils]   += 1
        dbe_data[:nombre][:exercices]  += (Dir["#{drecueil}/*.yml"].count - 1)
      end
    end
    dbe_data.to_json
  end
  
  # Return final code according to instrument and lang
  # 
  # @param  lang      Lang, p.e. :en or :fr
  # @param  instid    Instrument id (as defined in `_data.yml' file of instrument folder)
  # 
  def self.final_code lang, instid
    instrument_h = nom_humain_instrument instid, lang
    code = AuteurExercice.send("data_#{lang}").to_json
    <<-EOC
window.INSTRUMENT   = "#{instid}";
window.INSTRUMENT_H = "#{instrument_h}";
window.DB_EXERCICES = #{code};
window.DBE_DATA     = #{update_dbe_data(instid)};

    EOC
  end
  
  # Return human name of instrument +inst_id+ in language +lang+
  def self.nom_humain_instrument inst_id, lang
    YAML.load_file(File.join(folder_data, inst_id, '_data.yml'))["name_#{lang}"]
  end
  
  # Return full path to JS French file for instrument +instid+
  # 
  def self.path_fr instid
    File.join(folder_fr, "#{instid}.js")
  end
  def self.path_en instid
    File.join(folder_en, "#{instid}.js")
  end
  # Return full path to JS french data-base folder
  # This folder contain all files by instrument, in french
  def self.folder_fr
    @path_fr ||= File.join(APP_FOLDER, 'javascript', 'locale', 'db_exercices', 'fr')
  end
  # Return full path to JS english data-base file
  # This folder contain all files by instrument, in english
  def self.folder_en
    @path_en ||= File.join(APP_FOLDER, 'javascript', 'locale', 'db_exercices', 'en')
  end
  # Return full path to exercice folder (data base folder for exercices)
  def self.folder_data
    @folder_data ||= File.join(APP_FOLDER, 'data', 'db_exercices')
  end
  
  
  # Return TRUE if +path+ can be a folder instrument
  def self.folder_instrument? path
    return false unless File.directory? path
    return false unless File.exists? File.join(path, '_data.yml')
    return true
  end
  
end