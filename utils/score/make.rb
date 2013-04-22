# sticky true => le script se poursuit, mais la note reste jusqu'à ce qu'on clique dessus
def folder_roadmap
  File.join(Dir.home, 'Sites', 'cgi-bin', 'music_roadmap')
end
def path_picto
  File.join(folder_roadmap, '_MVC_', 'view', 'img', 'metronome', 'picto.tiff')
end
def notify_with_growl title, description, sticky = false
  sticky_bool = sticky ? " sticky true" : ""
  add_sticky = sticky ? "\n\n *** CLICK ON ME ***" : ""
  un_picto = File.exists? path_picto
  
  cmd = "notify with name \"Procedure\" title \"#{title}\" " +
        "description \"#{description}#{add_sticky}\" "  +
        "application name \"Make_Extraits_Partitions\"" + sticky_bool
  cmd += " image mypic" if un_picto
  puts "cmd: #{cmd}"

  return <<-APPLESCRIPT
  tell application "Growl"
    # register as application ¬
    #   "Make_Extraits_Partitions" all notifications {"Procedure"} ¬
    #   default notifications {"Procedure"} ¬
    #   icon of application "Script Editor"
    if #{un_picto.inspect} then
      set mypic to read "#{path_picto}" as TIFF picture
    end
  	#{cmd}
  end tell
  APPLESCRIPT
end

FOLDER_PIANO = File.join(Dir.home, 'Music', 'Piano', 'Exercices')
FOLDER_DB_EXERCICES = File.join(folder_roadmap, 'data', 'db_exercices')

def notify title, description, sticky = false
  open("|osascript", "w") { |io| io << notify_with_growl(title, description, sticky) }
end

pause_time = ARGV[0]
if pause_time.nil?
  PAUSE = 20
else
  PAUSE = pause_time.to_i
  notify "Pause", "Les pauses duront #{PAUSE} secondes"
end

unless File.exists? FOLDER_DB_EXERCICES
  notify "# DOSSIER INTROUVABLE", "Le dossier FOLDER_DB_EXERCICES (#{FOLDER_DB_EXERCICES}) est introuvable. Redéfinis son path."
  exit
end
unless File.exists? FOLDER_PIANO
  notify "# DOSSIER INTROUVABLE", "Le dossier FOLDER_PIANO (#{FOLDER_PIANO}) est introuvable. Redéfinis son path."
  exit
end

notify "Ouverture des dossiers", 
        "J'ouvre le dossier contenant les exercices de piano (partitions) et le dossier contenant la DB Exercice"
`open #{FOLDER_DB_EXERCICES}`
`open #{FOLDER_PIANO}`

sleep PAUSE / 3

notify "Choisir la partition", 
        "Choisis la partition dont il faut faire l'extrait, puis ouvre-la dans Aperçu.\nNOTE LA PAGE CONTENANT L'EXERCICE."
sleep PAUSE
notify "Ouvrir dans Gimp", "Ouvre la partition dans Gimp et choisis la page"
sleep PAUSE
notify "Croper la partition", "Dans Gimp, Crop la partition au maximum (MAJ + C)"
sleep PAUSE
notify "Dimension image", "Mets le canevas (Image > Taille du canevas) à 500 x 300"
sleep PAUSE
notify "Dimension du calque", "CMD + T pour redimensionner l'image à 500.\nNOTE: Lie hauteur et largeur si c'est la première fois."
sleep PAUSE
notify "Ajuster l'image", "Passer en vue 100% et ajuster (M) l'image au canevas"
sleep PAUSE
notify "Exporter l'image", "Exporter l'image au format JPG, avec une qualité de 60, et le nom <id exercice>-extrait.jpg"
sleep PAUSE
notify "Faire la vignette", "Mettre la taille du canevas à 200 x 100"
sleep PAUSE
notify "Ajuster la vignette", "Ajuster l'image pour qu'elle montre une petite partie"
sleep PAUSE / 2
notify "Exporter la vignette", "Exporter la vignette avec le nom <id exercice>-vignette.jpg"
sleep PAUSE
notify "Fin", "C'est la fin ! Tu peux me relancer pour en refaire une autre."
notify "Quelques indications utiles", "- Faire le fichier YAML de l'exercice en copiant-collant le texte d'une autre partition.\n- Une fois les fichiers préparés, tu peux lancer `$ rftp sync' pour les synchroniser ONLINE.\n- La définition des types d'exercices peut se trouver dans ./javascript/locale/en/constants.js", true