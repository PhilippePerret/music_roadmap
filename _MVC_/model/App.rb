=begin

Class App
---------
Pour l'application comme application

=end
class App
  class << self
    
    # Permet d'exécuter une requête sudo
    # 
    # NOTES
    # -----
    #   @ En offline seulement
    # 
    # @param  code  Le code shell à exécuter
    def sudo code

      # La méthode peut être appelée par un script utilitaire (en offline) donc
      # il faut faire ce check (dans un script utilitaire, Params n'est pas 
      # souvent défini)
      raise if (defined?(Params) && Params.online?) || ENV['TM_MATE'] == nil
      
      # raise "Interdit" if Params.online?
      pwd_file = File.join('data', 'secret', 'home_password')
      raise "Fichier password (home_password) introuvable dans ./data/secret/" unless File.exists? pwd_file
      pwd = File.read(pwd_file)
      `echo #{pwd} | sudo -S #{code}`
    end
    
    # Charge les données du fichier +path+
    # 
    # Cette méthode a été inaugurée suite aux problèmes JSON de US-ASCII
    # Adoption de Marshal pour l'enregistrement de tous les fichiers de
    # données (App::save_data pour les enregistrer)
    # Les deux méthodes doivent permettre de changer rapidement le fonctionnement
    # de l'enregistrement et de la lecture des données
    def load_data path
      Marshal.load(File.read path)
    end
    
    # Enregistre les données +data+ dans le fichier +path+
    # 
    # cf. `load_data' ci-dessus pour les explications
    def save_data path, data
      File.open(path, 'wb'){|f| f.write Marshal.dump(data)}
    end
    
    # Dans init.rb, check si les dossiers indispensables existent bien
    # 
    def check_required_folder
      folder_tmp
      folder_user
      folder_user_data
      folder_user_roadmap
    end
    
    # Dossier './user/' principal
    # 
    def folder_user
      @folder_user ||= begin
        d = File.join('.', 'user')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    
    # Dossier './user/roadmap/'
    # 
    def folder_user_roadmap
      @folder_user_roadmap ||= begin
        d = File.join(folder_user, 'roadmap')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end

    # Dossier './user/data/' contenant les données des
    # utilisateur
    # 
    def folder_user_data
      @folder_user_data ||= begin
        d = File.join(folder_user, 'data')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    
    def folder_tmp
      @folder_tmp ||= begin
        d = File.join(".", "tmp")
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    def folder_log
      @folder_log ||= begin
        d = File.join(folder_tmp, 'log')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    def folder_debug
      @folder_debug ||= begin
        d = File.join(folder_log, 'debug')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
  end
end