# Tests généraux de l'objet JS Roadmap

require 'spec_helper'

describe "Objet JS Roadmap" do
	include_examples "javascript", 'Roadmap'

	before :all do
	  goto_home :lang => 'fr'
	end
	
	describe "(méthodes généralistes)" do
		it { should_respond_to :init }
		it ":init doit initialiser la feuille de route (aucune pour le moment)" do
		  # Testé par les autres méthodes, puisque celle-ci ne fait rien en
			# en particulier. On peut savoir qu'elle fait son travail si le test
			# d'intégration de la page d'accueil présente une page d'accueil valide
		end
		describe ":reset_all" do
		  before do
				set_property(:nom => "unnom", :mdp => "unmdp", :md5 => "unmd5fictif", 
					:loaded => true, :specs_modified => true, :modified => true)
			  get_property(:md5).should == "unmd5fictif"
				get_property(:nom).should == "unnom"
				get_property(:mdp).should == "unmdp"
				get_property(:loaded).should be_true
				run 'reset_all'
			end
			it "doit mettre nom à nil" do
				get_property(:nom).should === nil
			end
			it "doit mettre mdp à nil" do
				get_property(:mdp).should === nil
			end
			it "doit mettre md5 à nil" do
			  get_property(:md5).should === nil
			end
			it "doit mettre loaded à false" do
			  get_property(:loaded).should === false
			end
			it "doit mettre :specs_modified à false" do
			  get_property(:specs_modified).should === false
			end
			it "doit mettre :modified à false" do
			  get_property(:modified).should === false
			end
			it "doit régler les boutons de la roadmap" do
			  pending "à coder"
			end
			it "doit initialiser les Roadmap.Data" do
			  pending "à coder"
			end
		end
		describe "nom et mdp" do
			before :each do
			  run 'set_div_specs(true)' # pour voir les specs
			end
		  it { should_respond_to :get_nom }
		  it { should_respond_to :get_mdp }
		  it { should_respond_to :get }
			it { should_respond_to :affixe }
			describe ":get_nom" do
				it "doit retourner le nom défini dans l'interface et définir la prop .nom" do
				  onav.text_field(:id => 'roadmap_nom').set ""
					"Roadmap.get_nom()".js.should be_nil
					"Roadmap.nom".js.should be_nil
				  onav.text_field(:id => 'roadmap_nom').set "le-nom"
					"Roadmap.get_nom()".js.should == "le-nom"
					"Roadmap.nom".js.should == "le-nom"
				end
			end
			
			describe ":get_mdp" do
				it "doit retourner le mot de passe défini dans l'interface et définir .mdp" do
				  onav.text_field(:id => 'roadmap_mdp').set ""
					"Roadmap.get_mdp()".js.should be_nil
					"Roadmap.mdp".js.should be_nil
				  onav.text_field(:id => 'roadmap_mdp').set "le-mdp"
					"Roadmap.get_mdp()".js.should == "le-mdp"
					"Roadmap.mdp".js.should == "le-mdp"
				end
			end
			
			describe ":get" do
				it "doit retourner le nom/mdp définis dans l'interface" do
				  onav.text_field(:id => 'roadmap_nom').set ""
				  onav.text_field(:id => 'roadmap_mdp').set ""
					# -->
					JS.run "Roadmap.get()"
					# Vérification
					"Roadmap.nom".js.should be_nil
					"Roadmap.mdp".js.should be_nil
					# Autre cas
				  onav.text_field(:id => 'roadmap_nom').set "le-nom-2"
				  onav.text_field(:id => 'roadmap_mdp').set "le-mdp-2"
					# -->
					JS.run "Roadmap.get()"
					# Vérification
					"Roadmap.nom".js.should == "le-nom-2"
					"Roadmap.mdp".js.should == "le-mdp-2"
				end
			end
			
			describe ":affixe" do
				it "doit retourner l'affixe de la feuille de route" do
				  JS.run "Roadmap.set('un-nom', 'un-mdp')"
					"Roadmap.affixe()".js.should == "un-nom-un-mdp"
				  JS.run "Roadmap.set('autrenom', 'autremdp')"
					"Roadmap.affixe()".js.should == "autrenom-autremdp"
				end
			end
		end
		
		describe ":is_locked" do
			it { should_respond_to :is_locked }
		  context "quand l'utilisateur est le possesseur de la roadmap" do
				before do
					open_roadmap 'testable', 'testable', {:as_owner => true}
				end
				it "(pour check) md5 de l'utilisateur doit être défini" do
				  "User.md5".js.should_not be_nil
				end
				it "(pour check) md5 de la feuille de route doit être défini" do
				  "Roadmap.md5".js.should_not be_nil
				end
				it "doit renvoyer false" do
			  	'Roadmap.is_locked()'.js.should === false
				end
		  end
			context "quand l'utilisateur n'est pas le possesseur de la roadmap" do
				before do
					open_roadmap 'testable', 'testable', {:as_owner => false}
				end
				it "doit renvoyer true" do
			  	'Roadmap.is_locked()'.js.should === true
				end
			end
			
		  
		end
	end # /describe méthodes généralistes
	
	describe ":set_modified" do
		# Méthode :set_modified
		it { should_respond_to :set_modified }
		it "doit définir que la roadmap est modifiée si rien" do
			JS.run "Roadmap.modified = false"
			"Roadmap.modified".js.should be_false
		  JS.run "Roadmap.set_modified()"
			"Roadmap.modified".js.should be_true
		end
		it "doit définir que la roadmap est modifiée si true en paramètre" do
			JS.run "Roadmap.modified = false"
			"Roadmap.modified".js.should be_false
		  JS.run "Roadmap.set_modified(true)"
			"Roadmap.modified".js.should be_true
		end
		it "doit définir que la roadmap n'est pas modifiée si false en paramètre" do
			JS.run "Roadmap.modified = true"
			"Roadmap.modified".js.should be_true
		  JS.run "Roadmap.set_modified(false)"
			"Roadmap.modified".js.should be_false
		end
		it "doit régler correctement le bouton Save" do
			# Pour que le bouton Save soit visible, il faut :
			# 	- qu'il y ait une feuille de route chargée
			# 	- que le panneau des specs soit ouvert
			open_roadmap 'test', 'test'
			run "set_div_specs", true
		  JS.run "Roadmap.set_modified(true)"
			btn = onav.a(:id => 'btn_save_roadmap')
			screenshot "btn-save-when-modified"
			btn.should be_visible
			# Quand mis à modifiée
		  JS.run "Roadmap.set_modified()"
			btn.class_name.should == 'btn on'
			btn.text.should == "LOCALE_UI.Roadmap.btn_save".js
			# Quand mis à non modifiée
		  JS.run "Roadmap.set_modified(false)"
			btn.class_name.should == 'btn off'
			btn.text.should == "LOCALE_UI.Roadmap.btn_saved".js
		end
	end
	
	describe ":set (définition de l'affixe de la roadmap — nom/mdp)" do
		# Méthode :set
		let(:champ_nom){ onav.text_field(:id => 'roadmap_nom') }
		let(:champ_mdp){ onav.text_field(:id => 'roadmap_mdp') }
		it { should_respond_to :set }
		it ":set doit régler l'affixe de la roadmap quand nom et mdp sont fournis" do
			champ_nom.set ""
		  champ_mdp.set ""
			"Roadmap.get_nom()".js.should be_nil # car renvoie .nom
			"Roadmap.get_mdp()".js.should be_nil # car renvoie .mdp
			# --- :set ---
			JS.run "Roadmap.set('lenom','lemdp')"
			# Vérification
			champ_nom.value.should == 'lenom'
			champ_mdp.value.should == 'lemdp'
		end
		it ":set doit pouvoir ne définir que le NOM" do
		  champ_nom.set ""
			champ_mdp.set "le-mdp-non-touched"
			"Roadmap.get_nom()".js.should be_nil
			# -->
			JS.run "Roadmap.set('lenom-touched',false)"
			"Roadmap.get_nom()".js.should == 'lenom-touched'
			"Roadmap.get_mdp()".js.should == "le-mdp-non-touched"
		end
		it ":set doit pouvoir ne définir que le MDP" do
		  champ_nom.set "le-nom-non-touched"
			champ_mdp.set ""
			"Roadmap.get_mdp()".js.should be_nil
			# -->
			JS.run "Roadmap.set(false, 'lemdp-touched')"
			"Roadmap.get_nom()".js.should == "le-nom-non-touched"
			"Roadmap.get_mdp()".js.should == 'lemdp-touched'
		end
	end
	
	describe ":onchange_affixe" do
		# :onchange_affixe
		before(:each) do
		  run 'reset_all'
		end
		it { should_respond_to :onchange_affixe }
		it "doit modifier le nom quand il est fourni" do
			JS.run "Roadmap.loaded = true"
			"Roadmap.loaded".js.should be_true
			"Roadmap.nom".js.should be_nil
			# -->
		  run 'onchange_affixe("mon_nouveau_nom", null)'
			# <--
			"Roadmap.nom".js.should == "mon_nouveau_nom"
			"Roadmap.mdp".js.should be_nil
			"Roadmap.loaded".js.should be_false
		end
		it "doit modifier le mdp s'il est fourni" do
			JS.run "Roadmap.loaded = true"
			"Roadmap.loaded".js.should be_true
		  "Roadmap.mdp".js.should be_nil
			# -->
		  run 'onchange_affixe', 'null, "mon_nouveau_mdp"'
			# <--
			"Roadmap.mdp".js.should == "mon_nouveau_mdp"
			"Roadmap.nom".js.should be_nil
			"Roadmap.loaded".js.should be_false
		end
		it "doit modifier nom et mdp si fournis" do
			JS.run "Roadmap.loaded = true"
			"Roadmap.loaded".js.should be_true
		  "Roadmap.nom".js.should be_nil
		  "Roadmap.mdp".js.should be_nil
			# -->
		  run 'onchange_affixe', '"un_nouveau_nom_ok", "mon_nouveau_mdp"'
			# <--
			"Roadmap.nom".js.should == "un_nouveau_nom_ok"
			"Roadmap.mdp".js.should == "mon_nouveau_mdp"
			"Roadmap.loaded".js.should be_false
		end
	end
	
	describe ":are_specs_valides" do
		# :are_specs_valides
		it { should_respond_to :are_specs_valides }
		it { property_should_exist :specs_valides }
		
		context "sans forcer le check doit renvoyer" do
			it "true quand specs_valides est true" do
			  "Roadmap.specs_valides=true".js
				run('are_specs_valides').should be_true
			end
			it "false quand specs_valides est false" do
			  "Roadmap.specs_valides=false".js
				run('are_specs_valides').should be_false
			end
		end
		
		context "en forçant le check" do
			context "avec nom et mdp fournis et valides" do
				before :all do
					clean_flash
					run 'set("unbonnom", "unbonmdp")'
					JS.run 'Roadmap.specs_valides = false'
					keep(:return => 'Roadmap.are_specs_valides(true, true)'.js)
				end
				it "doit retourner true" do
				  kept(:return).should be_true
				end
				it "doit mettre specs_valides à true" do
				  get_property(:specs_valides).should be_true
				end
			end
			context "avec nom blank" do
				context "et demande d'affichage du message" do
					before :all do
						clean_flash
						run 'set("", "un_bon_mdp")'
					end
					it "doit retourner false et afficher le message" do
						'Roadmap.are_specs_valides(true, true)'.js.should be_false
						screenshot "nom-blank-with-message"
						flash_should_contain "ERRORS.Roadmap.Specs.need_a_nom".js
					end
				end
				context "sans demande d'affichage du message" do
					before :all do
						clean_flash
						run 'set("", "un_bon_mdp")'
					  keep(:return => 'Roadmap.are_specs_valides(true, false)'.js)
					end
					it "doit retourner false" do
					  kept(:return).should be_false
					end
					it "doit afficher le message d'erreur" do
						flash_should_not_contain "ERRORS.Roadmap.Specs.need_a_nom".js
						screenshot "specs-invalides-sans-message"
					end
				end
			end
			context "avec nom invalide" do
				before :all do
					flash_clean
					run 'set("l\'été ça va bien ?","unbonmdp")'
					keep(:return => 'Roadmap.are_specs_valides(true)'.js)
				end
				it "doit retourner false" do
				  kept(:return).should be_false
				end
				it "doit mettre :specs_valides à false" do
				  get_property(:specs_valides).should be_false
				end
				it "doit corriger le nom fourni" do
				  get_property(:nom).should == "lt_a_va_bien_"
				end
				it "doit afficher le message d'erreur" do
					flash_should_contain "ERRORS.Roadmap.Specs.invalid_nom".js
				end
			end
			
			context "avec mdp blank" do
				context "et demande d'affichage du message" do
					before :all do
					  nav.reload_page
						run 'set("unbonnom","")'
					  keep(:return => 'Roadmap.are_specs_valides(true, true)'.js)
					end
					it "doit retourner false" do
						kept(:return).should be_false
					end
					it "doit afficher le message d'erreur" do
						screenshot "specs-invalides-with-message"
						flash_should_contain "ERRORS.Roadmap.Specs.need_a_mdp".js
					end
				end
				context "sans demande d'affichage du message" do
					before :all do
					  nav.reload_page
						run 'set("unbonnom","")'
					  keep(:return => 'Roadmap.are_specs_valides(true, false)'.js)
					end
					it "doit retourner false" do
						kept(:return).should be_false
					end
					it "doit afficher le message d'erreur" do
						screenshot "specs-invalides-sans-message"
						flash_should_not_contain "ERRORS.Roadmap.Specs.need_a_mdp".js
					end
				end
				
			end
			context "avec mdp invalide" do
				before :all do
				  nav.reload_page
					run 'set("unbonnom","un mauvé mdp !")'
					keep(:return => 'Roadmap.are_specs_valides(true)'.js)
				end
				it "doit retourner false" do
				  kept(:return).should be_false
				end
				it "doit afficher le message d'erreur" do
					flash_should_contain "ERRORS.Roadmap.Specs.invalid_mdp".js
				end
				it "doit corriger le mdp fourni" do
				  get_property(:mdp).should == "un_mauv_mdp_"
				end
			end
			
		end
				
		it "doit régler correctement les boutons" do
		  pending "à coder"
		end
	end

	describe ":get_a_correct" do
		# :get_a_correct
		it { should_respond_to :get_a_correct }
		it ":get_a_correct doit retourner un terme correct" do
			{
				'un mauvais nom' => 'un_mauvais_nom',
				'en été ça donne !' => "en_t_a_donne_"
			}.each do |bad, correct|
	  		run( 'get_a_correct', "'#{bad}'").should == correct
			end
		end
	end

	describe ":specs_ok" do
		# :specs_ok
		it { should_respond_to :specs_ok }
		it "doit retourner true si les specs de la roadmap sont valides" do
		  run "set", "'bonnom','bonmdp'"
		  run('specs_ok').should === true
		end
		it "doit retourner false si les specs de la roadmap sont vides" do
		  run "set", "'',''"
		  run('specs_ok').should === false
		end
		it "doit retourner false si un des éléments n'est pas fourni" do
		  run "set", "'bonnom',''"
		  run('specs_ok').should === false
		end
		it "doit afficher le message d'erreur s'il est demandé" do
		  run "set", "'',''"
		  run('specs_ok', true).should === false
			flash_should_contain "ERRORS.Roadmap.Specs.requises".js
		end
		it "ne doit pas afficher le message s'il n'est pas demandé" do
			screenshot "avant_clean"
			JS.run "UI.remove('div#inner_flash', true)"
			screenshot "apres_clean"
		  run "set", "'',''"
		  run('specs_ok', false).should === false
			flash_should_not_contain "ERRORS.Roadmap.Specs.requises".js
		end
	end
	
	describe ":set_div_specs" do
		# :set_div_specs
		it { should_respond_to :set_div_specs }
		it "doit retourner false dans tous les cas (pour le lien)" do
		  run('set_div_specs').should === false
		end
		it "doit afficher les specs et masquer le bouton si ouvert=true" do
		  run 'set_div_specs', true
			should_not_be_visible :div => 'open_roadmap_specs'
			should_be_visible :div => 'roadmap_specs-specs'
		end
		it "doit afficher le bouton et masquer les specs si ouvert=false" do
		  run 'set_div_specs', false
			should_be_visible :div => 'open_roadmap_specs'
			should_not_be_visible :div => 'roadmap_specs-specs'
		end
		it "doit toggler les specs et le bouton si sans argument" do
		  # On l'ouvre pour commencer
		  run 'set_div_specs', true
			should_not_be_visible :div => 'open_roadmap_specs'
			should_be_visible 		:div => 'roadmap_specs-specs'
			run 'set_div_specs'
			should_be_visible 		:div => 'open_roadmap_specs'
			should_not_be_visible :div => 'roadmap_specs-specs'
			run 'set_div_specs'
			should_not_be_visible :div => 'open_roadmap_specs'
			should_be_visible 		:div => 'roadmap_specs-specs'
		end
	end

	describe ":set_etat_specs" do
		# :set_etat_specs
		# 
		# Définit l'état de la tranche contenant les specs de la roadmap en fonction
		# de la définition correcte ou pas des nom/mdp
		it { should_respond_to :set_etat_specs }
		it "doit laisser la tranche ouverte quand les specs ne sont pas définies et retourner false" do
		  run "set", "'',''"
			res = run( "set_etat_specs", avec_message = false)
			should_be_visible :tr => 'specs_roadmap'
			res.should be_false
		end
		it "doit laisser la tranche ouverte et masquer le bouton quand les specs ne sont pas valides" do
		  run "set", "'ça c’est l’été','même pas chaud'"
			res = run( "set_etat_specs", avec_message = false)
			should_be_visible 		:div => 'roadmap_specs-specs'
			should_not_be_visible :div => 'open_roadmap_specs'
			res.should be_false
		end
		it "doit fermer la tranche et afficher le bouton quand les specs sont valides" do
		  run "set", "'exemple','exemple'"
			res = run( "set_etat_specs", avec_message = false)
			screenshot "specs_quand_valides"
			should_not_be_visible	:div => 'roadmap_specs-specs'
			should_be_visible 		:div => 'open_roadmap_specs'
			res.should be_true
		end
	end
	
	describe ":set_etat_btn_save" do
		it { should_respond_to :set_etat_btn_save }
		it "doit régler le bouton save correctement" do
			open_roadmap 'test', 'test', :specs => :visible
			btn = onav.a(:id => 'btn_save_roadmap')
			run "set_etat_btn_save(true)"
			btn.class_name.should == "btn on"
			btn.text.should == "LOCALE_UI.Roadmap.btn_save".js #"Sauver"
			run "set_etat_btn_save(false)"
			btn.class_name.should == "btn off"
			btn.text.should == "LOCALE_UI.Roadmap.btn_saved".js #"Sauvé"
			run "set_etat_btn_save(null)"
			btn.class_name.should == "btn act"
			btn.text.should == "LOCALE_UI.Roadmap.btn_saving".js # "En cours…"
		end
	end # / describe :set_etat_btn_save
	
	describe ":set_btns_roadmap" do
		before :all do
		  nav.reload_page # pour remettre tout à zéro
		end
		it { should_respond_to :set_btns_roadmap }
		describe "doit régler correctement les éléments quand" do
			it "rien n'est défini" do
			  run "set('', '')"
				set_property(:loaded 				=> false)
				set_property(:specs_valides => false)
				set_property(:modified 			=> false)
				# -->
				run "set_btns_roadmap"
				boutons_roadmap_should_have_bon_etat :loaded => false, :specs_valides => false, :modified => false
			end
			it "l'affixe est donné" do
				run "set('unbonnom', 'unbonmdp')"
				set_property(:loaded 				=> false)
				set_property(:specs_valides => true)
				set_property(:modified 			=> false)
				# -->
				run "set_btns_roadmap"
				boutons_roadmap_should_have_bon_etat :loaded => false, :specs_valides => true, :modified => false
			end
			it "une feuille de route est chargée" do
			  run "set('unbonnom', 'unbonmdp')"
				set_property(:loaded 				=> true)
				set_property(:specs_valides => true)
				set_property(:modified 			=> false)
				# -->
				run "set_btns_roadmap"
				boutons_roadmap_should_have_bon_etat :loaded => true, :specs_valides => true, :modified => false
			end
			it "la feuille de route courante est modifiée" do
			  run "set('unbonnom', 'unbonmdp')"
				set_property(:loaded 				=> true)
				set_property(:specs_valides => true)
				set_property(:modified 			=> true)
				# -->
				run "set_btns_roadmap"
				boutons_roadmap_should_have_bon_etat :loaded => true, :specs_valides => true, :modified => true
			end
		end
	end # / describe :set_btns_roadmap
	
	describe ":init_new" do
		
		# --- Initialisation d'une nouvelle feuille de route ---
		
		it { should_respond_to :init_new }
		it "doit initialiser une nouvelle feuille de route" do
			JS.run "UI.add('ul#exercices', '<li class=\"li_ex\">Faux ex</li');"
			flash_clean
			screenshot 'init_new_preparation'
			# Il doit y avoir un exercice
			"$('ul#exercices > li').length".js.should be > 0
			# Les nom/mdp ne doivent pas être vides
			run "set('fausse','fauxmdp')"
			"$('input#roadmap_nom').val()".js.should_not == ""
			"$('input#roadmap_mdp').val()".js.should_not == ""
			# .loaded mis à true
			set_property(:loaded => true)
			"Roadmap.loaded".js.should be_true
			# .specs_modified mis à true
			set_property(:specs_modified => true)
			"Roadmap.specs_modified".js.should be_true
			# Réglage des boutons
			JS.run "Roadmap.set_btns_roadmap();" 
			# Les boutons roadmap doivent être dans le bon état
			boutons_roadmap_should_have_bon_etat :loaded => true, :modified => false, :valide => true
			# Il ne doit y avoir aucun message affiché
			should_not_be_visible :div => 'flash'
			# Pour modifier la configuration générale
		  JS.run "Roadmap.Data.dispatch_config_generale({start_to_end:false,down_to_up:false,maj_to_rel:false,last_changed:'maj_to_rel'})"
			"Roadmap.Data.start_to_end".js.should == false
			JS.run "Roadmap.Data.show()"
			onav.span(:id => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.end_to_start".js
			onav.span(:id => 'start_to_end').should be_visible
			
			# --- vvvvvvvvv ---
			JS.run "Roadmap.init_new()"
			Watir::Wait.until{ "Roadmap.initing_new".js == false }
			screenshot "after_init_new"
			# --- ^^^^^^^^^ ---
			
			# Doit vider la liste des exercices
			"$('ul#exercices > li').length".js.should == 0
			# Doit mettre les champs nom et mdp à rien
			"$('input#roadmap_nom').val()".js.should == ""
			"$('input#roadmap_mdp').val()".js.should == ""
			# Doit mettre .loaded à false
			"Roadmap.loaded".js.should	be_false
			# Doit initialiser les Data
			# Doit mettre .modified à false
			"Roadmap.modified".js.should be_false
			# Doit régler les boutons roadmap
			boutons_roadmap_should_have_bon_etat :loaded => false, :modified => false, :valide => true
			# Doit initialiser les Data de la roadmap et l'interface
			"Roadmap.Data.start_to_end".js.should == true
			onav.span(:id => 'start_to_end').should_not be_visible
			# Doit afficher un message (dans la bonne langue)
			flash_should_contain "MESSAGES.Roadmap.ready".js
		end
	end # / describe :init_new

	describe "Méthodes d'ouverture d'une feuille de route" do
		describe ":open" do
			# :open
			it { should_respond_to :open }
			it "doit avoir une procédure :load (ajax + normale ensemble)" do
			  path = File.join(APP_FOLDER, 'ruby', 'procedure', 'roadmap', 'load.rb')
				File.exists?(path).should be_true
			end
			context "quand la feuille de route existe" do
				before do
					run 'reset_all'
				  run 'set', "'exemple', 'exemple'"
					run 'open'
					Watir::Wait.while{ "Roadmap.opening".js }
				end
				it "doit afficher les exercices" do
					nombre_exercices = "EXERCICES.length".js
					nombre_exercices.should be > 0
					"$('ul#exercices > li').length".js.should == nombre_exercices
				end
				it "doit afficher un message de réussite" do
				  flash_should_contain "MESSAGES.Roadmap.loaded".js
				end
				it "doit avoir réglé le md5" do
				  md5 = get_property(:md5)
					md5.should_not be_nil
					md5.should == "7f321a13187999ce575abb8f2fcd68d7"
				end
				it "doit avoir réglé le partage" do
				  partage = get_property(:partage)
					partage.should_not be_nil
					partage.to_s.should == "0"
				end
			end
			context "quand la feuille de route n'existe pas" do
				before do
					run 'reset_all'
				  run 'set', "'unknown_fdr', 'unkwonw_mdp#{Time.now.to_i}'"
					run 'open'
					Watir::Wait.while{ "Roadmap.opening".js }
				end
				it "ne doit pas avoir affiché d'exercices" do
					nombre_exercices = "EXERCICES.length".js
					nombre_exercices.should == 0
					"$('ul#exercices > li').length".js.should == 0
				end
				it "doit afficher un message de feuille introuvable" do
					flash_should_contain "ERRORS.Roadmap.unknown".js
					# Testé plus profondément en intégration
				end
			end			
		end

		describe ":end_open" do
		  # :end_open
			it { should_respond_to :end_open }
			it { property_should_exist :md5 }
			it { property_should_exist :partage }
			it "doit afficher un message d'erreur en cas d'erreur" do
			  run 'end_open', {:error => 'ERRORS.Roadmap.unknown'}
				Watir::Wait.while{ "Roadmap.opening".js }
				flash_should_contain "ERRORS.Roadmap.unknown".js
			end
			# it "doit afficher la feuille de route en cas de succès" do
			#   # Testé en intégration
			# end
			it "doit afficher un message de réussite en cas de succès" do
			  run 'end_open', {:error => nil, :roadmap => {:data_roadmap => {}}}
				flash_should_contain "MESSAGES.Roadmap.loaded".js
			end
			it "doit mettre loaded à true" do
				set_property(:loaded => false)
			  run 'end_open', {:error => nil, :roadmap => {:data_roadmap => {}}}
				"Roadmap.loaded".js.should === true
			end
			it "doit retourner true en cas de feuille chargée (loaded)" do
			  res = run 'end_open', {:error => nil, :roadmap => {:data_roadmap => {}}}
			  res.should === true
			end
			it "doit mettre loaded à false en cas d'échec" do
				set_property(:loaded => false)
			  res = run 'end_open', {:error => 'ERRORS.Roadmap.unknown'}
				res.should === false
			end
			it "doit régler le md5 de la feuille de route" do
				set_property(:md5 => nil)
				get_property(:md5).should be_nil
				run 'end_open({error:null,roadmap:{data_roadmap:{md5:"unfauxmd5"}}})'
				Watir::Wait.while{ "Roadmap.opening".js }
				get_property(:md5).should == "unfauxmd5"
			end
		end
	end
	
	describe "Méthodes de sauvegarde" do
		# Ici, on ne teste que leur existence. Elles sont testées en profondeur
		# en intégration (cf. roadmap/create_spec.rb, roadmap/save_spec.rb etc.)
		it { should_respond_to :create }
		it { should_respond_to :save }
		it { should_respond_to :end_save }
	end
	
	describe ":destroy" do
	  it "doit exister" do
	    should_respond_to :destroy
	  end
		it "doit se finir par :end_destroy" do
		  should_respond_to :end_destroy
		end
		it "doit avoir la propriété :destroying" do
		  property_should_exist :destroying
		end
		it ":destroy doit mettre :destroying à true" do
		  run 'destroy'
			get_property(:destroying).should == true
		end
		it ":end_destroy doit mettre :destroying à false" do
			set_property :destroying => true
		  run 'end_destroy'
			# Watir::Wait.while{ "Roadmap.destroying".js }
			get_property(:destroying).should be_false # forcément, benêt...
		end
		it "doit détruire la roadmap" do
		  pending "à coder"
		end
		it "ne doit pas détruire la roadmap si l'IP ne correspond pas à l'utilisateur" do
		  pending "à coder"
		end
	end
end