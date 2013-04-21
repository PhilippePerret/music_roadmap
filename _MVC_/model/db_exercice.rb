=begin

  Class DBExercice for Data Base Exercices

=end
require 'json'
require 'yaml'

class DBExercice
  
  # Return name of auteur +autid+
  # def self.auteur_name instid, autid # LATER, WHEN INSTRUMENT BE USED
  def self.auteur_name autid
    YAML.load_file(File.join(folder_auteur(autid), '_data.yml'))['name']
  end
  
  # Return title of recueil of id +recid+ according to the lang
  # 
  # * PARAMS
  #   :autid::    Author ID (= folder name)
  #   :recid::    Recueil ID (= folder name)
  # 
  def self.recueil_title autid, recid
    drecueil = YAML.load_file(File.join(folder_recueil(autid, recid), '_data.yml'))
    drecueil[@lang == :en ? 'recueil_en' : 'recueil_fr']
  end
  
  def self.folder_recueil autid, recid
    @folder_recueil ||= File.join(folder_auteur(autid), recid)
  end
  # def self.folder_auteur instid, autid # LATER, WHEN INSTRUMENT BE USED
  def self.folder_auteur autid
    @folder_auteur ||= File.join(folder_data, autid)
    # @folder_auteur ||= File.join(folder_data, instid, autid) # LATER, WHEN INSTRUMENT BE USED
  end
  
  def self.folder_data
    @folder_data ||= File.join(APP_FOLDER, 'data', 'db_exercices')
  end
  
  def self.set_lang lang
    @lang = lang
  end
  
  def self.lang
    @lang ||= :en
  end
  
  
  # -------------------------------------------------------------------
  #   Instance
  # -------------------------------------------------------------------
  
  # Full path of exercice
  # 
  attr_reader :path
  
  # Short-id of exercice (file affixe)
  # 
  attr_reader :id
  
  # Long-id of exercice ("<intrument>-<auteur>-<recueil>-<short id>")
  # 
  attr_reader :long_id
  
  # Auteur of the exercice (id)
  # 
  attr_reader :auteur
  
  # Recueil of the exercice (id)
  # 
  attr_reader :recueil
  
  
  # Initialize a new DBExercice
  # 
  # @param    long_id   Long-Id of exercice (something like "<instrument>-<auteur>-<recueil>-<id_ex>")
  # 
  def initialize long_id
    @long_id  = long_id
    decompose_long_id
    @path     = File.join(self.class.folder_data, @auteur, @recueil, "#{@id}.yml")
    # @path     = File.join(self.class.folder_data, @instrument, @auteur, @recueil, "#{@id}.yml") # LATER
    decompose_long_id # to set @id, @recueil, @auteur, @instrument
  end
  
  def decompose_long_id
    d = @long_id.split('-')
    @id         = d.pop
    @recueil    = d.pop
    @auteur     = d.pop
    @instrument = d.pop
  end
  
  # Duplicate exercice in roadmap +rm+
  # 
  # @param    rm      Instance of Roadmap
  # @param    withid  If provided, the id of the exercice in the roadmap. Otherwise, it
  #                   will be calculated here.
  # 
  # @note   @lang should be defined in self.class (with DBExercice::set_lang <lang>)
  #         otherwise the lang of title will be always english.
  # 
  def duplicate_in rm, withid = nil
    begin
      withid ||= rm.last_id_exercice + 1
      now = Time.now.to_i
      # Calculated values (or nil values)
      dex = {
        :id         => withid,
        :abs_id     => abs_id, 
        :titre      => titre,
        :auteur     => auteur_to_hum,
        :recueil    => recueil_to_hum,
        :tempo      => data['tempo_min'],
        :up_tempo   => nil,
        :obligatory => nil,
        :with_next  => nil,
        :created_at => now,
        :updated_at => now,
        :started_at => nil,
        :ended_at   => nil,
        :note       => nil,
        :image      => nil
      }
      # Duplicated values (from dbexercices to roadmap exercice)
      [:tempo_min, :tempo_max, :suite, :type].each do |prop|
        dex = dex.merge prop => data[prop.to_s]
      end
      # Create in Roadmap folder
      File.open(rm.path_exercice(dex[:id]), 'wb'){|f| f.write dex.to_json}
      return nil
    rescue Exception => e
      return e.message + "\n" + e.backtrace.join("\n")
    end
  end
  
  # Return auteur (human, not id) of the exercice
  def auteur_to_hum
    self.class.auteur_name( @auteur )
  end

  # Return recueil (human, not id) of the exercice
  def recueil_to_hum
    self.class.recueil_title( @auteur, @recueil )
  end
  # Return the exercice title according to the current lang
  def titre
    prop = self.class.lang == :en ? 'titre_en' : 'titre_fr'
    data[prop]
  end
  
  # Return the absolute id of the DB Exercice. It's the relative path from data/db_exercice
  # folder where separators are replaced with "-"
  def abs_id
    @long_id
  end
  
  # Return data as a Hash (String keys)
  def data
    YAML.load_file(@path)
  end
  
  # Return relative path
  def relative_path
    @relative_path ||= @path.sub(/^#{self.class.folder_data}\//,'')
  end
end