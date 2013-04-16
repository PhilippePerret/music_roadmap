require_model 'user'

def ajax_user_check
  begin
    hdata = param(:user)
    raise "Un Hash de données est requis" if hdata.class != Hash
    res = user_check hdata.to_sym
    # puts "res: #{res.inspect}"
    raise res[1] if res[0] == false
  rescue Exception => e
    RETOUR_AJAX[:error]     = e.message
    RETOUR_AJAX[:user]      = nil
    RETOUR_AJAX[:roadmaps]  = []
  else
    RETOUR_AJAX[:user]      = res[1]
    RETOUR_AJAX[:babar]     = "Est parmi nous"
    RETOUR_AJAX[:roadmaps]  = res[2]
  end
end

def user_check hdata
  begin
    raise "ERRORS.User.mail_required" unless hdata.has_key?(:mail)
    raise "ERRORS.User.mail_required" if hdata[:mail].to_s == ""
    raise "ERRORS.User.password_required" unless hdata.has_key?(:password)
    raise "ERRORS.User.password_required" if hdata[:password].to_s == ""
    user = User.new hdata
    raise "ERRORS.User.unknown" unless user.exists?
    raise "ERRORS.User.unknown" unless user.valide_with?(hdata[:password])
    # On peut charger l'utilisateur
    require 'procedure/user/load'
    [true, user_load(hdata[:mail], hdata[:password]), user.roadmaps]
  rescue Exception => e
    [false, e.message]
  end
end

