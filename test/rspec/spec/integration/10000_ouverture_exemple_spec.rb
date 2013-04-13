=begin

	Test d'intégration de l'ouverture de la feuille de route en EXEMPLE
	-------------------------------------------------------------------
	@note: 	Ce test teste la présence et l'état de tous les éléments de 
					l'interface, donc il peut être copié-collé pour d'autres tests
					comme la création ou l'ouverture du RM personnelle.
	
	@tests
		- l'impossibilité de créer la roadmap "exemple-exemple"
		EN TANT QUE VISITEUR QUELCONQUE (SIMPLE ET ADMIN)
			- l'affichage des exercices en exemple
			- le réglage et l'affichage de la configuration générale
			- l'affichage du bouton pour lancer les exercices (sans plus)
		EN TANT QUE VISITEUR
			- l'impossiblité de créer un nouvel exercice
			- l'impossibilité d'éditer ou de supprimer un exercice
			- l'impossibilité d'enregistrer le configuration générale
		EN TANT QU'ADMINISTRATEUR
			- l'affichage du bouton pour créer un exercice (sans plus)
			- l'affichage du bouton pour changer l'order (sans plus)
			- l'affichage des boutons pour supprimer et éditer les exercices (sans +)
=end
require 'spec_helper'

describe "Open Example Roadmap" do
	
	# Simule le clic sur le bouton "Ouvrir" après l'avoir fait apparaitre en
	# mettant 'exemple' et 'exemple' dans les champs nom et mdp
	def click_bouton_open
		open_specs 'exemple', 'exemple'
    onav.a(:id => 'btn_roadmap_open').click
		Watir::Wait.while{ "Roadmap.opening".js }
	end
	context "avec les bons nom-mdp" do
		# 
		# ---> Entrée situation normale
		# 
	  before :all do
	    goto_home
			# On remplit les specs
			onav.text_field(:id => 'roadmap_nom').set "exemple"
			onav.text_field(:id => 'roadmap_mdp').set 'exemple'
			onav.text_field(:id => 'roadmap_nom').focus
	  end
		describe "doit afficher" do
			it "le bouton “Ouvrir”" do
			  onav.a(:id => 'btn_roadmap_open').should be_visible
			end
			it "le bouton “Créer”" do
			  onav.a(:id => 'btn_roadmap_create').should be_visible
			end
		end
		describe "quand on clique sur le bouton “créer”" do
			after :all do
			  reset_user
			end
			context "pour un visiteur non identifié" do
				before :all do
					reset_user
					open_specs
				  onav.a(:id => 'btn_roadmap_create').click
					sleep 0.2
				end
				after :all do
				  JS.run "Aide.init(true)" # Pour fermer la boite
				end
				it "doit afficher la boite pour s'identifier" do
					flash_should_contain "ERRORS.User.need_to_signin".js
				end
			end
			context "pour un visiteur identifié" do
				before :all do
					identify_benoit
					open_specs
				  onav.a(:id => 'btn_roadmap_create').click
					sleep 0.2
				end
				it "doit remonter le message d'erreur que la RM existe déjà" do
					flash_should_contain "ERRORS.Roadmap.existe_deja".js
				end
			end
			context "pour un administrateur" do
				before :all do
					identify_phil
					open_specs
				  onav.a(:id => 'btn_roadmap_create').click
					sleep 0.2
				end
				it "doit remonter le message d'erreur que la RM existe déjà" do
					flash_should_contain "ERRORS.Roadmap.existe_deja".js
				end
			end
		end
		
		describe "quand on clique sur le bouton “Ouvrir”" do
			# 			--------------------------------------
			# 
			# ---> Suite de la situation normale
			# 
			before :all do
			  keep(:rm => Roadmap.new('exemple', 'exemple'))
			  keep(:dexes => data_exercices('exemple', 'exemple'))
			end
			after :all do
			  reset_user
			end
			context "pour un visiteur non administrateur" do
				before :all do
				  identify_benoit
					click_bouton_open
				end
				describe "la configuration générale des exercices" do
					describe "ne doit pas afficher" do
					  it "la case à cocher pour enregistrer la nouvelle configuration" do
					    div = config_generale.div(:id => 'div_cb_save_config')
							div.should_not be_visible
					  end
					end
				end
				describe "les boutons propres aux exercices" do
					describe "doit afficher" do
					  it "le bouton pour lancer les exercices" do
						  btn = onav.a(:id => 'btn_exercices_run')
							btn.should exist
							btn.should be_visible
					  end
					end
					describe "ne doit pas afficher" do
						it "le bouton pour modifier l'ordre" do
						  btn = onav.a(:id => 'btn_exercices_move')
							btn.should exist
							btn.should_not be_visible
						end
						it "le bouton pour créer un nouvel exercice" do
						  btn = onav.a(:id => 'btn_exercice_create')
							btn.should exist
							btn.should_not be_visible
						end
					end
				end
				describe "la liste des exercices" do
				  describe "NE doit PAS afficher" do
				    it "le bouton pour éditer les exercices" do
				    	kept(:dexes)[:ids].each do |id|
								li = ul_exercices.li(:id => "li_ex-#{id}", :class => 'ex')
								btn_edit = li.div(:class => 'btns_edition').a(:class => /btn_edit/)
								btn_edit.should exist
								btn_edit.should_not be_visible
							end
						end
						it "le bouton pour supprimer les exercices" do
				    	kept(:dexes)[:ids].each do |id|
								li = ul_exercices.li(:id => "li_ex-#{id}", :class => 'ex')
								btn_sup = li.div(:class => 'btns_edition').a(:class => /btn_del/)
								btn_sup.should exist
								btn_sup.should_not be_visible
							end
						end
					end
				end
			end
			context "pour un administrateur" do
				before :all do
				  identify_phil
					click_bouton_open
				end
				describe "la configuration générale des exercices" do
					describe "doit afficher" do
					  it "la case à cocher pour enregistrer la nouvelle configuration" do
					    div = config_generale.div(:id => 'div_cb_save_config')
							div.should exist
							div.should be_visible
					  end
					end
				end
				describe "les boutons propres aux exercices" do
					describe "doit afficher" do
						it "le bouton pour modifier l'ordre" do
						  btn = onav.a(:id => 'btn_exercices_move')
							btn.should exist
							btn.should be_visible
						end
						it "le bouton pour créer un nouvel exercice" do
						  btn = onav.a(:id => 'btn_exercice_create')
							btn.should exist
							btn.should be_visible
						end
					end
				end
				describe "la liste des exercices" do
					# LISTE DES EXERCICES
				  describe "doit afficher" do
				    it "le bouton pour éditer chaque exercice" do
				    	kept(:dexes)[:ids].each do |id|
								li = ul_exercices.li(:id => "li_ex-#{id}", :class => 'ex')
								btn_edit = li.div(:class => 'btns_edition').a(:class => /btn_edit/)
								btn_edit.should exist
								btn_edit.should be_visible
							end
						end
						it "le bouton pour supprimer chaque exercice" do
				    	kept(:dexes)[:ids].each do |id|
								li = ul_exercices.li(:id => "li_ex-#{id}", :class => 'ex')
								btn_sup 	= li.div(:class => 'btns_edition').a(:class => /btn_del/)
								btn_sup.should exist
								btn_sup.should be_visible
							end
						end
					end
				end
			end
			
			context "pour un visiteur admin ou simple visiteur" do
				before :all do
				  reset_user
					click_bouton_open
				end
				describe "la configuration générale des exercices" do
				  it "doit exister et être affichée" do
				    config_generale.should exist
						config_generale.should be_visible
				  end
					describe "doit afficher" do
						it "le bouton pour changer de configuration" do
							# Mais l'enregistrement sera impossible
						  btn = config_generale.a(:id => 'btn_next_config')
							btn.should exist
							btn.should be_visible
						end
						it "le bouton d'aide pour le changement de configuration" do
						  # n'existe pas encore
						end
						describe "la direction up/down des exercices" do
							let(:div){ config_generale.div(:id => 'div_down_to_up')}
							it { div.should exist }
							it { div.should be_visible }
						  it "qui doit posséder un picto d'aide valide" do
						    aide = div.a(:class => 'aide_lien')
								aide.should exist
								aide.should be_visible
								aide.attribute_value('onclick').should =~ /config-generale\/sens-exercice/
						  end
						end
						describe "la suite harmonique" do
							let(:div){ config_generale.div(:id => 'div_maj_to_rel')}
							it { div.should exist }
							it { div.should be_visible }
						  it "qui doit posséder un picto d'aide valide" do
						    aide = div.a(:class => 'aide_lien')
								aide.should exist
								aide.should be_visible
								aide.attribute_value('onclick').should =~ /config-generale\/suite-harmonique/
						  end
						end
						describe "l'ordre from start/end des exercices" do
							let(:div){ config_generale.div(:id => 'div_start_to_end')}
							it { div.should exist }
							it { div.should be_visible }
						  it "qui doit posséder un picto d'aide valide" do
						    aide = div.a(:class => 'aide_lien')
								aide.should exist
								aide.should be_visible
								aide.attribute_value('onclick').should =~ /config-generale\/ordre-exercices/
						  end
						end
					end
				end
				describe "les boutons propres aux exercices" do
					# BOUTONS GÉNÉRAUX POUR LES EXERCICES
					describe "doit afficher" do
					  it "le bouton pour lancer les exercices" do
						  btn = onav.a(:id => 'btn_exercices_run')
							btn.should exist
							btn.should be_visible
					  end
					end
				end
				describe "la liste des exercices" do
					# LISTE DES EXERCICES
				  describe "doit contenir" do
				    it "tous les exercices de la roadmap exemple" do
							# On boucle sur chaque exercice pour voir s'il est bien affiché
							# avec les bons éléments
							# @note: 	les boutons d'édition, propres au statut du visiteur
							# 				sont checkés plus haut en fonction de statut.
				    	kept(:dexes)[:ids].each do |id|
								dex = kept(:dexes)[:exercices][id]
								li = ul_exercices.li(:id => "li_ex-#{id}", :class => 'ex')
								li.should exist
								li.should be_visible
								# Titre de l'exercice
								titre_esc = Regexp.escape(dex['titre'])
								li.div(:class => 'ex_titre').text.should =~ /#{titre_esc}/
								unless dex['recueil'].to_s == ""
									li.span(:class => 'ex_recueil').text.should == dex['recueil']
								end
								# Tempo
								unless dex['auteur'].to_s == ""
									li.span(:class => 'ex_auteur').text.strip.should == "(#{dex['auteur']})"
								end
								li.select(:id => "tempo_ex-#{id}").value.should == dex['tempo']
								# Image
								unless dex['image'].to_s == ""
									img = li.img(:id => "image_ex-#{id}", :class => "ex_image")
									img.should exist
									img.src.should end_with "exercice/#{dex['image']}"
								end
								# Note
								unless dex['note'].to_s == ""
									note_esc = Regexp.escape(dex['note'])
									li.div(:class => "ex_note").text.should =~ /#{note_esc}/
								end
							end
				    end
				  end
				end
			end
			
		end
	end
	
	context "avec les mauvais nom-mdp" do
	  before :all do
	    goto_home
			# On remplit les specs
			onav.text_field(:id => 'roadmap_nom').set "exemple"
			onav.text_field(:id => 'roadmap_mdp').set 'exempl'
			onav.text_field(:id => 'roadmap_nom').focus
	  end
		describe "doit afficher" do
			it "le bouton “Ouvrir”" do
			  onav.a(:id => 'btn_roadmap_open').should be_visible
			end
			it "le bouton “Créer”" do
			  onav.a(:id => 'btn_roadmap_create').should be_visible
			end
		end
		describe "quand on clique sur le bouton “Ouvrir”" do
			before :all do
			  onav.a(:id => 'btn_roadmap_open').click
				Watir::Wait.while{ "Roadmap.opening".js }
			end
		  it "un message d'erreur valide doit s'afficher" do
		    flash_should_contain "ERRORS.Roadmap.unknown".js, :warning
		  end
			it "le div des specs doit rester ouvert" do
			  onav.div(:id => 'roadmap_specs-specs').should be_visible
			end
			it "aucun exercice ne doit être chargé" do
			  "EXERCICES.length".js.should == 0
				ul_exercices.li(:class => 'li_ex').should_not exist
			end
		end
	end
	

end