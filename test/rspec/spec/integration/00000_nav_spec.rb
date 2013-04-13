=begin

	Simplement pour tester l'efficaticité de nav::Nav.singleton
	
=end
require 'spec_helper'

describe nav do
  it { should respond_to :home }
	describe ":home" do
		context "sans options" do
			before :all do
			  subject.home
			end
		  it "doit rejoindre l'accueil" do
				onav.url.should start_with "http://" + (ONLINE ? URL_ONLINE : URL_OFFLINE)
		  end
			it "doit afficher une page française" do
			  onav.title.should =~ /Feuille de Route Musicale/
			end
		end
		
		context "avec option de langue anglaise" do
			before :all do
			  subject.home :lang => 'en'
			end
			it "doit rejoindre l'accueil" do
				onav.url.should start_with "http://" + (ONLINE ? URL_ONLINE : URL_OFFLINE)
			end
			it "doit afficher une page en anglais" do
			  onav.title.should =~ /Music Roadmap/
			end
		end
		
	end

end