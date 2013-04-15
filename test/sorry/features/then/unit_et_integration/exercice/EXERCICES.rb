when /EXERCICES doit (bien )?connaitre (le nouvel |l')exercice(?: #{STRING})?/ then
  # Vérifie qu'un exercice soit bien contenu et défini dans EXERCICES (JS)
  # 
  # Si c'est la tournure "le nouvel exercice" qui est utilisé, sans STRING,
  # alors les données de l'exercice doivent se trouver impérativement dans
  # @data_exercice, avec une clé :id pour l'identifiant de l'exercice.
  # 
  # Sinon, si on utilise « doit connaitre l'exercice "<id>" », alors les data
  # sont prises dans le fichier de l'exercice.
  # 
  # Si la tournure "bien connaitre" est utilisée, on fait une vérification
  # profonde, c'est-à-dire en confrontant les valeurs. Sinon, on vérifie
  # seulement que EXERCICES['<id>'] soit défini.
  # --
  deep      = $1 != nil
  lenouvel  = $2
  idex      = $3
  dex = get_data_exercice idex
  id = dex[:id]
  
  # Début du test
  "EXERCICES['#{idex}']" should be defined
  if deep
    ex = "EXERCICES['#{id}']".js
    ex['class']       should be "Exercice"
    ex['titre']       should be dex[:exercice_titre]
    ex['auteur']      should be dex[:exercice_auteur]
    ex['recueil']     should be dex[:exercice_recueil]
    ex['tempo']       should be dex[:exercice_tempo]
    ex['tempo_min']   should be dex[:exercice_tempo_min]
    ex['tempo_max']   should be dex[:exercice_tempo_max]
    ex['obligatory']  should be dex[:exercice_obligatory]
    ex['with_next']   should be dex[:exercice_with_next]
    ex['types']       should be (dex[:types] || dex[:exercice_types])
  end
  
# clauses end
end