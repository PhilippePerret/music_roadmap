when /je joue l'exercice #{STRING} pendant #{VARIABLE} secondes/ then
  # Simule le jeu de l'exercice pendant le nombre de secondes fournies en argument
  # 
  # * NOTES
  #   - En fait, on joue sur le temps de départ de l'exercice (`w_start`)
  #     pour simuler la durée de jeu de l'exercice.
  #   - La durée de jeu est placée dans la variable d'instance @duree_jeu, qui pourra être
  #     utilisée plus tard.
  # 
  # :STRING::     Identifiant de l'exercice, entre guillemets
  # :VARIABLE::   Nombre de secondes
  # --
  ex_id = $1
  @duree_jeu = $2.to_i
  new_start = Time.now.to_i - @duree_jeu
  "exercice('#{ex_id}').w_start = #{new_start}".js
  

# Fin de clauses
end