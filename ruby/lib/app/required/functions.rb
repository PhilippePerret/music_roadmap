=begin
  
  Fonctions propres à l'application, chargées par défaut

=end
DEBUG_ON = false unless defined? DEBUG_ON

$nombre_try = 0
$fichier_debug = nil

# Pour enregistrer des messages de débug
#   Si débug normal, mettre DEBUG_ON à true dans ./index.rb
#   Si débug de requêtes Ajax, mettre DEBUG_ON à true dans ./ajax.rb
def dbg message
  return unless DEBUG_ON
  if $fichier_debug.nil?
    $fichier_debug = File.join(App::folder_debug, "dbg.txt")
    File.unlink $fichier_debug if File.exists? $fichier_debug
  end
  begin
    now = Time.now.strftime("%d %m %Y - %H:%M:%S")
    File.open($fichier_debug, 'a'){ |f| f.write "#{now} -- #{message}\n" }
    $nombre_try = 0
  rescue Exception => e
    raise "Impossible de débugger… (#{e.message})" if $nombre_try > 2
    $nombre_try += 1
    $fichier_debug = nil
    dbg message
  end
end
alias :debug :dbg

# Charge le modèle voulu
def load_model models
  models = [models] unless models.class == Array
  models.each { |model| require File.join(FOLDER_MODELS, model) }
end
alias :require_model :load_model