/*
    FICHIER LOCALES ERREURS
    =======================
*/
window.ERROR = {
  lang: 'fr',
  // USER
  User:{
    need_to_signin          : "Vous devez vous identifier.",
    unknown                 : "Désolé, mais je ne parviens pas à vous reconnaitre…",
    mail_required           : "Adresse email requise.",
    md5_required            : "Md5 required.",
    password_required       : "Mot de passe requis.",
    Signup:{            
      already_exists        :"Cet email est celui d'un roadmapeur déjà inscrit.",
      name_required         :"Votre nom ne peut être vide !",
      mail_required         :"Votre adresse mail est requise.",
      bad_mail              :"Votre adresse email est invalide. Merci de la corriger",
      bad_mail_confirmation :"La confirmation de votre adresse email ne correspond pas…",
      password_required     :"Un mot de passe est requis.",
      bad_password          :"Votre mot de passe est invalide (seulement des lettres de a à z et/ou des chiffres).",
      bad_pwd_confirmation  :"La confirmation de votre mot de passe ne correspond pas…",
      instru_required       :"Votre instrument est requis"
    },
  },
  // ROADMAP
  Roadmap: {
    initialization_failed :"Impossible d'initialiser la feuille de route…",
    is_locked             :"Cette feuille de route est verrouillée",
    required              :"Une feuille de route est requise !",
    too_many              :"Désolé, mais vous ne pouvez pas créer plus de dix feuilles de route…",
    cant_create           :"Impossible de créer la feuille de route avec les données fournies…",
    unknown               :"Feuille de route introuvable…",
    existe_deja           :"Cette feuille de route existe déjà.",
    not_destroyed         :"# Impossible de détruire cette feuille de route…",
    bad_owner             :"Vous devez être le possesseur de cette feuille de route pour procéder à cette opération !",
    Specs:{
      requises            :"Le nom de la feuille de route est requis !",
      need_a_nom          :"Il faut définir le nom de la feuille de route !",
      invalid_nom         :"Le nom contient des caractères invalides que j'ai supprimés ou remplacés…",
      too_short_name      :"Ce nom est trop court (au moins 4 caractères, s'il vous plait)"
    },
    Data:{
      required                  : "Les données à dispatcher sont requises !",
      data_required             : "Les données (data_roadmap) sont requises !",
      config_generale_required  : "La configuration générale (config_generale) est requise !",
      data_exercices_required   : "Les données des exercices (data_exercices) sont requises !",
      exercices_required        : "La liste des exercices est requises !"
    },
    unable_with_example: "Cette action est impossible sur la feuille de route en exemple, désolé.", 
  },
  // INSTRUMENT
  Instrument:{
    should_be_defined      :"L'instrument devrait être défini…"
  },
  // EXERCICES
  Exercices: {
    Edit:{
      data_required       : "Les data de l'exercice sont requises",
      id_required         : "Un ID pour l'exercice est absolument requis !",
      title_required      : "L'exercice doit impérativement avoir un titre",
      min_sup_to_min      : "Le tempo max doit être supérieur au tempo minimum",
      tempo_inf_to_min    : "Le tempo actuel doit être supérieur au tempo minimum"
    }
  },
  // EXERCICE
  Exercice: {
    
  },
  // RAPPORT
  Rapport:{
    no_data               :"Les data pour construire un rapport sont requises",
    no_data_for_day       :"Aucun exercice n'a été travaillé au cours de cette journée."
  },
  // DATABASE EXERCICES
  DBExercice:{
    no_exercice_choosed   :"Il faut choisir les exercices à ajouter à votre feuille de route courante !"
  },
  // SÉANCE
  Seance:{
    no_working_time       :"Il faut indiquer un temps de travail !",
    no_exercice_found     :"Aucun exercice de votre feuille de route ne répond aux critères sélectionnés.",
    no_exercices          :"Il n'y a aucun exercice à jouer !"
  },
  // MAIL
  Mail:{
    need_mail             :"Vous devez indiquer votre mail",
    need_a_message        :"Vous devez écrire un message !",
    need_captcha_reponse  :"Vous devez indiquer la réponse au test captcha !"
  },
  // CAPTCHA
  Captcha:{
    no_reponse            :"Vous devez donner la réponse du captcha",
    no_time               :"Bizarre… aucun time fourni",
    no_file               :"Bizarre… aucun fichier pour vous… Ne seriez-vous pas en train de tenter une intrusion ?…",
    bad_answer            :"Votre réponse anti-bot est mauvaise…",
    too_much_tentatives   :"Désolé, mais vous avez dépassé le nombre de tentatives autorisées."
  }
}