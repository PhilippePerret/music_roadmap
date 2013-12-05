=begin
  
  Fonctions propres à l'application, chargées par défaut

=end
DEBUG_ON = false unless defined? DEBUG_ON

$nombre_try = 0
$fichier_debug = nil
# Pour enregistrer des messages de débug
def dbg message
  return unless DEBUG_ON
  if $fichier_debug.nil?
    $fichier_debug = File.join(App::folder_debug, "#{Time.now.to_i}.txt")
  end
  begin
    now = Time.now.strftime("%d %m %Y - %H:%m:%S")
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