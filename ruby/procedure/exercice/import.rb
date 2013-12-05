=begin

  Procédure AJAX d'importation
  ----------------------------
  La procédure reçoit une liste de chemins (séparés par ";") et retourne
    - La liste des exercices trouvé
    - La liste des erreurs rencontrées
  Elle crée également tous les exercices trouvés dans le roadmap courant
  
=end
require 'fileutils'
load_model 'roadmap' unless defined?(Roadmap)
require 'procedure/exercice/save'
require 'procedure/roadmap/load'

def ajax_exercice_import
  erreurs   = []
  exercices = []

  rm_to = Roadmap.new param(:rm_nom), param(:rm_mail)
  
  duser = {:mail => param(:rm_mail), :md5 => param(:md5)}
  begin
    raise "unknown" unless rm_to.exists?
    raise "bad_owner" unless rm_to.owner_or_admin?( duser )
  rescue Exception => e
    RETOUR_AJAX[:error] = "ERROR.Roadmap.#{e.message}"
    return
  end
  
  
  rm_to.build_folders # pour les tests car devrait toujours exister, ici
  
  
  # Il faut charger les identifiants courant pour en trouver de nouveaux
  data = roadmap_load param(:rm_nom), param(:rm_mail), {:data_exercices => true}
  $liste_ids = data[:data_exercices][:ordre]

  # # débug
  # erreurs << "Paths reçues : '#{param(:data)}'"
  # erreurs << "liste_ids au départ : #{$liste_ids.join(', ')}" # bizarrement, c'est vide
  # # /debug
  
  param(:data).split(',').each do |dstr|
    nom, mdp, old_id = dstr.strip.split('/')
    m_from = Roadmap.new nom, mdp
    if !File.exists?( m_from.folder_exercices )
      erreurs << "La feuille de route “#{nom}-#{mdp}” n'existe pas ou n'a pas d'exercices…"
    else # Le dossier existe
      ok, dex = load_this_exercice m_from, old_id, rm_to # fonction locale
      if ok
        # L'exercice existe et a pu être chargé
        dex[:id] = new_id = get_new_id          # Identifiant unique
        
        # # debug
        # erreurs << "New ID créé : #{new_id} (pas une erreur, pour retour)"
        # erreurs << "Nouvelle liste_ids : #{$liste_ids.join(', ')}"
        # # /debug
        
        exercice_save dex, rm_to                   # Sauvegarde dans la roadmap
        copie_image m_from, old_id, rm_to, new_id  # Copie image si elle existe
        copie_sound m_from, old_id, rm_to, new_id  # Copie son s'il existe
        exercices << dex                          # Ajout à liste pour JS
      else
        erreurs << "L'exercice #{dstr} n'a pas pu être chargé : #{dex}…"
      end
    end
  end
  RETOUR_AJAX[:error]     = erreurs.join('<br />') unless erreurs.empty?
  RETOUR_AJAX[:exercices] = exercices
end

def load_this_exercice m_from, old_id, rm_to
  begin
    path = File.join(m_from.folder_exercices, "#{old_id}.msh")
    raise "Cet exercice est introuvable" unless File.exists? path
    [ true, App::load_data path ]
  rescue Exception => e
    [ false, e.message ]
  end
end

def copie_image m_from, old_id, rm_to, new_id
  path_jpg = File.join(m_from.folder_exercices, "#{old_id}.jpg")
  path_png = File.join(m_from.folder_exercices, "#{old_id}.png")
  if File.exists? path_jpg
    FileUtils.cp path_jpg, rm_to.path_image_jpg( new_id )
  elsif File.exists? path_png
    FileUtils.cp path_png, rm_to.path_image_png( new_id )
  end
end
def copie_sound m_from, old_id, rm_to, new_id

end
def get_new_id
  i = 0
  while true do
    i += 1
    istr = i.to_s
    if $liste_ids.index(istr) === nil
      $liste_ids << istr
      return istr
    end
  end
end