=begin
  Méthodes tests pour l'utilisateur
=end

# Les data de l'utilisateur courant si on l'a identifié par identify_user ou
# récupéré par get_user_identified
# 
@data_user = nil
require File.join(APP_FOLDER, 'data', 'secret', 'data_phil.rb') # => DATA_PHIL

def reset_user
  JS.run "User.set({md5:null,nom:null,mail:null})"
end

# Identifier l'utilisateur en tant que Benoit
def identify_benoit;  identify_user 'benoit.ackerman@yahoo.fr' end
# Identifier en tant que Phil (administrateur)
def identify_phil;    identify_user DATA_PHIL[:mail] end

# Identifie un utilisateur
# 
# @param  mail    Si défini, on s'identifie comme cet utilisateur
#                 Sinon, on s'identifie comme PHil
def identify_user mail = nil
  mail = DATA_PHIL[:mail] if mail.nil?
  get_user mail
  md5   = @data_user[:md5]
  nom   = @data_user[:nom]
  JS.run "User.set({md5:'#{md5}',nom:'#{nom}',mail:'#{mail}'})"
end

# Retourne les data du user actuellement identifié
# Si on a utilisé identify_user pour identifier un utililisateur, la méthode
# retourne simplement l'utilisateur. En revanche, si on a forcé la définition
# du md5 autrement, il faut passer en revue les différents utilisateurs pour
# trouver celui qui convient.
def get_user_identified
  @data_user ||= begin
    md5_current = "User.md5".js
    duser       = nil
    raise "Impossible d'obtenir les data d'un user non identifié" if md5_current.nil?
    Dir["#{APP_FOLDER}/user/data/*"].each do |path|
      duser = JSON.parse(File.read(path))
      break if duser['md5'] == md5_current
    end
    duser
  end
end

# Retourne les data de l'utilisateur de mail +mail+
def get_user mail
  path = File.join(APP_FOLDER, 'user', 'data', mail)
  raise "Utilisateur introuvable" unless File.exists? path
  @data_user = JSON.parse(File.read(path)).to_sym
end