# coding: UTF-8

html = ""

html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'metronome.html'))
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'infos_exercice.html'))
if Params::offline?
  # html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'boite_admin.rb'))
  html << Html::load_view('gabarit/boite_admin.rb')
end
html