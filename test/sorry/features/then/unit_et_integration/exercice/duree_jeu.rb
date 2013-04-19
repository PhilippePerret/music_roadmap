when /le temps de jeu de l'exercice #{STRING} (?:ne )?doit (pas )?être enregistré/ then
  # Vérifie que le temps de jeu de l'exercice STRING a bien été enregistré dans le
  # fichier durees_jeux OU qu'il ne l'a pas été.
  # 
  # STRING: Identifiant de l'exercice entre guillemets
  # 
  # * NOTES
  #   - On récupère les informations sur la roadmap dans Roadmap javascript, donc ce test
  #     ne peut être utilisé qu'avec la roadmap courante.
  # 
  # * OPTIONNEL
  #   Si @duree_jeu est définie, contient le temps approximatif de jeu de l'exercice.
  #   On peut donc vérifier plus précisément. Dans le cas contraire, la seule vérification
  #   qui est faite est sur la date de dernière modification du fichier (qui doit remonter
  #   à moins de dix secondes) et la présence d'une donnée du jour.
  # 
  # --
  require 'date'
  require_model 'roadmap'
  idex    = $1
  dontbe  = $2 == "pas "
  today   = Date.today.strftime("%y%m%d")
  rm      = Roadmap.new "Roadmap.nom".js, "Roadmap.mdp".js
  path_dureesjeux = rm.file_duree_jeu.path
  File path_dureesjeux should exist
  # Le fichier doit avoir été modifié dans les 10 secondes précédentes
  mtime = File.stat(path_dureesjeux).mtime.to_i
  now   = Time.now.to_i
  unless dontbe
    mtime should be greater than (now - 10)
  end
  # Le fichier doit contenir une ligne commençant par l'identifiant de l'exercice et 
  # contenant la date d'aujourd'hui. Si la durée de jeu est connue (@duree_jeu), on doit
  # la chercher aussi (avec une marge de 5 secs.), sinon on cherche juste de 1 à 5 chiffres
  searched = today
  if defined?(@duree_jeu) && @duree_jeu != nil
    searched += "(" + (0..5).collect{|i| (@duree_jeu + i).to_s }.join("|") + ")"
  else
    searched += "[0-9]{1,5}"
  end
  reg = Regexp.new("^#{idex}\t(.+)#{searched}$")
  if dontbe
    File path_dureesjeux should not contain reg
  else
    File path_dureesjeux should contain reg
  end
  
# end of when-clauses
end