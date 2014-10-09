=begin
  Procédures de création d'un nouvel utilisateur
=end
require 'digest/md5'
require 'json'
require_model 'mail'

def ajax_user_create
  begin
    duser = param(:user)
    raise 'ERROR.User.Signup.need_data' if duser.class != Hash
    duser = duser.to_sym
    ok, md5 = user_create( duser, param(:lang) )
    raise md5 if ok == false
    RETOUR_AJAX[:user]  = duser.merge(:md5 => md5)
  rescue Exception => e
    RETOUR_AJAX[:user]  = nil
    RETOUR_AJAX[:error] = e.message
  end
end

# Création d'un nouvel utilisateur
# ---------------------------------
# @param  duser   Hash des data de l'utilisateur
# 
# @note: ne peut créer l'utilisateur que s'il n'existe pas
def user_create duser, lang = 'en'
  begin
    # Données requises
    raise "ERROR.User.mail_required" unless duser.has_key?(:mail)
    raise "ERROR.User.password_required" unless duser.has_key?(:password)
    raise "ERROR.User.Signup.instrument_required" unless duser.has_key?(:instrument)
    raise "ERROR.User.Signup.nom_existe_deja" if User::nom_exists?(duser[:nom])
    
    # MD5 et check de la non-existence
    # @note: l'instance a aussi besoin de connaître @instrument pour calculer
    # le md5
    user  = User.new( :mail => duser[:mail], :instrument => duser[:instrument] ) # virtual user
    raise "ERROR.User.Signup.already_exists" if user.exists?
    pwd   = duser.delete(:password)
    md5   = user.to_md5 pwd
    # Création de l'utilisateur
    duser = duser.merge( 
      :ip         => Params::User.ip,
      :salt       => duser[:instrument],
      :md5        => md5,
      :roadmaps   => [],
      :created_at => Time.now.to_i,
      :updated_at => Time.now.to_i
      )
    App::save_data user.path, duser
    User::add_nom user
    
    # On peut envoyer un mail à l'utilisateur et à l'administrateur
    Mail::lang( lang )
    Mail.new(
      :message  => 'user/signup.html',
      :subject  => (lang == 'en' ? "Signup" : "Inscription"),
      :to       => duser[:mail],
      :data     => {:pseudo => duser[:nom], :mail => duser[:mail], :password => pwd}
    ).send
    
    Mail.new(
      :message  => "Inscription de : #{user.mail}",
      :subject  => "Nouvelle inscription"
    ).send

    # raise "Juste pour chercher l'erreur"

    return [ true, md5 ]
  rescue Exception => e
    return [ false, e.message ]
  end
end