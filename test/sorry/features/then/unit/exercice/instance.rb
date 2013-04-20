when /le temps de départ de l'exercice #{STRING} doit être défini/ then
  # Vérifie que la propriété 
  # 
  # STRING contient l'identifiant de l'exercice entre guillemets
  # --
  "exercice('#{$1}').w_start".js should not be nil
  
when /le temps de fin de l'exercice #{STRING} doit être null/ then
  # Vérifie que le temps de fin de l'exercice ait été mis à null
  # 
  # STRING: identifiant de l'exercice entre guillemets
  # --
  "exercice('#{$1}').w_end".js should be nil

when /l'exercice #{STRING} doit être en train de jouer/ then
  # Vérifie que l'exercice soit "en jeu"
  # 
  # STRING : identifiant de l'exercice, entre guillemets
  # --
  "exercice('#{$1}').playing".js should be true