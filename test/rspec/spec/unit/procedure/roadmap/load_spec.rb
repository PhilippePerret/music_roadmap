=begin

	Test unitaire des procédures de chargement de la feuille de route
	
=end

require 'spec_helper'

describe "Procédures Roadmap/load" do
	
	# Le fichier
  describe "Le fichier" do
    it "doit exister" do
      path = File.join(FOLDER_PROCEDURES, 'roadmap', 'load.rb')
			File.exists?(path).should be_true
    end
	end
	
	# Les deux méthodes
	describe "doit répondre à" do
	  before do
			require 'procedure/roadmap/load'
		end
		it ":roadmap_load" do
		  expect{roadmap_load}.not_to raise_error NameError
		end
		it ":ajax_roadmap_load" do
		  expect{ajax_roadmap_load}.not_to raise_error NameError
		end
	end
		
	describe "méthode ajax_roadmap_load" do
	  # :ajax_roadmap_load
		context "quand tout est OK" do
			before :all do
				RETOUR_AJAX[:error] = nil
				RETOUR_AJAX.delete(:roadmap)
				rm = Roadmap.new( 'exemple', 'exemple')
				keep(:rm => rm)
				Params.set_params(
					:roadmap_nom => 'exemple', :roadmap_mdp => 'exemple',
					:mail => 'rien@pour.voir', :password => 'unfakepassword',
					:check_if_exists => true)
				# Params.set_params(:roadmap_nom => 'exemple')
				# Params.set_params(:roadmap_mdp => 'exemple')
				require 'procedure/roadmap/load'
				ajax_roadmap_load
			end
			describe "ne doit pas renvoyer" do
				it "d'erreur" do
					RETOUR_AJAX[:error].should be_nil
				end
				it "le message de roadmap indéfinissable" do
				  RETOUR_AJAX[:error].should_not == 'ERRORS.Roadmap.initialization_failed'
				end
				it "le message d'inexistance" do
				  RETOUR_AJAX[:error].should_not == "ERRORS.Roadmap.unknown"
				end
			end
			describe "RETOUR_AJAX[:roadmap]" do
			  subject { RETOUR_AJAX[:roadmap] }
				describe "doit définir les clés" do
					it { should have_key :data_roadmap }
					it { should have_key :config_generale }
					it { should have_key :data_exercices }
					it { should have_key :exercices }
				end
				describe "doit contenir" do
					describe ":data_roadmap" do
						# :data_roadmap
						subject { RETOUR_AJAX[:roadmap][:data_roadmap] }
						describe "qui doit contenir" do
							it { should have_key 'nom' }
							it "'nom' doit avoir la bonne valeur" do
							  subject['nom'].should == kept(:rm).nom
							end
							it { should have_key 'mdp' }
							it "'mdp' avoir la bonne valeur" do
							  subject['mdp'].should == kept(:rm).mdp
							end
							it { should have_key 'created_at' }
							it { should have_key 'updated_at' }
							it { should have_key 'md5' }
							it "md5 avoir la bonne valeur" do
							  subject['md5'].should == kept(:rm).md5
							end
						end
						describe "qui ne doit pas contenir" do
							it { should_not have_key 'mail' }
							it { should_not have_key 'password' }
							it { should_not have_key 'salt' }
						end
					end

					describe ":config_generale" do
						# :config_generale
						subject { RETOUR_AJAX[:roadmap][:config_generale] }
						describe "qui doit définir" do
						  it { should have_key 'start_to_end' }
						  it { should have_key 'maj_to_rel' }
						  it { should have_key 'down_to_up' }
						  it { should have_key 'last_changed' }
						end
					end

					describe ":data_exercices" do
						# :data_exercices
						subject { RETOUR_AJAX[:roadmap][:data_exercices] }
						describe "qui doit définir" do
							describe "'ordre'" do
							  it { should have_key 'ordre' }
								it "qui doit être une liste" do
								  subject['ordre'].class.should == Array
								end
							end
						end
					end
					
					describe ":exercices" do
						# :exercices
						subject { RETOUR_AJAX[:roadmap][:exercices] }
					end

				end
			end
			
		end # / context où tout est bon
		
		context "quand des problèmes surviennent" do
			before :all do
				RETOUR_AJAX[:error] = nil
				RETOUR_AJAX.delete(:roadmap)
				require 'procedure/roadmap/load'
			end
		end
		
	end
	
	describe "méthode roadmap_load" do
	  # :roadmap_load
		# @note: les retours sont vérifiés directement par la méthode ajax
		# on ne fait donc qu'un simple test ici
		before(:all) do
		  rm = Roadmap.new 'exemple', 'exemple'
			keep(:rm => rm)
			require 'procedure/roadmap/load'
		end
		context "Données valides et toutes les données demandées" do
			subject { roadmap_load 'exemple', 'exemple' }
			it { should have_key :data_roadmap }
			it { should have_key :config_generale }
			it { should have_key :data_exercices }
			it { should have_key :exercices }
		end
		context "Données valides et seulement exercices demandés" do
			subject { roadmap_load( 'exemple', 'exemple', :exercices => true) }
			it { should_not have_key :data_roadmap }
			it { should_not have_key :config_generale }
			it { should have_key :data_exercices }
			it { should have_key :exercices }
		end
		context "Données valides et seulement data roadmap demandée" do
			subject { roadmap_load( 'exemple', 'exemple', :data_roadmap => true) }
			it { should have_key :data_roadmap }
			it { should_not have_key :config_generale }
			it { should_not have_key :data_exercices }
			it { should_not have_key :exercices }
		end
		context "Données valides et seulement config générale demandée" do
			subject { roadmap_load( 'exemple', 'exemple', {:config_generale => true}) }
			it { should_not have_key :data_roadmap }
			it { should have_key :config_generale }
			it { should_not have_key :data_exercices }
			it { should_not have_key :exercices }
		end
		
		
	end
end