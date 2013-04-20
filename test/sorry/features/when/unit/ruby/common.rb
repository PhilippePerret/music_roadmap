when /j'appelle la méthode #{VARIABLE} du modèle #{VARIABLE}/ then
  # Appel d'une méthode d'un modèle
  # 
  # First VARIABLE is the method name (sans string)
  # Second VARIABLE is the model name (sans string)
  # 
  # @example:     Quand j'appelle la méthode show du modèle Rapport
  # --
  method = $1
  model  = $2
  
  case model
  when 'User'
    raise "Les tests du modèle User ne sont pas encore implémentés"
  when 'Rapport'
    case method
    when 'show' 
      stub(Rapport).show do |date|
        hdate = data_date date
        <<-EOT                                                          # <--
        RAPPORT DU #{hdate[:humaine]}                                   # /--

        #{hdate[:from_today]} jours se sont écoulés depuis cette date.  # <--
        EOT
      end
    end
  end
  
# Fin fichier
end