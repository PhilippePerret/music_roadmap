when /la durée de jeu de l'exercice #{STRING} doit être définie/ then
  # Vérifie que la durée de jeu (w_duree) de l'exercice spécifié ne soit pas à null
  # 
  # STRING: Identifiant de l'exercice entre guillemets
  # --
  idex = $1
  dureew = "exercice('#{idex}').w_duree".js
  dureew should not be nil
  dureew should be an instance of Fixnum
  dureew should be greater than 0
  

# end of file
end