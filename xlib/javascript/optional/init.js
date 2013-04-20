window.empty_object = {}
window.empty_class = function(){}

// Objet dans lequel seront ajouter toutes les extensions propres
// aux vues (quand la vue possède un fichier JS de même nom)
window.View = {}

$(document).ready(function(){

  // On définit certains objets/classes s'ils ne sont pas définis pour
  // ne pas avoir à les tester, et pouvoir simplement vérifier si leur
  // méthode existe avant de l'appeler
  define_objets_et_classes_par_defaut() ;
  
  // Quelques initialisation des éléments DOM de la page
  // (la méthode se trouve ci-dessous)
  onload_fur_elements();

  // Initialisation du site (if any)
  if ( method_exists( S.init ) ) { S.init() }

  // Si un message flash est ouvert, on pose dessus un timeout pour
  // le fermer au bout d'un certain temps.
  F.set_timer();
});

window.define_objets_et_classes_par_defaut = function(){
  if( "undefined" == typeof Admin ) Admin = empty_object ;
  if( "undefined" == typeof S     )     S = empty_object ;
  if( "undefined" == typeof U     )     U = empty_object ;
}
window.onload_fur_elements = function(){

  // Réactivité des TEXTAREA (pour les "suivre", c'est-à-dire modifier
  // leur taille en fonction du contenu)
  REvent.ON_KEYPRESS_ON_TEXTAREA = defined(REdit) && method_exists(REdit.textarea.on_keypress)

}