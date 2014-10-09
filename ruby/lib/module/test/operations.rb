# Opération utilisables pour le paramètre 'op' de l'url
require 'fileutils'
require 'json'

class Tests
  class << self
    
    # Détruit tous les utilisateurs et toutes les roadmaps
    # Si +strict+ est true, on ne recrée pas les dossiers (utilisé par les gels)
    def erase_all strict = false
      [folder_users, folder_roadmaps].each do |dossier|
        FileUtils::rm_rf dossier if File.exists? dossier
        Dir.mkdir(dossier, 0777) unless strict
      end
      log "- Dossier user/data et user/roadmap détruits."
      if File.exists? User::path_names_file
        File.unlink User::path_names_file 
        log "- Fichier des noms détruit"
      end
      return true
    end
    
    # => Retourne les données du fichier +path+
    # Son extension détermine comment il sera lu. Si l'extension est inconnu, on
    # retourne le contenu du fichier.
    # Le type (extension) peut être forcé à l'aide de +type+ (nécessaire par exemple
    # pour les fichiers de data des users dont le nom complet est le mail)
    def data_of path, type = nil
      raise "Fichier introuvable" unless File.exists? path
      type = File.extname(path)[1..-1] if type.nil? || type == "nil"
      case type
      when 'msh'      then App::load_data path
      when 'js'       then JSON::parse(File.read path).to_sym
      when 'integer'  then (File.read path).to_i
      else
        File.read path
      end
    end
    
    # Procède au gel de l'état courant
    def gel nom_gel
      Gel::gel nom_gel
      return true
    end
    
    # Procède au dégel de +nom_gel+
    def degel nom_gel
      Gel::degel nom_gel
      return true
    end
    
    # => Return true si le dossier de path +path+ existe
    def folder_exists? path
      (File.exists? path) && (File.directory? path)
    end
    # => Return true si le fichier de path +path+ existe et n'est pas un dossier
    def file_exists? path
      (File.exists? path) && !(File.directory? path)
    end
    
  end
end