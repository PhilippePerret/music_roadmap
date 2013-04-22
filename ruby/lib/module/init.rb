require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required', 'constants.rb')
Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
# require "_MVC_/model/html"

# Always Required Models
require_model 'html'
require_model 'roadmap'
require_model 'user'

# Connection Analyzing
require 'params'
Params.set_params

# Update Database Exercice?
# 
# @note: Cela n'arrive que de façon "forcée", lorsqu'on veut initialiser les données Database
# Exercices en supprimant le fichier `javascript/locale/fr/db_exercices/piano.js`
# 
# @TODO: Plus tard, il faudra une procédure qui checke les dates pendant un sleep time
# 
unless File.exists? File.join(APP_FOLDER, 'javascript', 'locale', 'db_exercices', 'fr', 'piano.js')
  require File.join(FOLDER_LIB_RUBY, 'module', 'data_base_exercices.rb')
  DataBaseExercices::update_each_instrument
end