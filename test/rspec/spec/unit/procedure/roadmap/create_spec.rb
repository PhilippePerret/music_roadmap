=begin

	Test de la procédure roadmap/create
	
=end
require 'spec_helper'
require_model 'roadmap'

require File.join(APP_FOLDER, 'data','secret','data_phil.rb') # => DATA_PHIL

describe "Procédure roadmap_create" do
  describe "Pré-requis" do
    it "doit avoir son fichier" do
      path = File.join(FOLDER_PROCEDURES, 'roadmap', 'create.rb')
			File.exists?(path).should be_true
    end
		it "doit répondre à roadmap_create" do
			require 'procedure/roadmap/create'
		  expect{roadmap_create({})}.not_to raise_error NameError
		end
  end

	describe "roadmap_create" do
		before :all do
		  require 'procedure/roadmap/create'
		end
		context "avec des data invalides" do
			describe "doit retourner une erreur si" do
				before :each do
					nom = "rmtest#{Time.now.to_i}"
					mdp = "rmmdp"
				  @data = {:nom => nom, :mdp => mdp, 
						:mail => DATA_PHIL[:mail], :md5 => DATA_PHIL[:md5], 
						:salt => DATA_PHIL[:instrument],
						:partage => 0}
				end
				[:nom, :mdp, :mail, :md5, :salt, :partage].each do |key|
					it "le #{key} n'est pas fourni" do
					  roadmap_create(@data.merge(key => nil)).should == "ERRORS.Roadmap.cant_create"
					end
				end
				it "le mail ne correspond à aucun utilisateur" do
				  roadmap_create(@data.merge(:mail => 'nil@nil')).should == "ERRORS.Roadmap.cant_create"
				end
				it "le md5 n'est pas celui de l'user" do
				  roadmap_create(@data.merge(:md5 => 'badmd5')).should == "ERRORS.Roadmap.cant_create"
				end
				it "la roadmap existe déjà" do
				  roadmap_create(@data.merge(:nom => 'testable', :mdp => 'testable')).should == "ERRORS.Roadmap.cant_create"
				end
			end
		end
		
	  context "avec des data valides" do
			before :all do
				keep(:justebefore => Time.now.to_i)
				nom = "roadmap#{Time.now.to_i}"
				mdp = "mdprm#{Time.now.to_i}"
				keep(:nom => nom, :mdp => mdp)
			  data = {:nom => nom, :mdp => mdp, 
					:mail => DATA_PHIL[:mail], :md5 => DATA_PHIL[:md5], 
					:salt => DATA_PHIL[:instrument],
					:partage => 0}
				keep(:rm => Roadmap.new( kept(:nom), kept(:mdp)) )
				$roadmaps_to_destroy << kept(:rm).folder
				# -->
				keep(:resultat => roadmap_create( data ))
				# <--
			end
			subject { kept(:rm) }
			it "doit retourner nil" do
			  kept(:resultat).should be_nil
			end
			describe "doit créer le dossier" do
		  	it "de la roadmap" do
		  	  File.exists?(subject.folder).should be_true
		  	end
				it "des exercices" do
				  File.exists?(subject.folder_exercices).should be_true
				end
			end
			describe "doit créer un fichier data.js contenant" do
				subject { JSON.parse(File.read(kept(:rm).path_data)).to_sym }
				it "le nom" do
				  subject.should have_key :nom
					subject[:nom].should == kept(:nom)
				end
				it "le mdp" do
				  subject.should have_key :mdp
					subject[:mdp].should == kept(:mdp)
				end
				it "le mail de l'user" do
				  subject.should have_key :mail
					subject[:mail].should == DATA_PHIL[:mail]
				end
				it "le md5 de l'user" do
				  subject.should have_key :md5
					subject[:md5].should == DATA_PHIL[:md5]
				end
				it "la date de création" do
					subject.should have_key :created_at
					subject[:created_at].should be >= kept(:justebefore)
				end
				it "doit mettre la date de modification" do
					subject.should have_key :updated_at
					subject[:updated_at].should be >= kept(:justebefore)
				end
			end
	  end
	  
	end
end