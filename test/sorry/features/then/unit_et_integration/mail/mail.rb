when "je dois avoir reçu le mail de confirmation de l'inscription" then
  # Vérifie que le mail d'inscription a bien été reçu
  # 
  # @required: @data_user, les données de l'utilisateur
  # 
  # --
  raise "@data_user est requis pour ce test…" if !defined?(@data_user) || @data_user.nil?

  require File.join(APP_FOLDER, 'data', 'secret', 'data_benoit.rb') # => DATA_BENOIT
  
  require 'net/pop'
  @pop = Net::POP3.new DATA_BENOIT[:pop3]
  @pop.start DATA_BENOIT[:mail], DATA_BENOIT[:password]

  def check_mails
    # Des mails ont été trouvés. On cherche le bon
    # puts "*** #{@pop.mails.length} nouveaux messages trouvés."
    mail_found = false
    @pop.mails.each_with_index do |message, index|
      code = message.pop
      # Le code contient-il les bons éléments ?
      next if code.match(/(Welcome to MUSIC ROADMAP|Bienvenue sur FEUILLE DE ROUTE MUSICALE)/).nil?
      next if code.match(/#{@data_user[:mail]}/).nil?
      next if code.match(/#{@data_user[:password]}/).nil?
      mail_found = true
      break
    end
    raise if mail_found == false
  end
  nombre_essais = 0
  begin
    raise if @pop.mails.empty?
    check_mails # Raise si le mail de confirmation n'est pas trouvé
  rescue Exception => e
    if nombre_essais < 4
      nombre_essais += 1
      puts "-> Je patiente 5 secondes pour les mails de Benoit…".blue #if Sorry::Core::Config.debugif(5)
      sleep 5
      retry
    else
      raise "Impossible de trouver le mail de confirmation de l'inscription…"
    end
  end
  
  
  
# Fin fichier
end