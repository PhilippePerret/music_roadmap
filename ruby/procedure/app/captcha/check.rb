=begin

  Test du captcha envoyé

  param doit contenir :
  
    :captcha_reponse  La réponse donnée
    :captcha_time     Le temps (qui est l'affixe du fichier js)
    :captcha_action   L'action pour laquelle le captcha est checké
                      Par exemple, si la valeur est "mail", le programme, en
                      cas de succès, doit retourner un lien mailto.
                    
=end

def ajax_app_captcha_check
  begin
    reponse = param(:captcha_reponse).to_s
    raise "Aucune réponse donnée…"  if reponse == ""
    time    = param(:captcha_time).to_s
    raise "Aucun temps donné…"      if time == ""
    action  = param(:captcha_action).to_s
    raise "Aucune action donnée…"   if action == ""

    @path_data_captcha = File.join(APP_FOLDER, 'tmp', 'captcha', "#{time}.js")
    raise "Vous tentez une intrusion, c'est pas bien…" unless File.exists? @path_data_captcha
    
    # Données enregistrées
    data = JSON.parse(File.read(@path_data_captcha))
    
    RETOUR_AJAX[:captcha_success] = reponse == data['reponse'].to_s
    RETOUR_AJAX[:captcha_failed]  = !RETOUR_AJAX[:captcha_success] && data['nombre_tentatives'] >= 3

    if RETOUR_AJAX[:captcha_success]
      on_success
    elsif RETOUR_AJAX[:captcha_failed]
      on_failed
    else
      data['nombre_tentatives'] += 1
      File.open(@path_data_captcha, 'wb'){|f| f.write data.to_json}
      
      RETOUR_AJAX[:captcha_message] = 
      if data['nombre_tentatives'] == 3
        "Attention, c'est votre dernière tentative…"
      else
        "Cette réponse est incorrect. Pouvez-vous ré-essayer ?"
      end
    end
  rescue Exception => e
    RETOUR_AJAX[:captcha_message] = e.message
  end
end

def detruire_fichier_data
  File.unlink( @path_data_captcha )
end
def on_failed
  RETOUR_AJAX[:captcha_message] = "Désolé, mais je ne peux pas vous laisser continuer, vous avez dépassé le nombre maximum de tentatives."
  detruire_fichier_data
end
def on_success
  detruire_fichier_data
  RETOUR_AJAX[:captcha_message] = joue_action_on_captcha param(:captcha_action)
end

def joue_action_on_captcha action
  case action
  when 'mail' then return lien_pour_mail
  end
  "#Erreur : l'action #{action} n'est pas définie, dans procedure/app/captcha/check…"
end
def lien_pour_mail
  require File.join(APP_FOLDER, 'data', 'secret', 'data_mail.rb')
  "<div class=center><a href=\"mailto:#{MAIL_PHIL}\">ENVOYER UN MESSAGE À PHIL</a></div>"
end