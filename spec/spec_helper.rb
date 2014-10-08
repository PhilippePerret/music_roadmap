# require 'webmock/rspec'
require 'capybara/rspec'
# require 'rspec-steps'
# require 'rspec-html-matchers'

Capybara.javascript_driver = :webkit
Capybara.default_driver = :selenium
Capybara.current_driver = :selenium
# Capybara.current_driver = :rack_test
Capybara.run_server = false
Capybara.app_host = "http://www.music-roadmap.net/development" # Développement
Capybara.default_wait_time = 10

Dir["./spec/support/**/*.rb"].each {|f| require f}


class String
  # Pour les tests, il faut supprimer les balises dans les textes pour faire
  # des comparaisons
  def sans_balises
    self.gsub(/<([^>]*?)>/, '')
  end
end

RSpec.configure do |config|
  
  # Inclure les modules matchers

  
  config.before :all do |x|

  end
  
  config.before :each do |x|

  end
  
  config.after :all do

  end

  # À jouer tout au début des tests
  # -------------------------------
  config.before :suite do
    empty_screenshot_folder
  end
  
  # À jouer tout à la fin des tests
  # --------------------------------
  config.after :suite do

  end  
  
  #---------------------------------------------------------------------
  #   Tests
  #---------------------------------------------------------------------
  # Pour savoir où se trouve le fichier test, on peut ajouter dans le
  # premier describe : "<nom du test> (#{relative_path(__FILE__)})"
  def relative_path path
    name = File.basename(path)
    doss = File.basename(File.dirname(path))
    ddos = File.basename(File.dirname(File.dirname(path)))
    "#{ddos}/#{doss}/#{name}"
  end
  
  #---------------------------------------------------------------------
  #   Méthodes utilitaires propres à l'application testée
  #---------------------------------------------------------------------
  def data_benoit
    @data_benoit ||= begin
      require './data/secret/data_benoit'
      DATA_BENOIT
    end
  end
  
  
  # Procède à un gel de l'état courant
  def gel nom_gel
    visit("/tests_utilitaires.rb?op=gel&arg1=#{nom_gel}")
  end
  
  # Procède au dégel de +nom_gel+
  def degel nom_gel
    visit("/tests_utilitaires.rb?op=degel&arg1=#{nom_gel}")
  end

  # ---------------------------------------------------------------------
  #   Screenshots
  # ---------------------------------------------------------------------
  def shot name
    name = "#{Time.now.to_i}-#{name}"
    page.save_screenshot("./spec/screenshots/#{name}.png")
  end
  alias :screenshot :shot
  
  def empty_screenshot_folder
    p = './spec/screenshots'
    FileUtils::rm_rf p if File.exists? p
    Dir.mkdir p, 0777
    p
  end

end

