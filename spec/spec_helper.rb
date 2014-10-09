# require 'webmock/rspec'
require 'capybara/rspec'
# require 'rspec-steps'
require 'rspec-html-matchers'
require 'cgi'
require 'net/http'

URL_MUSIC_ROADMAP = "http://www.music-roadmap.net"
URI_DEVELOPMENT = "#{URL_MUSIC_ROADMAP}/development"

Capybara.javascript_driver = :webkit
Capybara.default_driver = :selenium
Capybara.current_driver = :selenium
# Capybara.current_driver = :rack_test
Capybara.run_server = false
Capybara.app_host =  URI_DEVELOPMENT # Développement
Capybara.default_wait_time = 10

Dir["./spec/support/**/*.rb"].each {|f| require f}

APP_FOLDER = File.expand_path('.')
require File.join(APP_FOLDER, 'ruby', 'lib', 'module', 'init.rb')

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

  # Identification de Benoit en mode d'intégration
  # Note: Il faut peut-être procéder à un dégel avant.
  def identify_benoit
    visit('/')
    click_link('btn_want_signin')
    within('div#user_signin_form') do
      fill_in 'user_mail',      with: data_benoit[:mail]
      fill_in 'user_password',  with: data_benoit[:password]
      click_link('btn_signin')
    end
    expect(page).to have_content("Bienvenue")
  end
  def data_benoit
    @data_benoit ||= begin
      require './data/secret/data_benoit'
      DATA_BENOIT
    end
  end
  
  #---------------------------------------------------------------------
  #   Méthodes de tests utiles
  #---------------------------------------------------------------------
  # Cf. dans le dossier support/test_methods
  
  #---------------------------------------------------------------------
  #   Raccourcis des méthodes tests_utilitaires
  #---------------------------------------------------------------------
  # Cf. dans /support/test_methods/tests_utilitaires.rb
  

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

