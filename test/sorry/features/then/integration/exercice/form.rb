when "le formulaire exercice doit être affiché" then
  # Vérifie que le formulaire d'édition de l'exercice soit bien
  # affiché.
  # 
  # Il peut attendre un peu.
  # --
  Browser should display table :id => 'exercice_form', :class => 'form'

when "le formulaire exercice doit être vierge" then
  # Vérifie que tous les champs du formulaire soient bien à leur état
  # vide (pour la création d'un nouvel exercice, sinon il doit contenir les
  # valeurs actuelles de l'exercice)
  # --
  [:exercice_recueil, :exercice_titre, :exercice_auteur
  ].each do |domid|
    onav.input(:type => 'text', :id => domid.to_s).value should be ""
  end
  # Tous les checkbox des types d'exercices doivent être désactivés
  # @todo: il faudrait faire un autre passage avec un exercice édité
  # pour voir s'ils sont vraiment désactivés pour un nouvel exercice, 
  # car il ne me semble pas
  "Exercices.TYPES_EXERCICE".js.each do |id_type, nom_type|
    "$('input##{id_type}').is(':checked')".js should be false
  end
  # La valeur des menus tempos (bof... pas important)

end