# Opération utilisables pour le paramètre 'op' de l'url
require 'fileutils'

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
    end
    
    # Procède au gel de l'état courant
    def gel nom_gel
      Gel::gel nom_gel
    end
    
    # Procède au dégel de +nom_gel+
    def degel nom_gel
      Gel::degel nom_gel
    end
  end
end