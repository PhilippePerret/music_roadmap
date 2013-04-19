=begin

	Test unitaire des méthodes d'identification de l'utilisateur

=end
require 'spec_helper'

describe "Méthodes JS d'identification de l'user" do
	before :all do
	  goto_home :lang => 'en'
	end
  include_examples "javascript", "User"
	describe "Pré-requis" do
	  describe "doit répondre à" do
	    it { should_respond_to :signin }
			it { should_respond_to :check }
			it { should_respond_to :retour_check }
			it { should_respond_to :prepare_signin_form }
	  end 
		it { property_should_exist :checking }
		it "doit avoir une vue contenant le formulaire" do
		  path = File.join(APP_FOLDER, 'data', 'aide', 'user', 'signin_form.html')
			File.exists?(path).should be_true
		end
	end
	describe ":signin" do
		before :all do
			JS.run "Aide.init(true)"
			flash_clean
		  run 'signin'
			Watir::Wait.while{ "Aide.loading".js }
		end
		describe "le formulaire" do
		  it "doit s'afficher" do
		    signin_form.should exist
				signin_form.should be_visible
		  end
			describe "doit contenir" do
			  it "le champ :user_mail" do
			    signin_form.text_field(:id => 'user_mail').should exist
			  end
				it "le champ :user_password" do
				  signin_form.text_field(:id => 'user_password').should exist
				end
				it "le bouton pour s'identifier" do
				  signin_form.a(:id => 'btn_signin').should exist
				end
				it "le lien pour s'inscrire" do
				  signin_form.a(:id => 'btn_signup').should exist
				end
			end
		end
	end
	
	describe ":check" do
	  # Check des data données par l'utilisateur
		context "dans tous les cas" do
			it "doit mettre checking à true" do
			  run 'check'
				get_property(:checking).should === true
			end
		end
		
		context "en cas de données correctes" do
			before :all do
				JS.run "Aide.init(true)"
				flash_clean
				require File.join(APP_FOLDER, 'data', 'secret', 'data_phil.rb')
				data = {:mail => DATA_PHIL[:mail], :password => DATA_PHIL[:password]}
			  keep(:data => data)
				# -->
				run "check(#{data.to_json})"
				Watir::Wait.while{ "User.checking".js }
				# <--
			end
			it "doit afficher le message d'accueil" do
				flash_should_contain 'MESSAGE.User.welcome'.js
			end
			it "doit détruire le formulaire d'identification" do
			  signin_form.should_not exist
			end
			it "doit fermer la fenêtre d'aide" do
			  onav.section(:id => 'aide').should_not be_visible
			end
			it "doit régler le md5" do
			  get_property(:md5).should_not be_nil
				get_property(:md5).should == DATA_PHIL[:md5]
			end
		end
		context "en cas de données incorrectes" do
			pending "à coder"
		end
		
	end
	
	describe ":retour_check" do
		context "dans tous les cas" do
			before :all do
				nav.reload_page
			  run 'retour_check({user:{md5:null,nom:null},error:null})'
				Watir::Wait.while{ "User.checking".js }
			end
		  it "doit mettre checking à false" do
				get_property(:checking).should === false
		  end
		end
		context "en cas d'identification correcte" do
			before :all do
				JS.run "Aide.init(true)"
				flash_clean
				set_property(:md5 => "untrucpourvoir")
				keep(:md5 => "unmd5fictif")
				# -->
			  run 'retour_check({user:{md5:"unmd5fictif",nom:"un nom",mail:"mon@mail.com"},error:null})'
				Watir::Wait.while{ "User.checking".js }
			end
			it "doit afficher le message de bienvenue" do
			  flash_should_contain 'MESSAGE.User.welcome'.js, :notice
			end
			it "doit régler le md5 de l'user" do
			  get_property(:md5).should == kept(:md5)
			end
			it "doit régler le mail de l'user" do
			  get_property(:mail).should == "mon@mail.com"
			end
			it "doit détruire le formulaire" do
			  signin_form.should_not exist
			end
			it "doit fermer la fenêtre d'aide" do
			  onav.section(:id => 'aide').should_not be_visible
			end
		end
		context "en cas d'identification incorrecte" do
			before :all do
				set_property(:md5 => nil, :mail => nil)
				JS.run "Aide.init(true)"
				flash_clean
				run 'signin' # pour afficher le formulaire
				Watir::Wait::while{ "User.preparing_form".js }
				signin_form.should exist
				screenshot "signin-bad-ident"
				# -->
			  run 'retour_check({user:{md5:null,nom:null,mail:null},error:"Une erreur d’identification est survenue"})'
			end
			it "doit afficher le message d'erreur" do
			  flash_should_contain "Une erreur d’identification est survenue", :warning
			end
			it "doit régler le md5 à nil" do
			  get_property(:md5).should be_nil
			end
			it "ne doit pas détruire le formulaire" do
			  signin_form.should exist
				signin_form.should be_visible
			end
			it "ne doit pas fermer la fenêtre d'aide" do
			  onav.section(:id => 'aide').should be_visible
			end
		end
		
	end
end