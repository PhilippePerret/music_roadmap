#!/usr/bin/ruby
# encoding: UTF-8

require 'rubygems'
require 'cgi'
require 'rack' # pour Rack::Utils.parse_nested_query(string)

AJAX = false

begin
  # raise "Est-ce que ça marche ?"
  APP_FOLDER = File.expand_path('.')
  require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'init.rb')
  Html.out
  require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'add_new_connexion.rb')
  
rescue Exception => e
  STDOUT.write "Content-type: text/html\n"
  STDOUT.write "\n"
  STDOUT.write e.message
  STDOUT.write "<br>" + e.backtrace.join("<br>")
end