=begin

	Test unitaire de la procédure user/load
	
=end
require 'spec_helper'

require File.join(APP_FOLDER,'data','secret','data_phil.rb') # => DATA_PHIL

describe "Procédures user/load" do
	before(:all) do
	  require 'procedure/user/load'
	end
	describe "Pré-requis" do
		before :all do
		  Params.set_params(:user => {'mail' => nil, 'password' => nil})
		end
		it { File.exists?(File.join(FOLDER_PROCEDURES,'user','load.rb')).should be_true }
		it "doit répondre à :user_load" do
		  expect{user_load('mail')}.not_to raise_error NameError
		end
		it "doit répondre à :ajax_user_load" do
		  expect{ajax_user_load}.not_to raise_error NameError
		end
	end
	describe ":user_load" do
		context "avec des données invalides" do
			it "doit retourner nil si l'user est inconnu" do
			  res = user_load('unmailcomplètement@nil','badpassword')
				res.should be_nil
			end
			it "doit retourner nil si le mail manque" do
			  res = user_load(nil,'badpassword')
				res.should be_nil
			end
			it "doit retourner nil si le password manque" do
			  res = user_load('unmailcomplètement@nil',nil)
				res.should be_nil
			end
			it "doit retourner nil si le password ne matche pas" do
			  res = user_load(DATA_PHIL[:mail],'maisbadpassword')
				res.should be_nil
			end
		end
		
	  context "avec des données valides" do
	  	before(:each) do
	  	  keep(:duser => user_load(DATA_PHIL[:mail],DATA_PHIL[:password]))
	  	end
			describe "doit retourner un hash de données" do
				subject { kept(:duser) }
			  it { subject.class.should == Hash }
				it { subject.should have_key :nom }
				it { subject[:nom].should == DATA_PHIL[:nom] }
			end
	  end
	end
	
	describe ":ajax_user_load" do
		context "avec des données invalides" do
		  before(:all) do
		    require 'procedure/user/load'
				Params.set_params(:user => {'mail' => "unmailnimporte@quoi", 'password' => "bad"})
				# -->
				ajax_user_load
				# <--
		  end
			it "ne doit pas définir user" do
			  RETOUR_AJAX[:user].should be_nil
			end
			it "doit mettre une erreur" do
			  RETOUR_AJAX[:error].should == "ERRORS.User.unknown"
			end
		end
		
	  context "avec des données valides" do
	  	before(:all) do
				require 'procedure/user/load'
				Params.set_params(:user => {'mail' => DATA_PHIL[:mail], 'password' => DATA_PHIL[:password]})
				# -->
				ajax_user_load
				# <--
	  	end
			describe "doit retourner un hash de données" do
				subject { RETOUR_AJAX[:user] }
			  it { subject.class.should == Hash }
				it { subject.should have_key :nom }
				it { subject[:nom].should == DATA_PHIL[:nom] }
			end
	  end
	end
end