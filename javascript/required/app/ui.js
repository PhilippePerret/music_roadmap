var documentBody = (($.support.chrome)||($.support.safari)) ? document.body : document.documentElement;

if('undefined'==typeof UI) UI = {} ;
$.extend(UI,{
  FOLDER_IMAGES: "_MVC_/view/img/",

  // UI initialisation
  // @note: also called when language changes
  init: function(){
    this.set_flag_lang();
    this.set_noms_boutons();
    this.set_labels();
    RMEvent.observers_on_textfields();
    Locale.update();
    UI.humanize();
  },
  
  // Set User Interface when there is no roadmap
  // (e.g. on logout, on Roadmap.init or on destroy current roadmap)
  set_no_roadmap:function(){
    Roadmap.init_new();
    Roadmap.set_div_specs(true);
    Roadmap.set_etat_btn_save(null);
    Exercices.set_boutons();
  },
  
  /*
   *  Open a "volet" (rapport, exercices, session preparation, etc.)
   *  ---------------------------------------------------------------
   *  C'est dans cette méthode qu'on doit s'assurer que tous les éléments propres
   *  à chaque "volet" soit affiché/masqué. Et on appelle la méthode générale 
   *  d'ouverture du volet.
   */
  HIDDENS_ON_RAPPORT    :new DArray(['a#btn_seance_play', 'a#btn_exercices_move', 'a#btn_exercice_create']),
  SHOWS_ON_RAPPORT      :new DArray([]),
  HIDDENS_ON_SEANCE     :new DArray([]),
  SHOWS_ON_SEANCE       :new DArray(['a#btn_seance_play']),
  SHOWS_ON_EXERCICES    :new DArray(['a#btn_seance_play', 'a#btn_exercices_move', 'a#btn_exercice_create', 'div#open_roadmap_specs']),
  HIDDENS_WHILE_WORKING :new DArray(['a#btn_exercice_create','a#btn_exercices_move', 'div#open_roadmap_specs']),
  SHOWED_WHILE_WORKING  :new DArray(['a#btn_seance_play','a#btn_seance_end','a#btn_seance_pause']),
  current_volet:'exercices',
  open_volet:function(volet){
    if(this.current_volet != null && this.current_volet != volet){
      this.close_volet(this.current_volet);
    }
    // console.log("open volet "+volet);
    if('undefined' == typeof hide) hide = false;
    switch(volet){
      case 'rapport':
        this.HIDDENS_ON_RAPPORT.hide();
        // this.SHOWS_ON_RAPPORT.show();
        Rapport.show_section();
        break;
      case 'exercices':
        UI.set_visible('ul#exercices');
        Exercices.set_boutons() ;
        this.SHOWS_ON_EXERCICES.show();
        Exercices.set_boutons();
        break;
      case 'seance':
        this.HIDDENS_ON_SEANCE.hide();
        this.SHOWS_ON_SEANCE.show();
        Seance.prepare();
        Seance.show_section('seance_form');
        break;
      case 'running_seance':
        UI.set_visible('ul#exercices');
        this.HIDDENS_WHILE_WORKING.hide();
        this.SHOWED_WHILE_WORKING.show();
        Seance.set_working_ui(true);
        break;
    }
    this.current_volet = volet.toString();
    return false;//for a-link
  },
  close_volet:function(volet){
    switch(volet){
      case 'rapport':
        Rapport.hide_section();
        break;
      case 'exercices':
        UI.set_invisible('ul#exercices');
        this.SHOWS_ON_EXERCICES.hide();
        break;
      case 'seance':
        Seance.hide_section();
        this.SHOWS_ON_SEANCE.hide();
        break;
      case 'running_seance':
        this.SHOWED_WHILE_WORKING.hide();
        Seance.set_working_ui(false);
        this.close_volet('exercices');
        break;
    }
    this.current_volet = null;
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
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Label[o[1]]);
    });
    // Dans LOCALE_UI.Verb @TODO: Faire traiter par humanize (LOCALE_UI.Class)
    $([
      ['.label_close', 'close'],
      ['.lab_and_save', 'and_save']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Verb[o[1]]);
    });
    // Dans LOCALE_UI.Exercices.Label
    $([
      ['a#btn_exercice_create', 'new_exercice'],
      ['a#btn_exercices_move', 'activate_moving'],
      ['span#lab_ordre_exercices', 'ordre_exercices'],
      ['span#lab_suites_harmoniques', 'suites_harmoniques'],
      ['span#lab_sens_exercices', 'sens_des_exercices']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Exercices.Label[o[1]]);
    });
    // Dans LOCALE_UI.Seance
    $([
      ['a#btn_seance_play', 'start'],
      ['a#btn_seance_end',  'stop'],
      ['a#btn_seance_pause', 'pause']
    ]).each(function(i,o){
      $(o[0]).html(LOCALE_UI.Seance[o[1]]);
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
    // Pour forcer l'actualisation des éléments
    Seance.ready = false;
    Roadmap.UI.prepare();
    Roadmap.Data.show();
    Exercices.Edition.prepare();
    return false; // pour le a-lien
  },
  // Pour passer en "mode zen", c'est-à-dire que la partie de la liste des
  // exercice va prendre toute la page. EN fait, c'est plutôt un "ajuster
  // à l'écran"
  // @TODO: Prendre vraiment toute la dimension de la page
  fullscreening: false, // true quand on est en fullscreen
  mode_zen:false,
  fullscreen: function(){
    this.mode_zen = !this.mode_zen;
    var data;
    if(this.mode_zen){
      // data = {'position':'absolute', 'top':'0', 'left':'0',
      //   'width': '100%', 'height': '100%'}
      data = {'position':'absolute'};
      $('section#section_exercices').css(data);
      data_anim = {'width': '100%', 'height': '40em', 'top':'0', 'left':'0', 'font-size':'0.8em'};
      // $('section#section_exercices').animate({'top':'0', 'left':'0'});
      // $('section#section_exercices').animate({'width': '100%', 'height': '40em'});
      $('section#section_exercices').animate(data_anim, 400);
      $('ul#exercices').animate({'height':"90%"})
    }else{
      data = {'position':''};
      data_anim = {'top':'97px', 'left':'177px', 'width':"718px", 'height':"493px", 'font-size':'1em'};
      $('ul#exercices').animate({'height':"25em"});
      $('section#section_exercices').animate(data_anim, {
        duree:400, always:function(){$('section#section_exercices').css(data)}
      });
    }
    // Ajuster à l'écran
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
  set_flag_lang: function(){
    var relpath  = "picto/drapeau/" + (LANG=='fr'?'en':'fr') + ".png";
    var img_path = this.path_image(relpath);
    $('img#flag_lang').attr('src', img_path );
    $('img#flag_lang').attr('data-src', relpath );
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
  path_image: function(relpath){return this.FOLDER_IMAGES + relpath},
  
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