# Test unitaire de l'objet JS Exercices
# Gestion des exercices de la feuile de route

require 'spec_helper'

describe "Objet JS Exercices" do
	before :all do
	  nav.reload_page
	end
  include_examples "javascript", "Exercices"

  def set_modified valeur = true
  	set_property :modified => valeur
		get_property(:modified).should == valeur
  end
 	describe "doit posséder les propriétés" do
 	  it { property_should_exist :modified }
 	end
	describe "doit répondre à" do
		it { should_respond_to :set_boutons }
		it { should_respond_to :set_btns_edition }
		it { should_respond_to :set_btn_next_config_generale }
		it { should_respond_to :set_btn_create }
		it { should_respond_to :set_btn_move }
	end
	
	# Liste des constantes
	describe "doit définir la constante" do
	  [:TYPES_EXERCICE
		].each do |constant|
			it { should_have_constant constant }
		end
	end
	
	describe ":set_boutons" do
	  # :Exercices.set_boutons
	
		context "sans exercices" do
			before :all do
			  open_roadmap 'testable', 'testable', {:as_owner => false}
				JS.run 'EXERCICES={length:0}'
				run 'set_boutons'
				sleep 0.5
			end
			describe "ne doit pas afficher" do
				it "le bouton pour modifier l'ordre des exercices" do
			    should_not_be_visible :a => 'btn_exercices_move'
				end
			  it "le bouton “Lancer les exercices”" do
			    should_not_be_visible :a => 'btn_exercices_run'
			  end
			end
		end
		
		context "avec des exercices" do
			context "sur une feuille protégée" do
				before :all do
				  open_roadmap 'testable', 'testable', {:as_owner => false}
				  JS.run "EXERCICES={length:12}"
					run 'set_boutons'
					sleep 0.5
				end
				describe "doit afficher" do
				  it "le bouton “Lancer les exercices”" do
				    should_be_visible :a => 'btn_exercices_run'
				  end
				end
				describe "ne doit pas afficher" do
				  it "le bouton “Créer”" do
				    should_not_be_visible :a => 'btn_exercice_create'
				  end
					it "le bouton pour modifier l'ordre des exercices" do
				    should_not_be_visible :a => 'btn_exercices_move'
					end
				end
			end
			context "sur une feuille de l'user" do
				before :all do
				  open_roadmap 'testable', 'testable', {:as_owner => true}
				  JS.run "EXERCICES={length:12}"
					run 'set_boutons'
					sleep 0.5
				end
				describe "doit afficher" do
					it "le bouton pour créer un exercice" do
					  should_be_visible :a => 'btn_exercice_create'
					end
					it "le bouton pour lancer les exercices" do
				    should_be_visible :a => 'btn_exercices_run'
					end
					it "le bouton pour modifier l'ordre des exercices" do
				    should_be_visible :a => 'btn_exercices_move'
					end
				end
			end
		end
	end

	describe "doit posséder la méthode" do
	
	  describe ":set_modified" do
			# :set_modified
			it { should_respond_to :set_modified }
	    describe "qui doit mettre :modified à" do
				it "true sans arguments" do
				  set_modified false
					run 'set_modified'
					get_property(:modified).should be_true
				end
				it "true avec argument true" do
				  set_modified false
					run 'set_modified(true)'
					get_property(:modified).should be_true
				end
				it "false avec argument false" do
				  set_modified true
					run 'set_modified(false)'
					get_property(:modified).should be_false
				end
			end
			describe "qui doit mettre Roadmap.modified à" do
				before(:each) do
				  JS.run "Roadmap.modified = false"
					"Roadmap.modified".js.should be_false
				end
			  it "true sans argument" do
				  set_modified false
					run 'set_modified'
					sleep 2
					"Roadmap.modified".js.should be_true
			  end
				it "true avec argument true" do
				  set_modified false
					run 'set_modified(true)'
					"Roadmap.modified".js.should be_true
				end
				it "rien (en pas toucher) avec argument false" do
				  JS.run "Roadmap.modified = true"
					"Roadmap.modified".js.should be_true
					run 'set_modified(false)'
					"Roadmap.modified".js.should be_true
				end
			end
	  end
		describe ":reset_liste" do
			# :reset_liste
		  it { should_respond_to :reset_liste }
			it "qui doit vider la UL des exercices" do
			  JS.run "$('ul#exercices').append('<li>un li</li>')"
				"$('ul#exercices').length".js.should be > 0
				run 'reset_liste'
				"$('ul#exercices > li').length".js.should === 0
			end
			it "qui doit ré-initialiser la variable EXERCICES" do
			  JS.run "EXERCICES = 'nimporte quoi'"
				run 'reset_liste'
				"EXERCICES".js.should == {"length" => 0}
			end
		end
	end # / fin doit posséder la méthode
end