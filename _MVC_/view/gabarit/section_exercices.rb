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

# Texte d'introduction placé à l'accueil dans la liste des exercices
expli = File.read(File.join(APP_FOLDER, 'data', 'locale', Html::lang, 'accueil.html'))

# UL de la liste des exercices
html << '<ul id="exercices">'+expli+'</ul>'
html << '</section>' # section_exercices
# Le code à retourner
html