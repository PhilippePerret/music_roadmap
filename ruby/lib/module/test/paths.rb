# Définition de paths utiles aux tests
class Tests
  class << self
    
    def folder_users
      @folder_users ||= App::folder_user_data
    end
    def folder_roadmaps
      @folder_roadmaps ||= FOLDER_ROADMAP
    end
  end
end