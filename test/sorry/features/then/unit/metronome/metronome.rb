when "l'image du métronome doit être en mouvement" then
  # Vérifie que l'image du métronome soit bien en mouvement
  # --
  # @note: cela consiste simplement à vérifier que l'image soit bien le
  # gif.
  # 
  met = Browser get img :id => 'metronome_anim'
  met should have src "img/metronome/metro.gif"
  
when "l'image du métronome doit être arrêtée" then
  # Vérifie que l'image du métronome soit bien en mouvement
  # --
  # @note: cela consiste simplement à vérifier que l'image soit bien le
  # gif.
  # 
  met = Browser get img :id => 'metronome_anim'
  met should have src "img/metronome/metro_fixe.png"

when /le métronome de l'exercice #{STRING} doit jouer/ then
  # Vérifie que le métronome soit bien en route pour l'exercie spécifié, avec le bon
  # tempo.
  # 
  # STRING: Identifiant de l'exercice entre guillemets
  # --
  idex = $1
  "exercice('#{idex}').playing".js should be true
  "Metronome.playing".js should be true
  "Metronome.tempo".js should be "exercice('#{idex}').tempo".js
  "Metronome.checker".js should not be nil
  
when /le métronome exercice ne doit (?:plus|pas) jouer/ then
  # Vérifie que le métronome soit bien arrêté.
  # 
  # --
  "Metronome.playing".js should be false
  "Metronome.checker".js should be nil