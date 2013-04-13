=begin

	Test unitaire des méthodes JS de la création de la roadmap
	
=end
require 'spec_helper'

describe "La roadmap" do
  include_examples "javascript", "Roadmap"

	# :end_create
	describe ":end_create" do
	  it { should_respond_to :end_create }
		it { property_should_exist :creating }
		it "doit mettre :creating à false" do
		  set_property(:creating => true)
			get_property(:creating).should be_true
			run 'end_create'
			get_property(:creating).should be_false
		end
		it "doit afficher le message de fin de création si OK" do
		  run 'end_create(true)'
			flash_should_contain "MESSAGES.Roadmap.created".js, :notice
		end
	end
	# :create
	describe ":create" do
		it { should_respond_to :create }
		context "avec un user non identifié" do
			before(:all) do
			  JS.run "User.reset()"
				# -->
				run 'create'
				Watir::Wait.while{ "roadmap.creating".js }
				Watir::Wait.while{ "Aide.loading".js }
			end
			describe "doit" do
				it "afficher la boite d'identification/inscription et le message d'erreur" do
				  onav.div(:id => 'user_signin_form').should be_visible
				  flash_should_contain "ERRORS.User.need_to_signin".js, :warning
				end
			end
		end
		context "avec un user identifié" do
			before :all do
			  identify_user
				"User.is_identified()".js.should be_true
				keep(:nombre_roadmaps => get_nombre_roadmaps)
				# puts "Nombre de roadmaps : #{kept(:nombre_roadmaps)}"
			end
			context "avec des données roadmap bien définies" do
				context "ET unique" do
					before(:all) do
						"User.is_identified()".js.should be_true
						keep(
							:rm_nom 					=> "nomderoadmap#{Time.now.to_i}",
							:rm_mdp 					=> "mdpderoadmap#{Time.now.to_i}",
							:nombre_roadmaps 	=> get_nombre_roadmaps
							)
					  run "set('#{kept(:rm_nom)}','#{kept(:rm_mdp)}')"
						# -->
						run 'create'
						Watir::Wait.while{ "Roadmap.creating".js }
						# <--
						screenshot "creating-ok"
					end
					it "doit créer la roadmap" do
						rm = Roadmap.new kept(:rm_nom), kept(:rm_mdp)
						$roadmaps_to_destroy << rm.folder
						get_nombre_roadmaps.should == kept(:nombre_roadmaps) + 1
						duser = get_user_identified
						rm.nom.should 	== kept(:rm_nom)
						rm.mdp.should 	== kept(:rm_mdp)
						rm.mail.should	== duser[:mail]
						rm.md5.should 	== duser[:md5]
					end
				end
				context "MAIS existantes" do
					before :all do
						# On vérifie qu'elle n'a pas été détruite entre temps
						rm = Roadmap.new 'testable', 'testable'
						rm.should exist
					  run "set('testable','testable')"
						keep(:nombre_roadmaps => get_nombre_roadmaps)
						# -->
						run 'create'
						Watir::Wait.while{ "roadmap.creating".js }
						# <--
					end
					it "ne doit pas créer la roadmap" do
						get_nombre_roadmaps.should == kept(:nombre_roadmaps)
					end
					it "doit afficher le bon message d'erreur" do
					  flash_should_contain "ERRORS.Roadmap.existe_deja".js, :warning
					end
				end
			end
			context "avec de mauvaises données roadmap" do
				before(:all) do
					keep(:nombre_roadmaps => get_nombre_roadmaps)
				  run "set(null,null)"
					# -->
					run 'create'
					Watir::Wait.while{ "roadmap.creating".js }
					# <--
				end
				it "ne doit pas créer la roadmap" do
					get_nombre_roadmaps.should == kept(:nombre_roadmaps)
				end
			end
			
		end
		
		
	end
end