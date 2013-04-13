=begin
	Test unitaire des procédures de création de l'utilisateur
=end
require 'digest/md5'
require 'spec_helper'

$data_to_destroy = []

describe "Procédures de création de l'utilisateur" do
	before(:all) do
	  $data_to_destroy = []
	end
	after(:all) do
	  $data_to_destroy.each do |path|
			File.unlink path if File.exists? path
		end
	end
  describe "Pré-requis" do
    it "doit avoir son fichier" do
      path = File.join(FOLDER_PROCEDURES, 'user', 'create.rb')
			File.exists?(path).should be_true
    end
  end
	describe "Réponse aux méthodes" do
	  before(:all) do
	    require 'procedure/user/create'
	  end
		it ":user_create" do
		  expect{user_create}.not_to raise_error NameError
		end
		it ":ajax_user_create" do
		  expect{ajax_user_create}.not_to raise_error NameError
		end
	end
	describe ":user_create" do
		# Note : un appel à cette méthode doit avoir vérifié la validité
		# des données
		context "avec un utilisateur qui n'existe pas" do
			before(:all) do
		    duser = {
					:nom => "Un bon nom", 
					:mail => "lemail#{Time.now.to_i}@chez.lui", 
					:password => "pwd#{Time.now.to_i}",
					:description => "La description de l'utilisateur", 
					:instrument => "flûte à bec"
				}
				keep(:duser => duser)
				keep(:md5 => Digest::MD5.hexdigest("#{duser[:mail]}-#{duser[:instrument]}-#{duser[:password]}"))
				# Path du fichier résultat à trouver
				path = File.join(APP_FOLDER, 'user', 'data', duser[:mail])
				$data_to_destroy << path
				keep(:path => path)
				# -->
				keep(:retour => user_create(duser))
				# <--
			end
			subject{ JSON.parse(File.read(kept(:path))) }
			it "ne doit pas retourner d'erreur" do
			  kept(:retour)[0].should === true
			end
		  it "doit créer l'utilisateur" do
				File.exists?(kept(:path)).should be_true
		  end
			it "doit avoir calculé le md5" do
			  subject.should have_key 'md5'
				subject['md5'].should == kept(:md5)
			end
			it "doit avoir enregistré l'IP" do
			  subject.should have_key 'ip'
				subject['ip'].should == Params::User.ip
			end
			it "doit avoir enregistré le salt (instrument)" do
			  subject.should have_key 'salt'
				subject['salt'].should == kept(:duser)[:instrument]
			end
			it "doit retourner le md5 calculé" do
			  kept(:retour)[1].should == kept(:md5)
			end
		end
		context "avec un utilisateur existant déjà" do
			before(:all) do
			  folder = File.join(APP_FOLDER, 'user', 'data')
				path_first = Dir["#{folder}/*"].first
				dfirst = JSON.parse(File.read(path_first)).to_sym
				# -->
				keep(:retour => user_create(dfirst))
			end
			it "doit retourner false en premier argument" do
				kept(:retour)[0].should == false
			end
			it "doit retourner l'erreur en seconde donnée" do
			  kept(:retour)[1].should == "ERRORS.User.Signup.already_exists"
			end
		end
		
	end

	describe ":ajax_user_create" do
	  context "avec des données valides" do
			before(:all) do
				RETOUR_AJAX[:error] = nil
				sleep 1
		    duser = {
					:nom => "Un bon nom", 
					:mail => "lemail#{Time.now.to_i}@chez.lui", 
					:password => "pwd#{Time.now.to_i}",
					:description => "La description de l'utilisateur", 
					:instrument => "flûte à bec"
				}
				keep(:duser => duser)
				keep(:md5 => Digest::MD5.hexdigest("#{duser[:mail]}-#{duser[:instrument]}-#{duser[:password]}"))
				# Path du fichier résultat à trouver
				path = File.join(APP_FOLDER, 'user', 'data', duser[:mail])
				$data_to_destroy << path
				keep(:path => path)
				Params.set_params(:user => duser)
				# -->
				ajax_user_create
				# <--
			end
			it "doit créer l'utilisateur" do
			  File.exists?(kept(:path)).should be_true
			end
			it "doit enregistrer les bonnes données" do
			  duser = JSON.parse(File.read(kept(:path)))
				[:mail, :password, :instrument].each do |key|
					duser[key.to_s].should == kept(:duser)[key]
				end
				# Nouvelles données
				duser['md5'].should 	== kept(:md5)
				duser['salt'].should 	== kept(:duser)[:instrument]
				duser['ip'].should 		== Params::User.ip
			end
			it "ne doit pas retourner d'erreur" do
			  RETOUR_AJAX[:error].should be_nil
			end
			it "doit remonter le md5 de l'utilisateur" do
			  RETOUR_AJAX[:user].should_not be_nil
				RETOUR_AJAX[:user].should == {:md5 => kept(:md5)}
			end
	  end
	  context "avec des données invalides" do
	  	context "comme un utilisateur existant déjà" do
				before(:all) do
				  folder = File.join(APP_FOLDER, 'user', 'data')
					path_first = Dir["#{folder}/*"].first
					dfirst = JSON.parse(File.read(path_first)).to_sym
					Params.set_params(:user => dfirst)
					# -->
					ajax_user_create
					# <--
				end
				it "doit retourner le bon message d'erreur" do
					RETOUR_AJAX[:error].should == "ERRORS.User.Signup.already_exists"
				end
				it "doit mettre :user à nil" do
				  RETOUR_AJAX[:user].should be_nil
				end
	  	end
	  	context "car incomplètes" do
	  		before(:all) do
					RETOUR_AJAX[:error] = nil
	  		  Params.set_params(:user => {:mail => "unmail@bon.chez"})
					ajax_user_create
	  		end
				it "doit retourner le bon message d'erreur" do
				  RETOUR_AJAX[:error].should == "ERRORS.User.password_required"
				end
				it "doit mettre :user à nil" do
				  RETOUR_AJAX[:user].should be_nil
				end
	  	end
	  	
	  end
	  
	end

end