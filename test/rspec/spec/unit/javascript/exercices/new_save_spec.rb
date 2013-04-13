=begin
	Test unitaire des méthodes intervenants dans la création et la sauvegarde
	des exercices
=end
require 'spec_helper'

describe "Création/Édition d'exercices" do
	include_examples "javascript", "Exercices"
	
	before :all do
		nav.reload_page
	  @rm = Roadmap.new 'test_as_phil', 'test_as_phil'
	end
  describe ":new (demande de création d'un exercice/morceau)" do
	  # :new
		it { should_respond_to :new }
		context "avec un user non identifié" do
		  before :all do
				reset_aide
				reset_user
		    run 'new'
				Watir::Wait.until{ boite_identification.exists? }
				Watir::Wait.until{ boite_identification.visible? }
		  end
			after :all do
			  reset_aide # pour que la boite d'identification ne traine pas
			end
			it "doit afficher la boite d'identification" do
			  boite_identification.should exist
				boite_identification.should be_visible
			end
			it "ne doit pas afficher le formulaire" do
			  exercice_form.should_not be_visible
			end
		end
		context "avec un user identifié mais non propriétaire" do
			before :all do
				open_roadmap 'test_as_phil', 'test_as_phil', {:as_owner => false}
				run 'new'
				if exercice_form.visible?
					Watir::Wait.while{ exercice_form.visible? }
				end
			end
			it "doit afficher le message d'erreur" do
				flash_should_contain "ERRORS.Roadmap.bad_owner".js
			end
			it "ne doit pas afficher le formulaire exercice" do
			  exercice_form.should_not be_visible
			end
		end
		context "avec le propriétaire de la roadmap" do
			before :all do
				open_roadmap 'test_as_phil', 'test_as_phil', {:as_owner => true}
				run 'new'
			end
			it "doit retourner false (pour le a-bouton)" do
			  "Exercices.new()".js.should === false
			end
			describe "le formulaire" do
				it "doit être visible" do
				  exercice_form.should be_visible
				end
				it "doit définir un nouvel ID unique" do
				  new_id = onav.input(:type => 'hidden', :id => 'exercice_id').value
					# Cet exercice ne doit pas exister ni physiquement ni virtuellement
					"EXERCICES['#{new_id}']".js.should be_nil
					path = @rm.path_exercice( new_id )
					File.exists?(path).should be_false
				end
				it "doit régler le bouton “Sauver”" do
				  onav.a(:id => 'btn_exercice_save').text.should == "LOCALE_UI.Exercice.create_new_exercice".js
				end
			end
		end
	end
	
	describe ":save" do
	  # :save
		# --- CRÉATION D'UN NOUVEL EXERCICE ---
		it { should_respond_to :save }
		it { property_should_exist :saving }
		# @note: 	la méthode Exercices.save enregistre l'exercice défini dans
		# 				le formulaire de création/édition de l'exercice.
		def updated_at_in_file
			data_roadmap_in_file('test_as_phil', 'test_as_phil')['updated_at']
		end
		before :all do
		  @rm = Roadmap.new 'test_as_phil', 'test_as_phil'
		end
		context "quand l'user identifié n'est pas le propriétaire" do
			before :all do
			  open_roadmap( 'test_as_phil', 'test_as_phil', {:as_owner => false})
				run 'save'
				Watir::Wait.while{ "Exercices.saving".js }
			end
			it "doit afficher le message d'erreur" do
			  flash_should_contain "ERRORS.Roadmap.bad_owner".js
			end
			it "ne doit rien sauver" do
			  updated_at_in_file.should == @rm.updated_at
			end
		end
		context "quand l'utilisateur est le propriétaire" do
			# 
			# 	---> Contexte "naturel", avec un user propriétaire de la roadmap
			# 
			
			before :all do
				reload_page
			  open_roadmap('test_as_phil', 'test_as_phil', {:as_owner => true})
			end
			context "et des données valides" do
				before :all do
					run 'new' # pour ouvrir le formulaire
					Watir::Wait.until{ exercice_form.visible? }
					# On récupère l'identifiant unique généré
					@id = "$('input#exercice_id').val()".js

					# --- Vérifications ---
					File.exists?(@rm.path_exercice(@id)).should be_false
				  "EXERCICES['#{@id}']".js.should be_nil
				  ul_exercices.li(:id => "li_ex-#{@id}").should_not exist
					"Roadmap.Data.EXERCICES.ordre".js.should_not include @id
					# --- / fin vérifications
					
					@nombre_logs = File.read(@rm.path_log).split("\n").count
					@data = {
						:recueil => "Le recueil", :titre => "Titre exercice #{Time.now.to_i}",
						:auteur => "Phil", 
						:tempo => "100", :tempo_min => "80", :tempo_max => "120"
					}
					fill_form_with exercice_form, @data, 'exercice'
					screenshot "ex-form-with-good-data"
					# -->
					run 'save'
					Watir::Wait.while{ "Exercices.saving".js }
					# <--
				end
				it "doit actualiser la date de dernière modification" do
				  updated_at_in_file.should be > @rm.updated_at
				end
				it "doit enregistrer l'exercice" do
					File.exists?(@rm.path_exercice(@id)).should be_true
				end
				it "doit enregistrer les bonnes valeurs" do
				  data = data_exercice_in_file @rm, @id
					data['id'].should == @id
					[:titre, :recueil, :auteur
					].each do |k|
						data[k.to_s].should == @data[k]
					end
					[:tempo, :tempo_min, :tempo_max
					].each do |k|
						data[k.to_s].should == @data[k].to_i
					end
				end
				it "doit actualiser l'instance" do
				  inst = "exercice('#{@id}')".js
					[:titre, :recueil, :auteur, :tempo, :tempo_min, :tempo_max
					].each do |k|
						inst[k.to_s].to_s.should == @data[k].to_s
					end
				end
				it "doit ajouter l'exercice (car nouvel exercice) à EXERCICES" do
				  "EXERCICES['#{@id}']".js.should_not be_nil
				end
				it "doit être construit dans la liste des exercices" do
				  ul_exercices.li(:id => "li_ex-#{@id}").should exist
				end
				describe "ordre des exercices" do
				  it "doit être modifié dans la roadmap JS" do
						"Roadmap.Data.EXERCICES['ordre']".js.should include @id
				  end
					it "doit être modifié dans le fichier de la roadmap" do
					  rm = Roadmap.new 'test_as_phil', 'test_as_phil' # pour forcer la relecture
						rm.ordre_exercices.should include @id
					end
				end
				it "doit ajouter un log de création d'exercice" do
					logs = File.read(@rm.path_log).split("\n")
					logs.count.should be > @nombre_logs
					dlast = logs.last.split("\t")
					dlast[1].should == "500"
					dlast[2].should == @id
				end
			end
		end
		context "et des données invalides" do
			before :all do
				# On commence par remplir le formulaire de bonnes valeurs
				run 'new' # pour ouvrir le formulaire
				Watir::Wait.until{ exercice_form.visible? }
				# On récupère l'identifiant unique généré
				@id = "$('input#exercice_id').val()".js
			end
			def remplit_et_soumet_avec change_data
				@data = {
					:recueil => "Le recueil", :titre => "Titre exercice #{Time.now.to_i}",
					:auteur => "Phil",
					:tempo => "100", :tempo_min => "80", :tempo_max => "120"
				}
				@data = @data.merge change_data
				fill_form_with exercice_form, @data, 'exercice'
				screenshot "ex-form-with-bad-data"
				run 'save'
				Watir::Wait.while{ "Exercices.saving".js }
			end
			describe "lève une erreur si" do
				it "l'identifiant n'existe pas" do
				  remplit_et_soumet_avec( :id => "" )
					flash_should_contain "ERRORS.Exercices.Edit.id_required".js
				end
				it "le titre n'est pas donné" do
				  remplit_et_soumet_avec( :titre => "", :id => @id )
					flash_should_contain "ERRORS.Exercices.Edit.title_required".js
				end
				it "le tempo max est inférieur au tempo min" do
				  remplit_et_soumet_avec(:tempo_max => "40", :tempo_min => "60")
					flash_should_contain "ERRORS.Exercices.Edit.min_sup_to_min".js
				end
				it "le tempo courant est inférieur au tempo min" do
				  remplit_et_soumet_avec(:tempo => "60", :tempo_min => "80")
					flash_should_contain "ERRORS.Exercices.Edit.tempo_inf_to_min".js
				end
			end
		end
		
	end # / :save
	
	describe ":save_all" do
	  # :save_all
		# Sauvegarde de TOUS LES EXERCICES (dans le cas d'une création de roadmap
		# avec des exercices déjà définis)
		it { should_respond_to :save_all }
		it { property_should_exist :saving_all }
		context "quand la feuille de route est protégée" do
			it "doit lever une erreur et ne rien faire" do
			  pending "à coder"
			end
		end
		context "quand l'utilisateur est le posesseur de la rm" do
			it "doit mettre saving_all à true" do
			  pending "à coder"
				get_property(:saving_all).should === true
			end
			it "doit mettre les exercices dans liste_save_all" do
			  pending "à coder"
			end
			it "doit sauver tous les exercices" do
			  pending "à coder"
			end
		end
		context "à la fin de l'opération" do
			it "doit afficher un message de succès" do
			  pending "à coder"
			end
			it "doit mettre :saving_all à false à la fin" do
			  pending "à coder"
				get_property(:saving_all).should === false
			end
			it "liste_saved doit contenir tous les exercices sauvés" do
			  pending "à coder"
			end
		end
	end
end