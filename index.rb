#!/usr/bin/ruby
# encoding: UTF-8

require 'rubygems'
require 'cgi'
require 'rack' # pour Rack::Utils.parse_nested_query(string)

AJAX = false

begin
  APP_FOLDER = File.expand_path('.')
  require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required', 'constants.rb')
  Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
  require "_MVC_/model/html"
  require 'params'
  Params.set_params
  Html.out
  
  # ---
  # Lorsque cette page est chargée (une fois par utilisation normalement)
  # Un mail m'est envoyé avec les informations de connexion de l'utilisateur
  # ---
  begin
    if online? && Params::User::ip != '88.172.26.128'
      require 'procedure/app/mail/send'
      app_mail_send(
        :subject => "Connexion à Music Roadmap",
        :message => "Nouveau chargement de Music Roadmap.\n\nInformations utilisateur :\n" +
                    Params::User::get_infos(:as => :table)
      )
    end
  rescue Exception => e
    # Silencieux pour le moment
    bt = e.message + ( e.backtrace.join("\n") )
    raise bt
  end  
  
rescue Exception => e
  STDOUT.write "Content-type: text/html\n"
  STDOUT.write "\n"
  STDOUT.write e.message
end