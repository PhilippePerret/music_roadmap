require 'spec_helper'

describe 'User' do
  before :all do
    App::autorize_phil App::folder_user_data
    App::autorize_phil User::path_names_file if File.exists? User::path_names_file

    # Débug : pour voir la liste des noms enregistrés
    if File.exists? User::path_names_file
      name_list = App::load_data User::path_names_file
    end
    
  end
  
  after :all do
    App::autorize_www App::folder_user_data
    App::autorize_www User::path_names_file if File.exists? User::path_names_file
  end
  
  describe 'Méthode de classe' do
    
    # add_nom
    describe '::add_nom' do
      # Doit ajouter un nom à la liste des nom
      it 'répond' do
        expect(User).to respond_to :add_nom
      end
      it 'ajoute le nom à la liste' do
        duser = {:nom => "Un nouveau nom à #{Time.now.to_i}", :mail => "unmail@chez.lui", :instrument => "piano"}
        user = User::new duser
        expect(User::nom_exists? duser[:nom]).to eq(false)
        User::add_nom user
        expect(User::nom_exists? duser[:nom]).to eq(true)
        list = App::load_data User::path_names_file
        expect(list).to have_key duser[:nom]
        expect(list[duser[:nom]]).to eq(duser[:mail])
      end
    end
    # nom_exists?
    describe '::nom_exists?' do
      it 'répond' do
        expect(User).to respond_to :nom_exists?
      end
      it 'retourne true si le nom existe' do
        expect(User::nom_exists? 'Phil').to eq(true)
      end
      it 'retourne false si le nom n’existe pas' do
        expect(User::nom_exists? "Un nom tout à fait improbable #{Time.now.to_i}").to eq(false)
      end
    end
  end
end