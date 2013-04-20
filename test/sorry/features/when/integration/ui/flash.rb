when /(le message|l'alerte)( d'erreur)? #{STRING} est affichée?/ then
  # Test de la présence d'un message à l'écran, dans le flash (ATTENTION: clause Quand/When)
  # 
  # Les tournures possibles sont :
  #     When le message "<message/id locale>" est affiché
  #     Quand l'alerte "<...>" est affichée
  #     When le message d'erreur "<...>" est affiché
  # --
  mes_type  = $1
  derreur   = $2
  message   = $3
  key = (mes_type == "le message" && derreur.nil?) ? :notice : :warning
  Flash should contain key => message
