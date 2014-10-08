# 
# Class Params
# Class Params::User
# 
require 'cgi'

class Params
  # -------------------------------------------------------------------
  #   Class
  # -------------------------------------------------------------------
  class << self
    @params
    @params      = nil
    @is_offline  = nil
    @is_online   = nil

    def offline?
      @is_offline ||= get_env('SERVER_NAME') == 'localhost' # ou essayer avec HTTP_HOST
    end
    def online?
      @is_online ||= !offline?
    end
    def development?
      @mode_development ||= ENV['REQUEST_URI'].start_with?('/development/')
    end
    # Deux méthodes pour le débuggage (simulation de offline/online)
    def set_offline
      @is_offline = true
      @is_online  = false
    end
    def set_online
      @is_offline = false
      @is_online  = true
    end
  
    # => Définit les paramètres à la volée ou les lit dans l'URL
    def set_params hash = nil
      unless hash.nil?
        # Définition à la volée
        @params ||= {}
        return unless hash.class == Hash
        @params = @params.merge hash
      else
        init_params
        extract_params_from_url
      end
    end
  

    # => Retourne une valeur environnement
    def get_env cle
      ENV[cle]
    end
  
    # => Initialiser les paramètres
    def init_params
      @params = {}
    end

    # => Renvoie tous les paramètres
    def get_params
      @params
    end
    
    # => Extrait les valeurs GET de l'url
    def extract_params_from_url
      # extract_params
      # return if ENV['QUERY_STRING'].nil?
      # qstring = CGI::parse(CGI::unescape(ENV['QUERY_STRING']))
      # dbg qstring.inspect
      # # Rack::Utils.parse_nested_query( CGI::unescape(ENV['QUERY_STRING']) ).
      # qstring.each do |cle, valeur|
      #   valeur = valeur[0] if valeur.count == 1
      #   @params = @params.merge cle.to_sym => valeur
      # end
    end
    def extract_params key, as_array = false
      $cgi = CGI::new('html4')
      @params ||= {}
      skey  = key.to_s
      return nil if $cgi.nil? # quand tests
      value = if $cgi.has_key? skey
                if as_array
                  $cgi[skey]
                else
                  real_value_of $cgi[skey].to_s
                end
              else
                param_as_hash skey, as_array
              end
      @params[key] = value
    end
 
    def param_as_hash key, as_array
      key = key.to_s
      h = nil
      $cgi.params.each do |cle, value|
        found = cle.match(/^#{key}\[(.*)\]$/)
        next if found.nil?
        value = value[0] if value.count == 1 && !as_array
        value = real_value_of value
        h ||= {}
        if found[1].index('][').nil?
        
          h = h.merge found[1].to_sym => value
        else
          hstr = "h"
          found[1].split('][').each do |souscle|
            hstr = "#{hstr}[:#{souscle}]"
            eval("#{hstr} = {}") if true == eval("#{hstr}.nil?")
          end
          eval("#{hstr} = #{value.inspect}")
        end
      end
      h
    end
  
    def real_value_of value
      case value
        when "true"         then true
        when "false"        then false
        when "nil", "null"  then nil
        else value
      end
    end
  
    # => Récupère la route dans les paramètres
    # (@note: la méthode ne fait que chercher la clé :r — utilisée dans
    #  l'URL — et la remplace par :route)
    def extract_route params
      return params unless params.has_key? :r
      params = params.merge( :route => params.delete(:r) )
      params
    end

    # => Renvoie une valeur GET
    def value_get key
      return nil if @params.nil?
      @params[key.to_sym]
    end
    def value_set hashorkey, value = nil
      unless hashorkey.class = Hash
        hashorkey = { hashorkey => value }
      end
      @params ||= {}
      hashorkey.each do |key, value|
        @params = @params.merge key => value
      end
    end
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

# => Renvoie ou définit une variable URI
def param keyorhash, value = nil
  if value.nil? && keyorhash.class != Hash
    Params::extract_params keyorhash
    # Params::value_get keyorhash
  else
    Params.value_set keyorhash, value
  end
end