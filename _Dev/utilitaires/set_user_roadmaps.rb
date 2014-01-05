=begin

Permet de redéfinir la valeur des roadmaps d'un utilisateur
Utile pour l'implémentation.

=end
require './_MVC_/model/App'

# === NOUVELLE VALEUR ===
roadmaps = ["Hanon", "Morceaux"]

USER = "phil@atelier-icare.net"

path_user_data = File.join('user', 'data', USER)
user_data = App::load_data path_user_data
puts "Anciennes données :"
puts "#{user_data.inspect}"
exit(0) # pour ne voir que les données
user_data[:roadmaps] = roadmaps
App::sudo "chmod 0777 '#{path_user_data}'"
App::save_data path_user_data, user_data
App::sudo "chmod 0755 '#{path_user_data}'"

puts "\nNouvelles données :"
puts (App::load_data path_user_data).inspect