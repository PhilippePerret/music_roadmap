=begin

	Test du module JS Aide (objet Aide)
	
	@TODO: 	C'est une libraire générale (utilisable dans n'importe quelle
					application, il faudrait donc que ces tests soient mis ailleurs)
=end

require 'spec_helper'

# Il faut absolument que la procédure existe et que des aides existent
begin
	unless File.exists?(File.join(APP_FOLDER, 'ruby', 'procedure', 'aide', 'load.rb'))
		raise "La procédure aide/load.rb doit exister"
	end
	if Dir["#{APP_FOLDER}/data/aide/**/*.html"].length == 0
		raise "Il faut au moins un texte d'aide HTML (dans data/aide)"
	end
rescue Exception => e
	raise "# ERREUR FATALE : Impossible de jouer ces tests : #{e.message}"
	return
end

describe "Objet JS Aide" do

	include_examples "javascript", "Aide"
	 
	# => Retourne les données d'un fichier d'aide pris au hasard
	# 		:id 			L'identifiant de l'aide (= son path relatif)
	# 		:text			Le contenu du fichier (même si ruby)
	def get_an_help
		aide_folder = File.join(APP_FOLDER, 'data', 'aide')
		@liste_aides ||= Dir["#{aide_folder}/test/**/*.html"]
		@nombre_aides ||= @liste_aides.length
		aide_path = @liste_aides[rand(@nombre_aides)]
		{
			:id 		=> aide_path.sub(/#{Regexp.escape(aide_folder)}\//,''),
			:text 	=> File.read(aide_path)
		}
	end
	
	# Ouvre l'aide définie par le path relatif +path_id
	# 
	# @note: la méthode attend que l'aide soit bien affichée
	# 
	# @return [uid, domid], l'identifiant unique de l'aide et l'identifiant de
	# son div dans le DOM
	def open_aide path_id
		run "show('#{path_id}')"
		wait_for_aide
		uid 	= "Aide.TEXTS['#{path_id}'].uid".js
		domid = domid_aide uid
		[uid, domid]
	end
	
	def domid_aide uid
		"aide_text_id-#{uid}"
	end
	
	def wait_for_aide
		Watir::Wait.while{ 'Aide.showing'.js }
	end
	
	# Charge l'aide et retourne le Aide.TEXTS créé
	def load_this_aide aide_path
		run "load('#{aide_path}')"
		Watir::Wait.while{ 'Aide.loading'.js }
		"Aide.TEXTS['#{aide_path}']".js
	end
	
	
  describe "Généralités" do
    it "doit connaitre UI pour pouvoir fonctionner" do
			'UI'.should be_a_js_object
    end
  end
	describe "doit répondre à" do
		[	:open, :close, :show, :show_text, :get, :load, :end_load,
			:put_in_section, :div_aide, :uid, 
			:jqtext, :jqtext_exists, :otextid,
			:section, :bande_titre, :content,
			:set_focus, :set_liens, :lien_title,
			:is_focus_visible, :rend_focus_visible,
			:remettre_invisible, 
			:define_data_focus_with, :clignote,
			:moveon, :moveoff
		].each do |method|
			it { should_respond_to method }
	  end
	end
	
	describe "doit posséder la propriété" do
		before :all do
		  reset_aide
		end
		{
			:class 				=> 'Aide',
			:TEXTS 				=> {'length'=>0},
			:built 				=> true, # car fixé à l'initialisation
			:osection			=> nil,
			:obande_titre	=> nil,
			:ocontent			=> nil,
			:displayed		=> false
		}.each do |prop, value|
			it { property_should_exist prop }
			it "avec la valeur #{value}" do
				next if value.nil?
			  "Aide.#{prop}".js.should == value
			end
		end
	end
	
	
	describe "Méthode" do
		# :show
		describe ":show" do
			before :all do
			  reset_aide
				"Aide.TEXTS.length".js.should == 0
			  'Aide.displayed'.js.should be_false
				# -->
				run 'show("test/show")'
				wait_for_aide
				# <--
				@uid = "Aide.TEXTS['test/show'].uid".js
				@domid = "aide_text_id-#{@uid}"
			end
			describe "doit" do
				it "avoir mis displayed à true" do
				  'Aide.displayed'.js.should be_true
				end
				it "ajouter l'aide à TEXTS" do
				  "Aide.TEXTS.length".js.should == 1
					"Aide.TEXTS['test/show']".js.should_not be_nil
				end
			  it "ouvrir la fenêtre d'aide" do
			    section_aide.should be_visible
			  end
				it "contenir l'aide demandée" do
					onav.div(:id => @domid).should exist
				  onav.div(:id => 'aide_test_show').should exist
				end
				it "afficher l'aide demandée" do
					onav.div(:id => @domid).should be_visible
				end
				it "avoir le bon texte" do
					texte = Regexp.escape("Ceci est un fichier pour faire les tests de l'objet Aide.")
				  onav.div(:id => @domid).text.should =~ /#{texte}/
				end
			end
		end
	
		# :close
		describe ":close" do
			before :all do
				@uid, @domid = open_aide 'test/show'
				'Aide.displayed'.js.should be_true
				onav.div(:id => @domid).should exist
				onav.div(:id => @domid).should be_visible
			  # -->
				run 'close'
				Watir::Wait.while{ section_aide.visible? }
				# <--
			end
			describe "doit" do
				it "fermer le panneau d'aide" do
				  section_aide.should_not be_visible
				end
				it "mettre displayed à false" do
					"Aide.displayed".js.should be_false
				end
			end
		end
		
		# :open
		# 
	  describe ":open" do
			before :all do
			  open_aide "test/un_texte"
				close_aide
				'Aide.displayed'.js.should === false
				# -->
				run 'open'
				Watir::Wait.until{ "Aide.displayed".js }
				# <--
			end
			describe "doit" do
				it "mettre displayed à true" do
				  "Aide.displayed".js.should be_true
				end
				it "ouvrir le panneau d'aide" do
				  section_aide.should be_visible
				end
			end
	  end
			
		# :load
		describe ":load" do
			
			context "quand le texte d'aide existe" do
				before :all do
					reset_aide
				  # On chercher dans l'aide un texte
					@daide 		= get_an_help
					@aide_id = @daide[:id]
					"Aide.TEXTS.length".js.should == 0
					# -->
					@res = load_this_aide @aide_id
					# <--
				end
				describe "doit" do
					it "incrémenter le nombre d'aides" do
						"Aide.TEXTS.length".js.should == 1
					end
					it "avoir mis dans Aide.TEXTS le nouveau texte d'aide" do
						@res.should_not be_nil
					end
					it "avoir défini la propriété :id contenant le bon identifiant" do
						@res['id'].should == @aide_id
					end
					it "avoir défini la propriété :text contenant le texte" do
						@res['text'].should 	== @daide[:text]
					end
					it "avoir défini un :uid pour le texte d'aide" do
					  @res['uid'].should_not be_nil
					end
				end
			end

			context "quand le texte d'aide n'existe pas" do
				before :all do
				  @nombre_aides = "Aide.TEXTS.length".js
					@path = 'bad/id/pourvoir'
					# -->
					@res = load_this_aide @path
					# <--
				end
				describe "doit" do
				  it "incrémenter le nombre d'aide" do
				    "Aide.TEXTS.length".js.should == @nombre_aides + 1
				  end
					it "définir la donnée dans TEXTS" do
					  @res.should_not be_nil
					end
					it "avoir bien défini le texte d'aide" do
						search = Regexp.escape("Le texte d'aide d'ID #{@path}.html est introuvable")
						@res['text'].should =~ /#{search}/
					end
				end
			end
			
		end

		# :end_load
		# 
		# @certains tests sont faits indirectement par la méthode :load ci-dessus,
		# donc on ne vérifie que ceux propres à :end_load
		describe ":end_load" do
			before :all do
			  reset_aide
				"Aide.TEXTS".js.should == {'length'=>0}
			end
			context "quand les données sont bien remontées" do
				before :all do
					JS.run "Aide.loading = true"
					JS.run "$.proxy(Aide.end_load, Aide, null, {'error':null,'aide_id':'mon/aide.html','aide_text':'Mon texte aide'})()"
					Watir::Wait.while{ "Aide.loading".js }
					@res = "Aide.TEXTS['mon/aide.html']".js
				end
				describe "doit" do
					it "bien définir la ressource d'aide" do
						@res.should_not be_nil
						@res['id'].should == 'mon/aide.html'
						@res['text'].should == 'Mon texte aide'
						'Aide.TEXTS.length'.js.should == 1
					end
					it "mettre loading à false" do
					  'Aide.loading'.js.should be_false
					end
				end
			end
		end

		# :get
		describe ":get" do
			before :all do
			  @path = 'test/show'
			end
			context "quand le texte n'est pas encore chargé" do
				before :all do
				  reset_aide
					# -->
					run "get('#{@path}')"
					Watir::Wait.while{ "Aide.TEXTS['#{@path}']".js == nil}
					# <--
				end
				it "doit avoir demandé son chargement" do
				  "Aide.TEXTS['#{@path}']".js.should_not be_nil
				end
			end
			context "quand le texte est déjà chargé" do
				before :all do
				  # Puisque le test se fait dans l'ordre, on regarde si le test
					# précédent a été joué, qui charge déjà le texte testé. Dans le cas
					# contraire on le charge ici
					# On se sert de la propriété 'loading_required' spécialement créé pour
					# les tests pour voir si le texte a été chargé
					run "get('#{@path}')"
					Watir::Wait.while{ "Aide.TEXTS['#{@path}']".js == nil}
				end
				it "ne doit pas l'avoir rechargé" do
				  "Aide.loading_required".js.should be_false
				end
			end
		end
		
		# :show_text
		describe ":show_text" do
			before :all do
			  nav.reload_page
			end
			it "doit afficher le texte désiré" do
				run 'init', true # pour forcer la ré-initialisation complète
				aide = get_an_help # une aide au hasard
				run "load", "'#{aide[:id]}'"
				Watir::Wait.while{ "Aide.loading".js }
				"Aide.TEXTS.length".js.should == 1
				data_aide_in_texts = "Aide.TEXTS['#{aide[:id]}']".js
				uid = data_aide_in_texts['uid']
				onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").should_not exist
				run("jqtext_exists", "'#{aide[:id]}'").should be_false
				# -->
				run 'show_text', "'#{aide[:id]}'"
				# <--
				onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").should exist
			end
		end
		
		# :put_in_section
		describe ":put_in_section" do
			it "doit mettre le texte d'aide dans la section d'aide" do
				run 'init', true # pour forcer la ré-initialisation complète
			  aide 	= get_an_help # au hasard
				id 		= aide[:id]
				text	= aide[:text]
				run 'load', "'#{id}'"
				Watir::Wait.while{ "Aide.loading".js }
				data	= "Aide.TEXTS['#{id}']".js
				data.should_not be_nil
				uid		= data['uid']
				onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").should_not exist
				# -->
				run 'put_in_section', "'#{id}', true"
				# <--
				onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").should exist
			end
		end
		
		# :div_aide
		describe ":div_aide" do
			it "doit retourner le code HTML de l'aide" do
			  aide 	= get_an_help # au hasard
				id 		= aide[:id]
				text	= aide[:text]
				run 'load', "'#{id}'"
				Watir::Wait.while{ "Aide.loading".js }
				data	= "Aide.TEXTS['#{id}']".js
				data.should_not be_nil
				uid		= data['uid']
				# -->
				res = "Aide.div_aide('#{id}')".js
				# <--
				res.should =~ /class="aide_text"/
				res.should =~ /id="aide_text_id-#{uid}"/
				res.should =~ /class="aide_text_content"/
				res.should =~ /#{Regexp.escape(text)}/
			end
		end
		# :uid
		describe ":uid" do
			it "doit retourner un identifiant unique" do
			  res = run 'uid', '"path/to/aide.html"'
				res.should =~ /pathtoaide/
				res = res.sub(/pathtoaide/, '')
				# Il ne doit rester plus que des chiffres (mktime)
				res.gsub(/[0-9]/,'').should == ""
			end
		end
		
		# :jqtext_exists
		describe ":jqtext_exists" do
			before :all do
			  # On charge le texte d'aide pour qu'il soit dans Aide.TEXTS
				@path 	= 'test/un_texte'
				@daide 	= load_this_aide @path
				@domid 	= domid_aide(@daide['uid'])
			end
			context "quand le texte n'est pas affiché" do
				before :all do
					if section_aide.div(:id => @domid)
						JS.run "$('div##{@domid}').remove()"
					end
					section_aide.div(:id => @domid).should_not exist
					@res = "Aide.jqtext_exists('test/un_texte')".js
				end
				it "doit retourner false" do
				  @res.should be_false
				end
			end
			context "quand le texte est déjà affiché" do
				before :all do
					run "show_text('#{@path}')"
					Watir::Wait.until{ section_aide.div(:id => @domid).exists? }
					Watir::Wait.until{ section_aide.div(:id => @domid).visible? }
					@res = "Aide.jqtext_exists('test/un_texte')".js
				end
				it "doit retourner true" do
				  @res.should be_true
				end
			end
			
		end
	end # / describe Méthodes
	
	describe "Méthode DOM" do
		describe ":build" do
			it { should_respond_to :build }
			it "doit construire la fenêtre d'aide" do
			  JS.run "UI.remove('section#aide')"
				should_not_exist :section => 'aide'
				run 'build'
				should_exist :section => 'aide'
			end
			it "ne doit pas afficher la section d'aide" do
			  should_not_be_visible :section => 'aide'
			end
			it "doit mettre .built à true" do
			  set_property('built', false)
				run "build"
				'Aide.built'.js.should be_true
			end
		end
		
	  describe ":section" do
			before :all do
				JS.run "Aide.osection = null"
			  'Aide.osection'.js.should be_nil
			  JS.run "Aide.section()"
			end
			describe "doit" do
				it "définir la propriété :osection" do
				  "'undefined' == typeof Aide.osection".js.should_not be_true
					"'object' == typeof Aide.osection".js.should be_true
				end
			end
	  end
	
		describe ":bande_titre" do
			before :all do
			  JS.run "Aide.obande_titre = null"
				"Aide.obande_titre".js.should be_nil
				JS.run "Aide.bande_titre()"
			end
			it "doit définir l'objet obande_titre" do
			  "'undefined' == typeof Aide.obande_titre".js.should_not be_true
				"'object' == typeof Aide.obande_titre".js.should be_true
			end
		end
		
		describe ":content" do
			before :all do
			  JS.run "Aide.ocontent = null"
				"Aide.ocontent".js.should be_nil
				JS.run "Aide.content()"
			end
			it "doit définir l'objet ocontent" do
			  "'undefined' == typeof Aide.ocontent".js.should_not be_true
				"'object' == typeof Aide.ocontent".js.should be_true
			end
		end
		
		describe ":jqtext" do
			# Cette méthode ne fait que retourner l'objet jQuery de l'aide voulue
			# Or, dans Watir, ça crée une boucle infinie, donc on ne peut pas 
			# tester cette méthode. Mais elle est testée indirectement par toutes
			# les méthodes d'affichage.
		end
		
		describe ":otextid" do
			before :all do
			  @old_texts = "Aide.TEXTS".js
			end
			after(:all) do
			  JS.run "Aide.TEXTS = #{@old_texts.to_json}"
			end
			it { should_respond_to :otextid }
			it "doit retourner l'identifiant DOM unique de l'aide" do
				JS.run 'Aide.TEXTS={"1":{uid:"1test"}}'
			  res = run 'otextid', '1'
				res.should == "aide_text_id-1test"
			end
		end
		
		describe ":set_focus" do
			before(:each) do
			  if onav.element(:id => 'pour_test_focus').exists?
					JS.run "UI.remove('#pour_test_focus')"
				end
			end
			after(:all) do
			  if onav.element(:id => 'pour_test_focus').exists?
					JS.run "UI.remove('#pour_test_focus')"
				end
			end
			it "doit remplacer les liens focus d'un texte d'aide" do
			  JS.run 'UI.add_body(\'<focus id="pour_test_focus" value="id_element"></focus>\')'
				onav.element(:tag_name => 'focus', :id => 'pour_test_focus').should exist
				onav.a(:class => 'aide_focus', :id => 'pour_test_focus').should_not exist
				run 'set_focus'
				onav.element(:tag_name => 'focus', :id => 'pour_test_focus').should_not exist
				onav.a(:class => 'aide_focus', :id => 'pour_test_focus').should exist
			end
			it "doit utiliser le bon titre" do
			  JS.run 'UI.add_body(\'<focus id="pour_test_focus" title="Le bouton dans title" value="id_element"></focus>\')'
				run 'set_focus'
			  btn = onav.a(:class => 'aide_focus', :id => 'pour_test_focus')
				btn.text.should == " Le bouton dans title "
				JS.run 'UI.remove("#pour_test_focus")'
			  JS.run 'UI.add_body(\'<focus id="pour_test_focus" value="id_element">Le titre entre balise</focus>\')'
				run 'set_focus'
			  btn = onav.a(:class => 'aide_focus', :id => 'pour_test_focus')
				btn.text.should == " Le titre entre balise "
			end
		end
		describe ":set_liens" do
			before(:all) do
			  if 	onav.a(:id => "pour_test_set").exists? ||
 						onav.element(:tag_name => 'aide', :id => 'pour_test_set').exists?
					JS.run "UI.remove('#pour_test_set')"
				end
			end
			it "doit remplacer les balises <aide...>...</aide> du DOM" do
			  JS.run "UI.add_body('<aide id=\"pour_test_set\" value=\"path/to/aide.rb\">Le titre</aide>')"
				onav.element(:tag_name => 'aide', :id => 'pour_test_set').should exist
				onav.a(:id => "pour_test_set").should_not exist
				run "set_liens"
				onav.element(:tag_name => 'aide', :id => 'pour_test_set').should_not exist
				onav.a(:id => "pour_test_set").should exist
			end
		end
		
		describe ":lien_title" do
			before(:each) do
			  if 	onav.a(:id => "pour_test_set").exists? ||
 						onav.element(:tag_name => 'aide', :id => 'pour_test_set').exists?
					JS.run "UI.remove('#pour_test_set')"
				end
			end
			it "doit retourner le titre à mettre au lien aide" do
			  JS.run "UI.add_body('<aide id=\"pour_test_set\" value=\"path/to/aide.rb\">Le titre</aide>')"
			  "Aide.lien_title($('aide#pour_test_set'))".js.should_not be_nil
			end
			it "doit retourner le titre de l'attribut title s'il est défini" do
			  JS.run "UI.add_body('<aide id=\"pour_test_set\" title=\"Le titre dans title\" value=\"path/to/aide.rb\"></aide>')"
				"Aide.lien_title($('aide#pour_test_set'))".js.should == "Le titre dans title"
			end
			it "doit retourner le titre entre la balise si title n'est pas défini et qu'il existe" do
			  JS.run "UI.add_body('<aide id=\"pour_test_set\" value=\"path/to/aide.rb\">Le titre entre balise</aide>')"
				"Aide.lien_title($('aide#pour_test_set'))".js.should == "Le titre entre balise"
			end
			it "doit retourner une image interrogation si aucun titre n'est défini" do
			  JS.run "UI.add_body('<aide id=\"pour_test_set\" value=\"path/to/aide.rb\"></aide>')"
				res = "Aide.lien_title($('aide#pour_test_set'))".js
				res.should_not be_nil
				res.should =~ /<img ([^>]*)\/>/
				res.should =~ /src="([^"]*)\/interrogation.png"/
			end
		end
		
		# :is_focus_visible
		# -----------------
		# On teste à l'aide d'une feuille de route
		describe ":is_focus_visible" do
			before :all do
			  open_roadmap_phil
			end
			context "avec une visibilité par le display" do
				it "doit retourner true quand l'élément est visible" do
				  JS.run "exercice('1').li().show()"
					sleep 0.5
					"Aide.is_focus_visible('li#li_ex-1')".js.should be_true
				end
				it "doit retourner false quand l'élément est caché" do
				  JS.run "exercice('1').li().hide()"
					sleep 0.5
					"Aide.is_focus_visible('li#li_ex-1')".js.should be_false
				end
			end
			context "avec une visibilité par le visibility" do
				it "doit retourner true quand l'élément est visible" do
				  JS.run "exercice('1').li().show()"
				  JS.run "exercice('1').li().css('visibility','visible')"
					sleep 0.5
					"Aide.is_focus_visible('li#li_ex-1')".js.should be_true
				end
				it "doit retourner false quand l'élément est caché" do
				  JS.run "exercice('1').li().show()"
					JS.run "exercice('1').li().css('visibility','hidden')"
				  sleep 0.5
					"Aide.is_focus_visible('li#li_ex-1')".js.should be_false
				end
			end
		end
		
		# :rend_focus_visible
		# --------------------
		# @note: 	La méthode travaille en profondeur, mais ici on ne teste que
		# 				sur le parent
		# 				@TODO: on pourrait faire juste un cas, quand même, d'élément
		# 				qui a jusqu'à son arrière-grand-parent masqué
		# 
		# Pour faire ce test, on se sert du div des specs et du bouton pour
		# créer la roadmap
		# 
		describe ":rend_focus_visible" do
			def fils_should_not_be_visible
				ofocus.should_not be_visible
			end
			def fils_should_be_visible
				# if ofocus.visible?
				# 	puts_error "L'élément focussé (#{@jid_focus}) ne devrait pas être visible"
				# 	screenshot "ERR-focus-visible"
				# 	pere_is_visible = pere_focus.visible? ? 'oui' : 'non'
				# 	puts_error "Père visible ? -> #{pere_is_visible}\n"
				# end
				ofocus.should be_visible
			end
			def pere_should_be_visible
				pere_focus.should be_visible
			end
			def pere_should_not_be_visible
				pere_focus.should_not be_visible
			end
			def rend_pere_visible
				JS.run "$('#{@jid_pere_focus}').show()"
				JS.run "$('#{@jid_pere_focus}').css('style','')"
				Watir::Wait.until{ pere_focus.visible? }
			end
			def cache_pere_par_display
				rend_pere_visible # pour être sûr que les propriétés seront bonnes
				JS.run "$('#{@jid_pere_focus}').hide()"
				Watir::Wait.while{ pere_focus.visible? }
			end
			def cache_pere_par_visibility
				rend_pere_visible # pour être sûr que les propriétés seront bonnes
				JS.run "$('#{@jid_pere_focus}').css('visibility','hidden')"
				Watir::Wait.while{ onav.tr(:id => 'specs_roadmap').visible? }
			end
			def rend_fils_visible
				rend_pere_visible
				JS.run "$('#{@jid_focus}').show()"
				JS.run "$('#{@jid_focus}').attr('style','')"
				Watir::Wait.until{ ofocus.visible? }
			end
			# noter que ça rend aussi le père visible, donc il faut d'abord 
			# appeler cette méthode et ensuite régler le père
			def cache_fils_par_display
				rend_fils_visible # pour être sûr des propriétés
				JS.run "$('#{@jid_focus}').hide()"
				Watir::Wait.while{ ofocus.visible? }
			end
			def cache_fils_par_visibility
				rend_fils_visible # pour être sûr des propriétés
				JS.run "$('#{@jid_focus}').css('visibility','hidden')"
				Watir::Wait.while{ ofocus.visible? }
			end
			# Appelle la méthode et attend que l'élément soit visible
			# @note: s'échappe après 5 secondes même si l'élément n'est pas visible
			# @note: si l'élément n'est pas visible en fin de méthode, on renvoie
			# en console le Aide.FOCUS contenant toutes les informations sur le
			# parent.
			def call_rend_focus_visible
				# Il faut au préalable consigner les éléments non visibles
				JS.run "Aide.is_focus_visible($('#{@jid_focus}'))"
				JS.run "Aide.rend_focus_visible('#{@jid_focus}')"
				current_time = Time.now.to_i
				Watir::Wait.until{ ofocus.visible? || Time.now.to_i > (current_time + 10) }
				screenshot "rend-focus-visible"
				unless ofocus.visible?
					dfocus = "Aide.FOCUS".js.inspect
					puts_error "\nL'élément focussé devrait être visible avec :\nAide.FOCUS: #{dfocus}"
				end
			end
			
			before :all do
				# Il faut rendre la TR du parent du bouton visible
				
				# Définition de l'élément et son parent
				# @tag_pere_focus	= "tr"
				# @id_pere_focus	= 'specs_roadmap'
				# @tag_focus			= "a"
				# @id_focus				= "btn_roadmap_create"
				# JS.run "$('div#roadmap_specs-specs').show()"

				# Essai avec un LI d'exercice
				@tag_pere_focus	= "ul"
				@id_pere_focus	= 'exercices'
				@tag_focus			= "li"
				@id_focus				= "li_ex-1"

				open_roadmap_phil
				@jid_pere_focus = "#{@tag_pere_focus}##{@id_pere_focus}"
				@jid_focus			= "#{@tag_focus}##{@id_focus}"
				JS.run "$('#{@jid_pere_focus}').show()"
				Watir::Wait.until{ pere_focus.visible? }
			end
			let(:ofocus){ 	onav.send(@tag_focus, {:id => @id_focus}) }
			let(:pere_focus){ 		onav.send(@tag_pere_focus, {:id => @id_pere_focus}) }
	
			context "avec père affiché" do
				context "quand l'élément est déjà visible" do
					before :all do
						rend_fils_visible
						fils_should_be_visible
						pere_should_be_visible
						call_rend_focus_visible # <--
					end
					it "doit le laisser visible" do
					  ofocus.should be_visible
					end
				end
				context "quand l'élément est caché par display" do
					before :all do
						cache_fils_par_display
						pere_should_be_visible
						fils_should_not_be_visible
						call_rend_focus_visible # <--
					end
					it "doit le rendre visible" do
					  ofocus.should be_visible
					end
				end
				context "quand l'élément est caché par visibility" do
					before :all do
						cache_fils_par_visibility
						pere_should_be_visible
						fils_should_not_be_visible
						call_rend_focus_visible # <--
					end
					it "doit le rendre visible" do
					  ofocus.should be_visible
					end
				end
			end
			context "avec père caché par display" do
				context "quand l'élément est affiché" do
					it "doit le rendre visible" do
						rend_fils_visible
						fils_should_be_visible
						cache_pere_par_display
						pere_should_not_be_visible
						fils_should_not_be_visible
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end				
				context "quand l'élément est caché par display" do
					it "doit le rendre visible" do
						cache_fils_par_display
						fils_should_not_be_visible
						cache_pere_par_display
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end
				# "quand l'élément est caché par visibilité doit le rendre visible"
				context "quand l'élément est caché par visibilité" do
					it "doit le rendre visible" do
						cache_fils_par_visibility
						fils_should_not_be_visible
						cache_pere_par_display
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end
			end
			# "avec père caché par visibilité quand l'élément est affiché"
			context "avec père caché par visibilité" do
				context "quand l'élément est affiché" do
					it "doit le rendre visible" do
						rend_fils_visible
						fils_should_be_visible
						screenshot "1-fils-rendu-visible"
						cache_pere_par_visibility
						screenshot "2-pere-rendu-invisible"
						pere_should_not_be_visible
						screenshot "3-fils-devrait-etre-invisible"
						fils_should_not_be_visible
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end				
				context "quand l'élément est caché par display" do
					it "doit le rendre visible" do
						cache_fils_par_display
						fils_should_not_be_visible
						cache_pere_par_visibility
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end
				context "quand l'élément est caché par visibilité" do
					it "doit le rendre visible" do
						cache_fils_par_visibility
						fils_should_not_be_visible
						cache_pere_par_visibility
						call_rend_focus_visible # <--
					  ofocus.should be_visible
					end
				end
			end
		end
			
	
		# :remettre_invisible
		describe ":remettre_invisible" do
			it "doit remettre un texte invisible" do
			  pending "à coder"
			end
		end
		
		# :define_data_focus_with
		describe ":define_data_focus_with" do
		  before :all do
			  open_roadmap_phil
		    JS.run "Aide.data_focus = {}"
				run "define_data_focus_with($('li#li_ex-1'))"
		  end
			it "doit initialiser i" do
			  "Aide.data_focus.i".js.should == 0
			end
			it "doit régler jid" do
			  "Aide.data_focus.jid".js.should == "li#li_ex-1"
			end
			it "doit régler l'objet (obj)" do
			  "'object' == typeof Aide.data_focus.obj".should be_true
			end
			it "doit régler les propriétés initiales de l'objet" do
			  props = "Aide.data_focus.props".js
				props.should_not be_nil
				props.class.should == Hash
				props.should have_key 'border'
				props.should have_key 'background-color'
			end
			it "doit définir le style du clignotant (STYLE)" do
			  sty = "Aide.data_focus.STYLE".js
				sty.should_not be_nil
				sty.class.should == Hash
				sty.should have_key 'border'
				sty.should have_key 'background-color'
			end
		end
		# :clignote
		describe ":clignote" do
			def get_focus_styles
				return nil if "$('li#li_ex-1').attr('style')".js.nil? 
				style_string_to_hash "$('li#li_ex-1').attr('style')".js
			end
			def style_string_to_hash str
				sty = str.split(';')
				dstyle = {}
				sty.each do |paire|
					classe, valeur = paire.split ':'
					dstyle = dstyle.merge classe.strip =>  valeur.strip
				end
				dstyle
			end
			before :each do
			  open_roadmap_phil
				reset_user
				@id = "li_ex-1"
				Watir::Wait.until{ onav.li(:id => @id).visible? }
			end
			it "doit alerterner entre les deux styles" do
				run "define_data_focus_with($('li#li_ex-1'))"
				run 'clignote'
				style1 = get_focus_styles
				run 'clignote'
				style2 = get_focus_styles
				run 'clignote'
				get_focus_styles.should == style1
				run 'clignote'
				get_focus_styles.should == style2
				run 'clignote' # @IMPORTANT POUR LE TEST SUIVANT (ou alors recharger)
			end
			it "doit faire clignoter l'élément en boucle (en appelant :focus)" do
				next_time = Time.now.to_f
				liste_styles = []
				# C'est le focus qu'on doit appeler, avec fin à false
				# -->
				run "focus('li##{@id}',true)"
				# <--
				20.times do |i|
					liste_styles << "$('li#li_ex-1').attr('style')".js
					Watir::Wait.while{ next_time > Time.now.to_f }
					next_time += 0.2
				end
				# puts "liste_styles avant uniq : #{liste_styles.inspect}"
				liste_styles = liste_styles.reject{|e|e.nil?}.collect{|e|style_string_to_hash(e)}.uniq
				# puts "liste_styles après uniq : #{liste_styles.inspect}"
				liste_styles.count.should be > 1 # au moins les deux styles pour le clignotant
			end
		end
		
		# :scroll_to
		describe ":scroll_to" do
			it { should_respond_to :scroll_to }
			it ":scroll_to doit scroller jusqu'à l'élément voulu" do
			  pending "à coder"
			end
		end
		
		# :remove
		describe ":remove" do
			it { should_respond_to :remove }
			it "doit supprimer l'élément spécifié de la fenêtre d'aide" do
				run 'init', true # pour forcer la ré-initialisation complète
				aide 	= get_an_help # au hasard
				id 		=	aide[:id]
				run "show('#{id}')"
				Watir::Wait.while{ "Aide.loading".js }
				uid	= "Aide.TEXTS['#{id}'].uid".js
				# puts "\n\nid: #{id}"
				# puts "uid:#{uid}"
				# puts "Aide.TEXTS['#{id}'] = " + "Aide.TEXTS['#{id}']".js.inspect
				# puts "Contenu actuel : #{onav.section(:id => 'aide').html}"
				Watir::Wait.until do
					onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").exists?
				end
				# --> 
				run "remove('#{id}')"
				# <--
				onav.section(:id => 'aide').div(:id => "aide_text_id-#{uid}").should_not exist
				"Aide.TEXTS['#{id}']".js.should be_nil
			end
		end
	end # / describe Méthodes DOM
	
	describe "Méthodes utilisation" do
		
		# :moveon
		describe ":moveon" do
			it ":moveon doit permettre le déplacement de la fenêtre d'aide" do
			  # @TODO: comment tester ça ?
			end
		end
		
		# :moveoff
		describe ":moveoff" do
			it ":moveoff doit interrompre le déplacement de la fenêtre d'aide" do
			  # @TODO: comment tester ça ?
			end
		end
	end # /describe méthodes utilisation
end