=begin

  Model Roadmap
  --------------
  Malgré son nom singulier, c'est la classe d'une feuille d'exercice 
  principale
  
=end

require 'json'
require 'digest/md5'
require 'date'
require_model 'user'        unless defined?(User)
require_model 'exercice'    unless defined?(Exercice)
require_model 'seance'      unless defined?(Seance)

class Roadmap
  
  # Return le nom de la roadmap
  # 
  attr_reader :nom
  
  @nom        = nil
  @datajs     = nil  # Données du fichier data.js
  
  # Hash contenant les instances Exercice des exercices déjà relevés au cours du travail.
  # En clé : l'identifiant (String) de l'exercice et en valeur son instance.
  # Mais on accède pas directement à cette propriété, on fait plutôt :
  #     <roadmap>.exercice( <id exercice> )
  # 
  # @see: la méthode `exercice`
  @exercices  = nil
  
  # Instanciation
  # 
  # @param  data    SOIT Hash contenant :nom et :mail
  #                 SOIT String définissant :nom (Roadmap name)
  # @param  mail    SOIT nil si data est un Hash
  #                 SOIT String définissant :mail si :nom est string
  def initialize data, mail = nil
    @exercices = {}
    data = {:nom => data, :mail => mail} unless data.class == Hash
    set data
    check_nom_et_mail
  end
  
  # --- Méthodes de checks ---
  
  
  # =>  Return true si l'utilisateur est le possesseur de la rm ou un
  #     administrateur
  # @param  dauth     Hash contenant :mail, :md5
  # @param  pwd       Mot de passe String si dauth est un string
  # @param  md5       MD5 si dauth est un string
  # 
  # @note:  dans le flux normal, le possesseur est checké seulement avec
  #         le mail et le md5
  # 
  def owner_or_admin? dauth, lemd5 = nil
    if dauth.class == String
      dauth = {:mail => dauth, :md5 => lemd5 }
    end
    User.authentify_as_admin( dauth ) || owner?( dauth )
  end
  # Retourne true si l'utilisateur identifié par +dauth+ est bien le
  # détenteur de la feuille de route
  # @param  dauth   Pour le moment, contient :mail et :md5 qui doivent
  #                 correspondre à ceux enregistrés dans la feuille de route
  # 
  def owner? hismail, hismd5 = nil
    if hismail.class == Hash
      hismd5  = hismail[:md5]
      hismail = hismail[:mail]
    end
    begin
      raise "Mail nil" if hismail.nil?
      raise "Md5 required" if hismd5.nil?
      user = User.new hismail
      raise "User inconnu" unless user.exists?
    rescue Exception => e
      # # -- Débug Roadmap.owner? --
      # puts "# ERREUR in Roadmap.owner? : #{e.message}"
      # puts "Data transmises : mail:#{hismail}, password:#{hispwd}, md5:#{hismd5}"
      # # -- / débug --
      return false
    end
  
    return (hismail == mail) && ( hismd5 == md5 )
  end
  
  # Return owner of the roadmap (instance User)
  def user
    @user ||= User.new @mail
  end
  
  # Return config generale
  # 
  # @note: Keys are Symbol-s
  # 
  def config_generale
    @config_generale ||= begin
      if config_generale?
        JSON.parse(File.read(path_config_generale)).to_sym
      else
        {
          :first_to_last => true,
          :maj_to_rel   => true,
          :updated_at   => nil,
          :created_at   => Time.now.to_i,
          :down_to_up   => true,
          :last_changed => 'first_to_last',
          :tone        => 0
        }
      end
    end
  end
  
  LOOP_CONFIG_ATTRIBUTES = {
    :down_to_up   => :maj_to_rel, 
    :maj_to_rel   => :first_to_last, 
    :first_to_last => :down_to_up
    }
  # Define and save next config except if +dont_save+ is true (default: false)
  # 
  # * PARAMS
  #   :options::    Hash of options :
  #                 :save     If TRUE (default), save the next config
  #                 :tone     if TRUE (default) use the next tone
  # 
  # * RETURN
  # 
  #   An hash of config
  # 
  def next_general_config options = nil
    options ||= {}
    options = options.merge(:save => true) unless options.has_key?(:save)
    options = options.merge(:tone => true) unless options.has_key?(:tone)
    d = config_generale
    param_to_change     = LOOP_CONFIG_ATTRIBUTES[d[:last_changed].to_sym].to_sym
    d[param_to_change]  = !d[param_to_change]
    d[:last_changed]    = param_to_change
    @config_generale = d
    next_tone if options[:tone]
    save_config_generale if options[:save]
    @config_generale
  end
  
  # Next tone
  # 
  # On alterne entre ton majeur et ton mineur
  # Si la tonalité courante est majeure (<12) on ajoute 12, sinon, on retranche
  # 11 pour obtenir la tonalité majeur suivante
  def next_tone
    ton = @config_generale[:tone]
    @config_generale[:tone] = (ton < 12 ? ton + 12 : (ton + 1) % 12)
  end
  
  # Save config générale
  # 
  def save_config_generale
    File.open(path_config_generale, 'wb'){|f| f.write @config_generale.to_json}
  end
  
  
  
  # => Retourne true si le dossier de l'exercice existe déjà
  def exists?
    File.exists?( folder )
  end
  def data?
    File.exists?( path_data )
  end
  def config_generale?
    File.exists?( path_config_generale )
  end
  def exercices?
    File.exists?( path_exercices )
  end
  
  
  # Dispatch les données +data+ dans l'instance
  def set data
    data.each{ |k,v| self.instance_variable_set( "@#{k}", v ) }
  end
  def check_nom_et_mail
    @nom = nil if @nom == ""
    @mail = nil if @mail == ""
    raise "ERROR.Roadmap.initialization_failed" if @nom.nil? || @mail.nil?
  end
  
  # -------------------------------------------------------------------
  #   Data (dans data.js)
  # -------------------------------------------------------------------
  
  # =>  Retourne une valeur du fichier 'data.js' ou nil si le fichier
  #     n'existe pas, ou toutes les données si aucun paramètre
  # @param  key     La clé dans le fichier
  #                 Si nil, ce sont toutes les data qui sont remontées
  def get_datajs key = nil
    return nil unless data?
    @datajs ||= JSON.parse(File.read(path_data))
    return @datajs if key.nil?
    @datajs[key.to_s]
  end
  # =>  Retourne ce que j'appelle le `md5' de la roadmap, qui est
  #     constitué par le "mail-sel-password" du possession de la roadmap
  #     passé par un digest (toutes ces valeurs se trouvent dans data.js).
  # @return nil si les dannées ne sont pas fournies
  def md5;        get_datajs 'md5'        end
  # =>  Retourne l'ip du possesseur de la roadmap (ou nil si pas de data.js)
  def ip;         get_datajs 'ip'         end
  # =>  Retourne le mail du possesseur de la roadmap (ou nil)
  def mail;       get_datajs 'mail'       end
  # =>  Retourne la date de création de la rm
  def created_at; get_datajs 'created_at' end
  # =>  Retourne la date de dernière modification
  def updated_at; get_datajs 'updated_at' end
  
  # Retourne l'instance Exercice de l'exercice d'identifiant idex
  # 
  # @note: Les exercices déjà relevés sont conservés dans l'attribut @exercices de la
  # feuille de route
  def exercice idex
    @exercices[idex.to_s] ||= Exercice.new( idex, {:roadmap => self })
  end
  
  # =>  Retourne la data exercices +key+ ou l'ensemble des données exercices
  #     (fichier exercices.js) si +key+ n'est pas fourni ou nil
  def data_exercices key = nil
    return nil unless exercices?
    @data_exercices ||= JSON.parse(File.read(path_exercices))
    if key.nil?
      return @data_exercices
    else
      return @data_exercices[key.to_s] # toujours clé string
    end
  end
  
  # Update last id exercice
  def update_last_id_exercice id
    File.open(path_last_id_exercice,'wb'){ |f| f.write id.to_s }
  end
  
  # Return last id used
  def last_id_exercice
    @last_id_exercice ||= begin
      if File.exists? path_last_id_exercice
        File.read(path_last_id_exercice)
      else
        0
      end
    end
  end
  
  # =>  Retourne l'ordre des exercices (key 'ordre' du fichier 'exercices.js')
  #     En cas d'absence du fichier exercices.js renvoie une liste vide
  def ordre_exercices
    return [] if data_exercices.nil?
    data_exercices['ordre'] || []
  end
  
  # =>  Actualise la date de dernière modification de la roadmap
  def set_last_update
    @datajs = get_datajs
    @datajs ||= default_datajs
    @datajs['updated_at'] = Time.now.to_i
    File.open(path_data, 'wb'){|f| f.write( @datajs.to_json) }
  end
  # Données de data.js par défaut
  # @note: le mail et le password de l'utilisateur doivent se trouver dans
  # les paramètres.
  def default_datajs
    mail      = param(:mail)
    password  = param(:password)
    md5       = Digest::MD5.hexdigest("#{mail}-#{password}")
    {
      :created_at => Time.now.to_i,
      :updated_at => Time.now.to_i,
      :nom        => @nom,
      :mail       => mail,
      :md5        => md5,
      :password   => password,
      :salt       => nil, # inusité
      :ip         => Params::User.ip
    }
  end
  
  # -------------------------------------------------------------------
  #   Propre aux exercices
  # -------------------------------------------------------------------
  
  # -------------------------------------------------------------------
  # Pour les rapports et tout ce qui concerne les données de durée de
  # jeu
  # -------------------------------------------------------------------
  
  # Start seance
  # 
  def start_seance
    current_seance.run
  end
  
  # Return current seance (so the session of today)
  # 
  def current_seance
    @current_seance ||= Seance.new self
  end
  
  # Return the +x+ last working seances of the roadmap, if they exist.
  # 
  # * RETURN
  # 
  #   A sorted Array of Hash with seance data
  #   First is the oldest
  # 
  # * PARAMS
  #   :rm::     Instance Roadmap of the roadmap
  #   :x::      Number max of seances
  # 
  # * NOTE
  #   
  #   On pourrait boucler sur tous les fichiers jusqu'à trouver les x plus récents,
  #   mais lorsque le musicien en sera à 2 ans de travail et 600 fichiers, ça sera un peu
  #   lourd. Donc on fonctionne autrement : en incrémentant une date qu'on fait remonter
  #   de aujourd'hui à la date de création de la roadmap ou du nombre de fichiers jusqu'à
  #   trouver notre bonheur.
  # 
  def get_last x = 50
    dlasts = Seance::lasts self, x
    dlasts[:sorted_days].collect{ |jour| dlasts[:seances][jour] }
  end
  
  # Définit et retourne l'instance FileDureeJeu qui gère le fichier "durees_jeux" de la
  # roadmam, où sont enregistrés toutes les données des jeux de l'exercice.
  # 
  def file_duree_jeu
    @file_duree_jeu ||= FileDureeJeu.new self
  end
  
  # -------------------------------------------------------------------
  #   Créations
  # -------------------------------------------------------------------
  def build_folders
    build_folder
    build_folder_exercices
  end
  def build_folder
    Dir.mkdir( folder, 0777 ) unless File.exists?( folder )
  end
  def build_folder_exercices
    Dir.mkdir( folder_exercices, 0777 ) unless File.exists?( folder_exercices )
  end
  
  # -------------------------------------------------------------------
  # Définition des paths
  # -------------------------------------------------------------------
  def affixe
    @affixe ||= "#{@nom}-#{@mail}"
  end
  def folder
    @folder ||= File.join(APP_FOLDER, 'user', 'roadmap', affixe )
  end
  def path_data
    @path_data ||= File.join( folder, 'data.js' )
  end
  def path_config_generale
    @path_config_generale ||= File.join(folder, 'config_generale.js')
  end
  # --- EXERCICES ---
  # Return path to folder seance(s)
  # 
  def folder_seances
    @folder_seances ||= File.join( folder, 'seance' )
  end
  # Dossier contenant les exercices, les images, les fichiers midi/son if any
  def folder_exercices
    @folder_exercices ||= File.join( folder, 'exercice' )
  end
  # Path contenant l'identifiant du dernier exercice enregistré
  def path_last_id_exercice
    @path_last_id_exercice ||= File.join(folder, 'LAST_ID_EXERCICE')
  end
  # Path contenant les données générales des exercices (liste des exercices
  # en cours, etc.)
  def path_exercices
    @path_exercices ||= File.join(folder, 'exercices.js')
  end
  # Path d'un exercice en particulier
  def path_exercice id
    File.join( folder_exercices, "#{id}.js")
  end
  # --- JOURNAL DE BORD ---
  # Path du journal de bord (historique)
  def path_log
    @path_log ||= File.join(folder, 'log.txt')
  end
end