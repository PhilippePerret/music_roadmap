require 'spec_helper'

describe 'Essai de connexion au site ONLINE', :type => :feature do
  
  it 'folder_should_exist doit répondre' do
    folder_should_exist 'user/data'
    folder_should_not_exist 'user/data-bad'
  end
  
end