class Tests
  class Gel
    class << self
      def log str, options = nil
        Tests::log str, options
      end
      
      # Gel l'état courant sous le nom +nom_gel+
      def gel nom_gel
        dossier_gel = folder_gel nom_gel
        erase nom_gel if File.exists? dossier_gel
        Dir.mkdir dossier_gel, 0777
        FileUtils::cp_r Tests::folder_users, dossier_gel
        FileUtils::cp_r Tests::folder_roadmaps, dossier_gel
        log "Gel de #{nom_gel} OK"
      end
      
      # Procède au dégel de +nom_gel+
      def degel nom_gel
        Tests::erase_all strict = true
        path = folder_gel nom_gel
        raise "Le gel #{path} est inconnu…" unless File.exists? path
        FileUtils::cp_r File.join(path, 'data') ,   App::folder_user
        FileUtils::cp_r File.join(path, 'roadmap'), App::folder_user
        log "Dégel de #{nom_gel} OK"
      end
      
      # Détruit le dossier de gel de nom +nom_gel+
      def erase nom_gel
        dossier_gel = path_gel nom_gel
        FileUtils::rm_rf dossier_gel if File.exists? dossier_gel
      end
      
      def path_gel nom_gel
        File.join(folder, nom_gel)
      end
      alias :folder_gel :path_gel
      
      def folder
        @folder ||= begin
          d = File.join(APP_FOLDER, 'gels')
          Dir.mkdir(d, 0777) unless File.exists? d
          d
        end
      end
    end # << self Gel
  end
end