# Test des procédures de destruction

require 'digest/md5'

require 'spec_helper'
require_model 'roadmap'
require_model 'user'

require File.join(APP_FOLDER,'data','secret','data_phil') # => DATA_PHIL

describe "Procédures de destruction" do
	before(:all) do
	  require 'procedure/roadmap/destroy'
	end
	before :all do
		user 	= User.new "benoit.ackerman@yahoo.fr"
		keep(:mail 	=> user.mail)
		keep(:passw => user.password)
		keep(:md5 	=> user.md5)
		kept(:mail).should 	== "benoit.ackerman@yahoo.fr"
		kept(:md5).should 	== "730f9faacc270dd4dc565ebccd6bb456"
	end
  it "doit avoir son fichier" do
    procedure_should_exist 'roadmap/destroy'
  end
	it "doit répondre à roadmap_destroy" do
	  expect{roadmap_destroy}.not_to raise_error NameError
	end
	it "doit répondre à ajax_roadmap_destroy" do
	  expect{ajax_roadmap_destroy}.not_to raise_error NameError
	end
	def build_roadmap_asup
    folder = File.join(FOLDER_ROADMAP, 'asup-asup')
		keep(:folder => folder)
		unless File.exists? folder
			Dir.mkdir(folder, 0777)
			$roadmaps_to_destroy << folder
			rm 		= Roadmap.new "asup", "asup"
			data = {
				:nom 				=> "asup",
				:mdp 				=> "asup",
				:mail 			=> kept(:mail),
				:salt				=> "roadmap",
				:ip 				=> Params::User.ip,
				:md5				=> kept(:md5)
			}
			keep(:data => data)
			File.open(rm.path_data, 'wb'){|f| f.write(data.to_json)}
		end
	end
	describe "roadmap_destroy" do
		context "avec une feuille de route inexistante" do
			before :all do
				build_roadmap_asup
			end
			it "doit retourner le bon message d'erreur" do
			  res = roadmap_destroy Roadmap.new("destroy#{Time.now.to_i}", "destroy#{Time.now.to_i}"), {}
				res.should == "ERRORS.Roadmap.unknown"
			end
		end
		
		context "avec des données d'authentification valides (possesseur)" do
			before :all do
				build_roadmap_asup
				@res = roadmap_destroy Roadmap.new("asup","asup"), {:mail => kept(:mail), :md5 => kept(:md5)}
			end
			it { @res.should be_nil }
			it "a dû détruire le dossier" do
				File.exists?(kept(:folder)).should be_false
			end
		end
		
		context "avec des données d'administrateur" do
			before :all do
				build_roadmap_asup
				@res = roadmap_destroy Roadmap.new("asup","asup"), {:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password], :md5 => DATA_PHIL[:md5]}
			end
			it { @res.should be_nil }
			it "a dû détruire le dossier" do
				File.exists?(kept(:folder)).should be_false
			end
		end
		
		
		context "avec des données d'authentification invalides" do
			before :all do
				build_roadmap_asup
				@res = roadmap_destroy Roadmap.new("asup","asup"), {:mail => 'badmail', :md5 => "badmd5"} 
			end
			it { @res.should_not be_nil }
			it { @res.should == "ERRORS.Roadmap.bad_owner" }
			it "n'a pas dû détruire le dossier de la roadmap" do
				File.exists?(kept(:folder)).should be_true
			end
		end
		
	end
	
	describe "ajax_roadmap_destroy" do
		context "avec des données d'authentification valides par mail et mot de passe" do
			before :all do
				init_retour_ajax
		    build_roadmap_asup
				Params.set_params(
					:roadmap_nom 	=> "asup",
					:roadmap_mdp 	=> "asup",
					:mail 				=> kept(:mail), 
					:md5 					=> kept(:md5) 
				)
				ajax_roadmap_destroy
			end
			it "doit bien détruire la roadmap" do
			  File.exists?(kept(:folder)).should be_false
			end
			it "ne doit pas renvoyer de message d'erreur" do
			  RETOUR_AJAX[:error].should be_nil
			end
		end
		context "avec des données d'authentification valides par md5" do
			before :all do 
				init_retour_ajax
		    build_roadmap_asup
				Params.set_params(
					:roadmap_nom 	=> "asup",
					:roadmap_mdp 	=> "asup",
					:mail					=> kept(:mail),
					:md5 					=> kept(:md5)
				)
				ajax_roadmap_destroy
			end
			it "doit bien détruire la roadmap" do
			  File.exists?(kept(:folder)).should be_false
			end
			it "ne doit pas renvoyer de message d'erreur" do
			  RETOUR_AJAX[:error].should be_nil
			end
		end
		context "avec des données d'authentification invalides" do
			before :all do 
				init_retour_ajax
		    build_roadmap_asup
				Params.set_params(
					:roadmap_nom 	=> "asup",
					:roadmap_mdp 	=> "asup",
					:mail 				=> "verybadmail", 
					:password 		=> "worstpassword",
					:md5					=> "0123654789"
				)
				ajax_roadmap_destroy
			end
			it "NE doit PAS détruire la roadmap" do
			  File.exists?(kept(:folder)).should be_true
			end
			it "doit renvoyer un message d'erreur" do
			  RETOUR_AJAX[:error].should_not be_nil
				RETOUR_AJAX[:error].should == "ERRORS.Roadmap.bad_owner"
			end
		end
		
		context "avec une feuille de route inexistante" do
			before :all do
				init_retour_ajax
		    build_roadmap_asup
				Params.set_params(
					:roadmap_nom 	=> "ajaxdestroy#{Time.now.to_i}", 
					:roadmap_mdp 	=> "password",
					:mail					=> "unmauvaismail",
					:password			=> "aunpwde"
					)
			end
			it "doit retourner le bon message d'erreur" do
			  res = roadmap_destroy Roadmap.new("destroy#{Time.now.to_i}", "destroy#{Time.now.to_i}"), {}
				res.should == "ERRORS.Roadmap.unknown"
			end
		end
		
		
	end
end