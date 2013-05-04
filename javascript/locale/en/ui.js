window.LOCALE_UI = {
  lang: 'en',
  JOURS:['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  MOIS:['january', 'february', 'march', 'april', 'may', 'june', 'jully', 'august', 'september', 'october', 'november', 'december'],
  // -- Remplacements automatique --
  // Au changement de langue, l'application parcourt les éléments définis dans 'Class' et
  // 'Id' ci-dessous et les remplace par les textes localisés s'il les trouve.
  Class:{
    other             :"Other…",
    cancel            :"Cancel",
    duree             :"Duration",
    lab_modify        :"Modify…",
    lab_current       :"Current",
    lab_difficulties  :"Difficulties",
    lab_obligatory    :"Obligatory",
    lab_roadmap       :"Roadmap",
    lab_rapport       :"Work Report",
    lab_tone          :"Tune",
    lab_with_next     :"Linked to next"
  },
  Id:{
    span:{
      section_aide_titre      :"HELP",
      section_aide_move_txt   :"(move this box by <br>clicking-dragging this bar)",
      label_nb_mesures        :"Number of measures",
      label_nb_beats          :"Beats per measure",
      label_confection        :"Prepare a work session"
    }
  },
  // -- Fin des remplacements automatiques --
  colon         :": ",
  Verb:{
    and_save    :"and save",
    Cancel      :"Cancel",
    close       :"close",
    Close       :"Close",
    decrease    :"decrease",
    increase    :"increase",
    modify      :"modify…",
    Modify      :"Modify…",
    open        :"open",
    Open        :"Open",
    Save        :"Sauver",
    update      :"update",
    Update      :"Update"
  },
  Label:{
    day                 :"day",
    de_by               :"by",
    de_of               :"of",
    details             :"details",
    decreased           :"decreased",
    extrait             :"excerpt",
    in_next_session     :"Next session",
    increased           :"increased", 
    link_to_next        :"Linked to next",
    MDP                 :"PASSWORD",
    mail_to_phil        :"Mail to Phil",
    obligatory          :"Obligatory",
    pulse               :"pulse",
    resume              :"Summary",
    roadmap             :"Roadmap",
    tone                :"tone",
    subtitle            :"Deal with your daily music exercices",
    suite_exercices     :"Exercices suite",
    TITLE               :"MUSIC ROADMAP",
    title               :"Music Roadmap",
    today               :"Today",
    ROADMAP             :"ROADMAP",
    working_time        :"working time",
    Working_time        :"Working time"
  },                    
  User:{                
    logout              :"Log out",
    Signin:{             
      main_button       :"Signin (or Signup)",
      TITRE             :"Sign In on Music Roadmap",
      MAIL              :"Your email",
      PASSWORD          :"Your password",
      BTN_SIGNIN        :"Sign In!",
      BTN_WANT_SIGNUP   :"Sign up…"
    },                         
    Signup:{                   
      TITRE                   :"Sign Up",
      NAME                    :"Your name",
      MAIL                    :"Your (valid) email",
      MAIL_CONFIRMATION       :"Mail confirmation",
      PASSWORD                :"Your password",
      PASSWORD_CONFIRMATION   :"Password confirmation",
      INSTRUMENT              :"You play the…",
      DESCRIPTION             :"A few words about you",
      btn_signup              :"Sign up now!"
    },
  },
  Roadmap: {
    open_your_rm  : "Display…",
    btn_save      : "Save",
    btn_saved     : "Saved",
    btn_saving    : "Saving…",
    btn_open      : "Open",
    btn_init      : "Init",
    btn_create    : "Create",
  },
  Exercices: {
    Label:{
      new_exercice            :"New Exercice",
      activate_moving         :"Activate moving",
      stop_moving             :"Stop moving",
      sens_des_exercices      :"Exercices direction",
      suites_harmoniques      :"Harmonic suite",
      ordre_exercices         :"Order of the exercices"
    },
    Config:{
      title_volant            :"Click to set next general configuration of exercices",
      cb_save                 :"Save general config on change",
      first_to_last           :"from first to last exercice (except if session)",
      last_to_first           :"from Last to first exercice (except if session)",
      down_to_up              :"Up and then down the exercice",
      up_to_down              :"Down and then up the exercice",
      maj_to_rel              :"MAJOR to Relative",
      rel_to_maj              :"Relative to MAJOR",
      Label:{
        next_config           :"Next settings",
        libelle_harmonic_seq  :"Harmonic sequence"
      }
    },
    Edition:{
      types_of_exercice     :"Technics"
    }
  },
  Exercice: {
    create_new_exercice     :"Save this new exercice",
    create_new_morceau      :"Save this new piece",
    update                  :"Update this exercice",
    save_duree_travail      :"Yes, save time working on this exercice"
  },
  DBExercice:{
    titre                   :"DATABASE EXERCICES",
    search_in_db            :"Choose exercices in Database Exercices",
    add_selected            :"Add selected exercices to current roadmap"
  },
  Seance:{
    form_title              :"WORKING SESSION DEFINITION",
    start_title             :"WORKING SESSION OVERVIEW",
    end_title               :"WORKING SESSION ENDING",
    label_duree             :"Duration of the working session",
    label_difficulties      :"Difficulties to focus on",
    label_aleatoire         :"Random order",
    option_same_ex          :"Unable same exercice",
    option_obligatory       :"Obligatories",
    option_new_tone        :"New tone",
    option_next_config      :"Next general configuration",
    btn_prepare             :"Prepare the working session!",
    direction               :"Direction",
    start                   :"Start session",
    stop                    :"End session",
    pause                   :"Pause",
    restart                 :"Restart",
    replay                  :"Replay same working session",
    next_exercice           :"Next exercice",
    end_exercices           :"The end"    
  },
  Rapport:{
    per_month               :"for current month",
    titre                   :"SESSION REPORT",
    total_working_time      :"Total working time",
    legends_titre           :"Color per difficulty type",
    titre_by_ex             :"Working times per exercice",
    titre_by_type           :"Working times per technic",
    titre_by_tone           :"Working times per tone",
    btns_close              :"Back to exercices",
    rapport_du              :"Report of the ",
    btn_open_legend         :"Color legend",
    btn_open_by_type        :"Details per technique",
    btn_open_by_tone        :"Details per tone",
    btn_open_by_ex          :"Details per exercice"
  }
}