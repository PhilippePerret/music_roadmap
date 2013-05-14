

html = ""

html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'metronome.html'))
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'infos_exercice.html'))

html