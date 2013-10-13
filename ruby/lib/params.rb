# 
# Class Params
# Class Params::User
# 
require 'cgi'
require 'rack' # pour Rack::Utils.parse_nested_query(string)
# require 'hash' # mine
# require 'array' # mine

class Params
  # -------------------------------------------------------------------
  #   Class
  # -------------------------------------------------------------------
  @@PARAMS      = nil
  @@is_offline  = nil
  @@is_online   = nil

  def self.offline?
    @@is_offline ||= get_env('SERVER_NAME') == 'localhost' # ou essayer avec HTTP_HOST
  end
  def self.online?
    @@is_online ||= !offline?
  end
  
  # Deux méthodes pour le débuggage (simulation de offline/online)
  def self.set_offline
    @@is_offline = true
    @@is_online  = false
  end
  def self.set_online
    @@is_offline = false
    @@is_online  = true
  end
  
  # => Définit les paramètres à la volée ou les lit dans l'URL
  def self.set_params hash = nil
    unless hash.nil?
      # Définition à la volée
      @@PARAMS ||= {}
      return unless hash.class == Hash
      @@PARAMS = @@PARAMS.merge hash
    else
      init_params # vraiment bien ???...
      # extract_valeurs_post
      extract_valeurs_get_from_url
    end
  end

  # => Retourne une valeur environnement
  def self.get_env cle
    ENV[cle]
  end
  
  # => Initialiser les paramètres
  def self.init_params
    @@PARAMS = {}
  end

  # => Renvoie tous les paramètres (@@PARAMS)
  def self.get_params
    @@PARAMS
  end
  
  # => Extrait les valeurs POST de CGI
  # def self.extract_valeurs_post
  #   $CGI ||= CGI.new 'html4'
  #   params = extract_route( $CGI.params.unarrays )
  #   add_val_post params
  #   add_val_get( :route => params[:route] ) if params.has_key? :route
  # end
  
  # => Extrait les valeurs GET de l'url
  def self.extract_valeurs_get_from_url
    # params = extract_route CGI::parse(CGI::unescape(ENV['QUERY_STRING']))
    # qstring = CGI::parse(CGI::unescape(ENV['QUERY_STRING']))
    # params = Rack::Utils.parse_nested_query( "#{qstring}" )
    return if ENV['QUERY_STRING'].nil?
    Rack::Utils.parse_nested_query( CGI::unescape(ENV['QUERY_STRING']) ).
    each do |cle, valeur|
      @@PARAMS = @@PARAMS.merge cle.to_sym => valeur
    end
    # ---
    # Pour débug (pour voir ce qui est récupéré dans les paramètres)
    # File.open('@@PARAMS.txt', 'wb'){ |f| f.write @@PARAMS.inspect }
    # ---
  end
  
  # => Récupère la route dans les paramètres
  # (@note: la méthode ne fait que chercher la clé :r — utilisée dans
  #  l'URL — et la remplace par :route)
  def self.extract_route params
    return params unless params.has_key? :r
    params = params.merge( :route => params.delete(:r) )
    params
  end

  # => Ajoute un param GET
  def self.add_val_get key, val = nil
    @@PARAMS ||= {}
    if key.class == Hash
      @@PARAMS = @@PARAMS.merge key
    else
      @@PARAMS = @@PARAMS.merge( key.to_sym => val )
    end
  end
  # => Ajoute un param POST
  def self.add_val_post key, val = nil
    if key.class == Hash
      @@PARAMS = @@PARAMS.merge key
    else
      @@PARAMS = @@PARAMS.merge( key => val )
    end
  end
  # => Renvoie une valeur GET
  def self.value_get key
    return nil if @@PARAMS.nil?
    @@PARAMS[key.to_sym]
  end
  # => Renvoie une valeur POST
  def self.value_post key
    return nil if @@PARAMS.nil?
    @@PARAMS[key.to_sym]
  end

end

# -------------------------------------------------------------------
#   Sous-classe Params::User
#   ------------------------
#   
#   Pour obtenir les informations de l'utilisateur
# 
# -------------------------------------------------------------------
class Params
  class User
    
    # => Retourne l'adresse IP de l'utilisateur
    def self.ip
      ENV['REMOTE_ADDR']
    end
    # Retourne les informations sur l'utilisateur
    # @param  options    Les options pour le retour
    #                     Mettre :as à :text pour un retour texte (inspect)
    #                     Mettre :as à :table pour un retour table HTML
    def self.get_infos options = nil
      options ||= {}
      @@infos = {
        :REMOTE_ADDR            => ENV['REMOTE_ADDR'],
        :SERVER_ADDR            => ENV['SERVER_ADDR'],
        :HTTP_CLIENT_IP         => ENV['HTTP_CLIENT_IP'],
        :HTTP_X_FORWARDED_FOR   => ENV['HTTP_X_FORWARDED_FOR']
      }
      return @@infos unless options.has_key?(:as)
      case options[:as]
        when :text  then @@infos.inspect
        when :table then infos_as_table
        else @@infos.inspect # Toujours si le format n'est pas reconnu
      end
    end
    
    def self.infos_as_table
      t = '<table>'
      @@infos.each do |k,v|
        t += '<tr><td>' + k.to_s + '</td><td>' + v.to_s + '</td></tr>'
      end
      t += '</table>'
      t
    end
    
  end
end

# -------------------------------------------------------------------
# Fonctions généralistes
# -----------------------

# Raccourci
def online?; Params.online? end
def offline?; Params.offline? end

# => Renvoie ou définit une variable ou un hash de variable GET
def param keyorhash, value = nil
  if value.nil? && keyorhash.class != Hash
    Params::value_get keyorhash
  else
    Params.add_val_get keyorhash, value
  end
end
# => Renvoie ou définit une variable ou un hash de variable POST
def post keyorhash, value = nil
  if value.nil? && keyorhash.class != Hash
    Params::value_post keyorhash
  else
    Params::add_val_post keyorhash, value
  end
end  