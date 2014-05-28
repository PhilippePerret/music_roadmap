# 
# Config file for Sorry
# 
# @see https://github.com/PhilippePerret/sorry

require 'rubygems'
require 'cgi'
# require 'rack'  # pour Rack::Utils.parse_nested_query(string)

Sorry.configure do |config|
  
  Rapport = Object.new

  RETOUR_AJAX = {:error => nil} unless defined?(RETOUR_AJAX)


  # class Test::Unit::TestCase
  #   include RR::Adapters::TestUnit
  # end
  
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
    rm_nom  = "Roadmap.nom".js
    umail   = "User.mail".js
    Roadmap.new rm_nom, umail
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
      rm.exercice(id).data.each do |k, v|
        dex = dex.merge "exercice_#{k}".to_sym => v
      end
      dex = dex.merge :id => id
      dex # => on retourne le hash
    end
  end
  
  # Retourne des data user valides et uniques (notamment pour l'inscription, donc elles
  # sont complètes)
  # 
  def get_data_user_valides
    now = Time.now.to_i
    mail = "unmail#{now}@chez.lui"
    pasw = "motdepasse#{now}"
    {
      :nom => "Mon nom #{now}", :mail => mail, :mail_confirmation => mail,
      :password   => pasw, :password_confirmation => pasw,
      :instrument => "le tuba", :description => "Utilisateur inscrit à #{now}."
    }
  end
  
  # Return les data de Benoit
  def get_data_benoit
    require File.join(APP_FOLDER, 'data', 'secret', 'data_benoit.rb')
    return DATA_BENOIT
  end
  
  # Return a Hash for a date "AAAA-MM-JJ"
  def data_date date
    require 'date'
    odate = Date.parse(date)
    hprov = Date._parse( date )
    moisc = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'aout', 'sept', 'oct', 'nov', 'déc'][hprov[:mon]-1]
    moish = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][hprov[:mon]-1]
    jourh = hprov[:mday] == 1 ? '1er' : hprov[:mday] 
    {
      :jour_i         => hprov[:mday], 
      :mois_i         => hprov[:mon], 
      :annee_i        => hprov[:year],
      :jour           => odate.strftime("%d"), 
      :mois           => odate.strftime("%m"), 
      :annee          => odate.strftime("%Y"),
      :jj_mm_yyyy     => odate.strftime("%d %m %Y"),
      :humaine        => "#{jourh} #{moish} #{hprov[:year]}",
      :humaine_courte => "#{jourh} #{moisc} #{hprov[:year]}",
      :from_today     => (Date.today - odate).numerator
    }
  end
  
  def user_identified?
    "User.is_identified()".js
  end
  
  
end
