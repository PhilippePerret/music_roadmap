

require 'json'
require 'fileutils'

APP_FOLDER = File.expand_path("../../")
require File.join(APP_FOLDER, 'ruby', 'lib', 'app', 'required','constants.rb')
Dir["./support/**/*.rb"].each { |m| require m }
# Dir["#{APP_FOLDER}/ruby/lib/app/required/**/*.rb"].each { |m| require m }
require "params"


RSpec.configure do |config|
  
  config.before :suite do
    # On détruit les screenshots
    FileUtils.rm_rf folder_screenshot
    Dir.mkdir( folder_screenshot )
    
    # Éléments à détruire
    $roadmaps_to_destroy  = []  # des dossiers
    $files_to_destroy     = []  # des fichiers
    
    # On ouvre toujours l'accueil au début des tests
    # @note: plus tard, on pourra chercher un fonction comme sur narration
    nav.home

    # On lance le débug si nécessaire
    JS.run "if('object'==typeof(BT)){BT.reset(true)}" if DEBUG_ON
  end

  config.after :suite do
    
    # On détruit les roadmaps à détruire
    # @note: opérationnel pour les rm crées par JS ou par ruby
    require 'procedure/roadmap/destroy'
    $roadmaps_to_destroy.each do |path|
      next unless File.exists? path
      nom, mdp = File.basename(path).split('-')
      rm = Roadmap.new nom, mdp
      begin
        # Détruire par ruby (si construit par ruby)
        roadmap_destroy rm, {:mail => rm.mail, :md5 => rm.md5}
        raise if File.exists? path
      rescue Exception => e
        # Il faut détruire par JS
        JS.run "User.set({mail:'#{rm.mail}',md5:'rm.md5'})"
        JS.run "Roadmap.set('#{nom}','#{mdp}')"
        JS.run "Roadmap.destroy()"
        Watir::Wait.while{ "Roadmap.destroying".js }
      end
      
      # Erreur feuille de route non détruite
      if File.exists?(path)
        puts_error "Impossible de détruire la roadmap test #{nom}-#{mdp}"
      end
    end

    # Les autres fichiers à détruire
	  $files_to_destroy.each do |path|
			File.unlink path if File.exists? path
		end

    # On écrit le backtrace si on est en mode debug
    puts "BT.get()".js if DEBUG_ON
    
    # On ne ferme le navigateur qu'à la toute fin
    # @note: même s'il n'a pas été ouvert
    nav.close
    
  end


  config.before :all do
    goto_home :reload => false # ne fait rien si l'accueil est ouvert
    # Initialisation de l'aide.js
    JS.run "Aide.init(true)"
  end

  config.after :all do
  end
  
  config.include(JavascriptMatchers)
  config.include(AppJavascriptMatchers)
  
  # -------------------------------------------------------------------
  #   Méthodes propres à l'application
  # -------------------------------------------------------------------

  # --- Raccourcis pour les méthodes de test JS ---
  
  # Return true si le paragraphe d'identifiant +id+ est sélectionné (selected)
  def js_exercice_selected? id
    JS::DOM::selected?( "li#li_ex-#{id}" )
  end

  # --- Méthodes exercices ---
  
  # =>  Retourne les données du paragraphe +id+ en prenant ses valeurs dans
  #     la donnée EXERCICES (qui permet de construire le document test)
  def data_exercice id
    "EXERCICES['#{id}']".js
  end
  # Retourne les données de l'exercice, mais tirées du fichier (local)
  def data_exercice_from_file nom, mdp, id
    fdr = Roadmap.new nom, mdp
    ex_path = fdr.path_exercice id
    return nil unless File.exists?( ex_path )
    JSON.parse(File.read(ex_path))
  end
  
  # --- Méthodes généraliste ---
  def init_retour_ajax
    RETOUR_AJAX[:error] = nil
  end
  
  def load_model model # ou require_model
    model += ".rb" unless model.end_with? '.rb'
    require File.join(FOLDER_MODELS, model)
  end
  alias :require_model :load_model
  
  # Singleton Nav
  # -------------
  # @usage
  #   Utiliser dans les specs pour rejoindre ou recharger la page.
  #   nav.home                    Recharge la page d'accueil
  #   nav.home :online => true    Recharge la page en online
  #   nav.home :lang => 'en'      Recharge la page en version anglaise
  # 
  @@nav = nil
  def nav
    @@nav ||= Nav.instance # => Singleton Nav
  end
  
  $nav = nav
  
  def onav
    nav.browser 
  end
  
  # Rejoint la page d'accueil (raccourci pour nav.home)
  # -------------------------
  def goto_home options = nil
    nav.home options
  end
  
  # Recharge la page avec l'url courante (raccourci pour nav.reload_page)
  # -------------------------------------
  def reload_page; nav.reload_page end
  
  load_model 'roadmap'
  
  # Document pour test
  NOM_ROADMAP_TEST = "test"
  MDP_ROADMAP_TEST = "test"
  
  # Détruit la roadmap de nom +nom+ et de mdp +mdp+
  def destroy_roadmap nom, mdp
    nom ||= 'test'; mdp ||= 'test'
    JS.run "Roadmap.set('#{nom}', '#{mdp}')"
    JS.run "Roadmap.destroy()"
    Watir::Wait.until{ "Roadmap.destroying".js == false }
  end

  # Force la reconstruction du document test (dossier et fichiers)
  # En fait, maintenant, on ne fait que détruire le document qui doit être
  # actualisé au prochain appel de load_document_test. Car cette méthode est
  # appelée souvent à la fin des tests qui modifient le document test, et il
  # est inutile, quand ils sont joués seuls, de le reconstruire tout de suite
  def reset_roadmap_test
    destroy_roadmap NOM_ROADMAP_TEST, MDP_ROADMAP_TEST
  end
  
  # Charge la feuille de route de test dans la page
  def load_roadmap_test forcer_rechargement = false
    build_roadmap_test_if_needed
    unless forcer_rechargement
      return if onav.text_field(:id => 'roadmap_mdp').text == MDP_ROADMAP_TEST
    end
    onav.text_field(:id => 'roadmap_nom').set NOM_ROADMAP_TEST
    onav.text_field(:id => 'roadmap_mdp').set MDP_ROADMAP_TEST
    # IL faut sortir du champ pour afficher le bouton
    
    # ---/ débug
    # puts "NOM_ROADMAP_TEST: #{NOM_ROADMAP_TEST}"
    # puts "MDP_ROADMAP_TEST: #{MDP_ROADMAP_TEST}"
    # /---
    
    onav.tr(:id => 'specs_roadmap').a(:id => 'btn_roadmap_open').click
		# On attend que le document soit affiché
		Watir::Wait.until { "Roadmap.opening".js == false }
  end
  
  # Retourne l'instance Roadmap ou la crée
  # -------------------------------------------------------------------
  # @WARNING: Si la feuille est vraiment créé ici, il aura phil comme
  # propriétaire, alors que pour tester correctement, il faut que ce
  # soit "www", donc une roadmap créée à partir du navigateur
  # 
  def document nom = nil, mdp = nil
    nom ||= "documenttest"
    mdp ||= "mdptest"
    @document = Roadmap.new( :nom => nom, :mdp => mdp )
  end
  
  
  # Prépare le dossier du document test si nécessaire
  def build_document_test_if_needed
    return if File.exists?(File.join(APP_FOLDER,'user', 'roadmap', 'documenttest-mdptest'))
    js "Test.build_document_et_files_test()"
    # On attend la fin
    Watir::Wait.until{ "Test.document_test_building".js == false }
  end
  
  
end