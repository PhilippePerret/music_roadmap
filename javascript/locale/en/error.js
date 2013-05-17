window.ERROR = {
  lang: 'en',
  // USER
  User:{
    unknown                     : "I can't recognize you, sorry…",
    need_to_signin              : "Please sign in.",
    mail_required               : "Email address required!",
    md5_required                : "Md5 required.",
    password_required           : "Password required!",
    Signup:{
      already_exists            :"Email address of a user already signed up, sorry.",
      name_required             : "Your name should not be empty!",
      mail_required             : "Email address required.",
      bad_mail                  : "Invalid email address. Please try again.",
      bad_mail_confirmation     :"Your mail confirmation does not match…",
      password_required         : "A password is required.",
      bad_password              : "Invalid password (only a->z, 0->9)",
      bad_pwd_confirmation      :"Your password confirmation does not match…",
      instru_required           : "Your instrument is required, please."
    },
  },
  // ROADMAP
  Roadmap: {
    initialization_failed :"Unable to initialize roadmap…",
    is_locked             :"This roadmap is locked. Unable to save it.",
    required              :"A Music raodmap required!",
    too_many              :"You can't create more than 10 roadmaps, sorry.",
    cant_create           :"Unable to create the roadmap with these data",
    unknown               :"Unknown roadmap… Unable to load it.",
    existe_deja           :"This roadmap already exists…",
    not_destroyed         :"# Unabled to destroy this roadmap…",
    bad_owner             :"You can't do that! This roadmap is not yours!",
    Specs:{
      requises            :"Roadmap Name is required!",
      need_a_nom          :"A Roadmap's name is required!",
      invalid_nom         :"Roadmap Name is invalid…",
      too_short_name      :"The name is too short (at least 4 characters please)"
    },
    Data:{
      required                  : "Data to dispatch required!",
      data_required             : "Data :data_roadmap required!",
      config_generale_required  : "General configuration (:config_generale) required!",
      data_exercices_required   : "Exercices data (:data_exercices) required!",
      exercices_required        : "Exercices list required!"
    },
    unable_with_example: "Forbidden with Example Roadmap."
  },
  // INSTRUMENT
  Instrument:{
    should_be_defined      :"Instrument (ID) should be defined…"
  },
  // EXERCICES
  Exercices: {
    Edit:{
      data_required       : "Exercice data required",
      id_required         : "ID required",
      title_required      : "A exercice need a title",
      min_sup_to_min      : "Max tempo should be greater than Min tempo",
      tempo_inf_to_min    : "Current tempo should be greater than Min tempo"
    }
  },
  // EXERCICE
  Exercice: {
    
  },
  // RAPPORT
  Rapport:{
    no_data               :"Data required to build a report",
    no_data_for_day       :"No exercice played during this day."
  },
  // DATABASE EXERCICES
  DBExercice:{
    no_exercice_choosed   :"You have to choose the exercices to add to your current roadmap!"
  },
  // SEANCE
  Seance:{
    no_working_time       :"I need a working time!",
    no_exercice_found     :"No exercice in your roadmap matchs the criteria you have defined.",
    no_exercices          :"No exercice to play!"
  },
  // MAIL
  Mail:{
    need_mail             :"I need your email address.",
    need_a_message        :"You must write a message!",
    need_captcha_reponse  :"You must respond to the captcha test!"
  },
  // CAPTCHA
  Captcha:{
    no_reponse            :"I need your captcha answer",
    no_time               :"Bizarre… no time provided",
    no_file               :"Bizarre… no file for you… Are you a hacker?…",
    bad_answer            :"Your captcha answer is wrong…",
    too_much_tentatives   :"Sorry, no more temptatives."
  }  
}