=begin

  Une classe User pour simplifier les codes dans les tests.
  
  @note: Appelé "UserTest" pour ne pas interférer avec la class User du site.

=end

require 'json'

class UserTest
  
  # Son mail
  # 
  attr_reader :mail
  
  def initialize mail
    @mail = mail
  end
  
  # Lites des roadmaps de l'utilisateur courant
  # 
  # * PARAMS
  #   :opts::       Hash des options :
  #                 :as => :array / :hash (DEFAULT)
  # 
  # * RETURN
  #   - Soit le hash des roadmaps de l'utilisateur, avec en clé le "nomumail"
  #   - Soit le array de toutes les données.
  # 
  def roadmaps opts = nil
    opts ||= {}
    opts[:as] ||= :hash
    as_hash = opts[:as] == :hash
    retour = as_hash ? {} : []
    Dir["#{FOLDER_ROADMAP}/**/data.js"].each do |datajs|
      drm = JSON.parse(File.read(datajs))
      next unless drm['mail'] == mail
      if as_hash then 
        retour = retour.merge "#{drm['nom']}#{drm['mail']}" => drm
      else  
        retour << drm
      end
    end
    retour
  end
end