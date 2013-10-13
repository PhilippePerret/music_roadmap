#!/usr/bin/ruby
# encoding: UTF-8

DEBUG_ON  = false
AJAX      = true

=begin

  Module Ajax.rb
  
  Ce module est appelé par la brique Ajax.js pour gérer l'utilisation d'Ajax
  sur le site.
  
  On doit appeler ce module avec :
  Ajax.query({
    data: {
      proc: "<le nom de la procédure, sans 'ajax_' devant",
      <param 1> : "<valeur du paramètre <param 1>"
      etc. pour chaque paramètre.
    }
  });
  
  Le dossier 'ruby/ajax' doit contenir le module de nom : "<proc>"
  Il doit contenir une fonction de nom "ajax_<proc>"
  Cette fonction récupère les paramètres par : param(<param 1>) etc.
  @note: le module ajax peut faire appel à une procédure générale de même nom
  se trouvant dans le dossier 'ruby/procedure'. Dans ce cas, dans le module
  ajax, ajouter :
    require "procedure/<le nom de la procédure générale>"
  ... et dans la fonction "ajax_<proc>" faire un appel à la fonction de cette
  procédure générale (qui doit porter le même nom, par défaut) avec les
  paramètres requis.
  
  Gestion des erreurs
  -------------------
  Un simple `raise "<message>"` ajoutera le message d'erreur dans le flash.
  La propriété RETOUR_AJAX[:error] contient quant à elle l'intégralité de
  l'erreur, le message et le backtrace. La méthode JS qui reçoit le retour
  peut gérer ce retour.
  @noter qu'aucune erreur n'est produite au niveau Ajax, c'est toujours la
  méthode `success` qui est appelée.
  
=end

require 'rubygems'
require 'json'
require 'cgi'
# require 'active_support'
# require 'mail'

# L'objet retourné à JS
  RETOUR_AJAX = {
    :ok           => true,    # True si tout s'est bien passé
    :body         => nil,
    :error        => nil,     # Les erreurs éventuellement rencontrées
    :debug        => nil,     
    :real_op      => nil,
    :params       => nil,
    :cookies      => nil,
    :dom          => {}       # Objet contenant les éléments du DOM à remplacer
                              # Mettre en clé l'id (<id>) et en contenu le
                              # contenu à mettre dans l'élément d'id <id>
                              # Note: c'est dans cet objet qu'il faut mettre le
                              # code HTML pour le flash ([:dom][:flash])
  }


# Ajoute une erreur au retour ajax
# 
# @param  err_message     Le message d'erreur à afficher
# @param  err_backtrace   Le backtrace de l'erreur
# 
# @produit  La définition de la clé :error du retour ajax
#           + le message flash à afficher
# 
def error_ajax err_message, err_backtrace = nil
  RETOUR_AJAX[:error] ||= "" 
  RETOUR_AJAX[:dom][:flash] ||= ""
  erreur    = err_message
  backtrace = unless err_backtrace.nil? 
                "\n" + err_backtrace.join("\n")
              else "" end
  RETOUR_AJAX[:error] = erreur
  RETOUR_AJAX[:dom][:flash] << 
    '<div class="flash warning">' + 
    err_message + '<pre>' + backtrace + '</pre>' +
    # err_message + # en mode production
    '</div>'
end

begin


  APP_FOLDER = File.expand_path('.')
  require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'init.rb')
  
  # dbg "-> Script ajax.rb"
  
  # raise "ICI 1"
  
  # Pour l'analyse des paramètres (et notamment la procédure à utiliser)
  require 'params'
=begin
  Pour faire des tests en feignant d'envoyer des données
=end
  POUR_TESTER = false
  if POUR_TESTER
    # ========== DÉBUT DU CODE DE TEST =============
    # @note: ce Hash est envoyé à Params, comme s'il était envoyé par la requête
    data_test = {
      :proc       => 'seance/build',
      :rm_nom     => 'exercices',
      :user_mail  => '', # À DÉFINIR
      :user_md5   => '', # À DÉFINIR
    
      :params_seance  => {
        :working_time   => 3*60,
        :options        => {
          :aleatoire    => "true",
          :obligatory   => "true",
          :same_ex      => "false",
          :next_config  => "false",
          :new_tone     => "false"
        },
        :difficulties => ""
      }
    }
    Params::set_offline
    Params::set_params data_test
    # ========== FIN DE CODE DE TEST =============
  else
    # Mode normal (hors test ci-dessus)
    Params::set_params
  end
  
  
  # Librairie pour les procédures ajax.
  # Contient notamment `get_document' qui retourne l'instance Document du
  # document défini par les paramètres :roadmap_nom et :user_mail
  # require 'app/ajax'
  
  # On invoque la procédure demandée
  # @rappel : les paramètres dont la procédure ajax a besoin doivent être
  # récupérés par param(<nom paramètres>)
  # @Note: :proc peut être un path, pour obtenir le nom de la méthode, il faut
  # donc prendre seulement le nom de fin.
  procedure_ajax = param(:proc)
  nom_procedure  = procedure_ajax.gsub(/\//, '_')
  
  # On a pratiquement toujours besoin du model Roadmap
  load_model 'roadmap'
  
  # Les procédures peuvent se trouver dispatchées dans le dossier ajax et le
  # dossier `procedure' ou les deux peuvent être dans le dossier procédure.
  path_ajax = File.join(APP_FOLDER, 'ruby', 'ajax', "#{param(:proc)}.rb")
  if File.exists?(path_ajax)
    require "ajax/#{param(:proc)}"
  else
    require "procedure/#{param(:proc)}"
  end
  send "ajax_#{nom_procedure}"
  
rescue Exception => e
  # RETOUR_AJAX[:error] = e.message
  # error_ajax e.message, e.backtrace.inspect
  error_ajax e.message, e.backtrace
end

puts "Content-type: application/json"
puts ''
puts RETOUR_AJAX.to_json
