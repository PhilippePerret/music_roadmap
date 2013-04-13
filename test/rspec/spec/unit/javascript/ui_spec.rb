# Tests de l'objet JS UI
=begin

	@TODO: UI est une librairie en partie générale. Ces tests devraient se
	trouver ailleurs, dans des tests généraux.
	@TODO: Il faudra ajouter les autres méthodes récupérées d'autres modules UI
	
=end

require 'spec_helper'

describe "Objet JS UI" do
	def method_exists method
		js_method_should_exist( "UI.#{method}" )
	end
  def object_exists objet
		js_object_should_exist( "UI.#{objet}")
	end
	describe "Généralités" do
	  it "doit exister" do
			JS.exists?(:object => 'UI').should be_true
	  end
	end
	describe "Data" do
	  it "FOLDER_IMAGES doit être défini" do
			JS.exists?(:string => 'UI.FOLDER_IMAGES').should be_true
	  end
	end
	describe "Méthode" do
	  it ":init doit exister" do
			method_exists 'init'
			# Note : pour le moment elle ne fait rien
	  end
		it "doit répondre à :remove" do
		  method_exists 'remove'
		end
		it ":remove doit effacer un élément DOM" do
		  JS.run "UI.add_body('<div id=\"etest\"></div>')"
			onav.div(:id => 'etest').should exist
			JS.run "UI.remove('div#etest')"
			onav.div(:id => 'etest').should_not exist
		end
		it "doit répondre à :add_body" do
		  method_exists 'add_body'
		end
		it ":add_body doit ajouter un élément au body" do
		  JS.run "UI.remove('div#etest')"
			onav.div(:id => 'etest').should_not exist
			"UI.add_body('<div id=\"etest\"></div>')".js
			onav.div(:id => 'etest').should exist
		end
		it ":focus doit exister" do
		  method_exists 'focus'
		end
		it ":focus doit mettre le focus à un élément" do
		  pending "à coder"
		end
		it ":fullscreen doit exister" do
		  method_exists 'fullscreen'
		end
		it ":fullscreen doit permettre de passer en “plein écran”" do
		  pending "à coder"
		end
		# :path_image
		it "doit répondre à :path_image" do
		  method_exists 'path_image'
		end
		it ":path_image doit retourner le path de l'image" do
		  pim = "UI.FOLDER_IMAGES".js
			"UI.path_image('pour/voir.png')".js.should == "#{pim}pour/voir.png"
		end
		# :set_src_images
		it ":set_src_images doit exister" do
		  method_exists 'set_src_images'
		end
		it ":set_src_images doit définir le path des images" do
		  # On crée une image dans le document, définie avec data-src, on lance
			# la méthode et on regarde si son src a été correctement défini
			oimg = onav.image(:id => 'image_test')
			img  = '<img id="image_test" data-src="mon_image_test.png" />'
			oimg.exists?.should_not be_true
			JS::run "UI.add_body('#{img}')"
			# L'image doit exister, maintenant, mais ne pas avoir de src
			oimg.exists?.should be_true
			oimg.src.should == ""
			jimg = "$('img#image_test')"
			# # "#{jimg}.length".js.should be > 0
			# "$('img#image_test').length".js.should be > 0
			"#{jimg}.attr('src')".js.should be_nil
			# --- On lance la méthode ---
			"UI.set_src_images();".js
			# Le source de l'image doit être défini
			res = "#{jimg}.attr('src')".js
			res.should_not be_nil
			res.should =~ /img\/mon_image_test.png/
		end
		# :start_metronome / :stop_metronome
		it "doit répondre à :start_metronome" do
		  method_exists 'start_metronome'
		end
		it "doit répondre à :stop_metronome" do
		  method_exists 'stop_metronome'
		end
		it "doit répondre à :onclick_metronome_anim" do
		  method_exists 'onclick_metronome_anim'
		end
		it ":start_metronome et :stop_metronome doivent mettre en route et arrêter le métronome" do
		  "UI.stop_metronome()".js
			metro = onav.img(:id => 'metronome_anim')
			metro.should exist
			metro.src.should end_with "metro_fixe.png"
			"UI.start_metronome()".js
			metro.src.should end_with "metro.gif"
		  "UI.stop_metronome()".js
			metro.src.should end_with "metro_fixe.png"
		end
		it ":onclick_metronome_anim doit toggler l'état du métronome" do
		  "UI.stop_metronome()".js
			metro = onav.img(:id => 'metronome_anim')
			metro.should exist
			metro.src.should end_with "metro_fixe.png"
		  "UI.onclick_metronome_anim()"
		end
	end # describe méthodes
	
	# -------------------------------------------------------------------
	# 	Captcha
	# -------------------------------------------------------------------
	describe "Captcha" do
		def method_exists method
			js_method_should_exist( "UI.Captcha.#{method}" )
		end
	  it "doit répondre à :set_message" do
			method_exists :set_message
		end
		it ":set_message doit définir le message" do
	    pending "à coder"
	  end
		it "doit répondre à :check" do
		  method_exists :check
		end
		it ":check doit lancer la vérification" do
		  pending "à coder"
		end
		it ":doit répondre à :retour_check" do
		  method_exists :retour_check
		end
		it ":retour_check doit fonctionner" do
		  pending "à coder"
		end
	end
end