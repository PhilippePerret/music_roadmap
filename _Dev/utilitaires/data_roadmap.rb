=begin

Utilitaire pour lire les données d'une roadmap

=end
puts File.expand_path(".")

require './_MVC_/model/App'

path = "./user/roadmap/troisieme-phil@atelier-icare.net/exercices.msh"

puts (App::load_data path).inspect