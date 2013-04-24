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
# Formulaire de séance de travail (formulaire et compte rendu)
html << File.read(File.join(FOLDER_VIEWS, 'gabarit', 'seance_travail.html'))
# UL de la liste des exercices
html << '<ul id="exercices"></ul>'
html << '</section>' # section_exercices
# Le code à retourner
html