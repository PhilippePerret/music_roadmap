
# Test utitaire des méthodes utiles à l'inscription de l'utilisateur
require 'spec_helper'
	
describe "Procédures d'inscription de l'utilisateur" do
	include_examples "javascript", "User"
	before :all do
		goto_home :lang => 'fr'
	end
	describe ":prepare_signup_form" do
	  it { should_respond_to :prepare_signup_form }
		before :all do
			# On demande l'affichage du formulaire
			JS.run 'Aide.init(true)'
	    run 'new'
			Watir::Wait.while{ "Aide.loading".js }
			# On efface le contenu du formulaire et on le remplace par
			# un texte facilement remplaçable et testable
			new_html = '<tr><td id="signup_label_name">SIGNUP_LABEL_NAME</td></tr>'
			new_html += '<tr><td id="signup_label_mail">SIGNUP_LABEL_MAIL</td></tr>'
			new_html += '<tr><td><a id="signup_button_name">SIGNUP_BUTTON_NAME</a></td></tr>'
			JS.run( "$('div#user_signup_form > table').html('#{new_html}')" )
		  # On vérifie un peu
			signup_form.td(:text => 'SIGNUP_LABEL_NAME').should exist
			# -->
			run 'prepare_signup_form'
			Watir::Wait.while{ "User.preparing_form".js }
			screenshot "signup-form-prepared"
		end
		it "doit remplacer les labels" do
		  signup_form.td(:text => 'SIGNUP_LABEL_NAME').should_not exist
			signup_form.td(:id => 'signup_label_name').text.should == "Votre nom"
		  signup_form.td(:text => 'SIGNUP_LABEL_MAIL').should_not exist
			signup_form.td(:id => 'signup_label_mail').text.should =~ /Votre mail/
		end
		it "doit remplacer le nom du bouton" do
			signup_form.a(:id => 'signup_button_name').text.should_not == "SIGNUP_BUTTON_NAME"
			signup_form.a(:id => 'signup_button_name').text.should == "S'inscrire"
		end
	end
	describe ":new" do
	  it { should_respond_to :new }
	  before(:all) do
			JS.run "$('section#aide div#aide_content').html('')"
			JS.run 'Aide.init(true)'
	    run 'new'
			Watir::Wait.while{ "Aide.loading".js }
			screenshot "signup-form"
	  end
		describe "doit avoir été préparé" do
			it "doit avoir traduit les labels" do
			  onav.div(:id => 'user_signup_form').html.should_not =~ /SIGNUP_BUTTON_NAME/
			end
		end
		describe "doit afficher" do
			it "un formulaire d'inscription" do
			  onav.div(:id => 'user_signup_form').should exist
			end
			it "un champ pour entrer son nom" do
			  onav.text_field(:id => 'user_nom').should exist
			end
			it "un champ pour entrer son mail" do
			  onav.text_field(:id => 'user_mail').should exist
			end
			it "un champ pour entrer la confirmation de son mail" do
			  onav.text_field(:id => 'user_mail_confirmation').should exist
			end
			it "un champ pour entrer son mot de passe" do
			  onav.text_field(:id => 'user_password').should exist
			end
			it "un champ pour entrer la confirmation de son mot de passe" do
			  onav.text_field(:id => 'user_password_confirmation').should exist
			end
			it "un bouton pour s'inscrire" do
			  onav.a(:id => 'signup_button_name').should exist
			end
		end
	end
	describe ":create" do
	  it { should_respond_to :create }
		it { property_should_exist :creating }
		describe "doit avoir" do
			before :all do
			  # Le formulaire d'aide
				# Note : on ne l'ouvre que pour voir s'il sera fermé et
				# détruit à la fin de l'opération
				JS.run "$('section#aide div#aide_content').html('')"
				JS.run 'Aide.init(true)'
		    run 'new'
				Watir::Wait.while{ "Aide.loading".js }
				keep(
					:nom => "monnom", :password => "unmotdepasse#{Time.now.to_i}",
					:mail => "unbonmail#{Time.now.to_i}@chez.lui", :description => "", 
					:instrument => "piano"
					)
				keep(:md5 => Digest::MD5.hexdigest("#{kept(:mail)}-#{kept(:instrument)}-#{kept(:password)}"))
				keep(:path => File.join(APP_FOLDER, 'user', 'data', kept(:mail)))
				File.exists?(kept(:path)).should be_false
				$files_to_destroy << kept(:path)
				# -->
				run "create({nom:'#{kept(:nom)}',mail:'#{kept(:mail)}',password:'#{kept(:password)}',description:'#{kept(:description)}',instrument:'#{kept(:instrument)}'})"
				Watir::Wait.while{ "User.creating".js }
				# <--
				screenshot "create-success"
			end
			it "créé l'utilisateur" do
				File.exists?(kept(:path)).should be_true
				duser = JSON.parse(File.read(kept(:path)))
				duser.should have_key 'mail'
				duser['mail'].should == kept(:mail)
				duser.should have_key 'md5'
				duser['md5'].should == kept(:md5)
				duser.should have_key 'salt'
				duser['salt'].should == kept(:instrument)
				duser.should have_key 'ip'
				duser['ip'].should == "::1"
			end
			it "affiché le message de réussite" do
			  flash_should_contain "MESSAGE.User.created".js, :notice
			end
			it "avoir supprimé le div du formulaire d'aide" do
				onav.div(:id => 'user_signup_form').should_not exist
			end
			it "avoir fermé la fenêtre d'aide" do
				onav.section(:id => 'aide').should_not be_visible
			end
		end
	end
	describe ":end_create" do
	  it { should_respond_to :end_create }
		context "en cas de réussite" do
			describe "doit" do
				before(:all) do
					keep(:md5 => "0e1e23e54e")
					# -->
					run "end_create({user:{md5:'#{kept(:md5)}'},error:null})"
				end
				it "avoir mis creating à false" do
				  get_property(:creating).should === false
				end
				it "afficher le message de succès" do
				  flash_should_contain "MESSAGE.User.created".js#, :notice
				end
				it "avoir défini le md5 de l'utilisateur" do
				  get_property(:md5).should_not be_nil
					get_property(:md5).should == kept(:md5)
				end
			end
		end
		context "en cas d'échec" do
			describe "doit" do
				before(:all) do
					set_property(:md5 => nil)
					get_property(:md5).should be_nil
					keep(:md5 => "0e1e23e54e")
					# -->
					run "end_create({user:{md5:'#{kept(:md5)}'},error:'Une erreur'})"
				end
				it "afficher le message d'erreur" do
				  flash_should_contain 'Une erreur', :warning
				end
				it "laisser md5 à nil" do
				  get_property(:md5).should be_nil
				end
			end
		end
		
	end
	describe ":check_data" do
		before(:all) do
		  # Avec cette méthode, il faut passer par de la pseudo intégration
			# puisqu'il faut utiliser le formulaire
			JS.run "$('section#aide div#aide_content').html('')"
			JS.run 'Aide.init(true)'
	    run 'new'
			Watir::Wait.while{ "Aide.loading".js }
			keep(
				:nom 					=> "mon Nom \"guillemets\"", 
				:password 		=> "unmotdepasse#{Time.now.to_i}",
				:mail 				=> "unbonmail@chez.lui", 
				:description 	=> "Une description de \"l'utilisateur\"", 
				:instrument 	=> "piano et \"flûte\""
				)
			keep(
				:nom_corrected 					=> "mon Nom “guillemets”",
				:description_corrected 	=> "Une description de “l’utilisateur”",
				:instrument_corrected 	=> "piano et “flûte”"
			)
		end
		context "Avec des données valides" do
			before(:all) do
				signup_form.text_field(:id =>'user_nom').set kept(:nom)
				signup_form.text_field(:id =>'user_mail').set kept(:mail)
				signup_form.text_field(:id =>'user_mail_confirmation').set kept(:mail)
				signup_form.text_field(:id =>'user_password').set kept(:password)
				signup_form.text_field(:id =>'user_password_confirmation').set kept(:password)
				signup_form.text_field(:id =>'user_description').set kept(:description)
				signup_form.text_field(:id =>'user_instrument').set kept(:instrument)
			end
			# -->
			subject { run 'check_data' }
			it "doit avoir corrigé un nom avec guillemets" do
			  subject['nom'].should == kept(:nom_corrected)
			end
			it "doit avoir corrigé une description avec guillemets" do
			 	subject['description'].should == kept(:description_corrected)
			end
			it "doit avoir corrigé un instrument avec guillemets" do
			  subject['instrument'].should == kept(:instrument_corrected)
			end
			it "doit retourner le hash des data à enregistrer" do
				if subject == false
					raise "User.check_data() devrait renvoyer le hash, mais a renvoyé false avec l'erreur :" +
								onav.div(:id => 'inner_flash').html
					
				else
				  subject.should == {
					'nom' 				=>kept(:nom_corrected), 
					'mail'				=>kept(:mail),
					'password' 		=>kept(:password), 
					'description'	=>kept(:description_corrected),
					'instrument'	=>kept(:instrument_corrected)
					}
				end
			end
		end
		context "avec un mauvais" do
			before(:each) do
				signup_form.text_field(:id =>'user_nom').set kept(:nom)
				signup_form.text_field(:id =>'user_mail').set kept(:mail)
				signup_form.text_field(:id =>'user_mail_confirmation').set kept(:mail)
				signup_form.text_field(:id =>'user_password').set kept(:password)
				signup_form.text_field(:id =>'user_password_confirmation').set kept(:password)
				signup_form.text_field(:id =>'user_description').set kept(:description)
				signup_form.text_field(:id =>'user_instrument').set kept(:instrument)
			end
			it "nom doit lever la bonne erreur et retourner false" do
				signup_form.text_field(:id =>'user_nom').set ""
				"User.check_data()".js.should === false
				flash_should_contain "ERRORS.User.Signup.bad_name".js, :warning
			end
			it "mail doit lever la bonne erreur et retourner false" do
				signup_form.text_field(:id =>'user_mail').set ""
				"User.check_data()".js.should === false
				flash_should_contain "ERRORS.User.Signup.bad_mail".js, :warning
			end
			it "mail confirmation doit lever la bonne erreur" do
				signup_form.text_field(:id =>'user_mail_confirmation').set ""
				run 'check_data'
				flash_should_contain "ERRORS.User.Signup.bad_mail_confirmation".js, :warning
			end
			it "mot de passe doit lever la bonne erreur" do
				signup_form.text_field(:id =>'user_password').set ""
				run 'check_data'
				flash_should_contain "ERRORS.User.Signup.bad_password".js, :warning
			end
			it "confirmation mot de passe doit lever la bonne erreur" do
				signup_form.text_field(:id =>'user_password_confirmation').set "unmaivse"
				run 'check_data'
				flash_should_contain "ERRORS.User.Signup.bad_pwd_confirmation".js, :warning
			end
		end
		
		
	end
end
