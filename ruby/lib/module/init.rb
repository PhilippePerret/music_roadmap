require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required', 'constants.rb')
Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
require "_MVC_/model/html"
require 'params'
Params.set_params

# A-t-on besoin d'updater la base de données exercices ?
# @note: le contrôle se fait sur le fichier javascript/fr/db_exercices.js qui doit
# exister. Si ce n'est pas le cas, on appelle la procédure d'update
unless File.exists? File.join(APP_FOLDER, 'javascript', 'locale', 'fr', 'db_exercices.js')
  require File.join(FOLDER_LIB_RUBY, 'module', 'data_base_exercices.rb')
  DataBaseExercices::update
end