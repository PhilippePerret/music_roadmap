window.ERRORS = {
  lang: 'en',
  // USER
  User:{
    unknown             : "I can't recognize you, sorry…",
    need_to_signin      : "Please sign in.",
    mail_required       : "Email address required!",
    md5_required        : "Md5 required.",
    password_required   : "Password required!",
    Signup:{
      bad_name      : "Your name should not be empty!",
      bad_mail      : "Invalid email address. Please try again.",
      bad_mail_confirmation:"Your mail confirmation does not match…",
      bad_password  : "Invalid password (only a->z, 0->9)",
      bad_password_confirmation:"Your password confirmation does not match…"
    },
  },
  // ROADMAP
  Roadmap: {
    initialization_failed : "Unable to initialize roadmap…",
    required        : "A Music raodmap required!",
    cant_create     : "Unable to create the roadmap with these data",
    unknown         : "Unknown roadmap… Unable to load it.",
    existe_deja     : "This roadmap already exists…",
    not_destroyed   : "# Unabled to destroy this roadmap…",
    bad_owner       : "You can't do that! This roadmap is not yours!",
    Specs:{
      requises      : "Roadmap Name and password are required!",
      need_a_nom    : "Roadmap's name is required!",
      need_a_mdp    : "Roadmap's password is required!",
      invalid_nom   : "Roadmap Name is invalid…",
      invalid_mdp   : "Roadmap password is invalid…",
    },
    Data:{
      required                  : "Data to dispatch required!",
      data_required             : "Data :data_roadmap required!",
      config_generale_required  : "General configuration (:config_generale) required!",
      data_exercices_required   : "Exercices data (:data_exercices) required!",
      exercices_required        : "Exercices list required!",
    },
    unable_with_example: "Forbidden with Example Roadmap.", 
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
}