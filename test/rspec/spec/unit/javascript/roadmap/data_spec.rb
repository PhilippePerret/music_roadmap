=begin

	Tests de l'objet JS Roadmap.Data
	
=end

require 'spec_helper'

describe "Objet JS Roadmap.Data" do
	include_examples "javascript", "Roadmap.Data"
	 
	def array_exists ary
		JS.exists?(:array => "Roadmap.Data.#{ary}").should be_true
	end
	def object_exists objet
		JS.exists?(:object => "Roadmap.Data.#{objet}").should be_true
	end
	
	# Objets, constantes et propriétés
	describe "doit définir la constante" do
		it { property_should_exist :class }
	end
	# Valeurs des constantes
	describe "doit régler la constante" do
		it ":class à 'Roadmap.Data'" do
		  "Roadmap.Data.class".js.should == 'Roadmap.Data'
		end
	end
	describe "doit définir l'objet" do
	  it "lui-même" do
	    JS.exists?(:object => 'Roadmap.Data').should be_true
	  end
		it "EXERCICES" do
		  object_exists 'EXERCICES'
		end
	end
	describe "doit définir la liste" do
		it "DATA_GENERALES" do
		  array_exists 'DATA_GENERALES'
		end
	end
	describe "doit définir la propriété" do
		it { property_should_exist :down_to_up }
		it { property_should_exist :start_to_end }
		it { property_should_exist :maj_to_rel }
		it { property_should_exist :last_changed }
	end
	
	describe ":init_all" do
		# :Roadmap.Data.init_all
		before :all do
		  open_roadmap 'exemple', 'exemple'
		end
		it { should_respond_to :init_all }
		it "doit initialiser window.EXERCICES" do
		  JS.run "window.EXERCICES = {length:2, '12':'un exercice', '13':'un autre exercice'}"
			"window.EXERCICES".js.should_not == {'length' => 0}
			run 'init_all'
			"window.EXERCICES".js.should == {'length' => 0}
		end
		it "doit mettre down_to_up à true" do
		  set_property 'down_to_up', false
			run 'init_all'
			get_property('down_to_up').should == true
		end
		it "doit mettre start_to_end à true" do
		  set_property 'start_to_end', false
			get_property('start_to_end').should be_false
			run 'init_all'
			get_property('start_to_end').should be_true
		end
		it "doit mettre :maj_to_rel à true" do
		  set_property 'maj_to_rel', false
			get_property('maj_to_rel').should be_false
			run 'init_all'
			get_property('maj_to_rel').should be_true
		end
		it "doit actualiser l'affichage de la configuration générale" do
		  set_property('start_to_end', false)
		  set_property('down_to_up', false)
		  set_property('maj_to_rel', false)
			run "show"
			onav.span(:id => 'start_to_end').text.should 	== "LOCALE_UI.Exercices.Config.end_to_start".js
			run 'init_all'
			onav.span(:id => 'start_to_end').text.should 	== "LOCALE_UI.Exercices.Config.start_to_end".js
			onav.span(:id => 'down_to_up').text.should 		== "LOCALE_UI.Exercices.Config.down_to_up".js
			onav.span(:id => 'maj_to_rel').text[0..16].should 		== "LOCALE_UI.Exercices.Config.maj_to_rel".js[0..16]
		end
		it "doit mettre :last_changed à 'down_to_up'" do
		  set_property 'last_changed', 'start_to_end'
			get_property('last_changed').should == 'start_to_end'
			run 'init_all'
			get_property('last_changed').should == 'down_to_up'
		end
		it "doit mettre Roadmap.Data.EXERCICES à {'ordre':[]}" do
		  set_property "EXERCICES", "{'ordre':[1,2,3],'created_at':2456}"
			get_property("EXERCICES").should_not == {'ordre'=>[]}
			run 'init_all'
			get_property("EXERCICES").should == {'ordre'=>[]}
		end
	end # / describe :init_all
	
	describe ":dispatch principal" do
	  # :Roadmap.Data.dispatch
		it { should_respond_to :dispatch }
		# CES ERREURS SONT INUTILES. ELLES NE PEUVENT SE PRODUIRE QUE POUR UN
		# HACKER. LAISSONS-LE PATAUGER
		# it "doit lever une erreur si aucune donnée n'est transmise" do
		#   res = run 'dispatch'
		# 	res.should === false
		# 	flash_should_contain "ERRORS.Roadmap.Data.required".js
		# end
		# it "doit lever une erreur si les données ne contiennent pas :data_roadmap" do
		#   res = run 'dispatch({})'
		# 	flash_should_contain "ERRORS.Roadmap.Data.data_required".js
		# 	res.should === false
		# end
		# it "doit lever une erreur si les données ne contiennent pas :config_generale" do
		#   res = run 'dispatch({data_roadmap:{}})'
		# 	flash_should_contain "ERRORS.Roadmap.Data.config_generale_required".js
		# 	res.should === false
		# end
		# it "doit lever une erreur si les données ne contiennent pas :data_exercices" do
		#   res = run 'dispatch({data_roadmap:{},config_generale:{}})'
		# 	flash_should_contain "ERRORS.Roadmap.Data.data_exercices_required".js
		# 	res.should === false
		# end
		# it "doit lever une erreur si les données ne contiennent pas :exercices" do
		#   res = run 'dispatch({data_roadmap:{}, config_generale:{}, data_exercices:{ordre:[]}})'
		# 	flash_should_contain "ERRORS.Roadmap.Data.exercices_required".js
		# 	res.should === false
		# end
		it "doit dispatcher les données transmises si elles sont bonnes" do
		  res = run 'dispatch', {:data_roadmap=>{}, :config_generale=>{}, :data_exercices=>{:ordre=>[]}, :exercices=>{}}
			res.should === true
		end
	end
	describe ":dispatch_data" do
		# :Roadmap.Data.dispatch_data
		before :all do
			JS.run "Roadmap.md5=null"
			JS.run "Roadmap.partage=null"
			"Roadmap.md5".js.should be_nil
			"Roadmap.partage".js.should be_nil
		  run 'dispatch_data({md5:"unfauxmd5",partage:"7"})'
		end
		it { should_respond_to :dispatch_data }
		it "doit définir le md5 de la roadmap" do
			"Roadmap.md5".js.should == "unfauxmd5"
		end
		it "doit définir le niveau de partage de la roadmap" do
			"Roadmap.partage".js.should == 7
		end
	end
	
	describe ":dispatch_exercices" do
		before(:all) do
			@data_exercices = [
				{:id => "1", :titre => "Le titre du 1", :tempo => 120, :tempo_max => 140, :tempo_min => 60},
				{:id => "2", :titre => "Le titre du 2", :tempo => 80, :tempo_max => 100, :tempo_min => 40}
				].to_json
			# puts "data_exercices: #{@data_exercices}"
		end
	  # :Roadmap.Data.dispatch_exercices
		it { should_respond_to :dispatch_exercices }
		it "doit définir Roadmap.Data.EXERCICES" do
		  JS.run "Roadmap.reset_all()"
		  JS.run "Roadmap.Data.EXERCICES = null"
			"Roadmap.Data.EXERCICES".js.should be_nil
			run "dispatch_exercices({ordre:['1','2']},#{@data_exercices})"
			res = "Roadmap.Data.EXERCICES".js
			res.should_not be_nil
			res['ordre'].should == ["1", "2"]
		end
		it "doit construire les exercices" do
		  JS.run "Roadmap.reset_all()"
			onav.ul(:id => 'exercices').li().should_not exist
			run "dispatch_exercices({ordre:['1','2']},#{@data_exercices})"
			onav.ul(:id => 'exercices').li(:id => "li_ex-1").should exist
			onav.ul(:id => 'exercices').li(:id => "li_ex-2").should exist
		end
	end
	
	describe ":dispatch_config_generale" do
		# :dispatch_config_generale
		it { should_respond_to :dispatch_config_generale }
		it "doit dispatcher les données" do
		  run "dispatch_config_generale", {:start_to_end=>true,:down_to_up=>true,:maj_to_rel=>true,:last_changed=>'start_to_end'}
		  run "dispatch_config_generale", "{start_to_end:true,down_to_up:true,maj_to_rel:true,last_changed:'start_to_end'}"
			get_property('start_to_end').should be_true
			get_property('down_to_up').should be_true
			get_property('maj_to_rel').should be_true
			get_property('last_changed').should == 'start_to_end'
		  run "dispatch_config_generale", {:start_to_end=>false,:down_to_up=>false,:maj_to_rel=>false,:last_changed=>'maj_to_rel'}
			get_property('start_to_end').should be_false
			get_property('down_to_up').should be_false
			get_property('maj_to_rel').should be_false
			get_property('last_changed').should == 'maj_to_rel'
		end
	end
	describe ":show" do
		# :Roadmap.Data.show
		before :all do
		  open_roadmap 'exemple', 'exemple'
		end
		it { should_respond_to :show }
		it "doit afficher les textes corrects en fonction de la configuration" do
		  run "dispatch_config_generale", {:start_to_end=>true,:down_to_up=>true,:maj_to_rel=>true,:last_changed=>'start_to_end'}
			run "show"
			onav.span(:id => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.start_to_end".js
			onav.span(:id => 'down_to_up').text.should == "LOCALE_UI.Exercices.Config.down_to_up".js
			onav.span(:id => 'maj_to_rel').text[0..16].should == "LOCALE_UI.Exercices.Config.maj_to_rel".js[0..16]
		  run "dispatch_config_generale", {:start_to_end=>false,:down_to_up=>true,:maj_to_rel=>false,:last_changed=>'start_to_end'}
			run "show"
			onav.span(:id => 'start_to_end').text.should == "LOCALE_UI.Exercices.Config.end_to_start".js
			onav.span(:id => 'down_to_up').text.should == "LOCALE_UI.Exercices.Config.down_to_up".js
			onav.span(:id => 'maj_to_rel').text[0..16].should == "LOCALE_UI.Exercices.Config.rel_to_maj".js[0..16]
		end
	end

	describe ":get_config_generale" do
	  it "doit fonctionner" do
	    pending "à coder"
	  end
	end

end