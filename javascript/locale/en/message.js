window.MESSAGE = {
  lang: 'en',
  // Général
  thank_to_wait: "Wait a moment, please…",
  // USER
  User:{
    created     :"You're signup! Enjoy Music Roadmap!"+
                  "<br>Now you can <a onclick=\"return $.proxy(H.show,H,'roadmap/creation.html')()\" href=\"#\" class=\"to_help aide_lien\">create a roadmap</a>.",
    welcome     :"Welcome at Music Roadmap!",
    goodbye     :"See you later at Music Roadmap!"
  },
  // ROADMAP
  Roadmap: {
    must_signin_to_create   :"You must sign in (or sign up) to create or open a music roadmap.",
    how_to_make_a_good_nom  :"A valid name is 4 letters long and doesn't use special chars. If you want to open a roadmap of yours, use the select menu instead.",
    creating                :"Creating roadmap…",
    saving                  :"Saving…",
    created                 :"Roadmap successfully created"+
                             "<br>Now you can <a onclick=\"return $.proxy(H.show,H,'exercice/creation.html')()\" href=\"#\" class=\"to_help aide_lien\">add exercices</a>.",
    loaded                  :"Roadmap successfully opened!",
    saved                   :"Roadmap successfully saved!",
    ready                   :"New roadmap ready!",
    no_config_generale      :"No general configuration for this roadmap"
  },
  // EXERCICES
  Exercices: {
    Config: {
      saved     : "Exercices Configuration successfully saved!",
    },
  },
  // EXERCICE
  Exercice: {
    saved                     :"Exercice successfully saved!",
    work_on_exercice_saved    :"Working time on this exercice has been recorded",
    working_time_insuffisant  :"Too short working time on exercice. I don't save it.",
    really_save_duree_travail :"You've worked a hour on this exercice, really? If it's true, please confirm by clicking the link below."
  },
  DBExercice:{
    added                     :"BDE Exercices successfully added!",
    no_exercices_in_recueil   :"This collection has no exercice yet (Don't wait! Mail to Phil to beg him to add them!)"
  }
}