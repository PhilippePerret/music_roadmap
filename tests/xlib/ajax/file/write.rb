=begin

  Écrit le contenu d'un fichier
  
  :path       Le path du fichier
  :code       Le code à écrire
            
=end
code = (param :code).gsub(/\\(['"])/, "\\1")

File.unlink(param :path) if File.exists?(param :path)
File.open( (param :path), 'wb'){ |f| f.write code }
