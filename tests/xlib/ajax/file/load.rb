=begin

  Récupère le contenu d'un fichier
  
  :path       Le path du fichier
  
  @return le contenu dans :file_content
          
=end
require 'json'

path = param(:path)
options = param(:options)

if File.exists?(path)
  RETOUR_AJAX[:file_content] = File.read(path)
else
  RETOUR_AJAX[:ok]      = false
  RETOUR_AJAX[:message] = "File unfound (#{path})"
end

