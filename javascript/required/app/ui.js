var documentBody = (($.support.chrome)||($.support.safari)) ? document.body : document.documentElement;

if('undefined'==typeof UI) UI = {} ;
$.extend(UI,{
  FOLDER_IMAGES: "_MVC_/view/img/",

  // Initialisationo de l'interface (chargement de la page)
  // @note: Permet également de changer la langue de l'interface
  init: function(){
    this.set_drapeau_autre_langue() ;
    this.set_noms_boutons() ;
    this.set_labels();
  },
  
  // Règle les boutons en fonction de la langue courante
  set_noms_boutons: function(){
    // Boutons User
    $([
      ['a#btn_want_signin', 'main_button']
      ]).each(function(i,o){
        $(o[0]).html(LOCALE_UI.User.Signin[o[1]])
      });
    // Boutons Roadmap
    $([
      ['a#btn_roadmap_open', 'btn_open'],
      ['a#btn_new_roadmap',  'btn_create'],
      ['a#btn_init_roadmap', 'btn_init'],
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Roadmap[o[1]])
    });
    // Configuration des exercices
    $([
      ['a#btn_next_config', 'next_config']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Exercices.Config.Label[o[1]])
    });
  },
  
  // Règle les labels en fonction de la langue courante
  set_labels: function(){
    // Title de la fenêtre
    $('head > title').html(LOCALE_UI.Label.title);
    
    // Dans LOCALE_UI.Label
    $([
      ['div#nom_site', 'TITLE'],
      ['div#subtitle_site', 'subtitle'],
      ['a#mail_to_phil', 'mail_to_phil'],
      ['td#td_label_roadmap', 'ROADMAP'],
      ['td#td_label_mdp','MDP'],
      ['.label_roadmap', 'roadmap']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Label[o[1]]);
    });
    // Dans LOCALE_UI.Verb
    $([
      ['.label_close', 'close'],
      ['.lab_and_save', 'and_save']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Verb[o[1]]);
    });
    // Dans LOCALE_UI.Exercices.Label
    $([
      ['a#btn_exercices_run', 'play_exercices'],
      ['a#btn_stop_exercices', 'stop_exercices'],
      ['a#btn_exercice_create', 'new_exercice'],
      ['a#btn_exercices_move', 'activate_moving'],
      ['span#lab_ordre_exercices', 'ordre_exercices'],
      ['span#lab_suites_harmoniques', 'suites_harmoniques'],
      ['span#lab_sens_exercices', 'sens_des_exercices']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Exercices.Label[o[1]]);
    });
  },

  // Change la langue courante de l'interface
  // (appelée quand on clique sur le drapeau)
  change_lang: function(){
    window.LANG = LANG == 'fr' ? 'en' : 'fr' ;
    // Il faut modifier la source des javascript des locales
    // "javascript/locale/[fr/en]/**/*.js"
    var liste_js_locales = [], jqo ;
    $('script.locale').map(function(i,o){liste_js_locales.push( $(o) );});
    for(var i in liste_js_locales){
      jqo = liste_js_locales[i] ; // => objet jQuery
      id  = jqo.attr('id').split('-')[1] ; // => p.e. "errors"
      new_src = "javascript/locale/"+LANG+"/"+id+".js" ;
      js =  '<script id="'+jqo.attr('id') + '"' + 
            ' type="text/javascript" class="locale"' +
            ' src="'+new_src+'"></script>' ;
      jqo.replaceWith( js ) ; // pour forcer le rechargement
    }
    this.init();
    return false ; // pour le a-lien
  },
  // Pour passer en "plein écran", c'est-à-dire que la partie de la liste des
  // exercice va prendre toute la page. EN fait, c'est plutôt un "ajuster
  // à l'écran"
  fullscreening: false, // true quand on est en fullscreen
  fullscreen: function(){
    // Ajuster à l'écran
    var logo_height = $('section#bande_logo').height();
    var spec_height = $('div#roadmap_specs').height() ;
    var wind_height = $(window).height() ;
    var btns_height = parseInt($('div#btns_exercices').height());
    var new_height = (wind_height - btns_height - 200).toString() + "px" ;
    $('ul#exercices').css({'height': new_height, 'min-height': new_height});
    return false ; //pour le a-lien
  },
  // Certaines images peuvent avoir été définies par :
  //    <img data-src="path/relatif" />
  // On traite ce `data-src' pour en faire la source de l'image
  set_src_images: function(){
    $('img').map(function(i,o){
      o = $(o);
      if ( src = o.attr('data-src') ) o.attr('src', $.proxy(UI.path_image,UI,src) ) ;
    });
  },
  // Règle le drapeau de l'autre langue (seulement en/fr pour le moment)
  // @NB: La langue est définie dans la constante JS LANG
  set_drapeau_autre_langue: function(){
    var p = "picto/drapeau/" + (LANG=='fr'?'en':'fr') + ".png" ;
    $('img#drapeau_autre_langue').attr('src', this.path_image(p) ) ;
  },
  start_metronome: function(){this.onclick_metronome_anim(true)},
  stop_metronome: function(){ this.onclick_metronome_anim(false)},
  // Quand on clique sur l'animation du métronome
  // (on passe de fixe à balançant)
  onclick_metronome_anim: function(forcer){
    var src_gif = this.path_image('metronome/metro.gif') ;
    var src_png = this.path_image('metronome/metro_fixe.png') ;
    var img = $('img#metronome_anim') ;
    if ('undefined' == typeof forcer ) forcer = img.attr('src') == src_png ;
    img.attr('src', forcer ? src_gif : src_png) ;
  },
  path_image: function(relpath){
    return this.FOLDER_IMAGES + relpath ;
  },
  
  /*
      Sous-objet UI.Captcha pour gérer le test de Turing
  */
  Captcha:{
    
    set_message: function( texte ){ $('div#captcha_message').html(texte) },
    
    // Check captcha
    // 
    // @param   action    L'action qui sera possible si le captcha est bon
    //                    P.e. "mail" pour envoyer un mail.
    check: function(action){
      this.set_message( "" );
      Ajax.query({
        data:{
          proc            : 'app/captcha/check',
          captcha_action  : action,
          captcha_reponse : $('input#captcha_reponse').val(),
          captcha_time    : $('input#captcha_time').val()
        },
        success : $.proxy(UI.Captcha.retour_check, UI.Captcha),
        error   : $.proxy(UI.Captcha.retour_check, UI.Captcha)
      })
    },
    // Retour du check du captcha
    retour_check: function(rajax){
      if (rajax['error']) return F.error(rajax['error']) ;
      if ( rajax['captcha_success'] ){
        // On remplace le div du captcha par le texte renvoyé
        $('div#captcha').replaceWith( rajax['captcha_message']);
      } else if ( rajax['captcha_failed'] ) {
        // Échec définitif
        $('div#captcha').replaceWith( 
          '<div class="warning">' + rajax['captcha_message'] + '</div>');
      } else {
        this.set_message( rajax['captcha_message'] ) ;
      }
    },
  },
});