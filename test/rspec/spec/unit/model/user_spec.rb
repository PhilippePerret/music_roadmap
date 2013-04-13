# Test Unitaire de la class User

require 'spec_helper'
require_model 'user'

require File.join(APP_FOLDER,'data','secret','data_phil') # => DATA_PHIL

describe User.new do
	describe "doit répondre à" do
	  it { should respond_to :exists? }
		it { should respond_to :md5 }
		it { should respond_to :nom }
		it { should respond_to :mail }
		it { should respond_to :set }
		it { should respond_to :data_mini }
	end
	describe "exists?" do
		it "doit renvoyer true si l'user existe" do
		  u = User.new(:mail => DATA_PHIL[:mail])
			u.should exist
		end
		it "doit renvoyer false si l'user n'existe pas" do
		  u = User.new(:mail => "unforcémentmauvais")
			u.should_not exist
		end
	end
	describe ":data_mini" do
	  it "doit retourner les data minimales" do
	    res = User.new(DATA_PHIL[:mail]).data_mini
			res.should == {
				:mail => DATA_PHIL[:mail],
				:nom	=> DATA_PHIL[:nom],
				:md5	=> DATA_PHIL[:md5]
			}
	  end
	end
end

describe User do
	
	subject { User }
	it "doit être défini" do
	  defined?(User).should be_true
	end
	
	it { should respond_to :authentify_with_mail_and_password }
	describe ":authentify_with_mail_and_password" do
	  context "avec des données d'administrateur" do
	  	it { User::authentify_with_mail_and_password(:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password]).should be_true }
	  	it { User::authentify_with_mail_and_password(:password => DATA_PHIL[:password]).should be_false }
	  end
	  context "avec de mauvaises données" do
	  	it { User::authentify_with_mail_and_password(:mail => "badmail", :password => "badpassword").should be_false }
	  	it { User::authentify_with_mail_and_password({:md5 => "mauvaismd5555"}).should be_false }
	  end
	end
	
	it { should respond_to :authentify_with_md5 }
	describe ":authentify_with_md5" do
	  context "avec des données d'administrateur" do
	  	it { User::authentify_with_md5({:md5 => DATA_PHIL[:md5]}).should be_true }
	  end
	  context "avec de mauvaises données" do
	  	it { User::authentify_with_md5({:md5 => "badmd52456987"}).should be_false }
	  end
	end
	
	it { should respond_to :authentify_as_admin }
	describe ":authentify_as_admin" do
	  context "avec des données d'administrateur" do
	  	it { User::authentify_as_admin(:mail => DATA_PHIL[:mail], :md5 => DATA_PHIL[:md5]).should be_true }
	  	it { User::authentify_as_admin(:md5 => DATA_PHIL[:md5]).should be_true }
	  end
	  context "avec de mauvaises données" do
	  	it { User::authentify_as_admin(:mail => "badmail", :md5 => "badpassword").should be_false }
	  end
	end
	
end