# Test du chargement des locales en fonction de la langue

require 'spec_helper'

describe "Chargement des locales" do
  describe "Indépendant de la langue" do
    it "LOCALE_UI doit exister" do
			js_object_should_exist 'LOCALE_UI'
    end
		it "MESSAGES doit exister" do
			js_object_should_exist 'MESSAGES'
		end
		it "ERRORS doit exister" do
			js_object_should_exist 'ERRORS'
		end
  end
	describe "Chargement de la version française" do
		before(:all) do
		  goto_home :lang => 'fr'
		end
		it "LOCALE_UI doit être en français" do
		  "LOCALE_UI.lang".js.should == "fr"
		end
		it "MESSAGES doit être en français" do
		  "MESSAGES.lang".js.should == "fr"
		end
		it "ERRORS doit être en français" do
		  "ERRORS.lang".js.should == "fr"
		end
	end
	describe "Chargement de la version anglaise" do
		before(:all) do
		  goto_home :lang => 'en'
		end
		it "LOCALE_UI doit être en anglais" do
		  "LOCALE_UI.lang".js.should == "en"
		end
		it "MESSAGES doit être en anglais" do
		  "MESSAGES.lang".js.should == "en"
		end
		it "ERRORS doit être en anglais" do
		  "ERRORS.lang".js.should == "en"
		end
	end
end