# Test d'une bonne inscription
require 'spec_helper'

def data_user
  @data_user ||= begin
    d = data_benoit
    @mail = d[:mail]
    @pwd  = d[:password]
    # Note : les données ne doivent comprendre que les noms des champs du 
    # formulaire et tous les noms des champs de formulaire
    {
      :nom  => d[:nom],
      :mail => @mail,
      :mail_confirmation => @mail,
      :password => @pwd,
      :password_confirmation => @pwd,
      :instrument => d[:instrument]
    }
  end
end

feature 'Inscription d’un nouvel utilisateur de Music-Roadmap' do
  background do
    # @note : Exécuté à chaque "scenario"
    visit('/tests_utilitaires.rb?op=erase_all')
  end
  
  scenario 'Un visiteur s’inscrit avec succès' do
    visit('/')
    
    expect(page).to have_link('btn_want_signin')
    click_link('btn_want_signin')
    expect(page).to have_css('div#user_signin_form')
    expect(page).to have_css('a#btn_want_signup')
    
    # L'user clique sur le bouton pour s'inscrire
    click_link('btn_want_signup')
    expect(page).to have_css('div#user_signup_form')
    
    # L'user remplit le formulaire
    data_user.each do |prop, value|
      unless prop == :instrument
        fill_in("user_#{prop}", with: value)
      else
        select(value.capitalize, from: 'instrument')
      end
    end
    
    # L'user clique sur S'inscrire
    click_link('btn_signup')
    
    # === Résultats ===
    # Les bons messages
    expect(page).to have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("Vous pouvez maintenant créer une feuille de route.")
    expect(page).to have_content("Indiquez son nom dans le champ vert ci-dessous.")

    # Le formulaire d'inscription doit être caché
    expect(page).to_not have_css('div#user_signin_form')
    
    shot 'after_signup'
    
    # Le champ pour inscrire un nom de feuille de route doit être vert
    expect(page).to have_css('input#roadmap_nom.green')
    
    # # On fait un gel s'il n'a pas encore été fait
    # gel 'benoit_simple'
    # shot "after-gel-benoit"
    
    # L'utilisateur se trouve sur la bonne page
    
  end
  
  scenario 'Un visiteur s’inscrit avec des erreurs' do
    degel 'benoit_simple'
    shot "after-degel-benoit"
    visit('/')
    
    expect(page).to have_link('btn_want_signin')
    click_link('btn_want_signin')
    expect(page).to have_css('div#user_signin_form')
    expect(page).to have_css('a#btn_want_signup')
    
    # L'user clique sur le bouton pour s'inscrire
    click_link('btn_want_signup')
    expect(page).to have_css('div#user_signup_form')
    
    # L'user remplit le formulaire
    data_user.each do |prop, value|
      unless prop == :instrument
        fill_in("user_#{prop}", with: value)
      else
        select(value.capitalize, from: 'instrument')
      end
    end
    
    # L'erreur volontaire
    fill_in('user_mail_confirmation', with: "mauvais@mail.com")
    click_link('btn_signup')
    
    # === Résultats ===
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("La confirmation de votre adresse email ne correspond pas")
    
    # = Erreur de confirmation de mot de passe =
    fill_in('user_mail_confirmation', with: @mail)
    fill_in('user_password_confirmation', with: "badconfirmationpwd")
    click_link('btn_signup')
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("La confirmation de votre mot de passe ne correspond pas")
    

    # = Erreur absence de pseudo =
    fill_in('user_password_confirmation', with: @pwd)
    fill_in('user_nom', with: '')
    click_link('btn_signup')
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("Votre nom ne peut être vide")

    # = Erreur adresse mail invalide =
    fill_in('user_nom', with: 'Benoit')
    fill_in('user_mail', with: 'mailinvalide')
    click_link('btn_signup')
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("Votre adresse email est invalide")
    
    # = Erreur adresse mail existant déjà =
    fill_in('user_nom', with: 'Un autre Benoit')
    fill_in('user_mail', with: data_user[:mail])
    click_link('btn_signup')
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("Cet email est celui d'un roadmapeur déjà inscrit")
    
    # = Erreur pseudo existant =
    adresse_unique = 'uneadresse@unique.fr'
    fill_in('user_nom', with: 'Benoit')
    fill_in('user_mail', with: adresse_unique)
    fill_in('user_mail_confirmation', with: adresse_unique)
    click_link('btn_signup')
    expect(page).to_not have_content("Vous êtes inscrit à Feuille de Route Musicale !")
    expect(page).to have_content("Ce nom est déjà porté par un Roadmapeur")
        
  end
end