when /(le message|l'alerte)( d'erreur)? #{STRING} doit être affichée?/ then
  # Test de la présence d'un message à l'écran, dans le flash
  # 
  # Les tournures possibles sont :
  #     Then le message "<message/id locale>" doit être affiché
  #     Then l'alerte "<...>" doit être affichée
  #     Then le message d'erreur "<...>" doit être affiché
  # --
  mes_type  = $1
  derreur   = $2
  message   = $3
  key = (mes_type == "le message" && derreur.nil?) ? :notice : :warning
  Flash should contain key => message
  
when /(le message|l'alerte)( d'erreur)? #{STRING} ne doit pas être affichée?/ then
  # Test de la non présence d'un message dans le flash
  # 
  # --
  mes_type  = $1
  derreur   = $2
  message   = $3
  key = (mes_type == "le message" && derreur.nil?) ? :notice : :warning
  Flash should not contain key => message