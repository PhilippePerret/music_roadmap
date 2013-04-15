when /l'exercice (?:#{STRING} )?doit être affiché/ then
  # Vérifie l'affichage correct d'un exercice
  # 
  # Si STRING est défini, c'est l'identifiant de l'exercice, entre guillemets.
  # Ses données sont alors relevés dans le fichier exercice de la roadmap
  # courante.
  # Si non défini, les données doivent se trouver dans @data_exercice (qui
  # possède une clé :id avec l'identifiant)
  # --
  id = $1
  if id.nil?
    # Les data de l'exercice se trouve dans @data_exercice
    raise "@data_exercice doit être défini pour vérifier l'affichage de l'exercice" if !defined?(@data_exercice) || @data_exercice == nil
    id = @data_exercice[:id]
    dex = @data_exercice
  else
    # Il faut relever les data de l'exercice dans le fichier
    require_model 'roadmap'
    rm_nom = "Roadmap.nom".js
    rm_mdp = "Roadmap.mdp".js
    rm = Roadmap.new rm_nom, rm_mdp
    # Pour que les data correspondent à @data_exercice
    dex = {}
    rm.exercice(id).each do |k, v|
      dex = dex.merge "exercice_#{k}".to_sym => v
    end
  end
  
  @retour_console = Sorry::Core::Config.documented?
  
  ul_exercices = Browser get ul :id => 'exercices'
  ul_exercices should contain li :id => "li_ex-#{id}"
  liex = Browser get li :id => "li_ex-#{id}"
  
  def shouldcontain container, tag, data_tag, sujetstr
    print " - #{sujetstr} ? " if @retour_console
    data_tag = data_tag.merge :tag => tag.to_s
    container should contain data_tag
    # case tag
    # when :div then 
    #   container should contain div data_tag
    # when :a then
    #   container should contain a data_tag
    # when :img then
    #   container should contain img data_tag
    # when :span then 
    #   container should contain span data_tag
    # when :select then
    #   container should contain select data_tag
    # end
    print OUI if @retour_console
  end
  # Boutons d'édition
  shouldcontain liex, :div, {:class => 'btns_edition'}, "boutons édition"
  btns_edit = liex.div(:class => 'btns_edition')
  shouldcontain btns_edit, :a, {:class => 'btn_del'}, "bouton supprimer"
  shouldcontain btns_edit, :a, {:class => 'btn_edit'}, "bouton éditer"
  shouldcontain btns_edit, :a, {:class => 'btn_clic', :id => "btn_clic-#{id}"}, "bouton clic"
  
  # Titre de l'exercice
  shouldcontain liex, :div, {:id => "titre_ex-#{id}", :class => 'ex_titre'}, "div titre exercice"
  div_titre = liex.div(:id => "titre_ex-#{id}")
  shouldcontain div_titre, :span, {:class => 'ex_recueil'}, "recueil exercice"
  span = div_titre.span(:class => 'ex_recueil')
  span.text should be dex[:exercice_recueil]
  shouldcontain div_titre, :span, {:class => 'ex_titre'}, "titre exercice"
  span = div_titre.span(:class => 'ex_titre')
  span.text should be dex[:exercice_titre]
  shouldcontain div_titre, :span, {:class => 'ex_auteur'}, "auteur exercice"
  span = div_titre.span(:class => 'ex_auteur')
  span.text should contain dex[:exercice_auteur]
  
  # Un lien permettant d'obtenir le path de l'exercice
  shouldcontain liex, :a, {:class => 'ex_id'}, "lien [ID]"
  liex.a(:class => 'ex_id').text should be "[ID #{id}]"

  # Tempi
  shouldcontain liex, :div, {:id => "tempi_ex-#{id}", :class => 'ex_tempo'}, "div tempi exercice"
  odiv = liex.div(:id => "tempi_ex-#{id}")
  # shouldcontain odiv, :select, {:id => "tempo_ex-#{id}"}, "menu tempo"
  # odiv.select(:id => "tempo_ex-#{id}").value should be dex[:exercice_tempo]
  
  
  
  # Suite harmonique
  shouldcontain liex, :div, {:class => 'ex_suite petit'}, "div suite exercice"
  
  # Note
  if dex.has_key?(:note) && dex[:note].to_s != ""
    shouldcontain liex, :div, {:class => 'ex_note'}, "note exercice"
  end
  
  # Image
  if dex.has_key?(:image) && dex[:image] != nil
    shouldcontain liex, :img, {:id => "ex_image-#{id}", :class => 'ex_image'}, "image exercice"
  end
  
  
# fin de clauses
end