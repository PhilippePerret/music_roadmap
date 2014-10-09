#!/usr/bin/ruby
# encoding: UTF-8
=begin

Cf. le fichier tests_utilitaires.md pour le détail

=end
require 'rubygems'
require 'json'

AJAX      = false
DEBUG_ON  = true

def output code_or_hash
  if param(:type) == 'html'
    code_or_hash = code_or_hash.collect do |k,v|
      "<div>#{k} => #{v.inspect}</div>"
    end.join('') if code_or_hash.class == Hash
    output_html code_or_hash
  else
    code_or_hash = {:code => code_or_hash} unless code_or_hash.class == Hash
    output_json code_or_hash
  end
end
def output_json data
  STDOUT.write "Content-type: application/json\n\n"
  STDOUT.write data.to_json
end
def output_html code
  STDOUT.write "Content-type: text/html; charset:utf-8;\n\n"
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
    #{code}
  </body>
  </html>
  HTML
end
begin
  require 'rubygems'
  require 'cgi'
  APP_FOLDER = File.expand_path('.')
  require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'init.rb')
  
  # Les fichiers utiles pour les tests
  if Params::development?
    Dir["#{APP_FOLDER}/ruby/lib/module/test/**/*.rb"].each{|m| require m}
    begin
      res_operation = Tests::run_operation
      output res_operation
    rescue Exception => e
      raise e
    end
  else
    raise "Fichier impossible à atteindre en mode production"
  end
  
rescue Exception => e
  str = "<div class='warning'>#{e.message}</div>"
  str << "<br><br>" + e.backtrace.join("<br>")
  output str
end