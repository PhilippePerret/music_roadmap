require 'spec_helper'


feature 'Identification' do
  scenario 'avec un mauvais mot de passe' do
    visit '/'
    click_link('btn_want_signin')
    within('div#user_signin_form') do
      fill_in 'user_mail',      with: data_benoit[:mail]
      fill_in 'user_password',  with: "bad-password"
      click_link('btn_signin')
    end
    sleep 2
    screenshot("Bad-password")
    expect(page).to_not have_content("Bienvenue sur Feuille de Route Musicale")
    expect(page).to have_content("Désolé, mais je ne parviens pas à vous reconnaitre…")
  end
  
  scenario 'avec un mauvais mail' do
    visit '/'
    click_link('btn_want_signin')
    within('div#user_signin_form') do
      fill_in 'user_mail',      with: "Mauvaise-adresse@mail"
      fill_in 'user_password',  with: data_benoit[:password]
      click_link('btn_signin')
    end
    sleep 2
    screenshot("Bad-mail")
    expect(page).to_not have_content("Bienvenue sur Feuille de Route Musicale")
    expect(page).to have_content("Désolé, mais je ne parviens pas à vous reconnaitre…")
  end
end