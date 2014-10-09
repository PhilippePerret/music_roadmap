# Test de la fabricaton d'une session
require 'spec_helper'

feature 'Session de travail' do
  
  scenario 'Benoit demande une session de travail' do
    degel 'benoit_roadmap_hanon'
    identify_benoit
    benoit_choose_roadmap "Nouvelle_roadmap"
    
    expect(page).to_not have_css 'section#seance'
    
    # Le lien pour confection une session
    expect(page).to have_css 'a#btn_seance_show_form'
    
    # Benoit clique
    click_on 'btn_seance_show_form'
    
    # => Test : Le formulaire de choix d'une séance de travail
    ['section#seance', 'div#seance_form', 'div#seance_form_champs',
      'select#seance_duree_heures', 'select#seance_duree_minutes',
      'div#div_seance_form_options',
      'input#seance_option_aleatoire', 'input#seance_option_same_ex',
      'input#seance_option_obligatory', 'input#seance_option_new_tone',
      'input#seance_option_next_config',
      'a#btn_cancel_seance', 'a#btn_seance_prepare'
    ].each do |jid|
      expect(page).to have_css jid 
    end
    
    # Puisque c'est une roadmap qui vient d'être créée, tous les réglages sont
    # les réglages par défaut
    [
      {type: 'select',    id: 'seance_duree_heures',        value: "0", new_value: "2"},
      {type: 'select',    id: 'seance_duree_minutes',       value: "0", new_value: "30"},
      {type: 'checkbox',  id: 'seance_option_next_config',  value: true, new_value: true},
      {type: 'checkbox',  id: 'seance_option_same_ex',      value: true, new_value: false}
      # NOTE : Il y en a d'autres
    ].each do |regdata|
      case regdata[:type]
      when 'select'
        expect(page.find("select##{regdata[:id]}").value).to eq(regdata[:value])
        select( regdata[:new_value], from: regdata[:id])
      when 'checkbox'
        if regdata[:value] === true
          expect(page.find("input##{regdata[:id]}")).to be_checked
          uncheck regdata[:id] if regdata[:new_value] === false
        else
          expect(page.find("input##{regdata[:id]}")).to_not be_checked
          check regdata[:id] if regdata[:new_value] === true
        end
      end
    end
    
    # Benoit demande la confection de la séance de travail
    click_on "btn_seance_prepare"
    
    # L'aperçu de la séance doit s'afficher
    [
      'a#btn_seance_play', # le bouton pour lancer la séance
      'section#seance', 'div#seance_start',
      'div#seance_start_shortcuts', # pour afficher les raccourcis
      'div#seance_start_description'
    ].each do |showed|
      expect(page).to have_css showed
    end
    [
      'div#seance_form'
    ].each do |hided|
      expect(page).to_not have_css hided
    end
    
  end # fin scénario
end