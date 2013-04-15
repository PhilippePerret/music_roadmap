when /l'exercice (?:#{STRING} )?doit être (correctement )?affiché/ then
  # Vérifie l'affichage d'un exercice
  # 
  # Si STRING est défini, c'est l'identifiant de l'exercice, entre guillemets.
  # Ses données sont alors relevés dans le fichier exercice de la roadmap
  # courante.
  # Si non défini, les données doivent se trouver dans @data_exercice (qui
  # possède une clé :id avec l'identifiant)
  # 
  # Si la sentence contient "correctement", alors c'est un check en profondeur
  # qui est effectué (c'est-à-dire un check de la présence de TOUS les éléments,
  # et leur valeur). Dans le cas contraire, c'est un check superficiel où seuls
  # sont vérifiés la présence du LI de l'exercice, ses éléments principaux et
  # son titre (recueil, titre, auteur)
  # --
  id    = $1
  deep  = $2 != nil
  dex = get_data_exercice id
  id  = dex[:id] if id.nil?
  
  @retour_console = Sorry::Core::Config.documented?
  if deep && @retour_console
    puts "Vérification de tous les éléments de l'affichage d'un exercice"
  end

  ul_exercices = Browser get ul :id => 'exercices'
  
  def shouldcontain container, tag, data_tag, sujetstr
    print "#{sujetstr} ? " if @retour_console
    data_tag = data_tag.merge :tag => tag.to_s
    container should contain data_tag
    print "#{OUI}! -- " if @retour_console
  end
  
  # Le LI principal de l'exercice
  shouldcontain ul_exercices, :li, {:id => "li_ex-#{id}"}, "LI de l'exercice"
  liex = Browser get li :id => "li_ex-#{id}"
  
  # Boutons d'édition
  shouldcontain liex, :div, {:class => 'btns_edition'}, "boutons édition"
  btns_edit = liex.div(:class => 'btns_edition')
  if deep
    shouldcontain btns_edit, :a, {:class => 'btn_del'}, "bouton supprimer"
    shouldcontain btns_edit, :a, {:class => 'btn_edit'}, "bouton éditer"
    shouldcontain btns_edit, :a, {:class => 'btn_clic', :id => "btn_clic-#{id}"}, "bouton clic"
  end
  
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
  if deep
    shouldcontain liex, :a, {:class => 'ex_id'}, "lien [ID]"
    liex.a(:class => 'ex_id').text should be "[ID #{id}]"
  end
  
  # Tempi
  shouldcontain liex, :div, {:id => "tempi_ex-#{id}", :class => 'ex_tempo'}, "div tempi exercice"
  odiv = liex.div(:id => "tempi_ex-#{id}")
  shouldcontain odiv, :select, {:id => "tempo_ex-#{id}"}, "menu tempo"
  odiv.select(:id => "tempo_ex-#{id}").value should be dex[:exercice_tempo]
  if deep
    shouldcontain odiv, :span, {:id => "tempo_de_a_ex-#{id}"}, "tempo de… à…"
    de_a = "(de #{dex[:exercice_tempo_min]} à #{dex[:exercice_tempo_max]})"
    odiv.span(:id => "tempo_de_a_ex-#{id}").text should be de_a
  end
  
  # Suite harmonique
  if deep
    shouldcontain liex, :div, {:class => 'ex_suite petit'}, "div suite exercice"
    # @TODO: Il faudra vérifier plus en profondeur quand les pictos seront
    # créés pour les types de suite harmonique
    # Il faudra aussi vérifier qu'un lien aide conduise à l'aide 
    # Et peut-être aussi qu'un lien permette d'afficher la suite exacte.
  end
  
  # Note
  if deep && dex.has_key?(:exercice_note) && dex[:exercice_note].to_s != ""
    shouldcontain liex, :div, {:class => 'ex_note'}, "note exercice"
    liex.div(:class => 'ex_note').text should contain dex[:exercice_note]
  end
  
  # Image
  if deep && dex.has_key?(:image) && dex[:image] != nil
    shouldcontain liex, :img, {:id => "ex_image-#{id}", :class => 'ex_image'}, "image exercice"
  end
  
  # Pour que la spec sentence soit affichée à la ligne en mode documenté
  puts "" if @retour_console
  
# fin de clauses
end