window.MESSAGE = {
  lang: 'fr',
  // Général
  thank_to_wait: "Merci de patienter un instant…",
  // USER
  User:{
    created     :"Vous êtes inscrit à Feuille de Route Musicale !"+
                  "<br>Vous pouvez maintenant <a onclick=\"return $.proxy(H.show,H,'roadmap/creation.html')()\" href=\"#\" class=\"to_help aide_lien\">créer une feuille de route</a>. Indiquez son nom dans le champ vert ci-dessous.",
    welcome     :"Bienvenue sur Feuille de Route Musicale !",
    goodbye     :"À très bientôt sur Feuille de Route Musicale !"
  },
  // ROADMAP
  Roadmap:{
    must_signin_to_create   :"Vous devez être identifié (ou inscrit) pour ouvrir ou créer une feuille de route.",
    how_to_make_a_good_nom  :"Un nom valide possède au moins 4 lettres et n'utilise pas de caractères spéciaux. Si vous voulez ouvrir une de vos feuilles de route, utilisez plutôt le menu.",
    creating                :"Création de la feuille de route…",
    saving                  :"Sauvegarde en cours…",
    created                 :"Feuille de route créée avec succès !"+
                             "<br>Vous pouvez maintenant <a onclick=\"return $.proxy(H.show,H,'exercice/creation.html')()\" href=\"#\" class=\"to_help aide_lien\">ajouter des exercices</a>.",
    loaded                  :"Feuille de route ouverte avec succès !",
    saved                   :"Feuille de route sauvée avec succès !",
    ready                   :"La nouvelle feuille de route est prête",
    no_config_generale      :"Pas de configuration générale pour cette feuille de route"
  },
  // EXERCICES
  Exercices: {
    Config:{
      saved     : "Configuration des exercices sauvée avec succès."
    },
  },
  // EXERCICE
  Exercice: {
    saved                     : "Exercice enregistré avec succès.",
    work_on_exercice_saved    : "Temps de travail de l'exercice enregistré",
    working_time_insuffisant  :"Temps de travail insuffisant sur l'exercice. Je ne l'enregistre pas.",
    really_save_duree_travail : "Une heure de travail sur cet exercice, vraiment ? Si c'est le cas, d'abord bravo ;-), et confirmez en cliquant sur le lien ci-dessous, pour que j'enregistre ce temps."
  },
  // DBExercice
  DBExercice:{
    added                     :"Exercices BDE ajoutés avec succès !",
    no_exercices_in_recueil   :"Ce recueil ne possède pas encore d'exercices (n'hésitez pas à écrire à Phil pour lui demander de les ajouter !)"
  },
  // SEANCE
  Seance:{
    no_previous_ex            :"C'est le premier exercice ! (pas de précédent…)"
  },
  // MAIL
  Mail:{
    sent                      :"Votre message a bien été envoyé."
  }
}