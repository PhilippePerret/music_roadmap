when /j'attends jusqu'à ce que #{STRING} soit #{STRING}/ then
  # Attend jusqu'à ce que l'expression JS (1er STRING) ait la valeur (2e STRING)
  # 
  # STRING:     Expression javascript (.js sera donc ajouté ici)
  # STRING:     Valeur entre guillemets, qui sera évaluée ici. Donc, si l'attente est une
  #             chaîne, il faut utiliser : "\"ma chaine\"". Pour TRUE, il faut écrire
  #             "true", pour un Fixnum : "12", etc.
  # --
  exp   = $1
  value = eval($2)
  Browser wait_until{ exp.js == value }