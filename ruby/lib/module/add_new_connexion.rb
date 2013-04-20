# ---
# Lorsque cette page est chargée (une fois par utilisation normalement)
# Un mail m'est envoyé avec les informations de connexion de l'utilisateur
# ---
begin
  if online? # && Params::User::ip != '88.172.26.128'
    require 'procedure/mail/send'
    mail_send(
      :subject => "Connexion à Music Roadmap",
      :message => "Nouveau chargement de Music Roadmap.\n\nInformations utilisateur :\n" +
                  Params::User::get_infos(:as => :table)
    )
  end
rescue Exception => e
  bt = e.message + ( e.backtrace.join("\n") )
  File.open('error_mail.txt', 'w'){|f| f.write bt }
end  
