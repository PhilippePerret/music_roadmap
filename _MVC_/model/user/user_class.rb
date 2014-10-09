class User
  class << self
    
    def authentify_as_admin dauth
      require File.join(APP_FOLDER,'data','secret','data_phil_bis') # => DATA_PHIL
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

    # => Return true si le nom +nom+ est déjà utilisé par un
    # roadmapeur. Utilisé à l'inscription.
    def nom_exists? nom
      name_list.has_key? nom
    end
    
    # Ajoute un nom à la liste des noms (après création de l'utilisateur)
    def add_nom user
      @name_list = name_list.merge user.nom => user.mail
      App::save_data path_names_file, @name_list
    end
    
    def name_list
      @name_list ||= begin
        make_names_file unless File.exists? path_names_file
        App::load_data path_names_file
      end
    end
    
    def make_names_file
      File.unlink path_names_file if File.exists? path_names_file
      name_list = {}
      Dir["#{App::folder_user_data}/*.*"].each do |path|
        duser = App::load_data path
        name_list = name_list.merge duser[:nom] => duser[:mail]
      end
      App::save_data path_names_file, name_list
    end
    
    def path_names_file
      @path_names_file ||= File.join(App::folder_user, 'name_list.msh')
    end
    
  end # << self User
end