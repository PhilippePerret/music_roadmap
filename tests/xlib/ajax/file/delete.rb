=begin

  Détruir le contenu d'un fichier ou d'un dossier
  
  :path       Le path du fichier
            
=end
require 'fileutils'

if File.exists?(param :path)
  if File.directory?(param :path)
    FileUtils.rm_rf param(:path)
  else
    File.unlink(param :path) 
  end
end