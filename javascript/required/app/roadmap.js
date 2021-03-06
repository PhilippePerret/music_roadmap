/*
    Objet Roadmap
    --------------
    Gestion générale de la roadmap du jour pour travailler les exercices.
*/
window.Roadmap = {
  class     : 'Roadmap',
  nom       : null,
  md5       : null,
  partage   : null,
  loaded    : false,    // mis à true quand une roadmap est chargée
  modified  : false,
  last_id_exercice: null,
  
  // Return the id for a new exercice.
  // 
  // @noter que ce nouvel identifiant ne sera pris en compte qu'à l'enregistrement effectif
  // de l'exercice.
  // 
  next_id_exercice:function(){
    return ++ this.last_id_exercice ;
  },
  
  // Called when we focuse in text-field roadmap_nom
  // If User is identified, display an advice to compose the name of the roadmap.
  // Otherwise, set "Exemple" in the field and lock it.
  on_focus_nom:function(){
    var o = $('input#roadmap_nom');
    o.select();
    if (User.is_identified())
      F.show(MESSAGE.Roadmap.how_to_make_a_good_nom);
    else
      F.show(MESSAGE.Roadmap.must_signin_to_create);
  },
  // // => Retourne le nom de la feuille de route courante
  get_nom: function(){
    BT.add('-> Roadmap.get_nom') ;
    this.set($('input#roadmap_nom').val());
    BT.add('<- Roadmap.get_nom (return: this.nom='+this.nom+')') ;
    return this.nom;
  },
  // Définit le nom de la roadmap (et le place dans le div specs)
  set: function(nom){
    BT.add('-> Roadmap.set(nom:'+nom) ;
    if ( nom !== false ){
      if ( nom == "" ) nom = null ;
      this.nom = nom ;
      $('input#roadmap_nom').val( nom || "" ) ;
    }
    BT.add('<- Roadmap.set') ;
    return nom ;
  },
  // Relève les données du roadmap dans le document
  // @return  Null (void)
  get: function(){ 
    BT.add('-> Roadmap.get') ;
    this.get_nom(); 
    BT.add('<- Roadmap.get') ;
  },
  // => Retourn l'“affixe” de la feuille de route courante, c'est-à-dire le
  //    nom du dossier qui va contenir ses éléments.
  affixe: function(){
    return this.nom + '-' + User.mail ;
  },
  
  // Initialisation (au chargement de la page)
  init: function(){
    BT.add('-> Roadmap.init') ;
    this.set("");
    this.set_btns_roadmap();
    BT.add('<- Roadmap.init') ;
  },
  
  // Tout initialiser pour un nouveau document
  initing_new: false,
  init_new: function(){
    BT.add('-> Roadmap.init_new');
    this.initing_new = true;
    this.reset_all();
    BT.add('<- Roadmap.init_new');
    this.initing_new = false;
  },
  
  // Reset tout
  reset_all: function(){
    $('ul#exercices').html('') ;
    this.set(null) ;
    this.loaded         =false;
    this.specs_modified =false;
    this.md5            =null;
    this.partage        =null;
    this.Data.init_all() ;
    this.set_modified(false);
    this.set_btns_roadmap();
  },
  
  // Marque la feuille de route modifiée et règle le bouton Save
  set_modified: function( ismod ){
    if ( 'undefined' == typeof ismod ) ismod = true ;
    BT.add('-> Roadmap.set_modified('+ismod.toString()+')') ;
    this.modified = ismod ;
    this.set_etat_btn_save( this.modified ); 
    BT.add('<- Roadmap.set_modified') ;
  },
  
  /*
      RÉGLAGE INTERFACE
  */
  // Définit l'état du div contenant les specs en fonction de la présence ou
  // non du nom de la roadmap
  // @return true si les données sont bonnes, false dans le cas contraire
  set_etat_specs: function( with_message ){
    BT.add('-> Roadmap.set_etat_specs') ;
    if ('undefined' == typeof with_message) with_message = true ;
    var specs_are_ok = this.are_specs_valides(forcer = true, with_message) ;
    this.set_btns_roadmap() ;
    this.set_div_specs( specs_are_ok == false );
    BT.add('<- Roadmap.set_etat_specs (return: specs_are_ok='+specs_are_ok+')') ;
    return specs_are_ok ;
  },
  
  // Masquer/afficher les boutons propres à la roadmap
  // - Button to init a new roadmap (init)
  // - Button to open a roadmap
  // - Button to create a roadmap
  // - Button to save the roadmap
  // - Button to create a new exercice
  // - General configuration of exercices @FIXME: Devrait être avec les exercices
  // 
  set_btns_roadmap: function(){
    BT.add('-> Roadmap.set_btns_roadmap') ;

    var userok = User.is_identified();
    var rm_exemple = this.nom == "Exemple" && !userok ;
    // --
    var ok_to_create  = userok && this.nom != null ;
    var ok_to_open    = (ok_to_create && this.loaded == false) || rm_exemple ;
    var des_exs = EXERCICES.length > 0 ;
    
    // -- Visibilité par bouton --
    
    // :init
    // Ne doit être visible que s'il y a des exercices
    UI.set_visible('a#btn_init_roadmap', des_exs) ;
    
    // :open
    // Ne doit être visible que si les specs sont valides, que la roadmap
    // n'est pas chargée (attention : une autre roadmap peut avoir été
    // chargée)
    this.set_etat_btn_open(ok_to_open);
		
    // :create
    // Ne doit être visible que si les specs sont valides et ne correspondent
    // pas à la roadmap chargée (=> loaded = false)
    this.set_etat_btn_create(ok_to_create);
    
    // :save
    // Ne doit être visible que si une roadmap est chargée (son état varie
    // ensuite en fonction de l'état de la sauvegarde)
    this.set_etat_btn_save( this.modified == true ) ;
    
    // :select#roadmaps
    // Menu des roadmaps de l'utilisateur
    UI.set_visible('select#roadmaps', User.has_roadmaps() );
    
    // Configuration générale des exercices
    // Visible seulement si une feuille de route est chargée
    UI.set_visible('div#config_generale', this.loaded == true ) ;
    
    // :créer un exercice
    // Visible seulement si une feuille de route est chargée
    UI.set_visible('a#btn_exercice_create', this.loaded == true ) ;

    BT.add('<- Roadmap.set_btns_roadmap') ;
  },
  // Règle l'état du bouton "Ouvrir" (la roadmap)
  set_etat_btn_open:function(visible){
    UI.set_visible('a#btn_roadmap_open', visible);
  },
  // Règle l'état du bouton "Créer" (la roadmap)
  set_etat_btn_create:function(visible){
    UI.set_visible('a#btn_roadmap_create', visible);
  },
  // Règle l'état du bouton "Sauver"
  set_etat_btn_save: function( val ){
    BT.add('-> Roadmap.set_etat_btn_save') ;
    var css, nom ;
    switch( val ){
      case null   : css = 'act' ; nom = LOCALE_UI.Roadmap.btn_saving ; break ;
      case false  : css = 'off' ; nom = LOCALE_UI.Roadmap.btn_saved  ; break ;
      case true   : css = 'on'  ; nom = LOCALE_UI.Roadmap.btn_save   ; break ; 
    }
    $('a#btn_roadmap_save').attr('class', 'btn ' + css).html(nom) ;
    UI[this.loaded ? 'set_visible' : 'set_invisible']('a#btn_roadmap_save');
    BT.add('<- Roadmap.set_etat_btn_save') ;
  },

  // Définit l'état du div contenant les specs, le lien pour les ouvrir,
  // ainsi que les boutons pour confection une séance, lire un rapport, etc.
  set_div_specs: function( ouvert ){
    BT.add('-> Roadmap.set_div_specs') ;
    if ( 'undefined' == typeof ouvert ) meth_spec = meth_lien = 'toggle' ;
    else {
      meth_spec = (ouvert && User.is_identified()) ? 'show' : 'hide' ;
      meth_lien = ouvert ? 'hide' : 'show' ;
    }
    $('div#open_roadmap_specs')[meth_lien]() ;
    $('div#roadmap_specs-specs')[meth_spec]();
    BT.add('<- Roadmap.set_div_specs') ;
    return false ; // pour le a-lien
  },
  // Appelé quand on EST EN TRAIN de changer le nom de la roadmap
  // Pour faire apparaitre les boutons "créer" et "ouvrir" dès que le nom est
  // assez long.
  onchange_nom:function(current_nom){
    var ok = User.is_identified() && current_nom.length > 3 ;
    this.set_etat_btn_open(ok);
    this.set_etat_btn_create(ok);
  },
  // Appelé quand on change la valeur du nom de la roadmap dans les specs
  // @note: contrairement à la méthode `onchange_nom', cette méthode est appelée à
  // la fin, c'est-à-dire quand on sort du champ.
  on_end_change_nom:function(nom){
    BT.add('-> Roadmap.onchange_nom (nom='+nom) ;
    if( nom != null ) {
      try{
        if ( nom == "" ) throw 'need_a_nom' ;
        else {
          if( this.get_a_correct_and_set( nom ) == false ) throw 'invalid_nom';
          if( /*le nom corrigé */ this.nom.length < 4 ) throw 'too_short_name';
          if( this.nom.length > 30){
            this.set(this.nom.substr(0,29)) ;
            throw 'too_long_name' ;
          }
        }
      } catch (iderr){
        F.error(ERROR.Roadmap.Specs[iderr]);
      }
    }
    this.loaded = false;
    this.are_specs_valides(true, false);
    this.set_btns_roadmap();
    BT.add('<- Roadmap.onchange_nom') ;
  },
  
  // Retourne true si le nom de la roadmap est défini et que le mail de l'utilisateur
  // est défini
  specs_ok: function( with_message ){
    BT.add('-> Roadmap.specs_ok') ;
    if ('undefined' == typeof with_message) with_message = false ;
    this.get();
    var ok = this.nom != null && User.mail != null ;
    if ( with_message && !ok ) F.error(ERROR.Roadmap.Specs.requises) ;
    BT.add('<- Roadmap.specs_ok / return : ' + ok) ;
    return ok ;
  },
  
  // => Retourne true si le nom et le User.mail sont valides
  are_specs_valides: function(forcer_check, with_message ){
    BT.add('-> Roadmap.are_specs_valides') ;
    if ( User.mail == null ) return false ;
    if ( 'undefined' == typeof with_message ) with_message = true ;
    if ( 'undefined' == typeof forcer_check ) forcer_check = false ;
    if (this.specs_valides !== null && !forcer_check) return this.specs_valides ;
    try {
      if( this.nom == null ) {
        UI.focus('roadmap_nom');
        throw 'need_a_nom';
      }
      // Tout semble OK
      this.specs_valides = true ;
    } catch( erreur ){ 
      this.specs_valides = false ;
      if ( with_message ) Flash.error( ERROR.Roadmap.Specs[erreur], {keep:false} ) ;
    }
    BT.add('<- Roadmap.are_specs_valides (return: this.specs_valides='+this.specs_valides+')') ;
    return this.specs_valides ;
  },
  // Compose un nom correct pour la roadmap et le met dans le champ
  // return FALSE si le nom a dû être corrigé
  get_a_correct_and_set: function( from ){
    from = from.replace(/ /g, '_');
    from_init = from.toString();
    from = Texte.to_ascii( from );
    from = from.replace(/[^a-zA-Z0-9_-]/g, '');
    this.set(from);
    return from == from_init;
  },

  /*  Ouvre la roadmap voulue par un menu
  
      La méthode est appelée par un menu, principalement le menu "roadmaps"
      qui contient par les roadmaps de l'utilisateur.
      
      @param    idmenu    Identifiant du menu qui appelle la méthode
      @products Le chargement et l'affichage de la roadmap sélectionnée dans
                le menu (si elle existe)
  */
  open_by_menu: function( idmenu ){
    this.opening = true ;
    var oselect = $('select#' + idmenu) ;
    var nomumail = oselect.val();
    var drm   = nomumail.split('-');
    this.set(drm[0]);
    this.open();
    oselect.val('');
  },
  // Ouvre la roadmap courante
  opening: false, // mis à true pendant l'ouverture
  open: function(){
    BT.add('-> Roadmap.open') ;
    this.opening = true ;
    if( this.specs_ok( true ) == false ) return false ;
    Flash.show( MESSAGE.thank_to_wait )
    Ajax.query({
      data:{
        proc            : "roadmap/load",
        roadmap_nom     : this.nom,
        user_mail       : User.mail,
        check_if_exists : true
      },
      success: $.proxy(this.end_open, this),
      error  : $.proxy(this.end_open, this)
    })
    BT.add('<- Roadmap.open (attente retour ajax)') ;
    return false ;
  },
  // Retour ajax de la précédente
  // @note: rajax['data_roadmap'] contient les données des roadmaps
  end_open: function(rajax){
    BT.add('-> Roadmap.end_open') ;
    this.loaded = ( false == traite_rajax( rajax ) );
    if ( this.loaded ) {
      this.loaded = true ;
      var roadmap = rajax.roadmap ;
      this.last_id_exercice = parseInt(rajax.last_id_exercice, 10) ;
      Exercices.reset_liste() ;
      Roadmap.Data.dispatch(roadmap);
      Seance.last_params = rajax.params_last_seance ; 
      Roadmap.Data.show();
      F.show(MESSAGE.Roadmap.loaded);
      RMEvent.enable(KEY_EVENTS, $.proxy(Seance.onkeypress, Seance));
    }
    // $.proxy(Roadmap.set_div_specs, Roadmap, ouvert = !this.loaded)() ;
    UI.open_volet('exercices');
    this.set_btns_roadmap() ;
    this.set_div_specs( ouvert = !this.loaded ) ;
    
    // [#TODO: TRAITER ÇA PAR DES PRÉFÉRENCES]
    if ( this.loaded && User.mail == 'phil@atelier-icare.net') {
      Seance.show()
    }
    BT.add('<- Roadmap.end_open (return: this.loaded='+this.loaded+')') ;
    Roadmap.opening = false ;
    return this.loaded ;
  },
  
  
  // La méthode pour sauver les données de chaque exercice
  // Exercices.save_all($.proxy(Roadmap.save_all, Roadmap, 'suite')) ;
  
  // Enregistre les data des exercices (générales)
  save_data_exercices:function(fx_suite){
    BT.add('-> Roadmap.save_data_exercices') ;
    if (User.is_not_owner()) return false ;
    if ('function'!=typeof fx_suite) 
      fx_suite = $.proxy(this.end_save_data_exercices, this)
    Ajax.query({
      data:{
        proc            : 'roadmap/save',
        roadmap_nom     : this.nom,
        mail            : User.mail,
        md5             : User.md5,
        data_exercices  : this.Data.EXERCICES
      },
      success: fx_suite
    })
    BT.add('<- Roadmap.save_data_exercices') ;
  },
  end_save_data_exercices:function(rajax){
    traite_rajax( rajax );
  },
  
  // Enregistre la roadmap courante
  // ------------------------------
  saving: false,
  save: function(fx_suite){
    BT.add('-> Roadmap.save') ;
    this.saving = true ;
    try{
      if( User.need_to_signin($.proxy(this.save,this))) throw 'need_login' ;
      if ( false == this.creating ){
        if ( this.modified == false ) throw '' ;
        if ( this.is_locked() )       throw 'is_locked' ;
      }
      if( this.specs_ok(true) == false ) return this.end_save() ;
    }catch(erreur){
      if (erreur != '') F.error(ERROR.Roadmap[error]);
      this.saving = false; 
      return false;
    }
    F.show(MESSAGE.Roadmap.saving);
    // -> Requête de sauvegarde ou création
    Ajax.query({
      data:{
        proc            :'roadmap/save',
        lang            :LANG,
        roadmap_nom     :this.nom,
        mail            :User.mail,
        md5             :User.md5,
        creating        :this.creating,
        config_generale :this.Data.get_general_config(),
        data_exercices  :this.Data.EXERCICES //@TODO: vérifier comment l'ordre est sérialisé
                                              // et utiliser la méthode qui transforme en string
                                              // si nécessaire
      },
      success: $.proxy(this.end_save, this, fx_suite)
    })
    BT.add('<- Roadmap.save (après envoi requête ajax)') ;
  },
  end_save: function(fx_suite, rajax){
    BT.add('-> Roadmap.end_save') ;
    var error_occured = traite_rajax( rajax ) ;
    if( ! error_occured ) Flash.show(MESSAGE.Roadmap.saved) ;
    this.saving = false ;
    // Dans le cas d'une création
    if ( this.creating ){
      $.proxy(Log.new, Log, 100, this)() ;
      this.loaded   = true ;
      if ( error_occured ) this.end_create(false);
      this.set_btns_roadmap() ;
    }
    if ('function'==typeof fx_suite) fx_suite() ; // p.e. save exercices
    else if (this.creating) this.end_create(!error_occured) ;
    BT.add('<- Roadmap.end_save (return: error_occured='+error_occured+')') ;
    return ! error_occured ;
  },

  // Création de la Roadmap
  // @Noter que `creating' ne sera mis à false qu'après la sauvegarde totale
  // de la roadmap (donc après la sauvegarde des exercices)
  creating: false,
  create: function(rajax){
    this.creating = true ;
    if ( 'undefined' == typeof rajax ){
      BT.add('-> Roadmap.create (première entrée)') ;
      try {
        if ( User.need_to_signin($.proxy(this.create,this)) ) throw null ;
        if ( this.are_specs_valides(forcer=true) !== true )   throw null ;
        if ( User.has_nombre_max_roadmaps() ){F.error(ERROR.Roadmap.too_many); throw null;}
      } catch( erreur ){
        return this.end_create(false);
      }
      // Le nom-umail de la roadmap doit être unique
      Ajax.query({
        data:{proc:'roadmap/check',roadmap_nom:this.nom, user_mail:User.mail},
        success : $.proxy(this.create,this),
      })
      BT.add('<- Roadmap.create (attente retour ajax)') ;
      return false ; // pour le a-lien
    } else {
      // Retour Ajax
      BT.add('-> Roadmap.create (retour ajax)') ;
      if ( false == traite_rajax( rajax ) ){
        F.show( MESSAGE.Roadmap.creating ) ;
        this.md5 = User.md5 ;
        this.save() ;
      } else this.end_create(false);
    }
  },
  // Note: comme cette méthode est appelée après différents traitements 
  // indépendants, ce sont ces traitements qui gèrent l'affichage des erreurs
  // Donc ici, il suffit de savoir si la création a pu se faire ou non
  end_create:function(ok){
    if (ok === true){ 
      F.show(MESSAGE.Roadmap.created);
      /*  Il faut :
       *  - ajouter la roadmap à la liste de l'user et l'afficher dans le
       *    menu
       *  - régler la configuration générale des exercices
       *  - cacher les boutons "créer" et "open"
       *  - vider ul#exercices
       */
      User.add_roadmap(this.nom);
      this.set_etat_btn_open(false);
      this.set_etat_btn_create(false);
      $('ul#exercices').html('')
      this.UI.Set.config_generale();
    }
    this.creating = false;
    return false // pour certaines méthodes
  },
  
  // --- Méthodes de destruction de la roadmap
  destroying:false,
  destroy: function(){
    this.destroying = true ;
    Ajax.query({
      data:{
        proc: 'roadmap/destroy',
        roadmap_nom : this.nom,
        mail        : User.mail,
        password    : User.password
      },
      success: $.proxy(this.end_destroy, this)
    })
  },
  end_destroy:function(rajax){
    traite_rajax( rajax );
    UI.set_no_roadmap();
    this.destroying = false;
  },
  
  /*  Peuple le select#roadmaps avec les roadmaps envoyées
      -----------------------------------------------------

    @param   roadmaps    Liste (Array) d'identifiant de roadmap, c'est-à-dire
                         de "nom-umail". Seul le nom importe pour l'affichage
                         puisque umail est le mail du possesseur.

  */
  peuple_menu_roadmaps: function(roadmaps){
    var i, nom, umail;
    var menu = $('select#roadmaps');
    menu.html("");
    if('undefined' != typeof(roadmaps) || roadmaps != null){
      menu.append('<option value="">' + LOCALE_UI.Roadmap.open_your_rm + '</option>');
      for(i in roadmaps){
        idrm = roadmaps[i];
        drm = idrm.split('-') ;
        nom = drm[0]; umail = drm[1];
        menu.append('<option value="'+idrm+'">' + nom + '</option>');
      }
      UI.set_visible('select#roadmaps');
    } else {
      UI.set_invisible('select#roadmaps');
    }
  },
  // Save general config
  save_general_config:function(){
    Roadmap.set_modified();
    Roadmap.save();
    return false;//for a-link;
  },
  // /*
  //     Sous-objet Roadmap.Data
  //     -------------------------
  //     Gère toutes les données de la roadmap
  // */
  Data:{
    
    class: 'Roadmap.Data',
    
    // -------------------------------------------------------------------
    //  Les données de la Roadmap
    // -------------------------------------------------------------------
    
    // --- Paramètres généraux ---
    GENERAL_CONFIG_PROPERTIES:[
      // @WARNING: IL FAUT ABSOLUMENT GARDER LES TROIS PREMIÈRES EN PREMIER
      // Car quand on clique que le bouton pour passer à la configuration suivante, on
      // tourne sur ces trois premiers paramètres pour les passer alternativement de
      // true à false (ou inversement)
      // @see `next_general_config' ci-dessous
      'down_to_up', 'maj_to_rel', 'first_to_last', 'tone', 'last_changed'
    ],
    down_to_up        :true,            // cf. N0001
    first_to_last     :true,           // cf. N0002
    /**
      * Propriété à True si les exercices doivent être joués de façon aléatoire.
      * La valeur `true` surclasse `first_to_last`
      * @property {Boolean} ordre_aleatoire
      */
    ordre_aleatoire   :false,
    maj_to_rel        :true,            // cf. N0003
    tone              :0,
    last_changed      :'down_to_up',    // cf. N0004
    
    // --- Les Données générales des exercices ---
    // Pour l'obtenir     : Exercices.ordre()
    // Pour l'actualiser  : Exercices.set_ordre(<liste>);
    EXERCICES  : {
      'ordre' : []      // Liste des ID des exercices dans l'ordre
    },
  
    // Initialisation de toutes les données (nouveau document)
    init_all: function(){
      this.down_to_up     = true ;
      this.first_to_last  = true ;
      this.maj_to_rel     = true ;
      this.ordre_aleatoire = false ;
      this.tone          = 0 ;
      this.last_changed   = 'down_to_up' ;
      this.show() ;
      window.EXERCICES = {length:0} ;
      this.EXERCICES = {
        'ordre': []
      }
    },
 
    // Inverse une donnée générale
    // @param   key   La clé, par exemple 'down_to_up'
    toggle: function( key ){
      this[key] = ! this[key] ;
      Roadmap.Data.show();// Update display
    },
    
    // Passer à la configuration générale suivante
    next_general_config: function(){
      // Index de la nouvelle configuration
      var index_config = this.GENERAL_CONFIG_PROPERTIES.indexOf( this.last_changed ) ;
      index_config += 1 ; if ( index_config > 2 ) index_config = 0 ;
      // Modifier le paramètre suivant
      var config = this.GENERAL_CONFIG_PROPERTIES[index_config] ;
      this.toggle( config ) ;
      this.last_changed = config.toString();
      // On change de gamme
      ++ this.tone ;
      if (this.tone >= 24) this.tone = 0;
      Exercices.set_tones();
      this.show();
      return false;//for a-link
    },
    // => Retourne les données de la configuration générale
    get_general_config:function(){
      var d = {}, prop;
      for(var i in this.GENERAL_CONFIG_PROPERTIES){
        prop    = this.GENERAL_CONFIG_PROPERTIES[i];
        d[prop] = this[prop];
      }
      return d;
    },
    /**
      * Définit les données générales pour la séance
      * @method set_general_config
      * @param  {Object} data   Les données de la séance courante. L'objet contient beaucoup plus de
      *                         données que celles nécessaires à la méthode. Ici, on se sert de :
      *   @param {Boolean} data.down_to_up      Détermine le sens des exercices (à remonter ou à descendre)
      *   @param {Boolean} data.first_to_last   Du premier exercice au dernier, ou inversement
      *   @param {Boolean} data.maj_to_rel      Majeur au relatif ou inversement
      *   @param {Object}  data.options         Liste des options de la séance de travail
      *     @param  {Boolean} data.options.aleatoire  True si le sens doit être aléatoire.
      */
    set_general_config:function( data ){
      if (data == null) return F.show(MESSAGE.Roadmap.no_config_generale);
      this.ordre_aleatoire = false
      if(undefined != data.options) this.ordre_aleatoire = data.options.aleatoire
      for(var i in this.GENERAL_CONFIG_PROPERTIES){
        var prop = this.GENERAL_CONFIG_PROPERTIES[i];
        if('undefined' != typeof data[prop]) this[prop] = data[prop];
      }
    },
    
    // Règle l'interface avec les données spécifiées
    show: function(){
      // Afficher les data générales
      if (Roadmap.UI.ready == false ) Roadmap.UI.prepare();
      Roadmap.UI.Set.tone();
      Roadmap.UI.Set.config_generale();
    },
     
    // Dispatch les données envoyées
    // ------------------------------
    // @param data    Hash des données telles que remontées par la procédure
    //                ajax de chargement de la roadmap.
    //                Ou null si la roadmap n'est pas encore défini
    dispatch: function( data ){
      try {
        if ( 'undefined' == typeof data ) throw 'ERROR.Roadmap.Data.required' ;
        if ('undefined' != typeof data.data_roadmap)
          this.dispatch_data(data.data_roadmap);
        if ( 'undefined' != typeof data.config_generale )
          this.set_general_config(data.config_generale) ;
        if ( 'undefined' != typeof data.data_exercices )
          this.dispatch_exercices(data.data_exercices, data.exercices);
      } catch( erreur ) { return F.error(erreur) }
      return true ;
    },
    dispatch_data: function(data){
      if ('undefined' == typeof data.md5) data.md5 = null ;
      Roadmap.md5      = data.md5 ;
      if ('undefined' == typeof data.partage) data.partage = 0 ;
      Roadmap.partage  = parseInt(data.partage, 10);
    },
    // On construit tous les exercices
    // @note: C'est en ruby que le classement est fait selon la liste 'ordre'
    // des données générales
    dispatch_exercices: function(data, liste_exercices){
      this.EXERCICES = data ;
      var i;
      for(i in liste_exercices) exercice(liste_exercices[i]).build() ;
    },
    
  }, //  Fin du sous objet Roadmap.Data
  // -------------------------------------------------------------------
  
  // -------------------------------------------------------------------
  //  Sous-objet Roadmap.ui
  //  ---------------------
  //  Toutes les méthodes qui règles l'interface
  // -------------------------------------------------------------------
  UI: {
    ready:false, // set to true when UI roadmap is localized
    prepare:function(){
      $('a#btn_next_config_img').attr('title',LOCALE_UI.Exercices.Config.title_volant);
      $('label#config_generale_label_cbsave').html(LOCALE_UI.Exercices.Config.cb_save);
      // @TODO: Autres éléments localisés ?
      this.ready = false;
    },
    // -------------------------------------------------------------------
    // Sous-objet Roadmap.UI.Set
    // Définit une valeur dans l'interface
    // -------------------------------------------------------------------
    
    Set:{
      // Shortcuts
      aleatoire   :function(){ return Roadmap.Data.ordre_aleatoire},
      downToUp    :function(){ return Roadmap.Data.down_to_up},
      firstToLast :function(){ return Roadmap.Data.first_to_last},
      majToRel    :function(){ return Roadmap.Data.maj_to_rel},
      
      /**
        * Retourne le diminutif pour la direction des exercices
        * Nouveau traitement pour les trois choix de direction des exercices :
        * - de bas en haut (downToUp)
        * - de haut en bas (UpToDown)
        * - aléatoire
        * @method direction
        * @return {String} 'dtu', 'utd' ou 'zig'
        */
      dim_direction_exercices:function()
      {
        if( this.aleatoire() ) return 'zig'
        else return this.firstToLast() ? 'ftl' : 'ltf' 
      },
      // Règle le volant de la configuration générale et son texte
      config_generale:function(){
        $('img#config_generale_volant').attr('src', this.config_generale_img_path());
        $('div#config_generale_resume').html(this.config_generale_resume())
      },
      // Return summary of current general config
      config_generale_resume:function(){
        var ary = [];
        ary.push(LOCALE_UI.Exercices.Config[this.downToUp()?'down_to_up':'up_to_down']);
        ary.push(LOCALE_UI.Exercices.Config[this.majToRel()?'maj_to_rel':'rel_to_maj']);
        ary.push(
          LOCALE_UI.Exercices.Config[
            this.aleatoire() ? 'aleatoire' : 
            (this.firstToLast()?'first_to_last':'last_to_first')
          ]
        );
        return LOCALE_UI.Label.resume + LOCALE_UI.colon + ary.join(', ') + ".";
      },
      // Return path to config generale image
      config_generale_img_path:function(){
        var ary = [];
        ary.push( this.downToUp() ? 'dtu' : 'utd' );
        ary.push( this.majToRel() ? 'mtr' : 'rtm' );
        ary.push( this.dim_direction_exercices() );
        return UI.path_image('config/volant/'+ary.join('_')+'.png');
      },
      // Mets le texte +texte+ dans le SPAN d'identifiant +id+
      set_valeur_texte: function(id, texte){
        $('span#'+id).html( texte ) ;
      },
      // Affiche la gamme courante
      // Si des exercices sont affichés, qui sont de type à changer de tonalité,
      // on règle cette tonalité.
      // 
      // @note: la méthode est appelée par Roadmap.Data.show
      tone:function(){
        var tone = Roadmap.Data.tone;
        $('img#gconfig_img_cur_tone').attr('src', UI.path_image("note/gamme/"+tone+".jpg"));
        var nom_tone = LOCALE_UI.Label.today + ", ";
        nom_tone += LOCALE_UI.Label.tone + " " + LOCALE_UI.Label.de_of + " ";
        nom_tone += IDSCALE_TO_HSCALE[tone]['double'];
        $('div#gconfig_nom_cur_tone').html(nom_tone);
        Exercices.set_tones_of_exercices();
      }
    },
  //   // -------------------------------------------------------------------
  //   // Sous-objet   Roadmap.UI.Get
  //   // Relève les valeurs dans l'interface
  //   // -------------------------------------------------------------------
  //   Get:{
  //     
  //   }
  },
  // /Fin du sous-objet Roadmap.UI
  // -------------------------------------------------------------------
  
  // => Retourne true si la rm est protégée
  // cf. N0007
  is_locked:function(with_message){
    var locked = (User.md5 != this.md5) || User.md5 == null;
    if ( locked == false ) return false ;
    if ('undefined' == typeof with_message) with_message = true ;
    if ( with_message ) F.error(ERROR.Roadmap.bad_owner) ;
    return true ;
  }
}