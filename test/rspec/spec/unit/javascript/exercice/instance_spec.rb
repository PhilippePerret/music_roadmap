=begin

	Test unitaire de l'instance Exercice
	
=end
require 'spec_helper'

describe "Instance Exercice" do
	include_examples "javascript", "new Exercice()"
	before :all do
	  # nav.reload_page
		open_roadmap 'test_as_phil', 'test_as_phil'
	  @id = 1
		JS.run "ex = exercice('#{@id}')"
		'ex'.should be_an_exercice
	end
	describe "doit posséder la propriété" do
	  it { property_should_exist :id }
	  it { property_should_exist :abs_id }
	  it { property_should_exist :titre }
	  it { property_should_exist :recueil }
	  it { property_should_exist :types }
	  it { property_should_exist :obligatory }
	  it { property_should_exist :with_next }
	  it { property_should_exist :suite }
	  it { property_should_exist :note }
	  it { property_should_exist :tempo }
	  it { property_should_exist :tempo_min }
	  it { property_should_exist :tempo_max }
	  it { property_should_exist :up_tempo }
	  it { property_should_exist :started_at }
	  it { property_should_exist :ended_at }
	  it { property_should_exist :created_at }
	  it { property_should_exist :updated_at }
	end
  describe "doit répondre à" do
		[:li, :select, :deselect,
			:edit
		].each do |method|
    	it { should_respond_to method }
		end
  end

	describe ":edit" do
	  # :edit
		context "avec le propriétaire" do
			before :all do
				JS.run "User.md5 = Roadmap.md5"
				JS.run "User.mail = 'un-mail-pourvoir@rien.com'"
			  JS.run "ex.edit()"
				sleep 0.5
			end
			describe "doit afficher" do
				it "le nom de bouton correct" do
				  exercice_form.a(:id => 'btn_exercice_save').text.should == "LOCALE_UI.Exercice.update".js
				end
			  it "le formulaire exercice" do
			    exercice_form.should be_visible
			  end
				it "toutes les valeurs textuelles et menus de l'exercice" do
					# Les valeurs textuelles et menus
				  [:titre, :recueil, :auteur, :tempo, :tempo_min, :tempo_max,
						:obligatory, :note
					].each do |prop|
						exercice_form.element(:id => "exercice_#{prop}").value.should == "ex.#{prop}".js.to_s
					end
				end
				it "tous les types de l'exercice" do
					# Les types
					ex_types = "ex.types".js || []
					all_types = "Exercices.TYPES_EXERCICE".js
					all_types.each do |idtype, nom|
						cb = exercice_form.checkbox(:id => "exercice_type_#{idtype}")
						if ex_types.include?( idtype )
							cb.should be_checked
						else
							cb.should_not be_checked
						end
					end
				end
			end
		end
		context "quand l'user n'est pas le propriétaire" do
			before :all do
				close_exercice_form
			  JS.run "User.set({md5:'pas bon', mail:'nimporte@quoi.com'})"
				JS.run "ex.edit()"
				sleep 0.5
			end
			it "doit retourner une erreur" do
			  flash_should_contain "ERRORS.Roadmap.bad_owner".js
			end
			it "ne doit pas afficher la boite d'édition" do
			  exercice_form.should_not be_visible
			end
		end
		
	end

	describe ":select/:deselect" do
	  # :select (sélection de l'exercice)
		it ":select doit sélectionner l'exercice" do
			JS.run 'ex.select()'
			sleep 0.2
	    onav.li(:id => "li_ex-#{@id}").attribute_value('class').should =~ /\bselected\b/
		end
		it ":deselect doit déselectionner l'exercice" do
	    onav.li(:id => "li_ex-#{@id}").attribute_value('class').should =~ /\bselected\b/
			JS.run 'ex.deselect()'
			sleep 0.2
			onav.li(:id => "li_ex-#{@id}").attribute_value('class').should_not =~ /\bselected\b/
		end
	end
end