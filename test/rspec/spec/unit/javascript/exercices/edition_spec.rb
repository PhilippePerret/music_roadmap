=begin
	Test unitaire du sous-objet Exercices.Edition
	
=end
require 'spec_helper'

describe "Sous-Objet JS Exercices.Edition" do
  
	# Affiche le div des types d'un exercice (masqué par défaut)
	def show_div_types
		open_exercice_form unless exercice_form.visible?
	  JS.run "$('div#exercice_cbs_types').show()"
		Watir::Wait.until{ exercice_form.div(:id => 'exercice_cbs_types').visible? }
	end
	alias :open_div_types :show_div_types
	# Décocher tous les types d'un exercice
	def decoche_all_types
		divtypes = exercice_form.div(:id => 'exercice_cbs_types')
	  "Exercices.TYPES_EXERCICE".js.each do |k, nom|
			divtypes.checkbox(:id => "exercice_type_#{k}").clear
		end
	end
	# Cocher tous les types d'un exercice
	def coche_all_types
		divtypes = exercice_form.div(:id => 'exercice_cbs_types')
	  "Exercices.TYPES_EXERCICE".js.each do |k, nom|
			divtypes.checkbox(:id => "exercice_type_#{k}").set
		end
	end

	before :all do
	  nav.reload_page
	end
	include_examples "javascript", "Exercices.Edition"
	subject { "Exercices.Edition" }
	
	# Liste des méthodes auxquelles doit répondre l'édition
  describe "doit répondre à" do
    [
			:open, :close,
			:prepare, :types_populate, :menus_tempo_populate,
	 		:toggle_types,
			:get_values, :set_values,
			:pickup_types, :coche_types
		].each do |method|
			it { should_respond_to method }
		end
  end

	# Liste des propriétés de Exercices.Edition
	describe "doit posséder la propriété" do
	  [	:class,
			:preparing, :prepared,
			:types_populated, :types_populating, 
		].each do |prop|
			it { property_should_exist prop }
		end
	end
	
	describe ":open" do
	  context "pour le propriété de la feuille de route" do
	  	before :all do
				nav.reload_page
				open_roadmap_phil	:as_phil => true
				run 'close'
	  	  # -->
				open_exercice_form
				# <--
	  	end
			it "doit s'ouvrir" do
			  exercice_form.should be_visible
			end
			it "ne doit pas afficher la boite d'identification" do
			  signin_form.should_not exist
			end
	  end
	  context "pour un non propriétaire" do
	  	before :all do
				nav.reload_page
				open_roadmap_phil	:as_phil => false
				run 'close'
	  	  # -->
				run 'open'
				sleep 0.5
				screenshot "open-exercice-form-non-owner"
				# <--
	  	end
			it "ne doit pas ouvrir le formulaire" do
			  exercice_form.should_not be_visible
			end
			it "doit afficher le message d'erreur" do
			  flash_should_contain 'ERRORS.Roadmap.bad_owner'.js
			end
	  end
	  context "pour un visiteur non identifié" do
	  	before :all do
				nav.reload_page
				open_roadmap_phil	:as_phil => false
				reset_user
				run 'close'
	  	  # -->
				run 'open'
				Watir::Wait.until{ signin_form.exists? }
				Watir::Wait.until{ signin_form.visible? }
				screenshot "open-exercice-form-non-signined"
				# <--
	  	end
			it "doit ouvrir la boite d'identification" do
			  signin_form.should be_visible
			end
			it "ne doit pas ouvrir le formulaire" do
			  exercice_form.should_not be_visible
			end
			it "doit afficher le message d'erreur" do
			  flash_should_contain 'ERRORS.User.need_to_signin'.js
			end
	  end
	end

	describe ":close" do
	  it "doit toujours fermer le formulaire" do
	    nav.reload_page
			open_roadmap_phil :as_phil => true
			open_exercice_form
			exercice_form.should be_visible
			# -->
			run 'close'
			Watir::Wait.while{ exercice_form.visible? }
			# <--
			exercice_form.should_not be_visible
	  end
	end
	describe "set_values" do
	  # @note: la méthode est traitée indirectement par <Exercice>.edit, donc
		# inutile de la retraiter ici (surtout que des propriétés pourraient
		# être ajoutées, ce qui doublerait le travail)
	end
	
	
	describe ":get_values" do
		# 
		# ----- > TEST DE LA RÉCUPÉRATION DES VALEURS DU FORMULAIRE
		# 
	  before :all do
	    open_exercice_form
			# On place des valeurs quelconque
			now = Time.now.to_i
			@hdata = {
				# :id					=> {:type => 'non', :value => "1"},
				:abs_id			=> {:type => 'sel', :value => nil},
				:titre 			=> {:type => 'txt', :value => "Titre de #{now}"},
				:recueil		=> {:type => 'txt', :value => "Recueil du titre #{now}"},
				:auteur			=> {:type => 'txt', :value => "Auteur de #{now}"},
				:image			=> {:type => 'txt', :value => nil},
				:suite			=> {:type => 'sel', :value => "normale"},
				:types 			=> {:type => 'typ', :value => ['A0', 'C0', 'T0', 'G0'].sort},
				:tempo 			=> {:type => 'sel', :value => 88},
				:tempo_min	=> {:type => 'sel', :value => 63},
				:tempo_max	=> {:type => 'sel', :value => 89},
				:up_tempo		=> {:type => 'sel', :value => nil},
				:obligatory => {:type => 'cb',  :value => true},
				:with_next 	=> {:type => 'cb',  :value => false},
				:note				=> {:type => 'txt', :value => "Une note sur #{now}."}
				}
			@hdata.each do |id, dprop|
				next if dprop[:value] == nil
				onaturel = exercice_form.element(:id => "exercice_#{id}")
				onaturel = onaturel.to_subtype if onaturel.exists?
				case dprop[:type]
				when 'txt' 	then onaturel.set dprop[:value]
				when 'sel'	then onaturel.select_value dprop[:value].to_s
				when 'cb'		then
					if dprop[:value] == true then onaturel.set else onaturel.clear end
				when 'typ' 	then
					open_div_types
					decoche_all_types
					dprop[:value].each do |idtype|
						exercice_form.checkbox(:id=>"exercice_type_#{idtype}").set
					end
				else
					# do nothing
				end
			end
			# -->
			@res = "Exercices.Edition.get_values()".js
			# puts "Retour get_values: #{@res.inspect}"
			# <--
	  end
		it "doit définir correctement les propriétés" do
			properties = "EXERCICE_PROPERTIES".js
			# On supprime des propriétés qui ne sont pas à tester
			['id', 'created_at', 'updated_at', 'started_at', 'ended_at'].each do |p|
				properties.delete(p)
			end
			properties.each do |prop|
				dprop = @hdata[prop.to_sym]
				if dprop.nil?
					puts_error "La propriété #{prop} n'est pas traitée dans le check de Exercices.Edition.get_values"
					next
				elsif dprop[:value] == nil
					next
				end
				@res.should have_key prop
				picked 		= @res[prop]
				expected 	= dprop[:value]
				picked = case prop
					when 'types' then picked.sort
					else picked
				end
				if picked != expected
					raise "La propriété #{prop} ne correspond pas (attendu:#{expected.inspect}, trouvée:#{picked.inspect})"
				else
					picked.should == expected
				end
			end
		end
	end
	
	describe ":populate_types" do
		before :all do
		  open_roadmap 'test_as_phil','test_as_phil', {:as_owner => true}
			open_exercice_form
			@divtypes = exercice_form.div(:id => 'exercice_cbs_types')
		end
	  context "quand les types ne sont pas peuplés" do
	  	before :all do
				JS.run "$('div#exercice_cbs_types').html('')" # On vide
	  	  JS.run "Exercices.Edition.types_populated = false"
				run 'types_populate'
				Watir::Wait.while{ "#{subject}.types_populating".js }
	  	end
			it "doit mettre tous les types dans le div des types" do
				@divtypes = exercice_form.div(:id => 'exercice_cbs_types')
				show_div_types unless @divtypes.visible?
			  "Exercices.TYPES_EXERCICE".js.each do |k, nom|
					@divtypes.label(:for => "exercice_type_#{k}").should exist
					@divtypes.checkbox(:id => "exercice_type_#{k}").should exist
					label = @divtypes.label(:for => "exercice_type_#{k}")
					label.should exist
					label.text.should == nom
				end
			end
	  end
	  context "quand les types sont déjà peuplés" do
	  	before :all do
				show_div_types unless @divtypes.visible?
			  "Exercices.TYPES_EXERCICE".js.each do |k, nom|
					@divtypes.checkbox(:id => "exercice_type_#{k}").should exist
					label = @divtypes.label(:for => "exercice_type_#{k}")
					label.should exist
					label.text.should == nom
				end
				# -->
				run 'types_populate'
				Watir::Wait.while{ "#{subject}.types_populating".js }
				# <--
	  	end
			it "ne doit pas doubler les types" do
			  "Exercices.TYPES_EXERCICE".js.each do |k, nom|
					"$('input#exercice_type_#{k}').length".js.should == 1
				end
			end
	  end
	  
	end
	
	describe ":toggle_types" do
		# :toggle_types (pour afficher/masquer les types)
		before :all do
		  open_roadmap 'test_as_phil', 'test_as_phil', {:as_owner => true}
			open_exercice_form
		end
	  context "quand les types sont cachés" do
			before :all do
	  	  JS.run "$('div#exercice_cbs_types').hide()"
				Watir::Wait.while{ exercice_form.div(:id => 'exercice_cbs_types').visible? }
				# -->
				run 'toggle_types'
				Watir::Wait.until{ exercice_form.div(:id => 'exercice_cbs_types').visible? }
				# <--
			end
	  	it "doit afficher les types" do
				exercice_form.div(:id => 'exercice_cbs_types').should be_visible
	  	end
			it "doit régler correctement le nom du bouton" do
			  exercice_form.a(:id => 'btn_toggle_types_exercices').text.should ==
			 		"LOCALE_UI.Verb.close".js
			end
	  end
		context "quand les types sont affichés" do
			before :all do
	  	  JS.run "$('div#exercice_cbs_types').show()"
				Watir::Wait.until{ exercice_form.div(:id => 'exercice_cbs_types').visible? }
				# -->
				run 'toggle_types'
				Watir::Wait.while{ exercice_form.div(:id => 'exercice_cbs_types').visible? }
				# <--
			end
			it "doit masquer les types" do
				exercice_form.div(:id => 'exercice_cbs_types').should_not be_visible
			end
			it "doit régler correctement le nom du bouton" do
			  exercice_form.a(:id => 'btn_toggle_types_exercices').text.should == 
					"LOCALE_UI.Verb.modify".js
			end
		end
		
	  
	end
	
	describe ":coche_types" do
	  # Cocher les types voulus
		before :all do
			show_div_types # pour afficher
			@checked 		= ['C0', 'T0', 'A0', 'R0', 'T1']
			@unchecked 	= ['G0','S0','G1', 'L0','P0']
			coche_all_types
			# -->
			run "coche_types(#{@checked.inspect})"
			# <--
		end
		it "doit cocher les types voulus" do
		  @checked.each do |id|
				"$('input#exercice_type_#{id}').is(':checked')".js.should be_true
			end
		end
		it "ne doit pas cocher les autres" do
		  @unchecked.each do |id|
				"$('input#exercice_type_#{id}').is(':checked')".js.should be_false
			end
		end
	end
	describe ":pickup_types" do
	  before :all do
			show_div_types # pour afficher
			# On coche quelques types
			@checked = ['C0', 'T0', 'A0', 'R0', 'T1']
			decoche_all_types
			@checked.each do |id|
				exercice_form.checkbox(:id => "exercice_type_#{id}").set
			end
	  end
		it "doit ramasser les types sélectionnés pour l'exercice" do
			run('pickup_types').sort.should == @checked.sort
		end
	end

end