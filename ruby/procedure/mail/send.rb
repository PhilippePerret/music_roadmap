=begin
  Procédure d'envoi de mail
  
  REQUIS (dans les paramètres transmis par ajax)
  
    param(:from)        Expéditeur (phil par défaut)
    param(:to)          Destinataire
    param(:subject)     Le sujet du message
    param(:message)     Le message ou le path relatif
    param(:data)        Les data pour le template, if any
    
  @TODO: faire une procédure 'app_mail_send' (une fonction ici) pour être
  conforme à l'usage du site
  
=end
require_model 'mail'

# Procédure appelée par ajax (JS Mail.send)
def ajax_mail_send
  begin
    mail_send(
      :from     => param(:from),
      :to       => param(:to),
      :subject  => param(:subject),
      :message  => param(:message),
      :data     => param(:data)
    )
  rescue Exception => e
    errmes = e.message
    errmes += '<br>' + e.backtrace.join('<br>') if Params::offline?
    RETOUR_AJAX[:error] = errmes
  end
end

# Envoie un mail
# 
# @param  data    Hash contenant au minimum les données :
#                 Cf. le model 'Mail' pour le détail
# 
def mail_send data
  Mail.new(data).send
end
