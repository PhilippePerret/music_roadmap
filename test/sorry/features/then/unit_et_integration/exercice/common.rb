when "l'exercice doit être créé" then
  # Vérifie qu'un exercice a bien été créé
  # 
  # Les data doivent impérativement se trouver dans le Hash @data_exercice
  # Toutes les valeurs sont checkées ici en prenant le tout dernier exercice
  # créé. Certaines valeurs sont obligatoirement dans @data_exercice, d'autres
  # sont optionnelles. Si elles ne sont pas définies, on prend leur valeur
  # par défaut, définies ici.
  # --
  raise "@data_exercice doit être défini pour pouvoir vérifier l'exercice" if !defined?(@data_exercice) || @data_exercice.nil?

  require_model 'roadmap'
  
  # On va supposer que c'est le dernier exercice créé, et on connait la 
  # roadmap courante par javascript. Mais que se passera-t-il si ce n'est
  # pas le dernier exercice créé ? C'est simple = il ne matchera pas et une
  # erreur sera levée.
  rm_nom = "Roadmap.nom".js
  rm_mdp = "Roadmap.mdp".js
  rm = Roadmap.new rm_nom, rm_mdp
  path_last_exercice = nil
  last_date = 0
  
  # On récupère le tout dernier exercice
  Dir["#{rm.folder_exercices}/*.js"].each do |pathex|
    if File.stat(pathex).mtime.to_i > last_date
      path_last_exercice = "#{pathex}"
      last_date = File.stat(pathex).mtime.to_i
    end
  end
  dfile = JSON.parse(File.read(path_last_exercice))
  # puts "*** Data du dernier exercice :#{dfile.inspect}"
  
  # On compare les data
  de = @data_exercice # shorter
  {
    'titre'     => :exercice_titre,
    'recueil'   => :exercice_recueil,
    'auteur'    => :exercice_auteur,
    'tempo'     => :exercice_tempo, 
    'tempo_min' => :exercice_tempo_min, 
    'tempo_max' => :exercice_tempo_max
  }.each do |kfile, kdata|
    dfile[kfile] should be @data_exercice[kdata]
  end
  # Valeurs optionnellement définies (la troisième est la valeur par défaut)
  [
    ['types',       :types,                 []        ],
    ['obligatory',  :exercice_obligatory,   false     ],
    ['suite',       :exercice_suite,        "normale" ],
    ['abs_id',      :exercice_abs_id,       nil       ],
    ['with_next',   :exercice_with_next,    nil       ],
    ['up_tempo',    :exercice_up_tempo,     nil       ]
  ].each do |dd|
    kfile, kdata, defaut = dd
    expected = @data_exercice.has_key?(kdata) ? @data_exercice[kdata] : defaut
    dfile[kfile] should be expected
  end
  
  # Quelques valeurs supplémentaires
  dfile['created_at'] should not be nil
  dfile['updated_at'] should not be nil
  dfile['started_at'] should be nil
  dfile['ended_at']   should be nil
  
# fin du fichier
end