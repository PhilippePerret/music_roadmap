# Test Unitaire de l'objet JS User

require 'spec_helper'

describe "Objet JS User" do
	def init_user
		set_property(:nom => nil)
		set_property(:md5 => nil)
		set_property(:identified => false)
		get_property(:nom).should be_nil
		get_property(:md5).should be_nil
		get_property(:identified).should == false
	end
  include_examples "javascript", "User"

	describe ":reset" do
	  # :reset
		it { should_respond_to :reset }
		it "doit réinitialiser les données de l'user" do
	    JS.run "User.set({md5:'unmd5',nom:'son nom',identified:true})"
			get_property(:md5).should_not be_nil
			get_property(:nom).should_not be_nil
			get_property(:identified).should be_true
			# -->
			run "reset"
			# <--
			get_property(:md5).should be_nil
			get_property(:nom).should be_nil
			get_property(:identified).should be_false
		end
	end
	describe ":set" do
		it { should_respond_to :set }
		it "doit permettre de définir les données de l'utilisateur" do
			init_user
			# -->
		  run 'set', {:md5 => "012365478", :identified => true}
			# <--
			get_property(:md5).should == "012365478"
			get_property(:identified).should == true
		end
	end
  
	describe "Méthodes d'identification" do
	 	it { should_respond_to :is_identified }
		it { should_respond_to :is_not_identified }
		it { should_respond_to :need_to_signin }
		it { should_respond_to :is_not_owner }
		it { property_should_exist :preparing_form }
		
		context "quand user identifié et propriétaire de la roadmap" do
			# 
			# 	Contexte "normal", avec un user propriétaire de la roadmap
			# 	courante
			# 
			before :all do
			  remove_aide
				open_roadmap('testable', 'testable', {:as_owner => true})
				@retour = run 'is_not_owner'
			end
			it "doit retourner false" do
			  @retour.should === false
			end
			it "ne doit pas afficher le formulaire d'identification" do
			  signin_form.should_not exist
			end
		end
		
		context "user identifié (mais non propriétaire)" do
			before :all do
				remove_aide
			  open_roadmap('testable','testable', {:as_owner => false})
			end
			it ":is_identified retourner true" do
				run('is_identified').should be_true
			end
			it ":need_to_signin doit retourner false" do
			  run('need_to_signin').should be_false
			end
			it ":is_not_identified doit retourner false" do
			  run('is_not_identified').should === false
			end
			describe ":is_not_owner" do
				before :all do
				  @retour = run 'is_not_owner'
				end
			  it "doit retourner true" do
			    @retour.should === true
			  end
				it "ne doit pas afficher le formulaire d'identification" do
				  boite_identification.should_not exist
				end
			end
		end
		
		context "quand user non identifié" do
			before :all do
				reset_user
			end
			it "is_identified doit retourner false" do
			  run('is_identified').should === false
			end
			it "is_not_identified doit retourner true" do
			  run('is_not_identified').should === true
			end
			describe ":is_not_owner" do
				before :all do
					remove_aide
				  @retour = run 'is_not_owner'
					Watir::Wait.until{ signin_form.exists? }
					Watir::Wait.while{ "User.preparing_form".js }
				end
			  it "doit retourner true" do
			    @retour.should === true
			  end
				it "doit afficher la boite d'identification/inscription" do
					signin_form.should exist
				  signin_form.should be_visible
				end
			end
			describe ":need_to_signin" do
				before :all do
					nav.reload_page
					@retour = run 'need_to_signin'
					Watir::Wait.until{ signin_form.exists? }
					Watir::Wait.while{ "User.preparing_form".js }
				end
				it "doit retourner true" do
				  @retour.should be_true
				end
				it "doit afficher le message d'erreur" do
				  flash_should_contain "ERRORS.User.need_to_signin".js, :warning
				end
				it "doit afficher le formulaire d'identification" do
					signin_form.should exist
					signin_form.should be_visible
				end
			end
		end
	end
end