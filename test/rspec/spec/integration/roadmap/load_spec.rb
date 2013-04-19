=begin

	Test d'intégration du chargement d'une feuille de route
	--------------------------------------------------------
	
	On essaie de charger la feuille de route exemple et on vérifie que son 
	affichage soit valide.
	
	Note : 	cette feuille doit être lancée dans son intégralité pour fonctionner
					correctement.
=end
require 'spec_helper'

describe "Ouverture d'une feuille de route (exemple)" do
	# On récupère toutes les données de l'exemple
	let(:roadmap_nom){ 'exemple' }
	let(:roadmap_mdp){ 'exemple' }
  let(:roadmap_data_in_file) do
		require 'procedure/roadmap/load'
		roadmap_load roadmap_nom, roadmap_mdp
	end
	let(:config_generale_in_file){ roadmap_data_in_file[:config_generale] }
	let(:data_in_file){ roadmap_data_in_file[:data_roadmap] }
	let(:data_exercices_in_file){ roadmap_data_in_file[:data_exercices] }
	let(:exercices_in_file){ roadmap_data_in_file[:exercices] }

	# Les éléments Watir intéressants
	let(:ul_exercices){ onav.ul(:id => 'exercices') }
	
	def li_ex id
		ul_exercices.li(:id => "li_ex-#{id}")
	end
	# Retourne l'objet Watir du menu du tempo de l'exercice d'id +id+
	def select_tempo id
		li_ex(id).select(:id => "tempo_ex-#{id}")
	end
	
	it "doit accecpter l'affixe exemple-exemple" do
	  JS.run "Roadmap.set('#{roadmap_nom}','#{roadmap_mdp}')"
		"Roadmap.are_specs_valides(true)".js.should be_true
		"Roadmap.specs_ok()".js.should be_true
	end

	it "doit charger la feuille avec succès" do
	  JS.run "Roadmap.open()"
		Watir::Wait.while{ "Roadmap.opening".js }
		flash_should_contain "MESSAGE.Roadmap.loaded".js
		"Roadmap.loaded".js.should === true
	end
	
	it "doit avoir fermé le div des specs et affiché le bouton" do
	  should_not_be_visible :div => 'roadmap_specs-specs'
		should_be_visible 		:div => 'open_roadmap_specs'
	end
	
	it "doit avoir construit les exercices dans la liste" do
	  ul_exercices.li().should exist
		exercices_in_file.each do |dex|
			id = dex['id']
			ul_exercices.li(:id => "li_ex-#{id}").should exist
		end
	end
	
	it "doit avoir bien réglé le tempo de chaque exercice" do
		exercices_in_file.each do |dex|
			id 		= dex['id']
			select_tempo(dex['id']).value.should == dex['tempo']
		end
	end
	
	it "doit avoir affiché la configuration générale" do
	  should_be_visible :div => 'config_generale'
	end
	
	it "doit avoir réglé correctement la configuration générale" do
		id = config_generale_in_file['start_to_end'] == true ? 'start_to_end' : 'end_to_start'
	  watir_e(:span => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.#{id}".js
		id = config_generale_in_file['maj_to_rel'] == true ? 'maj_to_rel' : 'rel_to_maj'
	  watir_e(:span => 'maj_to_rel').text[0..16].should == "LOCALE_UI.Exercices.Config.#{id}".js[0..16]
		id = config_generale_in_file['down_to_up'] == true ? 'down_to_up' : 'up_to_down'
	  watir_e(:span => 'down_to_up').text.should == "LOCALE_UI.Exercices.Config.#{id}".js
	end
	
	it "doit afficher le message de succès" do
	  flash_should_contain "MESSAGE.Roadmap.loaded".js
	end
end