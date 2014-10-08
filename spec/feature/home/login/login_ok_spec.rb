require 'spec_helper'


feature 'Identification' do
  scenario 'L’user ouvre la boite d’identification et entre ses données correctes' do
    visit '/'
    click_link('btn_want_signin')
    within('div#user_signin_form') do
      fill_in 'user_mail', :with => data_benoit[:mail]
      fill_in 'user_password', :with => data_benoit[:password]
      click_link('btn_signin')
    end
    expect(page).to have_content("Bienvenue sur Feuille de Route Musicale")
  end
end