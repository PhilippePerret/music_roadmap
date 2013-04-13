# 
# Test de la procédure exercice/save
# 
require 'spec_helper'

describe "Procédures exercice/save" do
	after :all do
		# Il faut détruire tout le dossier exercices
		rm = Roadmap.new 'testable', 'testable'
	  FileUtils::rm_rf rm.folder_exercices
	end
	describe "requiert" do
	  it "le fichier ruby" do
			File.exists?(File.join(FOLDER_PROCEDURES,'exercice','save.rb')).should be_true
	  end
		it "la méthode `exercice_save'" do
			require 'procedure/exercice/save'
		  expect{exercice_save}.not_to raise_error NameError
		end
		it "la méthode `ajax_exercice_save'" do
			require 'procedure/exercice/save'
		  expect{ajax_exercice_save}.not_to raise_error NameError
		end
	end
	
	describe ":ajax_exercice_save" do
		before :all do
		  require 'procedure/exercice/save'
		  @rm 		= Roadmap.new 'testable', 'testable'
			@owner 	= {:mail => @rm.mail, :md5 => @rm.md5}
			@id			= "fake#{Time.now.to_i}"
			@data		= {'id' => @id, 'titre' => "Titre de #{@id}"}
		end
	  # Note: c'est surtout la procédure exercice_save qui fait les 
		# contrôles donc on peut se contenter du minimum ici
		context "quand tout est valide" do
			before :all do
				init_retour_ajax
			  Params.set_params(
					:data => @data, :mail => @rm.mail, :md5 => @rm.md5,
					:roadmap_nom	=> @rm.nom, :roadmap_mdp => @rm.mdp
				)
			ajax_exercice_save
			end
			it "met le retour erreur à nil" do
			  RETOUR_AJAX[:error].should be_nil
			end
		end
		describe "renvoie la bonne erreur" do
			context "quand le roadmap n'existe pas" do
				before :all do
					init_retour_ajax
				  Params.set_params(
						:data => @data, :mail => @rm.mail, :md5 => @rm.md5,
						:roadmap_nom	=> 'n"im"porte"quoi', :roadmap_mdp => "faux"
					)
					ajax_exercice_save
				end
				it { RETOUR_AJAX[:error].should == "ERRORS.Roadmap.required" }
			end
			context "quand l'utilisateur n'est pas défini" do
				before :all do
					init_retour_ajax
				  Params.set_params(
						:data => @data, :mail => nil, :md5 => nil,
						:roadmap_nom	=> @rm.nom, :roadmap_mdp => @rm.mdp
					)
					ajax_exercice_save
				end
				it { RETOUR_AJAX[:error].should == "ERRORS.Roadmap.bad_owner" }
			end
			context "quand les data sont nil" do
				before :all do
					init_retour_ajax
				  Params.set_params(
						:data => nil, :mail => @rm.mail, :md5 => @rm.md5,
						:roadmap_nom	=> @rm.nom, :roadmap_mdp => @rm.mdp
					)
					ajax_exercice_save
				end
				it { RETOUR_AJAX[:error].should == "ERRORS.Exercices.Edit.data_required" }
			end
			context "quand l'identifiant n'est pas fourni" do
				before :all do
					init_retour_ajax
				  Params.set_params(
						:data => @data.merge( 'id' => nil ), 
						:mail => @rm.mail, :md5 => @rm.md5,
						:roadmap_nom	=> @rm.nom, :roadmap_mdp => @rm.mdp
					)
					ajax_exercice_save
				end
				it { RETOUR_AJAX[:error].should == "ERRORS.Exercices.Edit.id_required" }
			end
		end
		
	end
	describe ":exercice_save" do
		before :all do
		  require 'procedure/exercice/save'
		  @rm 		= Roadmap.new 'testable', 'testable'
			@owner 	= {:mail => @rm.mail, :md5 => @rm.md5}
		end
		describe "quand" do
			
			context "tout est bien défini" do
				# 
				# ----> Contexte naturel où tout est OK
				# 
				before :all do
					@id = "fakeid#{Time.now.to_i}"
					@data = {
						'id' => @id,
						'titre'=> "Le titre #{Time.now.to_i}",
						'tempo'=> "200", 'tempo_min'=>"100", 'tempo_max'=>"300"
					}
					File.exists?(@rm.path_exercice(@id)).should be_false
					# -->
				  @res = exercice_save @rm, @data, @owner
					# <--
				end
				it "doit retourner nil" do
				  @res.should be_nil
				end
				it "doit créer le fichier de l'exercice" do
					File.exists?(@rm.path_exercice(@id)).should be_true
				end
				it "doit avoir enregistré les valeurs dans le fichier" do
				  data = JSON.parse(File.read(@rm.path_exercice(@id)))
					['id','titre','tempo','tempo_max','tempo_min'
					].each do |k|
						data[k].should == @data[k]
					end
				end
			end

		  context "le context est invalide par" do
				it "une feuille de route inexistante" do
					res = exercice_save nil, nil, nil
					res.should == "ERRORS.Roadmap.required"
				end
				it "des données inexistantes" do
				  res = exercice_save @rm, nil, nil
					res.should == "ERRORS.Exercices.Edit.data_required"
				end
				it "un mauvais propriétaire" do
					res = exercice_save @rm, {}, {:mail => "bad", :md5 => "bad"}
					res.should == "ERRORS.Roadmap.bad_owner"
				end
				it "des données d'exercice invalides (pas d'id)" do
					res = exercice_save @rm, {:titre => "le titre"}, @owner
					res.should == "ERRORS.Exercices.Edit.id_required"
				end
		  end

		end
	end
end