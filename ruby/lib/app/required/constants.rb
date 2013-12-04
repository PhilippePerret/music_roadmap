=begin

  Définition des constantes utiles et dossiers par défaut
  
  @requis:    APP_FOLDER    path au dossier de l'application
  
=end


FOLDER_RUBY       = File.join(APP_FOLDER, 'ruby')
FOLDER_LIB_RUBY   = File.join(FOLDER_RUBY, 'lib')
FOLDER_MVC        = File.join(APP_FOLDER, '_MVC_')
FOLDER_MODELS     = File.join(FOLDER_MVC, 'model')
FOLDER_PROCEDURES = File.join(FOLDER_RUBY, 'procedure')
# FOLDER_AJAX       = File.join(FOLDER_RUBY, 'ajax')

FOLDER_ROADMAP   = File.join(APP_FOLDER, 'user', 'roadmap')

$: << APP_FOLDER
$: << FOLDER_RUBY
$: << FOLDER_LIB_RUBY

ISCALE_TO_HSCALE = {
  0 => "C", 1 => "C#", 2 => "D", 3 => "Eb", 4 => "E", 5 => "F",
  6 => "F#", 7 => "G", 8 => "Ab", 9 => "A", 10 => "Bb", 11 => "B",
  12 => "Cm", 13 => "C#m", 14 => "Dm", 15 => "D#m", 16 => "Em",
  17 => "Fm", 18 => "F#m", 19 => "Gm", 20 => "G#m", 21 => "Am", 
  22 => "Bbm", 23 => "Bm"
}