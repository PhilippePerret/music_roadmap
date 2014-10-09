require 'spec_helper'


feature 'Ajout d’exercices de la BDE à une roadmap' do

  scenario 'Benoit ajoute tous les Hanons sauf le 60 (gel: benoit_roadmap_hanon)' do
    degel 'benoit_first_empty_roadmap'
    identify_benoit

    # Les éléments qu'on ne doit pas trouver
    ['table#exercice_form', 'div#database_exercices'].each do |jqobj|
      expect(page).to_not have_css(jqobj)
    end
    benoit_choose_roadmap 'Nouvelle_roadmap'
    shot "after-choose-roadmap"

    # Benoit clique sur "Nouvel exercice"
    expect(page).to have_css('a#btn_exercice_create')
    page.find('a#btn_exercice_create').click # ne fonctionne pas avec click_link…
    # Le formulaire pour un nouvel exercice doit être ouvert
    expect(page).to have_css('table#exercice_form')
    expect(page).to have_css('a#seach_ex_in_database')

    # Benoit clique sur le bouton de recherche dans la base de données
    click_link 'seach_ex_in_database'
    expect(page).to have_css('div#database_exercices')
    expect(page).to_not have_css('div#div_recueils_auteur-hanon')

    # Benoit clique sur le bouton pour afficher les exercices Hanon
    click_link "Charles-Louis Hanon"
    expect(page).to have_css('div#div_recueils_auteur-hanon')
    expect(page).to_not have_css('div#div_recueil_content-hanon-pianiste_virtuose_part_1')

    {
      1 => (1..20),
      2 => (21..43),
      3 => (44..59)
    }.each do |irecueil, range_exos|
      expect(page).to_not have_css("div#div_recueil_content-hanon-pianiste_virtuose_part_#{irecueil}")
      # Benoit clique le bouton pour voir la première partie
      click_link "btn_load_exercices_of-hanon-pianiste_virtuose_part_#{irecueil}"
      expect(page).to have_css("div#div_recueil_content-hanon-pianiste_virtuose_part_#{irecueil}")
      # Benoit clique le bouton pour tout cocher
      within("div#div_recueil_content-hanon-pianiste_virtuose_part_#{irecueil}") do
        click_button "Tout cocher"
      end
      # ==> Test : Tous les exercices doivent être cochés
      within("div#div_exercices-hanon-pianiste_virtuose_part_#{irecueil}") do
        range_exos.each do |iex|
          expect(find("input#cb_dbex-hanon-pianiste_virtuose_part_#{irecueil}-#{iex}")).to be_checked
        end
        # Benoit décoche le 60
        if irecueil == 3
          uncheck 'cb_dbex-hanon-pianiste_virtuose_part_3-60'
        end
      end
    end

    # Le 60e ne doit pas être sélectionné
    within("div#div_exercices-hanon-pianiste_virtuose_part_3") do
      expect(page).to have_css 'input#cb_dbex-hanon-pianiste_virtuose_part_3-60'
      expect(find('input#cb_dbex-hanon-pianiste_virtuose_part_3-60')).to_not be_checked
    end

    # Benoit clique sur le bouton pour ajouter ces exercices
    click_on 'btn_dbe_add_selected'

    # => Test : La page doit afficher la liste des exercices choisis
    expect(page).to have_css('ul#exercices')
    # Il doit y avoir 59 exercices affichés
    within('ul#exercices') do
      (1..59).each do |iex|
        expect(page).to have_css("li#li_ex-#{iex}")
        within("li#li_ex-#{iex}") do
          # On vérifie juste quelques indications
          expect(page).to have_css("div#titre_ex-#{iex}")
          within("div#titre_ex-#{iex}") do
            expect(page).to have_css "span.ex_auteur", text: "(Hanon)"
            expect(page).to have_css "span.ex_titre", text: "Exercice n°#{iex}"
          end
        end
      end
      expect(page).to_not have_css('li#li_ex-60')
    end

    # => Test : des fichiers et dossiers créés
    rm_folder = folder_roadmap benoit, "Nouvelle_roadmap"
    # - Le fichier LAST_ID_EXERCICE
    file_should_exist "#{rm_folder}/LAST_ID_EXERCICE"
    res = data_of "#{rm_folder}/LAST_ID_EXERCICE", :integer
    expect(res).to eq(59)
    # - Le premier et le dernier exercice
    file_should_exist "#{rm_folder}/exercice/1.msh"
    file_should_exist "#{rm_folder}/exercice/59.msh"
    
    dataex1 = data_of("#{rm_folder}/exercice/1.msh")
    # puts dataex1.inspect
    {
      :instrument => "piano", :recueil => "Le Pianiste virtuose (1<sup>ère</sup> Partie)",
      :titre=>"Exercice n°1", :auteur => "Hanon", 
      :nb_mesures => 59, :tempo_min => 60, :tempo_max => 108, :tempo => 60, :up_tempo => nil,
      :start_at => nil, :ended_at => nil, 
      :tone => nil, :obligatory => nil, :with_next => nil, 
      :note => nil
    }.each do |k, v|
      expect(dataex1[k]).to eq(v)
    end
    
    gel "benoit_roadmap_hanon"
  end
end