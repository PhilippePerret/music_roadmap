# Test unitaire du modèle Roadmap

require 'spec_helper'
require_model 'roadmap'
require_model 'user'

require File.join(APP_FOLDER,'data','secret','data_phil') # => DATA_PHIL

describe Roadmap do
	describe "La class" do
		# Pas de tests pour le moment
	end
	describe "L'Instance" do
		def rm_test
			@roadmap_test ||= Roadmap.new 'test_as_phil', 'test_as_phil'
		end
		def rm_none
			@roadmap_inexistante ||= Roadmap.new "forcéement une mauvaise", "très ça"
		end
		def rm forcer_init = false
			if forcer_init
				@rm = Roadmap.new "uneroadmap#{Time.now.to_i}", "sonpassword"
			else
				@rm ||= Roadmap.new "uneroadmap#{Time.now.to_i}", "sonpassword"
			end
		end
		subject { Roadmap.new 'test_as_phil', 'test_as_phil' }
		it { should respond_to :exists? }
		it ":exists doit retourner true si la roadmap existe" do
		  rm = Roadmap.new 'test_as_phil', 'test_as_phil'
			rm.exists?.should be_true
		end
		it ":exists? doit retourner false si la roadmap n'existe pas" do
			rm_none.exists?.should be_false
		end
		it { should respond_to :data? }
		it ":data? doit retourner true si les data existent" do
		  rm_test.data?.should be_true
		end
		it ":data? doit retourner false si les data n'existent pas" do
		  rm_none.data?.should be_false
		end
		it { should respond_to :config_generale? }
		it ":config_generale? doit retourner true si la config générale existe" do
		  rm_test.config_generale?.should be_true
		end
		it ":config_generale? doit retourner false si la config n'existe pas" do
		  rm_none.config_generale?.should be_false
		end
		it { should respond_to :exercices? }
		it ":exercices? doit retourner true s'il y a des exercices" do
		  rm_test.exercices?.should be_true
		end
		it ":exercices? doit retourner false s'il n'y a pas d'exercices" do
		  rm_none.exercices?.should be_false
		end
		it { should respond_to :set }
		it ":set doit permettre de dispatcher des données" do
			rm(true) # pour forcer une nouvelle roadmap virtuelle
		  iv_set(rm, :nom => nil, :mdp => nil)
			iv_get(rm, :nom).should be_nil
			iv_get(rm, :mdp).should be_nil
			# -->
			rm.set(:nom => "le beau nouveau nom", :mdp => "un autre password")
			# <--
			iv_get(rm, :nom).should == "le beau nouveau nom"
			iv_get(rm, :mdp).should == "un autre password"
		end
		it { should respond_to :check_nom_et_mdp }
		it ":check_nom_et_mdp ne doit rien faire si nom et mdp sont non nil" do
		  rm(true)
			rm.check_nom_et_mdp.should be_nil
		end
		it ":check_nom_et_mdp doit lever une erreur si le nom ou le mdp sont mauvais" do
		  rm(true)
			[:nom, :mdp].each do |key|
				["", nil].each do |bad_value|
					iv_set(rm, key => bad_value)
					expect{ rm.check_nom_et_mdp }.to raise_error
					iv_set(rm, key => "quelquechose")
					expect{ rm.check_nom_et_mdp }.not_to raise_error
				end
			end
		end
		# On ne peut pas créer ces trois dossiers (permissions)
		it { should respond_to :build_folders }
		it { should respond_to :build_folder }
		it { should respond_to :build_folder_exercices }
		
		describe "Path définition" do
			subject { rm_test }
			def file_of_folder relpath
				File.join( subject.folder, relpath)
			end
		  it { should respond_to :affixe }
			it { subject.affixe.should == "test_as_phil-test_as_phil" }
			it { should respond_to :folder }
			it { subject.folder.should == File.join(FOLDER_ROADMAP, subject.affixe) }
			it { should respond_to :path_data}
			it { subject.path_data.should == file_of_folder('data.js') }
			it { should respond_to :path_data }
			it { should respond_to :path_config_generale }
			it { subject.path_config_generale.should == file_of_folder('config_generale.js')}
			it { should respond_to :path_exercices }
			it { subject.path_exercices.should == file_of_folder('exercices.js') }
			it { should respond_to :folder_exercices }
			it { subject.folder_exercices.should == file_of_folder('exercice') }
			it { should respond_to :path_exercice }
			it "doit pouvoir renvoyer la path d'un exercice" do
			  subject.path_exercice("1").should == file_of_folder('exercice/1.js')
			end
			it { should respond_to :path_image_png }
			it ":path_image_png doit retourner le path de l'image PNG" do
			  subject.path_image_png("2").should == file_of_folder('exercice/2.png')
			end
			it { should respond_to :path_image_jpg }
			it ":path_image_jpg doit retourner le path de l'image JPEG" do
			  subject.path_image_jpg("3").should == file_of_folder( 'exercice/3.jpg')
			end
			it { should respond_to :path_log }
			it { subject.path_log.should == file_of_folder( 'log.txt') }
		end
		
		describe "Data définition" do
			subject { rm_test }
			
			# get_datajs
			it { should respond_to :get_datajs }
			context "quand data.js n'existe pas" do
				subject { rm_none }
				it { subject.ip.should be_nil }
				it { subject.md5.should be_nil }
				it { subject.mail.should be_nil }
			end
			context "quand data.js existe" do
				subject { rm_test }
				it { subject.ip.should_not be_nil }
				it { subject.md5.should_not be_nil }
				it { subject.mail.should_not be_nil }
				it { subject.mail.should == DATA_PHIL[:mail] }
			end
			
			# IP
			it { should respond_to :ip }
			context "quand la rm existe" do
				subject { rm_test }
				it { subject.ip.should_not be_nil }
				it { subject.ip.gsub(/[0-9\.:]/,'').should == ""}
			end
			context "quand la rm n'existe pas" do
				subject { rm_none }
				it { subject.ip.should be_nil }
			end
			
			# md5
			it { should respond_to :md5 }
			context "quand les data existent" do
				subject { rm_test }
				it { subject.md5.should_not be_nil}
				it { subject.md5.gsub(/[0-9a-z]/,'').should == ""}
				it { subject.md5.length.should == 32 }
			end
			context "quand les data n'existent pas" do
				before { rm = rm_none }
				it { rm.md5.should be_nil }
			end
			
			# :updated_at
			describe ":updated_at" do
			  it { should respond_to :updated_at }
			  context "quand les datas existent" do
					before do
						d = JSON.parse(File.read(rm_test.path_data))
					  @updated_at = d['updated_at']
					end
			  	subject { rm_test }
					it { subject.updated_at.should_not be_nil }
					it { subject.updated_at.should == @updated_at }
			  end
			  context "quand les datas n'existent pas" do
			  	subject { rm_none }
			  	it { subject.updated_at.should be_nil }
			  end
			end
			
			# :data_exercices
			describe ":data_exercices" do
				it { should respond_to :data_exercices }
			  it "doit être testé" do
			    pending "à coder"
			  end
			end
			
			# :ordre_exercices
			describe ":ordre_exercices" do
			  it { should respond_to :ordre_exercices }
				context "quand l'ordre est défini" do
					it "doit le retourner" do
					  pending "à coder"
					end
				end
				context "quand le fichier exercices.js n'existe pas" do
					it "ne doit pas retourner nil" do
					  pending "à coder"
					end
					it "doit retourner une liste vide" do
					  pending "à coder"
					end
				end
				context "quand exercices.js existe, mais sans ordre" do
					it "doit retourner une liste vide" do
					  pending "à coder"
					end
				end
			end
			
			:set_last_update
			# :set_last_update
			describe ":set_last_update" do
				subject { rm_test }
			  it { should respond_to :set_last_update }
				it "doit actualiser la date de dernière modification de la roadmap" do
					old_updated_at = rm_test.get_datajs['updated_at']
				  sleep 1 # pour être sûr qu'elle sera différente
					rm_test.set_last_update
					new_data = JSON.parse(File.read(rm_test.path_data))
					old_updated_at.should be < new_data['updated_at']
				end
			end
			# owner?
			describe ":owner?" do
				it { should respond_to :owner? }
				context "quand les données d'authentification sont valides" do
					subject { rm_test }
					it { subject.owner?(:mail => rm_test.mail, :password => DATA_PHIL[:password]).should be_true }
				end
				context "quand les données d'authentification sont invalides" do
					it { subject.owner?(:mail => "bad", :password => "new").should be_false }
				end
			end
			
			# owner_or_admin?
			describe ":owner_or_admin?" do
			  it { should respond_to :owner_or_admin? }
				context "quand les données d'authentification sont valides" do
					subject { rm_test }
					it { subject.owner_or_admin?(:mail => rm_test.mail, :password => DATA_PHIL[:password]).should be_true }
				end
				context "quand les données d'authentification sont invalides" do
					it { subject.owner_or_admin?(:mail => "bad", :password => "new").should be_false }
				end
				context "quand c'est un administrateur (Phil)" do
					# C'est un "faux test" puisque la feuille de route est de toute façon
					# possédée par moi
					it { subject.owner_or_admin?(:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password]).should be_true }
				end
				
			end
		end
	end
end