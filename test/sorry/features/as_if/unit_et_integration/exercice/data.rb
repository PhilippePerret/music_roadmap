when "les données du formulaire exercice sont valides" then
  # Définit @data_exercice avec des data valides pour un exercice
  # ---
  @data_exercice = {
    :exercice_recueil   => "Cahier I",
    :exercice_titre     => "Mon premier exercice le #{Time.now.to_i}",
    :exercice_auteur    => "Philomène",
    :exercice_tempo     => 100,
    :exercice_tempo_min => 80,
    :exercice_tempo_max => 131,
    :types              => ["AR", "PC"]
  }