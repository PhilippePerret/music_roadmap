/*
    Objet JS User
    -------------
    Gestion de l'utilisateur
*/

window.User = {
  nom             :null,
  md5             :null,
  mail            :null,
  instrument      :null,      // Instrument ID (used for DB Exercices)
  roadmaps        :null,      // liste (array) des roadmaps de l'utilisateur
  identified      :false,
  remembered      :false,     // Mis à true si l'utilisateur a déjà ses cookies de reconnaissance
  
  preparing_form  :false, // mis à true pendant préparation formulaires
  
  PREFERENCES: {
    after_roadmap_loading: null, //@TODO: REMETTRE ÇA EN RÉGLAGE Seance.show
  },
  
  // Réinitialisation de l'user
  reset:function(){
    [this.nom, this.md5, this.mail, this.instrument,this.roadmaps] = [null,null,null,null,null];
    this.identified = false;
  },
  /**
    * Méthode appelée quand l'user se déconnecte en cliquant sur "Log out"
    * @method logout
    */
  logout:function(){
    this.reset();
    UI.open_volet('exercices');
    this.set_button_login();
    Roadmap.peuple_menu_roadmaps();
    UI.set_no_roadmap();
    F.show(MESSAGE.User.goodbye);
    // On remet la page d'accueil (en fait, il suffit d'insérer ce code
    // et de demander l'update des locales)
    $('ul#exercices').html('<div data-locale="app/accueil" style="display:inline;"></div>');
    Locale.update();
    return false; // pour le a-lien
  },
  
  set_button_login:function(){
    with($('a#btn_want_signin')){
      html(LOCALE_UI.User[this.identified?'logout':'signin']);
      attr('onclick', "return $.proxy(User."+(this.identified?'logout':'signin')+", User)()");
    }
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
    F.error(ERROR.User.need_to_signin) ;
    this.signin();
    this.fx_pour_suivre_signin = fx_suite ;
    return true ;
  },
  /**
    * Méthode appelée quand l'utilisateur clique sur le lien pour s'identifier.
    * S'il possède des cookies, on l'envoie directement au check (`this.check`), sinon on ouvre
    * le formulaire d'identification.
    * @method signin
    */
  signin:function(){
    if(Cookies.exists('mrdm_mail'))
    {
      var data_user = {
        mail      : Cookies.valueOf('mrdm_mail'),
        password  : Cookies.valueOf('mrdm_password'),
        remember  : true
      }
      Cookies.delete( 'mrdm_mail')
      Cookies.delete( 'mrdm_password')
      this.check( data_user )
    }
    else
    {
      this.preparing_form = true ;
      Aide.options({bandeau_titre:false}) ; // réglage des options
      Aide.remove('user/signup_form');
      Aide.show('user/signin_form', $.proxy(this.prepare_signin_form, this));    
    }
    return false; // pour le a-lien
  },
  // Méthode vérifiant les data envoyées pour l'identification
  // @param hdata   Données fournies (utiles aux tests unitaires). Si non
  //                fournies, sont relevées dans le formulaire
  checking:false,
  check:function(hdata){
    this.checking = true ;
    if ('undefined' == typeof hdata){
      hdata = {
        mail      : $('input#user_mail').val(), 
        password  : $('input#user_password').val(),
        remember  : $('input#remember_me').is(':checked')
      }
      // On vérifie que les données soient valides avant de les envoyer
      try{
        if ( hdata.mail     == "" ) throw 'mail_required';
        if ( hdata.password == "" ) throw 'password_required';
      }catch(erreur){
        F.error(ERROR.User[erreur]);
        return this.checking = false ;
      }
    }
    Flash.show( MESSAGE.thank_to_wait )
    Ajax.query({
      data    : {proc:'user/check',user:hdata},
      success : $.proxy(this.retour_check, this, hdata.password)
    });
    return false ; // pour le a-lien
  },
  /**
    * Retour ajax de la précédente
    * @method retour_check
    * @param {String} password    Le mot de passe fourni ou récupéré dans le cookie
    * @param {Object} rajax       Le retour ajax
    */
  retour_check:function(password, rajax){
    if ( false == traite_rajax(rajax) ){
      // ------------------------
      //  Identification réussie
      // ------------------------
      if(rajax.remember){ 
        rajax.user.password = password ;
        this.remember_me( rajax.user ) ;
      }
      this.set_identified(rajax.user);
      this.roadmaps = rajax.roadmaps ;
      Aide.remove('user/signin_form');
      Aide.close() ;
      F.show(MESSAGE.User.welcome);
      this.pour_suivre_identification();
    } else {// Identification failed
      Flash.clean()
      this.reset();
    }
    this.checking = false ;
  },
  
  /**
    * Méthode qui mémorise l'utilisateur
    * Elle place deux cookies sur l'ordinateur de l'utilisateur, contenant son mail et son mot
    * de passe. La méthode est appelée au retour du check de l'utilisateur, on sait donc qu'il
    * est valide.
    * @method remember_me
    * @param {Object} user  Données de l'utilisateur, dont `mail` et `password`
    */
  remember_me:function( user ){
    // On place un cookie contenant l'adresse mail et le mot de passe de l'utilisateur
    Cookies.create('mrdm_mail',       user.mail,      1000);
    Cookies.create('mrdm_password',   user.password,  1000);    
    this.remembered = true
  },
  
  /**
    * Marquer l'utilisateur identifié pour l'application
    * @method set_identified
    * @param {Object} duser   Données (non sensibles) de l'utilisateur
    */
  set_identified:function(duser){
    this.md5        = duser.md5;
    this.nom        = duser.nom;
    this.mail       = duser.mail;
    this.instrument = duser.instrument;
    this.identified = true;
  },
  // Méthode appelée en fin d'identification réussie ou d'inscription, pour
  // poursuivre avec la méthode initialement invoquée (par exemple la création
  // d'une roadmap).
  pour_suivre_identification:function(){
    // Set the signin/logount main button
    this.set_button_login();
    Roadmap.set_div_specs(true);
    // Set the roadmaps menu (with user's roadmaps if any)
    Roadmap.peuple_menu_roadmaps( this.roadmaps );
    $('select#roadmaps').focus();
    // On poursuit avec la méthode demandée au départ
    if ('function' == typeof this.fx_pour_suivre_signin){ 
      this.fx_pour_suivre_signin();
      this.fx_pour_suivre_signin = null ;
    }
  },
  
  // Add roadmap to user roadmap list
  // @note: only used when user creates a new roadmap
  add_roadmap:function(rm_name){
    if(this.roadmaps == null) this.roadmaps = [];
    this.roadmaps.push(rm_name);
    Roadmap.peuple_menu_roadmaps(this.roadmaps);
  },
  // Return TRUE if user is identified and has roadmaps. FALSE otherwise
  has_roadmaps:function(){
    return this.roadmaps != null && this.roadmaps.length > 0;
  },
  
  // Return TRUE if user has too many roadmap (10 max)
  has_nombre_max_roadmaps:function(){
    if (this.roadmaps == null) return false;
    return this.roadmaps.length >= 10 ;
  },
  
  // Called with press tab or return on password field
  check_key_press_on_password:function(evt){
    var kcode = evt.keyCode;
    if(kcode != K_RETURN && kcode != K_TAB) return;
    if(kcode == K_RETURN) this.check();
    else{
      evt.stopPropagation(); // unnecessary, but...
      $('input#user_mail').select();
      return false;
    }
  },
  SIGNIN_LABELS:['TITRE','MAIL','PASSWORD','REMEMBER_ME'],
  SIGNIN_BUTTONS:['BTN_SIGNIN', 'BTN_WANT_SIGNUP'],
  prepare_signin_form: function(){
    var i, label_id, search, td_id, replace ;
    // Les labels
    for( i in this.SIGNIN_LABELS ){
      label_id  = this.SIGNIN_LABELS[i] ;
      search    = "SIGNIN_LABEL_" + label_id ;
      td_id     = search.toLowerCase();
      $('div#user_signin_form #'+td_id).html( LOCALE_UI.User.Signin[label_id] ) ;
    }
    // Les boutons
    $('div#user_signin_form a#btn_cancel_signin').text(LOCALE_UI.Verb.Cancel);
    for(i in this.SIGNIN_BUTTONS){
      label_id  = this.SIGNIN_BUTTONS[i] ;
      btn_id    = label_id.toLowerCase();
      $('div#user_signin_form a#'+btn_id).text( LOCALE_UI.User.Signin[label_id] ) ;
    }
    // Observer on passwork field (to check return)
    $('input#user_password').bind('keypress',$.proxy(this.check_key_press_on_password,this));
    // Focus in mail field
    $('input#user_mail').select();
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
    Aide.show('user/signup_form', $.proxy(this.prepare_signup_form, this));
    Aide.remove('user/signin_form');
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
  // Check les data entrées pour l'inscription
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
        errmes = ERROR.User.Signup[erreur.locale] ;
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
      F.show( MESSAGE.User.created );
      this.set_identified(rajax.user);
      this.roadmaps = [];
      $('div#user_signup_form').remove();
      Aide.close();
      $('input#roadmap_nom').addClass('green');
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
    // Instruments
    this.prepare_instruments_in_signup_form();
    this.preparing_form = false ;
  },
  
  // Called with user choose a instrument in select #instrument in sign up form
  // 
  on_choose_instrument:function(oselect){
    var o = $(oselect);
    var instid    = o.val();
    var for_other = instid == "other";
    $('div#div_other_instrument').css('visibility', for_other ? 'visible' : 'hidden');
    if ( ! for_other ) $('input#user_instrument').val(instid);
    return false
  },
  
  // @note: DATA_INSTRUMENTS is defined in `javascript/locale/<lang>/instruments.js`. To
  // update this file when an instrument has been added, remove file :
  //  javascript/locale/db_exercices/fr/piano.js
  prepare_instruments_in_signup_form:function(){
    for(var instid in DATA_INSTRUMENTS){
      var dinst = DATA_INSTRUMENTS[instid];
      $('select#instrument').append(
        '<option value="'+dinst['id']+'">' + dinst['name'] + '</option>');
    }
    $('select#instrument').append(
      '<option value="other" class="other">' + LOCALE_UI.Class.other + '</option>');
    // Et placer le texte explicatif en fonction de la langue
    
  },
  
  // Called when we click on contact button
  mailto_phil:function(){
    H.show('application/mail_to_phil.rb',$.proxy(User.prepare_form_mail,User));
    return false;//pour le a-lien
  },
  // Called when we click on "Send mail!" button
  // Send the mail
  sending_mail:false,
  send_mail:function(){
    this.sending_mail = true;
    var data = this.get_data_mail();
    if(data == null){
      this.sending_mail = false;
      return false;
    }
    data.proc = 'app/mailto_phil';
    Ajax.query({
      data:data,
      success:$.proxy(this.retour_send_mail,this)
    });
    return false;//pour le lien
  },
  retour_send_mail:function(rajax){
    var remove = true;
    if(traite_rajax(rajax)==false){ 
      F.show(MESSAGE.Mail.sent);
    } else {
      if ('undefined'!=typeof rajax.captcha_error){
        switch(rajax.captcha_error){
          case 'too_much_tentatives': remove = true; break;
          case 'bad_answer': $('input#captcha_reponse').select(); break;
          default: remove = true;
        }
      }
    }
    if(remove){
      H.remove('application/mail_to_phil.rb');
      H.close();
    }
    this.sending_mail = false;
  },
  // Retourne les data du mail (en les checkant)
  // Retourne NULL si les données sont mauvaises
  get_data_mail:function(){
    try{
      var data = {subject:"Message"};
      var mess = [];
      data.from = 
        this.get_mail_value('input#mail_sender', 'need_mail');
      mess.push(["De", '<a href="mailto:'+data.from+'">' + data.from + '</a>']);
      mess.push(["Sujet", $('select#mail_general_subject').val() + '<br>' +
                      $('input#mail_subject').val()]);
      mess.push(["Message", 
        this.get_mail_value('textarea#mail_message', 'need_a_message')]);
      data.captcha_reponse = 
        this.get_mail_value('input#captcha_reponse', 'need_captcha_reponse');
      data.captcha_time = $('input#captcha_time').val();
      data.message = this.mettre_en_form_message_mail(mess);
      return data;
    }catch(iderror){
      F.error(ERROR.Mail[iderror]);
      return null;
    }
  },
  // Met en forme le message (le construit dans une table)
  mettre_en_form_message_mail:function(data){
    var tbl = '<table border="0" cellpadding="4">';
    var paire;
    for(var i in data){
      tbl += '<tr><td>'+data[i][0]+'</td><td>'+data[i][1]+'</td></tr>';
    }
    tbl += '</table>';
    return tbl;
  },
  get_mail_value:function(jid, error_id){
    var value = $(jid).val().trim();
    if (value == ""){
      $(jid).addClass('error');
      $(jid).select();
      throw error_id;
    }
    return value;
  },
  LOCALES_MAIL:{
    'span#mailto_from_libelle':"your_mail",
    'span#mailto_subject_libelle':"mail_subject",
    'span#mailto_croches':"croches",
    'span#mailto_captcha_titre':"captcha_thanks",
    'a#btn_send_mail':"btn_send_mail"
    },
  prepare_form_mail:function(){
    // Régler les textes locaux
    for(var jid in this.LOCALES_MAIL){
      $(jid).html(LOCALE_UI.Mail[this.LOCALES_MAIL[jid]]);
    }
    // Le menu des subjets généraux
    var o = $('select#mail_general_subject');
    o.html('');
    for(var i in LOCALE_UI.Mail.general_subjects){
      var sub = LOCALE_UI.Mail.general_subjects[i];
      o.append('<option value="'+sub+'">'+sub+'</option>');
    }
    // Si l'utilisateur est identifié, on met son mail et on le cache
    if (User.is_identified()){
      $('input#mail_sender').val(this.mail);
      $('div#div_mailto_from').hide();
    }
  }
}