# Tests de l'objet JS Roadmap.UI

require 'spec_helper'

describe "Sous-objet JS" do
	before :all do
	  nav.reload_page
	end
	
	describe "Roadmap.UI" do
		include_examples "javascript", "Roadmap.UI"
		describe "Set" do
			it { "Roadmap.UI.Set".should be_a_js_object }
		end
	end
  
	describe "Roamap.UI.Set" do
		before :all do
		  open_roadmap 'testable', 'testable' # Pour que les éléments soient visibles
		end
	  include_examples "javascript", "Roadmap.UI.Set"
		describe ":set_valeur_texte" do
		  it { should_respond_to :set_valeur_texte }
			it "doit pouvoir régler le texte d'un span" do
			  run "set_valeur_texte('down_to_up','boudin')"
				onav.span(:id => 'down_to_up').text.should == "boudin"
				run "set_valeur_texte('down_to_up','autre texte')"
				onav.span(:id => 'down_to_up').text.should == "autre texte"
			end
		end
		describe ":start_to_end" do
		  it { should_respond_to :start_to_end }
			it "doit afficher le bon texte en fonction de Roadmap.Data.start_to_end" do
			  JS.run "Roadmap.Data.start_to_end = true"
				run "start_to_end"
				onav.span(:id => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.start_to_end".js
			  JS.run "Roadmap.Data.start_to_end = false"
				run "start_to_end"
				onav.span(:id => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.end_to_start".js
			end
		end
		describe ":down_to_up" do
		  it { should_respond_to :down_to_up }
			it "doit afficher le bon texte en fonction de Roadmap.Data.down_to_up" do
			  JS.run "Roadmap.Data.down_to_up = true"
				run "down_to_up"
				onav.span(:id => 'down_to_up').text.should == "LOCALE_UI.Exercices.Config.down_to_up".js
			  JS.run "Roadmap.Data.down_to_up = false"
				run "down_to_up"
				onav.span(:id => 'down_to_up').text.should == "LOCALE_UI.Exercices.Config.up_to_down".js
			end
		end
		describe ":maj_to_rel" do
		  it { should_respond_to :maj_to_rel }
			it "doit afficher le bon texte en fonction de Roadmap.Data.maj_to_rel" do
			  JS.run "Roadmap.Data.maj_to_rel = true"
				run "maj_to_rel"
				onav.span(:id => 'maj_to_rel').text[0..16].should == "LOCALE_UI.Exercices.Config.maj_to_rel".js[0..16]
			  JS.run "Roadmap.Data.maj_to_rel = false"
				run "maj_to_rel"
				onav.span(:id => 'maj_to_rel').text[0..16].should == "LOCALE_UI.Exercices.Config.rel_to_maj".js[0..16]
			end
		end
		describe ":last_changed" do
			# Ne sert à rien mais doit exister (car les méthodes sont appelées dynamiquement)
		  it { should_respond_to :last_changed }
		end
	end
end