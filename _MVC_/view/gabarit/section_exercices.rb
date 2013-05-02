=begin

  View des paramètres
  --------------------
  
  Renvoie le code de la vue contenant les réglages actuels des exercices
  
=end

html = ""

# --- LES EXERCICES ---
html << '<section id="section_exercices">'
# Boutons
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'boutons_exercices.html'))
# Création édition
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'form_exercice.html'))
# Section pour la gestion des séances de travail
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'seance.html'))
# Section pour la gestion des rapports
html << eval(File.read File.join(FOLDER_VIEWS, 'gabarit', 'rapport.rb'))
# UL de la liste des exercices
html << '<ul id="exercices"></ul>'
html << '</section>' # section_exercices
# Le code à retourner
html