when /le mail est #{STRING}/ then
  # Place le mail dans @mail pour une utilisation ultérieure
  # --
  @mail = $1

when "le mail est celui de Benoit" then
  # Place le mail de Benoit dans @mail
  # --
  dbenoit = get_data_benoit
  @mail = dbenoit[:mail]

when /le password est #{STRING}/ then
  # Place le mot de passe dans @password pour une utilisation ultérieure
  # --
  @password = $1

when "le password est celui de Benoit" then
  # Met le mot de passe de Benoit dans @password
  # --
  dbenoit = get_data_benoit
  @password = dbenoit[:password]