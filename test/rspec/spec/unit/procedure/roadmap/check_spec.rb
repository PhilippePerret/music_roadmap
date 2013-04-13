# Test unitaire de la procédure de check de l'existence d'une roadmap

require 'spec_helper'

describe "Procédures roadmap/check" do
  it "doit avoir son fichier procédure" do
		procedure_should_exist 'roadmap/check'
  end
	it "doit retourner null si la feuille de route n'existe pas" do
		begin
			now = Time.now.to_i
	  	nom = "fdr#{now}"
			mdp = "mdp#{now}"
			path = File.join(APP_FOLDER, 'user', 'roadmap', "#{nom}-#{now}")
		end while File.exists? path
		$roadmaps_to_destroy << path
		require 'procedure/roadmap/check'
		Params.set_params( :roadmap_nom => nom, :roadmap_mdp => mdp )
		ajax_roadmap_check
		RETOUR_AJAX[:error].should be_nil
	end
	it "doit retourner le message d'erreur s'il y a un problème" do
		require 'procedure/roadmap/check'
		Params.init_params
	  Params.set_params(:roadmap_nom => nil, :roadmap_mdp => nil)
		ajax_roadmap_check
		RETOUR_AJAX[:error].should == "ERRORS.Roadmap.Specs.requises"
	end
	it "doit retourner le message d'existence si la feuille de route existe" do
		require 'procedure/roadmap/check'
		Params.set_params( :roadmap_nom => 'exemple', :roadmap_mdp => 'exemple' )
	  expect{ ajax_roadmap_check }.not_to raise_error
		RETOUR_AJAX[:error].should == "ERRORS.Roadmap.existe_deja"
	end
end