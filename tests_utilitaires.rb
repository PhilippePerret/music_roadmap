#!/usr/bin/ruby
# encoding: UTF-8
=begin

Ce script peut être appelé directement par l'adresse :

  http://www.music-roadmap.net/development/tests_utilitaires.rb

… pour permettre des traitements au cours des tests.

=end

AJAX      = false
DEBUG_ON  = true

STDOUT.write "Content-type: text/html; charset:utf-8;\n"
STDOUT.write "\n"
STDOUT.write <<-HTML
<!DOCTYPE html>
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8">
  <title>Utilitaires de tests</title>
  <link rel="stylesheet" href="/_MVC_/view/css/required/common/common.css" type="text/css" media="screen" title="no title" charset="utf-8">
</head>
<style type="text/css">
body {
  padding: 4em !important;
  font-size:16pt !important;
}
</style>
<body>
HTML
begin
  require 'rubygems'
  require 'cgi'
  APP_FOLDER = File.expand_path('.')
  require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'init.rb')
  
  # Les fichiers utiles pour les tests
  if Params::development?
    Dir["#{APP_FOLDER}/ruby/lib/module/test/**/*.rb"].each{|m| require m}
    begin
      Tests::run_operation
    rescue Exception => e
      raise e
    end
  else
    raise "Fichier impossible à atteindre en mode production"
  end
  
rescue Exception => e
  # STDOUT.write "Content-type: text/html; charset:utf-8;\n"
  # STDOUT.write "\n"
  STDOUT.write "<div class='warning'>#{e.message}</div>"
  STDOUT.write "<br><br>" + e.backtrace.join("<br>")
end
STDOUT.write '</body></html>'