=begin

  Méthodes pratiques pour l'interface

=end

# Retourne le div contenant la configuration générale
def config_generale
	onav.div(:id => 'config_generale')
end

# Retourne la section des exercices
def section_exercices
  onav.section(:id => 'section_exercices')
end
# Retourne la liste UL des exercices
def ul_exercices
	section_exercices.ul(:id => 'exercices')
end
# => Return le LI d'un exercice
def li_exercice id
  ul_exercices.li(:id => "li_ex-#{id}")
end

# => Return le formulaire pour l'édition/création d'exercice
def exercice_form
  onav.table(:id => 'exercice_form')
end
# Ouvre le formulaire d'édition de l'exercice
def open_exercice_form
  JS.run "Exercices.Edition.open()"
  Watir::Wait.until{exercice_form.table(:id => 'exercice_form').visible?}
end
# Ferme le formulaire d'édition de l'exercice
def close_exercice_form
  JS.run "Exercices.Edition.close()"
  Watir::Wait.while{exercice_form.table(:id => 'exercice_form').visible?}
end

# => Retourne la boite d'aide (section)
def section_aide
  onav.section(:id => 'aide')
end
# Supprime la section d'aide si elle existe
def remove_aide
  JS.run 'Aide.init(true)'
  Watir::Wait.while{ onav.section(:id => 'aide').div(:id => 'aide_content').text != "" }
end
# Retourne la boite d'identification (dans Aide)
def boite_identification
  onav.div(:id => 'user_signin_form')
end
alias :signin_form :boite_identification
# => Return la boite d'inscription (dans Aide)
def boite_inscription
  onav.div(:id => 'user_signup_form')
end
alias :signup_form :boite_inscription