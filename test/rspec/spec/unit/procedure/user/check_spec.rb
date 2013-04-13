=begin

	Test unitaire des procédures de check de l'user

=end
require 'spec_helper'
require File.join(APP_FOLDER, 'data', 'secret', 'data_phil.rb') # => DATA_PHIL

describe "Procédures d'identification de l'utilisateur" do
  describe "Pré-requis" do
    it "le fichier procédure doit exister" do
      path = File.join(FOLDER_PROCEDURES, 'user', 'check.rb')
			File.exists?(path).should be_true
    end
		describe "doit répondre à" do
		  before(:all) do
		    require 'procedure/user/check'
		  end
			it ":user_check" do
			  expect{user_check}.not_to raise_error NameError
			end
			it ":ajax_user_chec" do
			  expect{ajax_user_check}.not_to raise_error NameError
			end
		end
  end

	describe ":user_check" do
		before(:all) do
		  require 'procedure/user/check'
		end
	  context "en cas de validité" do
			before(:all) do
				@hdata = {:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password]}
			end
			subject { user_check @hdata }
	  	it "doit retourner [true, <md5>]" do
				subject.should == [true, 
						{:md5=>DATA_PHIL[:md5],:nom=>DATA_PHIL[:nom],:mail=>DATA_PHIL[:mail]}]
	  	end
	  end
	  context "doit retourner le bon message d'erreur quand" do
	  	it "mail non fourni" do
				res = user_check(:mail => nil, :password => DATA_PHIL[:password])
	  	  res.should == [false, 'ERRORS.User.mail_required']
	  	end
			it "password non fourni" do
				res = user_check(:mail => DATA_PHIL[:mail], :password => nil)
	  	  res.should == [false, 'ERRORS.User.password_required']
			end
			it "mail inconnu fourni" do
				res = user_check(:mail => "unkownmail@chez.lui", :password => "unpasse")
	  	  res.should == [false, 'ERRORS.User.unknown']
			end
			it "le mot de passe ne correspond pas" do
				res = user_check(:mail => DATA_PHIL[:mail], :password => "unbadpasse")
	  	  res.should == [false, 'ERRORS.User.unknown']
			end
	  end
	  
	end

	describe ":ajax_user_check" do
		before(:all) do
		  require 'procedure/user/check'
		end
	  context "en cas de succès" do
			before(:all) do
				RETOUR_AJAX[:error] = nil
				RETOUR_AJAX[:user] 	= nil
			  Params.set_params(
					:user => {:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password]})
				ajax_user_check
			end
			it "doit laisser :error à nil" do
			  RETOUR_AJAX[:error].should be_nil
			end
	  	it "doit mettre le md5 et le nom dans :user" do
	  	  RETOUR_AJAX[:user].should == 
					{:md5 => DATA_PHIL[:md5], :nom => DATA_PHIL[:nom], :mail => DATA_PHIL[:mail]}
	  	end
	  end
	  context "en cas d'échec" do
	  	before(:all) do
				RETOUR_AJAX[:error] = nil
				RETOUR_AJAX[:user] 	= nil
				Params.set_params(:user => {:mail => "pasbon", :password => "inv alide"})
	  		ajax_user_check
	  	end
			it "doit mettre :user à nil" do
			  RETOUR_AJAX[:user].should == nil
			end
			it "doit mettre l'erreur dans :error" do
			  RETOUR_AJAX[:error].should_not be_nil
			end
	  end
	  
	end

end