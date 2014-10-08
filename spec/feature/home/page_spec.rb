require 'spec_helper'

describe 'La page d’accueil', :type => :feature do
  before :each do
    visit '/'
  end
  
  describe 'présente les liens utiles' do
    it 'pour s’identifier ou s’inscrire' do
      expect(page).to have_link('btn_want_signin')
    end
    it 'pour afficher l’aide' do
      expect(page).to have_link('btn_help')
    end
    it 'pour contacter l’administrateur' do
      expect(page).to have_link('mail_to_phil')
    end
  end
  
  describe 'contient la section' do
    it 'des boutons principaux' do
      expect(page).to have_selector('section#main_buttons')
    end
    it 'de la bande logo' do
      expect(page).to have_selector('section#bande_logo')
    end
    it 'du métronome' do
      expect(page).to have_selector('section#sec_metronome')
    end
    it 'de l’exercice courant (mais masqué)' do
      expect(page).to_not have_selector('section#current_exercice')
    end
    it 'de la feuille de route' do
      expect(page).to have_selector('section#roadmap')
    end
    it 'de l’aide (mais masquée)' do
      expect(page).to_not have_selector('section#aide')
    end
    
  end
  
end