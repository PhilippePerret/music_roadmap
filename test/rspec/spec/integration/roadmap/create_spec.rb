=begin

	Test d'intégration de la création d'une roadmap
	
=end
require 'spec_helper'

describe "[intégration] Création d'une roadmap" do
	def set_nom nom
		onav.text_field(:id => 'roadmap_nom').set nom
	end
	def set_mdp mdp
		onav.text_field(:id => 'roadmap_mdp').set mdp
		JS.run "Roadmap.set_btns_roadmap()"
	end
	def click_bouton_create_roadmap
		btn_create = onav.a(:id => 'btn_roadmap_create')
		unless btn_create.visible?
			JS.run "Roadmap.set_btns_roadmap()"
		end
		btn_create.click
	end
	def roadmap_should_exist nom, mdp
		roadmap_exists?(nom,mdp).should === true
	end
	def roadmap_should_not_exist nom, mdp
		roadmap_exists?(nom,mdp).should === false
	end
	
	context "quand l'utilisateur n'est pas identifié" do
		before do
		  JS.run 'User.reset()'
			keep(:nombre_roadmaps => get_nombre_roadmaps)
			# -->
			set_nom "mafdr#{Time.now.to_i}"
			set_mdp "motdepasse"
			click_bouton_create_roadmap
			Watir::Wait.while{ "Roadmap.creating".js }
			# <--
		end
		it "doit afficher un message d'erreur" do
		  flash_should_contain "ERRORS.User.need_to_signin".js, :warning
		end
		it "ne doit pas créer la feuille de route" do
		  get_nombre_roadmaps.should == kept(:nombre_roadmaps)
		end
	end
	context "doit produire une erreur si" do
		it "si la feuille de route existe déjà" do
			identify_user
		  set_nom "exemple"
			set_mdp "exemple"
			click_bouton_create_roadmap
			Watir::Wait.while{ "Roadmap.creating".js }
			flash_should_contain "ERRORS.Roadmap.existe_deja".js
		end
	end
	
	context "avec de bonnes informations" do
		before do
			identify_user
			# Trouver un nom de roadmap unique
			begin
		  	now = Time.now.to_i
				nom = "fdr#{now}"
				mdp = "#{now}"
		 	end while File.exists?( roadmap_path(nom, mdp) )
			keep(:now => now, :nom => nom, :mdp => mdp)
			set_nom nom; set_mdp mdp;
			$roadmaps_to_destroy << roadmap_path(nom, mdp)
			# -->
			click_bouton_create_roadmap
			Watir::Wait.while{ "Roadmap.creating".js }
			Watir::Wait.while{ "Log.adding".js }
			# <--
		end
		it "doit afficher un message de succès" do
		  flash_should_contain "MESSAGES.Roadmap.created".js
		end
		it "doit créer la roadmap et afficher le message de réussite" do
			flash_should_contain "MESSAGES.Roadmap.created".js
			roadmap_should_exist kept(:nom), kept(:mdp)
		end
		it "doit avoir ajouté un log de création" do
			# Le dernier message de log doit être 100 et supérieur ou égale à
			# la date de maintenant
			rm = Roadmap.new kept(:nom), kept(:mdp)
			dlast_log = File.read(rm.path_log).strip.split("\n").last.split("\t")
		  time = dlast_log[0].to_i
			code = dlast_log[1]
			time.should be >= kept(:now)
			code.should == "100"
		end
	end
	
	
end