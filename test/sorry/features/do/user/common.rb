when /Détruire tous les utilisateurs créés après (.+)$/ then
  # Détruit tous les utilisateurs qui auraient été créés à partir
  # de la variable donnée en fin de sentence. Cette variable doit être une variable
  # globale ($...) qui sera évaluée ici.
  # 
  # @note: Pour le moment, la méthode ne passe pas par le site, donc il peut y avoir des
  # problèmes de permissions.
  # --
  apres = eval($1)
  raise "La date de début de destruction est trop lointaine (1 heure max)" if apres < (Time.now.to_i - 3600)
  folder = File.join(APP_FOLDER, 'user', 'data')
  Dir["#{folder}/*"].each do |path|
    print "-> Détruire #{path} ? " if Sorry::Core::Config::debugif(5)
    if File.stat(path).mtime.to_i < apres
      puts NON if Sorry::Core::Config::debugif(5)
      next 
    end
    puts OUI if Sorry::Core::Config::debugif(5)
    File.unlink path
  end
  
# Fin de clauses
end