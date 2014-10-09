# Test d'acceptance de la création d'une roadmap

require 'spec_helper'


feature 'Création d’une Roadmap' do
  def rm_data
    @rm_data ||= {
      :nom => "Nouvelle roadmap"
    }
  end
  background do
    degel 'benoit_simple'
  end

  scenario 'User crée une roadmap avec succès' do
    # On vérifie qu'aucun élément qui doit être créé n'existe
    rm_folder = './user/roadmap/Nouvelle_roadmap-benoit.ackerman@yahoo.fr'
    folder_should_not_exist rm_folder
    expect(roadmaps_of data_benoit[:mail]).to be_empty # aucune roadmap

    identify_benoit
    expect(page).to_not have_css('a#btn_roadmap_create')
    # Benoit rentre un nom de roadmap
    fill_in 'roadmap_nom', with: rm_data[:nom]
    # => Le bouton "Créer" doit apparaitre
    expect(page).to have_css('a#btn_roadmap_create')
    shot 'after-roadmap-name'
    # Benoit clique sur le bouton "Créer"
    click_link 'btn_roadmap_create'

    expect(page).to have_content("Feuille de route créée avec succès !")

    # === Test de la bonne création de la roadmap ===
    folder_should_exist rm_folder
    # Tous les fichiers qu'il doit contenir
    ['config_generale.msh', 'data.msh', 'exercices.msh', 'log.txt'].each do |nfile|
      file_should_exist "#{rm_folder}/#{nfile}"
    end
    # Tous les dossiers qu'il doit contenir
    ['exercice'].each do |ndos|
      folder_should_exist "#{rm_folder}/#{ndos}"
    end

    # La nouvelle roadmap doit être enregistrée dans la liste des roadmaps de
    # Benoit
    rms = roadmaps_of data_benoit[:mail]
    expect(rms).to include "Nouvelle_roadmap"

    # # On fait un gel si des choses ont été changées
    # gel 'benoit_first_empty_roadmap'
    # folder_should_exist "./gels/benoit_first_empty_roadmap"
    #
  end

  scenario 'User crée une roadmap avec des erreurs' do
    identify_benoit

    # Le bouton n'apparait pas si le nom est trop court
    fill_in 'roadmap_nom', with: "sho"
    expect(page).to_not have_css('a#btn_roadmap_create')

    # Le bouton apparait si le nom est assez long
    fill_in 'roadmap_nom', with: "shor"
    expect(page).to have_css('a#btn_roadmap_create')

    # Erreur : Nom de roadmap invalide au niveau des caractères
    fill_in 'roadmap_nom', with: "l'été ça va bien"
    expect(page).to have_css('a#btn_roadmap_create')
    find('body').click # pour blurer le champ
    shot 'after-correction-nom'
    # => erreur
    expect(page).to have_content "Le nom contient des caractères invalides que j'ai supprimés ou remplacés"
    expect(page.find('input#roadmap_nom').value).to eq("lete_ca_va_bien")
    # Ne fonctionne pas :
    # expect(page).to have_css 'input#roadmap_nom', text: "lete_ca_va_bien"

    # Erreur : Nom de roadmap trop long
    fill_in 'roadmap_nom', with: "#{'g f'*10}trop"
    find('body').click # pour blurer le champ
    expect(page).to have_content "Ce nom est trop long (max 30 signes)"
    shot 'after-too-long'

  end

  scenario 'Benoit crée une roadmap de même nom' do
    degel 'benoit_first_empty_roadmap'
    identify_benoit

    # Erreur : Nom de roadmap déjà utilisé par Benoit
    fill_in 'roadmap_nom', with: "Nouvelle_roadmap"
    click_link 'btn_roadmap_create'

    #=> erreur
    expect(page).to have_content "Vous possédez déjà une feuille de route de ce nom. Cliquez le bouton “Ouvrir” pour l'ouvrir."

  end
 
  scenario 'User ne peut pas créer plus de 10 roadmaps' do
    identify_benoit
    11.times do |itime|
      fill_in 'roadmap_nom', with: "Roadmap#{itime}"
      click_link 'btn_roadmap_create'
      # sleep 0.7
      if itime < 10
        expect(page).to have_content "Feuille de route créée avec succès !"
      else
        expect(page).to have_content "Désolé, mais vous ne pouvez pas créer plus de dix feuilles de route…"
      end
    end
  end
end