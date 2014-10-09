# => Return Array des noms de roadmaps de l'utilisateur de mail +umail+
def roadmaps_of umail
  umail = umail.mail if umail.class == User
  user_data(umail)[:roadmaps]
end

# Note : Benoit doit être identifié (identify_benoit)
def benoit_choose_roadmap rm_name
  expect(page).to have_css 'select#roadmaps'
  select(rm_name, from: 'roadmaps')
  expect(page).to have_content('Feuille de route ouverte avec succès !')
end

# => Return le path au dossier de la roadmap +rm_name+ de l'utilisateur de mail +umail+
# @param umail    Soit le mail, soit l'user
def folder_roadmap umail, rm_name
  umail = umail.mail if umail.class == User
  File.join('.', 'user', 'roadmap', "#{rm_name}-#{umail}")
end