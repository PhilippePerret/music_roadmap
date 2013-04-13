=begin

	Test de la validité de la page d'accueil quand on arrive dessus
	
=end

require 'spec_helper'

describe "Page d'accueil" do
	before(:all) do
    goto_home
		screenshot "accueil"
	end
  it "doit charger la bonne url" do
		onav.url.should =~ 	
			if ONLINE then 	/music-roadmap.net/
			else 						/cgi-bin\/music_roadmap/
			end
  end

	describe "doit contenir" do
		
	  describe "la bande logo" do
	    it { onav.section(:id => 'bande_logo').should exist }
			describe "avec" do
				it "le lien pour écrire à Phil" do
				  should_exist :a => 'mail_to_phil'
				end
				# it "un bouton pour passer en français (si anglais)" do
				#   goto_home :lang => 'en'
				# 	should_exist :a => 'btn_change_lang'
				# 	onav.img(:id => 'drapeau_autre_langue').src.should =~ /fr.png/
				# end
				# it "un bouton pour passer en anglais (si français)" do
				#   goto_home :lang => 'fr'
				# 	should_exist :a => 'btn_change_lang'
				# 	onav.img(:id => 'drapeau_autre_langue').src.should =~ /en.png/
				# end
			end
	  end
# 		it "la section partage" do
# 		  onav.section(:id => 'partage').should exist
# 		end
# 		it "la section donation" do
# 		  onav.section(:id => 'donation').should exist
# 		end
# 		describe "le div des specs de la roadmap" do
# 			# ROADMAP SPECS
# 		  it {onav.div(:id => 'roadmap_specs').should exist}
# 			describe "qui doit contenir" do
# 				it "la partie pour spécifier la roadmap" do
# 					should_be_visible :input => 'roadmap_nom'
# 				 	should_be_visible :input => 'roadmap_mdp'
# 				end
# 				it "et afficher le bouton pour fermer les spécificités" do
# 				  should_be_visible :a => 'btn_close_specs'
# 				end
# 			end
# 		end
# 		describe "la section métronome" do
# 			# MÉTRONOME
# 		  it { onav.section(:id => 'sec_metronome').should exist }
# 			describe "qui doit posséder" do
# 				it "ses images dans le bon dossier" do
# 					folder_metronome = File.join(FOLDER_MVC, 'view', 'img', 'metronome')
# 					img_path 	= File.join(folder_metronome, 'metro_fixe.png')
# 					anim_path = File.join(folder_metronome, 'metro.gif')
# 					File.exists?( img_path ).should be_true
# 					File.exists?( anim_path ).should be_true
# 				end
# 				describe "une balise image" do
# 				  it { onav.section(:id => 'sec_metronome').img(:id => 'metronome_anim').should exist }
# 					it "qui doit avoir la bonne image" do
# 					  img = onav.section(:id => 'sec_metronome').img(:id => 'metronome_anim')
# 						img.src.should end_with 'metronome/metro.gif'
# 					end
# 					it "qui doit contenir l'image au chargement" do
# 					  width 	= "$('img#metronome_anim').width()".js
# 						height	= "$('img#metronome_anim').height()".js
# 						# puts "width:#{width}; height:#{height}"
# 						height.should be > 0
# 					end
# 					it "qui doit changer (en image fixe) quand on clique dessus" do
# 						img = watir_e :img => 'metronome_anim'
# 					  img.click
# 						img.src.should =~ /metro_fixe\.png/
# 					end
# 					it "qui doit reprendre quand on reclique dessus" do
# 						img = watir_e :img => 'metronome_anim'
# 						img.click
# 						img.src.should =~ /metro\.gif/
# 					end
# 				end
# 			end
# 		end
# 		
# 		describe "La section d'exercices" do
# 		  # LISTE EXERCICES
# 			it { section_exercices.should exist }
# 			describe "qui doit contenir" do
# 			  describe "un UL pour les exercices" do
# 			    it { ul_exercices.should exist }
# 					describe "qui doit contenir" do
# 					  context "(quand anglais)" do
# 							it "le texte pour les premiers pas" do
# 							  goto_home :lang => 'en'
# 								div = onav.ul(:id => 'exercices').li(:id => 'premiers_pas')
# 								div.should exist
# 								lien_aide = div.a(:id => 'btn_premiers_pas')
# 								lien_aide.should exist
# 								lien_aide.html.should =~ /'application\/premiers-pas'/
# 								lien_aide.text.should =~ /First steps/
# 							end
# 					  end
# 					  context "(quand français)" do
# 							it "le texte pour les premiers pas" do
# 							  goto_home :lang => 'fr'
# 								div = onav.ul(:id => 'exercices').li(:id => 'premiers_pas')
# 								div.should exist
# 								lien_aide = div.a(:id => 'btn_premiers_pas')
# 								lien_aide.should exist
# 								lien_aide.html.should =~ /'application\/premiers-pas'/
# 								lien_aide.text.should =~ /Prise en main/
# 							end
# 					  end
# 					  
# 					end
# 			  end
# 			end
# 		end
# 	end
# 	
# 	describe "ne doit pas afficher" do
# 		it "le bouton “Ouvrir” (roadmap)" do
# 			should_not_be_visible :a => 'btn_roadmap_open'		  
# 		end
# 	  it "le bouton “Créer” (roadmap)" do
# 			should_not_be_visible :a => 'btn_roadmap_create'
# 	  end
# 		it "la bouton “Sauver” (roadmap)" do
# 		  should_not_be_visible :a => 'btn_save_roadmap'
# 		end
# 		it "le bouton “Init”" do
# 			should_not_be_visible :a => 'btn_init_roadmap'
# 		end
# 		it "la configuration générale de l'exercice" do
# 		  should_not_be_visible :div => 'config_generale'
# 		end
# 		it "le bouton pour créer un nouvel exercice" do
# 		  should_not_be_visible :a => 'btn_exercice_create'
# 		end
# 		it "le formulaire pour un nouvel exercice" do
# 		  should_not_be_visible :table => 'exercice_form'
# 		end
	end
end