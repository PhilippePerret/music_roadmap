when "les données d'inscription sont valides" then
  # Met dans @data_user des données d'inscription valides
  # --
  @data_user = get_data_user_valides
  
when /les données d'inscription n'ont pas de (.+)$/ then
  # Définir les données d'inscription avec une données manquante
  # 
  # --
  @data_user = get_data_user_valides unless defined?(@data_user)
  vider = $1.to_sym
  @data_user.merge!( vider => "" )

when /les données d'inscription ont une? mauvaise? (.+)$/ then
  # Met une mauvaise donnée dans les données de l'utilisateur @data_user qui doivent
  # servir plus tard
  # 
  # --
  to_badify  = $1.strip
  @data_user = get_data_user_valides
  case to_badify
  when 'mail' then @data_user.merge! :mail => "averybadmail"
  when 'confirmation de mail' then @data_user.merge! :mail_confirmation => "bouhhh"
  when 'password' then @data_user.merge! :password => "avec des chars impossible !"
  when /confirmation de password/ then @data_user.merge! :password_confirmation => "houps"
  else
    raise "Impossible de trouver to_badify #{to_badify.inspect}:#{to_badify.class}..."
  end

when "les données d'inscription existent déjà" then
  # Met dans @data_user les données d'un utilisateur déjà inscrit
  # 
  # --
  folder = File.join(APP_FOLDER, 'user', 'data')
  path   = Dir["#{folder}/*"].first
  # Je récupère un Hash avec les données qui servent à l'inscription, car les données
  # relevées sont plus nombreuses que celles à faire rentrer dans le formulaire
  datatmp = JSON.parse(File.read(path))
  @data_user = {}
  get_data_user_valides.each do |k,val|
    @data_user = @data_user.merge( k => datatmp[k.to_s] )
  end
  @data_user = @data_user.merge(:mail_confirmation => datatmp['mail'])
  @data_user = @data_user.merge(:password => "unmotdepassevalide")
  @data_user = @data_user.merge(:password_confirmation => "unmotdepassevalide")
  
# Fin du fichier
end