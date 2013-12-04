# coding: UTF-8

=begin

  View des paramètres
  --------------------
  
  Renvoie le code de la vue contenant les réglages actuels des exercices
  
=end

html = ""

# --- LES EXERCICES ---
html << '<section id="section_exercices">'
# Boutons
html << Html::load_view('gabarit/boutons_exercices.html')
# Boite extrait
html << Html::load_view('gabarit/extrait_partition.html')
# Création édition
html << Html::load_view('gabarit/form_exercice.html')
# Boite pour la BDE
html << Html::load_view('gabarit/dbe.html')
# Section pour la gestion des séances de travail
html << Html::load_view('gabarit/seance.html')
# Section pour la gestion des rapports
html << Html::load_view('gabarit/rapport.rb')
# UL de la liste des exercices
html << '<ul id="exercices"></ul>'
html << '</section>' # section_exercices
# Le code à retourner
html