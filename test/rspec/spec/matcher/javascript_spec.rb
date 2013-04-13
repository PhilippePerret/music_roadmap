require 'spec_helper'

describe "Common Javascript Matchers" do
  before :all do
    nav.home :reload => false
  end
	describe ":be_like" do
	  it "doit retourner false si les deux choses sont différentes" do
	    "Bon".should_not be_like("Mauvais")
	  end
		it "doit retourner true si les deux choses sont équivalentes" do
		  JS.run "good = 'Je suis ça'"
			JS.run "autre = good"
			"good".should be_like 'autre'
		end
	end
	describe ":be_defined (defined?)" do
	  it { "VauteurSlap#{Time.now.to_i}".should_not be_defined }
		it { "Aide".should be_defined }
	end
	describe ":be_an_js_object" do
	  it { "Aide".should be_a_js_object }
	end
	describe ":be_a_method_of" do
		it "doit retourner true si la méthode existe" do
		  "open".should be_a_method_of "Aide"
		end
		it "doit retourner false si la méthode n'existe pas" do
		  "bad_method".should_not be_a_method_of "Aide"
		end
		it "doit mettre la classe dans le message" do
		  JS.run "ex = new Exercice('bad')"
			expect{"update".should_not be_a_method_of "ex"}.to raise_error
		end
		it "doit vérifier que l'objet existe" do
		  expect{"update".should be_a_method_of "bad"}.to raise_error
		end
	end
end

describe "Javascript Matchers propres à l'application" do
  before :all do
    nav.home :reload => false
  end
	describe ":be_an_exercice" do
	  it "doit retourner true si c'est un exercice" do
	    "badex".should_not be_an_exercice
	  end
		it "doit retourner false si ça n'est pas un exercice" do
		  JS.run "goodex = new Exercice"
			"goodex".should be_an_exercice
		end
	end
end