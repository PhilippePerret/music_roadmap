=begin

  Test du captcha envoyé

  param doit contenir :
  
    :captcha_reponse  La réponse donnée
    :captcha_time     Le temps (qui est l'affixe du fichier js)

  * PRODUCTS
    RETOUR_AJAX[:captcha_success] à TRUE si le captcha est bon, FALSE otherwise
    RETOUR_AJAX[:captcha_error]   Identifiant du message d'erreur, if any
        Peut contenir :
          'too_much_tentatives'     Nombre de tentatives dépassé
          'bad_answer'              Mauvaise réponse donnée
          'no_reponse'              Aucun réponse donnée
          'no_time'                 Pas de temps donné (erreur système ou intrusion)
          'no_file'                 Fichier inexistant (erreur système ou intrusion)
    
    Return NIL si OK, ou l'identifiant d'erreur (pour utilisation en ruby)
    
=end

def ajax_app_captcha_check
  begin
    reponse = param(:captcha_reponse).to_s
    raise "no_reponse"  if reponse == ""
    time    = param(:captcha_time).to_s
    raise "no_time"     if time == ""

    @path_data_captcha = File.join(APP_FOLDER, 'tmp', 'captcha', "#{time}.js")
    raise "no_file" unless File.exists? @path_data_captcha
    
    # Données enregistrées
    data = JSON.parse(File.read(@path_data_captcha))
    
    # Évaluation
    RETOUR_AJAX[:captcha_success] = reponse == data['reponse'].to_s
    
    unless RETOUR_AJAX[:captcha_success]
      if data['nombre_tentatives'] >= 3
        # Trop de tentatives
        detruire_fichier_data
        raise 'too_much_tentatives'
      else
        # On inscrit une tentative supplémentaire
        data['nombre_tentatives'] += 1
        File.open(@path_data_captcha, 'wb'){|f| f.write data.to_json}
        raise 'bad_answer'
      end
    end
    
    detruire_fichier_data if RETOUR_AJAX[:captcha_success]
    return nil # usage en ruby
  rescue Exception => e
    RETOUR_AJAX[:captcha_error] = e.message
    return e.message # usage en ruby
  end
end

def detruire_fichier_data
  File.unlink( @path_data_captcha )
end