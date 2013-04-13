# Procédure pour détruire une feuille de route

require 'fileutils'
require 'digest/md5'
require_model 'roadmap'
require_model 'user'

def ajax_roadmap_destroy
  rm    = Roadmap.new param(:roadmap_nom), param(:roadmap_mdp)
  dauth = { :mail => param(:mail), :password => param(:password), :md5 => param(:md5) }
  res = roadmap_destroy rm, dauth
  RETOUR_AJAX[:error] = res unless res.nil?
end

# Procède à la destruction de la feuille de route
# 
# @param  rm    Instance Roadmap de la feuille de route
# @param  auth  Paramètres d'authentification
#               contient :
#                 :mail   => adresse IP de l'utilisateur courant
#                 :passw  => MD5 du mail-password de l'utilisateur
# 
def roadmap_destroy rm, auth
  
  # # -- débug --
  # puts "rm est bien de class Roadmap" if rm.class == Roadmap
  # puts "rm existe" if rm.exists?
  # puts "l'user est bien le possesseur" if rm.owner? auth
  # puts "auth: #{auth.inspect}"
  # puts_error "L'USER N'EST PAS LE POSSESSEUR" unless rm.owner? auth
  # # -- / débug --
  
  return "Il faut fournir un RM à roadmap_destroy" if rm.class != Roadmap
  return "Il faut les paramètres d'authentification pour roadmap_destroy" if auth.nil?
  begin
    raise "unknown"     unless rm.exists?
    raise "bad_owner"   unless rm.owner_or_admin? auth
    return roadmap_can_be_removed rm # => nil si succès, ou message d'erreur
  rescue Exception => e
    return "ERRORS.Roadmap.#{e.message}"
  end
end

# Procède vraiment à la destruction de la feuille de route
# @return NIL en cas de succès ou le message d'erreur
def roadmap_can_be_removed rm
  raise "# ERREUR FATALE : Une feuille de route doit être founie" if rm.class != Roadmap
  begin
    FileUtils.rm_rf rm.folder
    return nil
  rescue Exception => e
    raise "# ERREUR FATALE DANS roadmap_can_be_removed"+
            "\n# MESSAGE : #{e.message}"+
            "\n# ROADMAP : #{rm.inspect}"
    return e.message
  end
end