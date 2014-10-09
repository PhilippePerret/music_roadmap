# Liste de toutes les méthodes de tests

* [Sur Users](#on_user)
* [Sur fichiers](#on_files)

<a name='on_user'></a>
##Sur les utilisateurs

    user_data <mail>
      # Return Hash des data de l'utilisateur (dans son fichier principal)
      
    roadmaps_of <mail user>
      # Retourne un Array des noms des roadmaps de l'utilisateur

<a name='on_files'></a>
##Sur fichiers

    folder_should_exist <path>
    folder_should_not_exist <path>
      # => Provoque une erreur
    
    file_should_exist <path>
    file_should_not_exist <path>
      # => Provoque une erreur
      # @note : vraiment un FICHIER, pas un dossier
    
    data_of <path>[, <extension>]
      # => Retourne les données du fichier de path <path>, en général sous forme
      #    de Hash, sauf lorsque l'extension est inconnu ou qu'il s'agit d'un fichier
      #    de texte.
    
    folder_exists? <path>
      # => return true si le dossier existe
    file_exists? <path>
      # => return true si le fichier (PAS DOSSIER) existe
      