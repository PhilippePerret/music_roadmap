# Tests de l'objet UI propre à l'application

require 'spec_helper'

describe "Objet JS UI (propre à l'application)" do
	def js_should_exist method
		js_method_should_exist "UI.#{method}"
	end
	describe "doit répondre à la méthode générale" do
	  it ":init" do
	    js_should_exist 'init'
			# Pour le moment, elle ne fait rien
	  end
	end
	
	# :add
	describe ":add" do
	  it "doit exister" do
	    js_should_exist 'add'
	  end
		it "doit permettre d'ajouter un élément dans le DOM" do
			if onav.div(:id => 'pour_test_add').exists?
		  	JS.run "$('div#pour_test_add').remove()"
			end
			should_not_exist :div => 'pour_test_add'
			JS.run "UI.add('ul#exercices', '<div id=\"pour_test_add\">Pour test</div>')"
			onav.ul(:id => 'exercices').div(:id => 'pour_test_add').should exist
		end
	end
	
	# :add_body
	describe ":add_body" do
	  it "doit exister" do
	    js_should_exist 'add_body'
	  end
	end
	
	# :remove
	describe ":remove" do
	  it "doit exister" do
	    js_should_exist 'remove'
	  end
		it "doit permettre de supprimer un élément du DOM" do
		  unless onav.div(:id => 'pour_test_add').exists?
				JS.run "UI.add('ul#exercices', '<div id=\"pour_test_add\">Pour test</div>')"
			end
			should_exist :div => 'pour_test_add'
			JS.run "UI.remove('div#pour_test_add')"
			should_not_exist :div => 'pour_test_add'
		end
	end
	
	# :focus
	describe ":focus" do
	  it "doit exister" do
	    js_should_exist 'focus'
	  end
		it "doit mettre le focus sur l'élément" do
			unless onav.text_field(:id => 'pour_test').exist?
		  	JS.run "UI.add_body('<input type=\"text\" value=\"\" id=\"pour_test\"/>')"
			end
			should_not_focused :input => 'pour_test'
			JS.run "UI.focus('input#pour_test')"
			should_focused :input => 'pour_test'
		end
		it "doit permettre de mettre le focus en définissant la valeur" do
			JS.run "UI.remove('input#pour_test')"
		  JS.run "UI.add_body('<input type=\"text\" value=\"\" id=\"pour_test\"/>')"
	  	watir_e(:input => 'pour_test').value.should == ""
			JS.run "UI.focus('input#pour_test', 'avec cette valeur')"
			should_focused :input => 'pour_test'
	  	watir_e(:input => 'pour_test').value.should == 'avec cette valeur'
		end
	end
end