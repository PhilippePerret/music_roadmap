/*
    Objet JS User
    -------------
    Gestion de l'utilisateur
*/

window.User = {
  nom             :null,
  md5             :null,
  mail            :null,
  roadmaps        :null,      // liste (array) des roadmaps de l'utilisateur
  identified      :false,
  
  preparing_form  :false, // mis à true pendant préparation formulaires
  
  // Réinitialisation de l'user
  reset:function(){
    this.nom = null ;
    this.md5 = null ;
    this.identified = false ;
  },
  // When logout button is clicked
  logout:function(){
    this.reset();
    with($('btn#btn_want_signin')){
      html(LOCALE_UI.User.Signin.main_button);
      attr('onclick', "return $.proxy(User.signin, User)()");
    }
    return false ; // pour le a-lien
  },
  
  // Dispatch des données dans User
  set: function(hdata){
    for(k in hdata){ this[k] = hdata[k]}
  },
  
  // Retourne true si l'utilisateur est défini (mais pas identifié)
  is_identified: function(){    return this.md5 != null},
  is_not_identified:function(){ return this.md5 == null},
  
  /*
      Méthodes d'identification de l'user
      ------------------------------------
  */
  // La méthode qui sera appelée en cas de réussite de l'inscription ou
  // de l'identification. C'est la méthode qui appelle `need_to_signin' qui
  // envoie à la fonction ce paramètre
  fx_pour_suivre_signin:null,
  
  // Retourne true si l'utilisateur (identifié ou non) n'est pas le
  // propriétaire de la roadmap courante.
  // Ouvre le formulaire d'identification si nécessaire.
  is_not_owner:function(fx_suite){
    if ( this.need_to_signin(fx_suite) ) return true ;
    return Roadmap.is_locked() ;
  },
  // Méthode à appeler par :
  //    if ( User.need_to_signin() ) return false;
  // dans toutes les opérations qui nécessitent que l'utilisateur soit
  // identifié (création, sauvegarde, etc.)
  // 
  // @return  FALSE si l'utilisateur NE doit PAS s'identifier.
  //          TRUE quand l'utilisateur doit s'identifier.
  // 
  need_to_signin:function(fx_suite){
    if ( this.is_identified() ) return false ;
    F.error(ERRORS.User.need_to_signin) ;
    this.signin();
    this.fx_pour_suivre_signin = fx_suite ;
    return true ;
  },
  // Open the identification pseudo-form
  // @note: maybe the signup form is visible, so we have to remove it, because some
  // fields have same name.
  signin:function(){
    this.preparing_form = true ;
    Aide.options({bandeau_titre:false}) ; // réglage des options
    Aide.remove('user/signup_form.html');
    Aide.show('user/signin_form.html', $.proxy(this.prepare_signin_form, this));
    return false; // pour le a-lien
  },
  // Méthode vérifiant les data envoyées pour l'identification
  // @param hdata   Données fournies (utiles aux tests unitaires). Si non
  //                fournies, sont relevées dans le formulaire
  checking:false,
  check:function(hdata){
    this.checking = true ;
    if ('undefined' == typeof hdata){
      hdata = {mail:$('input#user_mail').val(), password:$('input#user_password').val()}
    }
    // On vérifie que les données soient valides avant de les envoyer
    try{
      if ( hdata.mail     == "" ) throw 'mail_required';
      if ( hdata.password == "" ) throw 'password_required';
    }catch(erreur){
      F.error(ERRORS.User[erreur]);
      return this.checking = false ;
    }
    Ajax.query({
      data:{proc:'user/check',user:hdata},
      success: $.proxy(this.retour_check, this)
    });
    return false ; // pour le a-lien
  },
  // Retour ajax de la précédente
  retour_check:function(rajax){
    if ( false == traite_rajax(rajax) ){
      // ------------------------
      //  Identification réussie
      // ------------------------
      var duser     = rajax.user ;
      this.md5      = duser.md5 ;
      this.nom      = duser.nom ;
      this.mail     = duser.mail ;
      this.roadmaps = rajax.roadmaps ;
      $('div#user_signin_form').remove();
      Aide.close() ;
      F.show(MESSAGES.User.welcome);
      this.pour_suivre_identification();
    } else {
      // Identification failed
      this.md5  = null ;
      this.nom  = null ;
      this.mail = null ;
    }
    this.checking = false ;
  },
  // Méthode appelée en fin d'identification réussie ou d'inscription, pour
  // poursuivre avec la méthode initialement invoquée (par exemple la création
  // d'une roadmap).
  pour_suivre_identification:function(){
    // Set the signin/logount main button
    with( $('a#btn_want_signin') ){
      html(LOCALE_UI.User.logout);
      attr('onclick', "return $.proxy(User.logout, User)()");
    }
    // Set the roadmaps menu (with user's roadmaps if any)
    Roadmap.peuple_menu_roadmaps( this.roadmaps );
    // On poursuit avec les méthodes demandée au départ
    if ('function' == typeof this.fx_pour_suivre_signin){ 
      this.fx_pour_suivre_signin();
      this.fx_pour_suivre_signin = null ;
    }
  },
  SIGNIN_LABELS:['TITRE','MAIL','PASSWORD'],
  SIGNIN_BUTTONS:['BTN_SIGNIN', 'BTN_WANT_SIGNUP'],
  prepare_signin_form: function(){
    var i, label_id, search, td_id, replace ;
    // Les labels
    for( i in this.SIGNIN_LABELS ){
      label_id  = this.SIGNIN_LABELS[i] ;
      search    = "SIGNIN_LABEL_" + label_id ;
      td_id     = search.toLowerCase();
      $('div#user_signin_form td#'+td_id).html( LOCALE_UI.User.Signin[label_id] ) ;
    }
    // Les boutons
    $('div#user_signin_form a#btn_cancel_signin').text(LOCALE_UI.Verb.Cancel);
    for(i in this.SIGNIN_BUTTONS){
      label_id  = this.SIGNIN_BUTTONS[i] ;
      btn_id    = label_id.toLowerCase();
      $('div#user_signin_form a#'+btn_id).text( LOCALE_UI.User.Signin[label_id] ) ;
    }
    this.preparing_form = false ;
  },
  /*
      Méthodes d'inscription de l'utilisateur
      ------------------------------------------
  */
  // Ouvre le formulaire pour que l'utilisateur s'inscrive
  // Appelé par le bouton "S'inscrire" du formulaire d'identification
  // Note: Pour cette raison, la boite d'identification doit être détruite, qui
  // contient des champs de même nom (mail et password)
  
  new: function(){
    this.preparing_form = true ;
    Aide.options({bandeau_titre:false});
    Aide.show('user/signup_form.html', $.proxy(this.prepare_signup_form, this));
    Aide.remove('user/signin_form.html');
  },
  
  // Fonctionne avec la méthode suivante (@todo: mais ça pourrait être généralisé)
  check_field:function(field_jid, operator, expected, locale){
    var o   = $(field_jid);
    var val = o.val().trim();
    var res = eval("val " + operator + " " + expected);
    if (res === false ) throw { locale:locale, dom:o };
    else { 
      o.removeClass('error');
      return val ;
    }
  },
  // Check les data entrées
  // Return le Hash des données à enregistrer ou lève une erreur en cas
  // d'erreur et retourne false
  check_data:function(){
    try{

      var nom = this.check_field("input#user_nom", '!=', "''", 'name_required');
      nom = Texte.correct_guil_et_apo( nom ) ;
      var mail = this.check_field('input#user_mail', '!=', "''", 'mail_required');
      if ( mail.indexOf('@') < 0 ) throw {locale:'bad_mail', dom:$('input#user_mail')} ;
      if ( mail.replace(/^([-a-zA-Z0-9_\.]+)@([-a-zA-Z0-9_\.]+)\.([a-z]){1,4}$/i,'') != "" ) throw {locale:'bad_mail', dom:$('input#user_mail')} ;
      this.check_field('input#user_mail_confirmation', '==', "'"+mail+"'", 'bad_mail_confirmation');
      var pwd = this.check_field('input#user_password', '!=', "''", 'password_required');
      if ( pwd.replace(/[a-zA-Z0-9]/g, '') != "") throw {locale:'bad_password', dom:$('input#user_password')};
      this.check_field('input#user_password_confirmation', '==', "'"+pwd+"'", 'bad_pwd_confirmation');
      var instrument = this.check_field('input#user_instrument', "!=", "''", 'instru_required');
      instrument = Texte.correct_guil_et_apo( instrument ) ;
      var description = Texte.correct_guil_et_apo($('textarea#user_description').val().trim());

      // Tout est OK
      return { nom:nom, password:pwd, mail:mail, instrument:instrument,
        description:description } ;
    }catch(erreur){
      if ( 'object' == typeof erreur ){
        erreur.dom.addClass('error');
        erreur.dom.focus();
        errmes = ERRORS.User.Signup[erreur.locale] ;
      }
      else{ errmes = erreur }
      F.error(errmes, {inner:'section#aide'});
      return false;
    }
  },
  // Création de l'utilisateur (après check des informations transmises)
  // @param   hdata   Les données de l'utilisateur à créer. Si non fournies,
  //                  la méthode les prend dans le formulaire et les teste
  // @note: La procédure envoie aussi un mail à l'utilisateur et à l'administrateur
  // 
  creating:false,
  create:function(hdata){
    if ('undefined' == typeof hdata) hdata = this.check_data();
    if ( hdata != false ){
      Ajax.query({
        data:{proc:'user/create', user:hdata, lang:LANG},
        success:$.proxy(this.end_create, this)
      });
    }
    return false; //pour le a-lien
  },
  // Retour ajax de la précédente
  end_create:function(rajax){
    if (false == traite_rajax(rajax) ){
      // ---------------------
      //  Inscription réussie
      // ---------------------
      F.show( MESSAGES.User.created );
      this.md5 = rajax.user.md5 ;
      $('div#user_signup_form').remove();
      Aide.close();
      this.pour_suivre_identification();
    }
    this.creating = false ;
  },
  // Préparation du formulaire d'inscription
  SIGNUP_LABELS:['TITRE', 'NAME', 'MAIL', 'MAIL_CONFIRMATION', 'PASSWORD', 'PASSWORD_CONFIRMATION', 'INSTRUMENT', 'DESCRIPTION'],
  SIGNUP_BUTTONS:['BTN_SIGNUP', 'BTN_CANCEL_SIGNUP'],
  prepare_signup_form: function(){
    this.preparing_form = true ;
    var i, label_id, search, td_id, replace ;
    // Les labels
    for( i in this.SIGNUP_LABELS ){
      label_id  = this.SIGNUP_LABELS[i] ;
      search    = "SIGNUP_LABEL_" + label_id ;
      td_id     = search.toLowerCase();
      replace   = LOCALE_UI.User.Signup[label_id];
      $('div#user_signup_form td#'+td_id).html( replace );
    }
    // Les boutons
    $('div#user_signup_form a#btn_cancel_signup').text(LOCALE_UI.Verb.Cancel);
    $('div#user_signup_form a#btn_signup').text(LOCALE_UI.User.Signup.btn_signup);
    this.preparing_form = false ;
  },
  
  
}