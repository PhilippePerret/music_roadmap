=begin
  Envoi de mail à Phil
=end

def ajax_app_mailto_phil
  # On vérifie le captcha
  require 'procedure/app/captcha/check'
  resultat = ajax_app_captcha_check
  if resultat.nil? # Si tout est OK, on peut envoyer le mail
    require 'procedure/mail/send'
    ajax_mail_send
  else
    RETOUR_AJAX[:error] = "ERROR.Captcha.#{resultat}"
  end
end