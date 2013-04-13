=begin

	Test unitaire des méthodes JS de sauvegarde de la roadmap
	
=end
require 'spec_helper'

require File.join(APP_FOLDER,'data','secret','data_phil.rb') # => DATA_PHIL

describe "La roadmap" do
	
  include_examples "javascript", "Roadmap"

	describe "doit répondre à" do
		# Les méthodes de sauvegarde auxquelles doit répondre Roadmap
		it { should_respond_to :create }
		it { should_respond_to :save }
		it { should_respond_to :end_save }
	end
	
	# :save
	describe ":save" do
		context "quand l'utilisateur n'est pas identifié" do
			before do
				reset_user
			  open_roadmap 'testable', 'testable'
				# -->
				run 'save'
				Watir::Wait.while{ "Roadmap.saving".js }
				# <--
			end
			it "doit afficher la boite d'identification" do
			  pending "à coder"
			end
		end
		
		context "Quand l'utilisateur n'est pas le possesseur de la roadmap" do
			context "mais qu'il existe" do
				before do
					open_roadmap 'testable', 'testable', {:as_owner => true}
					mailphil 		= DATA_PHIL[:mail]
					mailbenoit 	= "benoit.ackerman@yahoo.fr"
					identify_user("User.mail".js == mailphil ? mailbenoit : mailphil)
			  	set_property :modified => true
					get_property(:modified).should === true
					# -->
					run 'save'
					Watir::Wait.while{ "Roadmap.saving".js }
					# <--
				end
				it "doit lever la bonne erreur" do
					flash_should_contain "ERRORS.Roadmap.bad_owner".js, :warning
				end
			end
			
		end
		context "quand la feuille de route n'existe pas" do
			before :all do
				# On charge la feuille de route "testable" et on change le
				# nom et le mdp
				rm = Roadmap.new 'testable', 'testable'
			  open_roadmap( 'testable', 'testable', {:as_owner => true} )
				get_property(:nom).should == 'testable'
				get_property(:mdp).should == 'testable'
				bad_nom = "verybadname#{Time.now.to_i}"
				bad_mdp = "verybadtdm"
				run "set('#{bad_nom}','#{bad_mdp}')"
				get_property(:nom).should == bad_nom
				get_property(:mdp).should == bad_mdp
				set_property(:modified => true)
				get_property(:modified).should === true
				get_property(:md5).should == "User.md5".js
				# -->
				run 'save'
				Watir::Wait.while{ "Roadmap.saving".js }
				Watir::Wait.while{ "Log.adding".js }
				# <--
			end
			it "ne doit rien avoir sauvé" do
			  pending "à coder"
			end
			it "doit avoir retourné un message d'erreur" do
				flash_should_contain "ERRORS.Roadmap.unknown".js, :warning
			end
		end
		
		context "Quand l'utilisateur est le possesseur de la roadmap" do
			before :all do
				flash_clean
				# On va modifier complètement la feuille de route testable
				rm = Roadmap.new 'testable', 'testable'
				rm.set_owner(DATA_PHIL[:mail]) # @note: extension de test
				
				open_roadmap 'testable', 'testable', {:as_owner => true}
				screenshot "open-before-save-with-owner"
				# Pour garder en mémoire la dernière date de modification
				keep :updated_at => rm.updated_at
				sleep 1 # pour que le updated_at soit différent
				
				# Modification des paramètres de la configuration générale
				keep(:old_down_to_up 		=> "Roadmap.Data.down_to_up".js)
				kept(:old_start_to_end 	=> "Roadmap.Data.start_to_end".js)
				new_val = kept(:old_down_to_up) ? 'false' : 'true'
				JS.run "Roadmap.Data.down_to_up = #{new_val}"
				new_val = kept(:old_start_to_end) ? 'false' : 'true'
				JS.run "Roadmap.Data.start_to_end = #{new_val}"
				
				# Modification de l'ordre des exercices
				keep :old_ordre_exercices => rm.ordre_exercices
				new_ordre_exercices = ["2", "1", "#{Time.now.to_i}"]
				JS.run "Roadmap.Data.EXERCICES['ordre'] = #{new_ordre_exercices.to_json}"
				keep :new_ordre_exercices => new_ordre_exercices

				# # -- débug --
				# rm_md5 		= "Roadmap.md5".js
				# user_md5 	= "User.md5".js
				# puts "---------------------------------"
				# puts "MD5 de la roadmap : #{rm_md5}"
				# puts "MD5 de l'utilisateur : #{user_md5}"
				# puts "OLD updated_at : #{kept(:updated_at)}"
				# puts "old_ordre_exercices: #{rm.ordre_exercices.inspect}"
				# puts "new ordre exercices: #{new_ordre_exercices.inspect}"
				# puts "---------------------------------"
				# # -----------
				
				set_property(:modified => true)
				get_property(:modified).should === true
				# -->
				run 'save'
				Watir::Wait.while{ "Roadmap.saving".js }
				Watir::Wait.while{ "Log.adding".js }
				sleep 0.5
				screenshot "save-with-owner"
				# <--
			end
			it "ne doit afficher aucun message d'erreur" do
			  div_error = onav.div(:id => 'inner_html').div(:class => /warning/)
				if div_error.exists?
					raise "Il ne devrait y avoir aucun message d'error, hors flash affiche :" +
								div_error.html
				else
					div_error.should_not exist
				end
			end
			it "doit avoir modifié le fichier data.js" do
			  path = File.join(APP_FOLDER,'user','roadmap','testable-testable','data.js')
				File.exists?(path).should be_true
				djs = JSON.parse(File.read(path))
				# puts "Data dans le fichier 'testable-testable/data.js': #{djs.inspect}"
			end
		  it "doit modifier la date de dernière actualisation" do
				rm = Roadmap.new 'testable', 'testable'
				rm.updated_at.should be > kept(:updated_at)
		  end
			it "doit avoir enregistré les modifications de configuration générale" do
				# Double check, dans le fichier
				path = File.join(roadmap_path('testable', 'testable'), 'config_generale.js')
				cg = JSON.parse(File.read(File.join(path)))
				cg['down_to_up'].should_not 	== kept(:old_down_to_up)
				cg['down_to_up'].should 			=== !kept(:old_down_to_up)
				cg['start_to_end'].should_not == kept(:old_start_to_end)
				cg['start_to_end'].should 		=== !kept(:old_start_to_end)
			end
			it "doit avoir enregistré le changement de l'ordre des exercices" do
				rm = Roadmap.new 'testable', 'testable'
				rm.ordre_exercices.should_not == kept(:old_ordre_exercices)
				rm.ordre_exercices.should 		== kept(:new_ordre_exercices)
			end
		end
	end

			
	# :end_save
	describe ":end_save" do
		context "dans tous les cas" do
			it "doit se poursuire dans la méthode définie en paramètre" do
			  JS.run "window.fantome = null;"
				"fantome".js.should be_nil
				# -->
				run 'end_save(function(){window.fantome="0123456"},{error:null})'
				Watir::Wait.while{ "Roadmap.saving".js }
				# <--
				"fantome".js.should == "0123456"
				Watir::Wait.while{ "Log.adding".js }
			end
			it "doit régler correctement le bouton « Sauver »" do
			  pending "à coder"
				Watir::Wait.while{ "Log.adding".js }
			end
		end
		context "en cas d'erreur" do
			it "doit afficher le message d'erreur en cas d'erreur" do
			  run "end_save(null, {error:'Avec une erreur'})"
				flash_should_contain "Avec une erreur"
				Watir::Wait.while{ "Log.adding".js }
			end
			it "doit retourner false" do
			  res = run "end_save(null,{'error':'Avec une erreur'})"
				res.should === false
				Watir::Wait.while{ "Log.adding".js }
			end
			it "doit mettre saving à false" do
				set_property('saving', true)
			  run "end_save(null,{'error':'Avec une erreur'})"
				get_property('saving').should === false
				Watir::Wait.while{ "Log.adding".js }
			end
		end
		context "en cas de succès" do
			it "doit retourner true" do
			  res = run "end_save(null,{'error':null})"
				res.should === true
				Watir::Wait.while{ "Log.adding".js }
			end
			it "doit afficher le bon message" do
			  run 'end_save(null,{error:null})'
				flash_should_contain "MESSAGES.Roadmap.saved".js
				Watir::Wait.while{ "Log.adding".js }
			end
		end
		
		context "en cas de création (avec échec ou succès)" do
			before(:each) do
			  JS.run "Roadmap.creating = true"
			end
			it "doit mettre loaded à true" do
				set_property('loaded', false)
				run 'end_save'
				get_property('loaded').should be_true
				Watir::Wait.while{ "Log.adding".js }
			end
			it "doit enregistrer un nouveau message log de création" do
				now = Time.now.to_i
				rm = Roadmap.new 'testable', 'testable'
				path_logs = File.join(rm.folder, 'log.txt')
			  logs =	if File.exists? path_logs then File.read(path_logs).split("\n")
								else [] end
				# -->
				run 'end_save'
				Watir::Wait.while{ "Log.adding".js }
				# <--
				screenshot "log-quand-creating"
				raise "Fichier Log introuvable (il aurait dû être créé)" unless File.exists? path_logs
				new_logs = File.read( path_logs ).split("\n")
				new_logs.count.should == logs.count + 1
				# Le dernier log doit avoir le code 100 et la data doit être supérieure
				# ou égale à la date de départ
				dlastlog = new_logs.last.split("\t")
				dlastlog[0].to_i.should be >= now
				dlastlog[1].should == "100"
			end
			it "doit mettre creating à false si échec" do
			  run "end_save(null,{'error':'FAILED'})"
				get_property('creating').should === false
			end
			it "doit régler les boutons de la roadmap" do
			  pending "à coder"
			end
		end # / end context d'une création	
	end # / :end_save
end