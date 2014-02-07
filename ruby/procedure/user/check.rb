require_model 'user'

def ajax_user_check
  begin
    hdata = param(:user)
    raise "Un Hash de données est requis" if hdata.class != Hash
    res = user_check hdata.to_sym
    raise res[1] if res[0] == false
  rescue Exception => e
    RETOUR_AJAX[:error]     = e.message
    RETOUR_AJAX[:user]      = nil
    RETOUR_AJAX[:roadmaps]  = []
  else
    RETOUR_AJAX[:user]      = res[1]
    RETOUR_AJAX[:remember]  = hdata['remember'].to_s == "true"
    RETOUR_AJAX[:roadmaps]  = res[2]
  end
end

def user_check hdata
  begin
    raise "ERROR.User.mail_required" unless hdata.has_key?(:mail)
    raise "ERROR.User.mail_required" if hdata[:mail].to_s == ""
    raise "ERROR.User.password_required" unless hdata.has_key?(:password)
    raise "ERROR.User.password_required" if hdata[:password].to_s == ""
    user = User.new hdata
    raise "ERROR.User.unknown" unless user.exists?
    raise "ERROR.User.unknown" unless user.valide_with?(hdata[:password])
    # On peut charger l'utilisateur
    require 'procedure/user/load'
    [true, user_load(hdata[:mail], hdata[:password]), user.roadmaps]
  rescue Exception => e
    [false, e.message]
  end
end

