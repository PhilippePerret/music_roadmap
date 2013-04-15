# 
# Config file for Sorry
# 
# @see https://github.com/PhilippePerret/sorry

require 'rubygems'
require 'cgi'
require 'rack' # pour Rack::Utils.parse_nested_query(string)

Sorry.configure do |config|
      
  RETOUR_AJAX = {:error => nil} unless defined?(RETOUR_AJAX)
      
  require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required', 'constants.rb')
  Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
  $: << APP_FOLDER
  require "_MVC_/model/html"
  require 'params'
  Params.set_params

  # Chargement des données secrètes administrateur
  # => DATA_PHIL
  require File.join(APP_FOLDER, 'data', 'secret', 'data_phil.rb')
  
  APP_FOLDER_URL_ONLINE     = "www.music-roadmap.net"
  APP_FOLDER_URL_OFFLINE    = "localhost/~philippeperret/cgi-bin/music_roadmap"
  
  config.url_online   = APP_FOLDER_URL_ONLINE
  config.url_offline  = APP_FOLDER_URL_OFFLINE
  
  # Require la procédure spécifiée
  # 
  # @param  :rel_path::     Chemin relatif à la procédure, depuis le dossier
  #                         `<app>/ruby/procedures`
  # 
  def require_procedure rel_path
    require File.join(APP_FOLDER, 'ruby', 'procedure', rel_path)
  end
  
  
  # Retourne la roadmap courante dans le navigateur
  # 
  def get_current_roadmap
    require_model 'roadmap'
    rm_nom = "Roadmap.nom".js
    rm_mdp = "Roadmap.mdp".js
    Roadmap.new rm_nom, rm_mdp
  end
  
  # Retourne les data_exercice SOIT de l'identifiant fourni en argument,
  # SOIT de la variable @data_exercice qui doit être définie (lève une errreur
  # dans le cas contraire).
  # 
  # @return:  Un hash où toutes les clés "naturelles" d'un exercice sont
  # préfixées par 'exercice' (p.e. : :exercice_titre). Toutes les clés sont
  # des Symbol
  # 
  def get_data_exercice id
    if id.nil?
      raise "@data_exercice doit être défini" if !defined?(@data_exercice) || @data_exercice.nil?
      raise "@data_exercice doit définir l'identifiant (key :id)" unless @data_exercice.has_key?(:id)
      @data_exercice
    else
      # Il faut relever les data de l'exercice dans le fichier
      rm = get_current_roadmap
      dex = {}
      rm.exercice(id).each do |k, v|
        dex = dex.merge "exercice_#{k}".to_sym => v
      end
      dex # => on retourne le hash
    end
  end
  
  def user_identified?
    "User.is_identified()".js
  end
  
  # def logout_user
  #   puts "JE PASSE DANS LOGOUT_USER DE LA CONFIGURATION"
  # end
  
  def locale messid
    return "Je viens pour te voir"
  end
  
end
