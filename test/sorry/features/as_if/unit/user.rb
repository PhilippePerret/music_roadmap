when /le mail est #{STRING}/ then
  # Place le mail dans @mail pour une utilisation ultérieure
  # --
  @mail = $1

when /le password est #{STRING}/ then
  # Place le mot de passe dans @password pour une utilisation ultérieure
  # --
  @password = $1