=begin

  Model Roadmap
  --------------
  Malgré son nom singulier, c'est la classe d'une feuille d'exercice 
  principale
  
=end

require 'json'
require 'digest/md5'
require_model 'user'

class Roadmap
  
  # Return le nom de la roadmap
  # 
  attr_reader :nom
  
  # Return le mdp (mot de passe) de la roadmap
  # 
  # @note: il faudrait que ça devienne une procédure obsolète maintenant
  # que l'utilisateur est nécessairement identifié. Mais ça changera énormément
  # de choses, puisque ce mdp est intensivement utilisé. Peut-être le rendre
  # simplement transparent en définissant sa valeur au mail de l'utilisateur,
  # ce qui permettra d'avoir des RM avec le même nom (nom) pour deux users 
  # sans problème.
  # 
  attr_reader :mdp
  
  @nom      = nil
  @mdp      = nil
  @datajs   = nil  # Données du fichier data.js
  
  # Instanciation
  # 
  # @param  data    SOIT Hash contenant :nom et :mdp
  #                 SOIT String définissant :nom
  # @param  mdp     SOIT nil si data est un Hash
  #                 SOIT String définissant :mdp si :nom est string
  def initialize data, mdp = nil
    data = {:nom => data, :mdp => mdp} unless data.class == Hash
    set data
    check_nom_et_mdp
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
  def check_nom_et_mdp
    @nom = nil if @nom == ""
    @mdp = nil if @mdp == ""
    raise "ERRORS.Roadmap.initialization_failed" if @nom.nil? || @mdp.nil?
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

  # Retourne les data de l'exercice d'identifiant +idex+
  def exercice idex
    JSON.parse(File.read(path_exercice(idex)))
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
      :mpd        => @mdp,
      :mail       => mail,
      :md5        => md5,
      :password   => password,
      :salt       => nil, # inusité
      :ip         => Params::User.ip
    }
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
    @affixe ||= "#{@nom}-#{@mdp}"
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
  # Dossier contenant les exercices, les images, les fichiers midi/son if any
  def folder_exercices
    @folder_exercices ||= File.join( folder, 'exercice' )
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
  # Path de l'image PNG de l'exercice
  def path_image_png id
    File.join( folder_exercices, "#{id}.png")
  end
  def path_image_jpg id
    File.join( folder_exercices, "#{id}.jpg")
  end
  # --- JOURNAL DE BORD ---
  # Path du journal de bord (historique)
  def path_log
    @path_log ||= File.join(folder, 'log.txt')
  end
end