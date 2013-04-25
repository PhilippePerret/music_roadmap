require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required', 'constants.rb')
# Classes extentions
Dir["#{APP_FOLDER}/ruby/lib/required/**/*.rb"].each { |m| require m }
# App required-s
Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
# require "_MVC_/model/html"

# Always Required Models
require_model 'html'
require_model 'roadmap'
require_model 'user'

# Connection Analyzing
require 'params'
Params.set_params

# Updates to do ?
if File.exists? File.join(APP_FOLDER, '_force_update.rb')
  require '_force_update.rb'
  # Update Database Exercice?
  if FORCE_UPDATE[:db_exercices]
    require File.join(FOLDER_LIB_RUBY, 'module', 'data_base_exercices.rb')
    DataBaseExercices::update_each_instrument
  end
end