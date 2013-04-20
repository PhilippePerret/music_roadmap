when "je remplis le formulaire exercice" then
  # Simule le remplissage du formulaire d'édition d'un exercice
  # 
  # REQUIS: @data_exercice doit avoir été défini avant, avec toutes les
  # valeurs requises. C'est un Hash contenant en clés les identifiants des
  # champs, et cette clause se débrouille avec le reste
  raise "@data_exercice must be defined!" if defined?(@data_exercice).nil? || @data_exercice.nil?
  # On ouvre le div des types pour le remplir
  Browser click :id => 'btn_toggle_types_exercices'
  # On place les données
  @data_exercice.each do |id, val|
    if id == :types
      val.each do |type|
        Browser set "exercice_type_#{type}".to_sym => true
      end
    else
      Browser set id => val
    end
  end
  # Un petit screenshot pour voir tout ça
  screenshot "filled-exercice-form"
  
# end of clauses
end