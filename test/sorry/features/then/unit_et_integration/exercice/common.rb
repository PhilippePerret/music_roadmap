when "l'exercice doit être créé" then
  # Vérifie qu'un exercice a bien été créé
  # 
  # Les data doivent impérativement se trouver dans le Hash @data_exercice
  # Toutes les valeurs sont checkées ici en prenant le tout dernier exercice
  # créé. Certaines valeurs sont obligatoirement dans @data_exercice, d'autres
  # sont optionnelles. Si elles ne sont pas définies, on prend leur valeur
  # par défaut, définies ici.
  # 
  # @note: L'identifiant (relevé dans le fichier) est ajouté à @data_exercice
  # pour un contrôle ultérieur (par exemple voir si l'exercice a été affiché)
  # --
  raise "@data_exercice doit être défini pour pouvoir vérifier l'exercice" if !defined?(@data_exercice) || @data_exercice.nil?
  
  # L'exercice est peut-être encore en train d'être crée donc j'attends jusqu'à
  # la fin de la création
  Browser wait_while{ "Exercices.saving".js }
  
  # On va supposer que c'est le dernier exercice créé, et on connait la 
  # roadmap courante par javascript. Mais que se passera-t-il si ce n'est
  # pas le dernier exercice créé ? C'est simple = il ne matchera pas et une
  # erreur sera levée.
  rm = get_current_roadmap
  path_last_exercice = nil
  last_date = 0
  
  # On récupère le tout dernier exercice
  Dir["#{rm.folder_exercices}/*.js"].each do |pathex|
    mtime_file = File.stat(pathex).mtime.to_i
    if mtime_file > last_date
      path_last_exercice = "#{pathex}"
      last_date = 0 + mtime_file
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
    ['obligatory',  :exercice_obligatory,   nil       ],
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
  
  # On ajoute l'identifant
  @data_exercice = @data_exercice.merge :id => dfile['id']
  
  
when /l'exercice (?:#{STRING} )?doit avoir été ajouté à la roadmap/ then
  # On teste qu'un (nouvel) exercice a bien été ajouté à la roadmap courante.
  # 
  # Si STRING est défini, c'est l'identifiant de l'exercice entre guillemets.
  # Sinon, on prend l'exercice défini dans @data_exercice, qui doit impérativement
  # être défini.
  # --
  id  = $1
  rm  = get_current_roadmap
  dex = get_data_exercice id
  id  = dex[:id] || dex[:exercice_id] if id.nil?
  
  # Dans javascript
  # puts "Roadmap.Data.EXERCICES.ordre:" + "Roadmap.Data.EXERCICES.ordre".js.inspect
  "Roadmap.Data.EXERCICES.ordre".js should contain id
  
  # Dans les fichiers
  dfile = JSON.parse(File.read(rm.path_exercices))
  dfile['ordre'].should contain id
  
  
when /je détruis (le nouvel |l')exercice(?: #{STRING})?/ then
  # Feature "Then" à ajouter à la fin de la création d'un nouvel exercice.
  # J'ai dû la créer car apparemment After all ... n'est pas encore opérationnel
  # 
  # Si STRING est fourni, c'est l'identifiant de l'exercice entre guillemets
  # Sinon, l'identifiant est pris dans @data_exercice qui doit exister
  # ---
  id  = $1
  rm  = get_current_roadmap
  dex = get_data_exercice id
  id  = id || dex[:id] || dex[:exercice_id]
  pex = rm.path_exercice(id)
  File pex should exist
  "Exercices.delete('#{id}',destroy=true)".js
  Browser wait_while{ "Exercices.deleting".js }
  File pex should not exist
# fin du fichier
end