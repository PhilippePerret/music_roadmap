then "la page d'accueil doit s'afficher"
  # Browser should have url base_url

then "la page d'accueil doit contenir les bons éléments"
  # Browser should contain 'section#bande_logo'
  # Browser should contain image :id => 'metronome_anim', :src => /metro.gif/
  # Browser should contain section :id => 'partage'
  # Browser should display div :id => 'roadmap_specs'

then "la page d'accueil doit répondre aux méthodes utiles"
  # Browser should respond to "Aide.open"
  "Aide" should respond to "open" # test JS implicite

when /la boite d'identification (ne )?doit( plus| pas)? être ouverte/ then
  # Vérifie que la boite d'identification soit bien fermée ou ouverte
  # --
  ouverte = $1.nil? && $2.nil?
  if ouverte
    Browser should display div :id => 'user_signin_form'
  else
    Browser should not display div :id => 'user_signin_form'
  end

when /(?:le|la) (lien|bouton|label|case) #{STRING} doit avoir le label #{STRING}/ then
  # Teste le nom d'un élément comme un lien, un bouton, etc.
  # --
  wel_type  = $1 # lien, bouton, etc. (inusité pour le moment)
  wel_jid   = $2 # jID de l'élément (entre guillemets ou non)
  wel_label = $3 # contenu attendu
  wel_jid.sub!(/^(['"])?(.+)\1$/){$2}
  wel = Browser get wel_jid
  wel should not be nil
  wel should have label wel_label

# fin ds clauses
end
  