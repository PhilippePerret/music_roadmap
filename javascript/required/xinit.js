/*
  Initialisation
  --------------
  
  (Au chargement de la page). Noter que le "x" de xinit.js permet de placer
  ce script en tout dernier, et donc d'avoir tous les éléments déjà chargés.
*/
$(document).ready(function(){

  DEBUG = false ;
  // if(console) DEBUG = true ; else DEBUG = false ;
  
  // Définition des éléments à surveiller au démarrage. L'application est considérée comme
  // chargée lorsque tous les éléments sont mis à true
  // 
  UI.ready_states = {
    length      :-1,       // calculé au premier hit
    jquery      :false,    // mis à true à la fin de cette fonction
    exedition   :false,    // préparation formulaire exercice
    home_text   :false
  };
  
  
  // Backtrace (note: brique en librairie générale)
  Backtrace.reset() ;
  
  // Rendre la liste des exercices "sortable" et la section "draggable"
  var exs = $('ul#exercices')
  exs.sortable({
    disabled      : true, // Sinon, les menus select sont inabordables
    axis          : "y",
    containment   : "parent",
    start         : function(evt,ui){ Roadmap.saving = true  },
    stop          : function(evt,ui){ Roadmap.saving = false },
    update        : $.proxy(Roadmap.on_stop_dragging, Roadmap)
  });
  // exs.disableSelection();

  // $('section#document').draggable({disabled: true}) ;
  /*
    Les méthodes fonctionnent dans cet ordre :
    start
    change (if any)
    update (if any)
    stop (appelé après toutes les opérations de update)
  */

  $.proxy(UI.init,UI)();
  $.proxy(Aide.init, Aide)() ;
  $.proxy(Roadmap.init, Roadmap)() ;
  
  // Préparation de la boite d'édition de l'exercice
  $.proxy(Exercices.Edition.prepare, Exercices.Edition)();
  
  // Pour le select quand on focus un input#text ou un textarea
  $.proxy(UI.InputText.select_on_focus, UI.InputText)() ; 
  $.proxy(UI.Textarea.select_on_focus, UI.Textarea)() ;
  
  // On replace la src des images
  $.proxy(UI.humanize, UI)();
  // On définit l'image du drapeau de l'autre langue
  $.proxy(UI.set_flag_lang, UI)()
  
  // On affiche le premier texte d'aide
  var d = {
      inner     :"ul#exercices",
      id        :"app/accueil",
      fx_suite  :$.proxy(UI.set_ready, UI, 'home_text')
    }
  $.proxy(Locale.show, Locale, d)();

  // On indique que ce fichier a terminé. Mais d'autres processus sont peut-être encore
  // en cours.
  $.proxy(UI.set_ready, UI, 'jquery')();
})