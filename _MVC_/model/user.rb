# Class Utilisateur

class User
  class << self
    
    def authentify_as_admin dauth
      require File.join(APP_FOLDER,'data','secret','data_phil') # => DATA_PHIL
      authentify_with_mail_and_password(dauth) || authentify_with_md5(dauth)
    end

    def authentify_with_mail_and_password dauth
      return false if dauth[:mail].nil? || dauth[:password].nil?
      dauth[:mail] == DATA_PHIL[:mail] && dauth[:password] == DATA_PHIL[:password]
    end

    def authentify_with_md5 dauth
      return false if dauth[:md5].to_s == ""
      dauth[:md5] == DATA_PHIL[:md5]
    end
  end  
  
  # -------------------------------------------------------------------
  #   L'instance
  # -------------------------------------------------------------------
  
  # Email Address of the user
  # 
  attr_reader :mail
  
  # Instanciation de l'utilisateur
  # @param  data    Si Hash, c'est un hash des données de l'utilisateur
  #                 Si String, ça doit être obligatoirement le mail
  # 
  def initialize data_init = nil
    data_init = {:mail => data_init} if data_init.class == String
    set data_init unless data_init.nil?
  end
  
  def set hdata
    hdata.each{ |k,v| instance_variable_set("@#{k}",v)}
  end
  def md5;          @md5          ||= data['md5']         end
  def nom;          @nom          ||= data['nom']         end
  def ip;           @ip           ||= data['ip']          end
  def password;     @password     ||= data['password']    end
  def instrument;   @instrument   ||= data['instrument']  end
  def description;  @description  ||= data['description'] end
  def salt;         @salt         ||= data['salt']        end
  def created_at;   @created_at   ||= data['created_at']  end
  def updated_at;   @updated_at   ||= data['updated_at']  end
  # Retourne la liste des roadmaps de l'utilisateur
  # 
  # @FIXME: Comme le paramètres 'roadmaps' n'était pas prévu au départ, la
  # méthode comprend aussi une relève des roadmaps dans la liste des roadmaps
  # Cette procédure est à supprimer lorsqu'un tour sera fait
  # @FIXME: Mettre ça ensuite :
  # def roadmaps;     @roadmaps     ||= data['roadmaps']    end
  def roadmaps
    if @roadmaps.nil? || @roadmaps.empty? # => il faut relever la liste
      @roadmaps = Dir["#{FOLDER_ROADMAP}/**/data.js"].collect do |datajs|
        drm = JSON.parse(File.read(datajs))
        next nil if drm['mail'] != mail
        "#{drm['nom']}-#{drm['mdp']}"
      end.reject{|e| e.nil?}
      save
    end
    @roadmaps
  end
  
  # Ajoute une roadmap à l'utilisateur (et sauve ses nouvelles données)
  def add_roadmap nom, mdp
    # @FIXME: Ici, il faudra faire un check du nombre de roadmaps pour le
    # limiter
    @roadmaps << "#{nom}-#{mdp}"
    save
  end
  # => Return les data minimales (pour JS)
  def data_mini
    {:nom => nom, :md5 => md5, :mail => mail}
  end
  # Retourne les data enregistrées si elles existent
  def data
    return {} unless exists?
    @data ||= JSON.parse(File.read(path))
  end
  
  # Retourn les données sous forme de Hash
  # 
  # @note: Les prend dans l'instance, contrairement à `data` qui les prend
  # dans le fichier.
  def data_to_hash
    {
      :nom => nom, :md5 => md5, :mail => mail, :salt => salt, :ip => ip,
      :description => description, :instrument => instrument, 
      :created_at => created_at, :updated_at => updated_at,
      :roadmaps => roadmaps
    }
  end
  # Retourne les données sous forme de Hash JSON (pour enregistrement)
  # 
  # @param  with_update   Si TRUE (default), on actualise updated_at. True
  #                       par défaut puisque cette méthode est principalement
  #                       utilisée pour sauver les données de l'utilisateur
  # 
  def data_to_json with_update = true
    d = data_to_hash
    d.merge(:updated_at => Time.now.to_i) if with_update
    d.to_json
  end
  
  # Enregistre les nouvelles données de l'utilisateur
  def save
    File.open(path, 'wb'){ |f| f.write data_to_json }
  end
  
  def exists?
    File.exists? path
  end
  def valide_with? password
    password == data['password']
  end
  
  def path
    @path ||= File.join(APP_FOLDER, 'user', 'data', @mail)
  end
end