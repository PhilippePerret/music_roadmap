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
