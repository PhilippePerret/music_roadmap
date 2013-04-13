/*
    Objet Roadmap
    --------------
    Gestion générale de la roadmap du jour pour travailler les exercices.
*/
window.Roadmap = {
  class     : 'Roadmap',
  nom       : null,
  mdp       : null,
  md5       : null,
  partage   : null,
  loaded    : false,    // mis à true quand une roadmap est chargée
  modified  : false,
  
  // // => Retourne le nom de la feuille de route courante
  get_nom: function(){
    BT.add('-> Roadmap.get_nom') ;
    this.set($('input#roadmap_nom').val(), false) ;
    BT.add('<- Roadmap.get_nom (return: this.nom='+this.nom+')') ;
    return this.nom;
  },
  // // => Retourne le mdp de la feuille de route courante
  get_mdp: function(){
    BT.add('-> Roadmap.get_mdp') ;
    this.set(false, $('input#roadmap_mdp').val()) ;
    BT.add('<- Roadmap.get_mdp (return: this.mdp='+this.mdp+')') ;
    return this.mdp;
  },
  // Définit le nom et le mdp du document (et les place dans le div specs)
  set: function(nom, mdp){
    BT.add('-> Roadmap.set(nom:'+nom+', mdp:'+mdp+')') ;
    if ( nom !== false ){
      if ( nom == "" ) nom = null ;
      this.nom = nom ;
      $('input#roadmap_nom').val( nom || "" ) ;
    }
    if ( mdp !== false ){
      if ( mdp == "" ) mdp = null ;
      this.mdp = mdp ;
      $('input#roadmap_mdp').val( mdp || "" ) ;
    }
    BT.add('<- Roadmap.set') ;
    if ( nom === false ) return mdp ;
    else if ( mdp === false ) return nom ;
    else return [nom, mdp] ;
  },
  // Relève les données du roadmap dans le document
  // @return  Null (void)
  get: function(){ 
    BT.add('-> Roadmap.get') ;
    this.get_nom(); 
    this.get_mdp();
    BT.add('<- Roadmap.get') ;
  },
  // => Retourn l'“affixe” de la feuille de route courante, c'est-à-dire le
  //    nom du dossier qui va contenir ses éléments.
  affixe: function(){
    return this.nom + '-' + this.mdp ;
  },
  
  // Initialisation (au chargement de la page)
  init: function(){
    BT.add('-> Roadmap.init') ;
    // Rechargement la feuille de route si un nom/mdp est défini et qu'il
    // est valide.
    if ( this.set_etat_specs(messages=false) ) this.open() ;
    BT.add('<- Roadmap.init') ;
  },
  
  // Tout initialiser pour un nouveau document
  initing_new: false,
  init_new: function(){
    BT.add('-> Roadmap.init_new') ;
    this.initing_new = true ;
    this.reset_all() ;
    F.show(MESSAGES.Roadmap.ready);
    BT.add('<- Roadmap.init_new') ;
    this.initing_new = false ;
  },
  
  // Reset tout
  reset_all: function(){
    $('ul#exercices').html('') ;
    this.set(null,null) ;
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
  // non des nom et mdp
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
  set_btns_roadmap: function(){
    BT.add('-> Roadmap.set_btns_roadmap') ;

    var des_exs = EXERCICES.length > 0 ;
    var specsok_and_not_loaded = this.loaded == false && this.specs_ok() ;
    
    // -- Bouton par bouton --
    
    // :init
    // Ne doit être visible que s'il y a des exercices
    UI.set_visible('a#btn_init_roadmap', des_exs) ;
    
    // :open
    // Ne doit être visible que si les specs sont valides, que la roadmap
    // n'est pas chargée (attention : une autre roadmap peut avoir été
    // chargée)
    UI.set_visible('a#btn_roadmap_open', specsok_and_not_loaded ) ;
		
    // :create
    // Ne doit être visible que si les specs sont valides et ne correspondent
    // pas à la roadmap chargée (=> loaded = false)
    UI.set_visible('a#btn_roadmap_create', specsok_and_not_loaded );
    
    // :save
    // Ne doit être visible que si une roadmap est chargée (son état varie
    // ensuite en fonction de l'état de la sauvegarde)
    this.set_etat_btn_save( this.modified ) ;
    
    // Configuration générale des exercices
    // Visible seulement si une feuille de route est chargée
    UI.set_visible('div#config_generale', this.loaded == true ) ;
    
    // :créer un exercice
    // Visible seulement si une feuille de route est chargée
    UI.set_visible('a#btn_exercice_create', this.loaded == true ) ;

    BT.add('<- Roadmap.set_btns_roadmap') ;
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
    UI.set_visible('a#btn_save_roadmap', this.loaded ) ;
    $('a#btn_save_roadmap').attr('class', 'btn ' + css).html(nom) ;
    BT.add('<- Roadmap.set_etat_btn_save') ;
  },

  // Définit l'état du div contenant les specs et le lien pour les ouvrir
  set_div_specs: function( ouvert ){
    BT.add('-> Roadmap.set_div_specs') ;
    if ( 'undefined' == typeof ouvert ) meth_spec = meth_lien = 'toggle' ;
    else {
      meth_spec = ouvert ? 'show' : 'hide' ;
      meth_lien = ouvert ? 'hide' : 'show' ;
    }
    $('div#open_roadmap_specs')[meth_lien]() ;
    $('div#roadmap_specs-specs')[meth_spec]();
    BT.add('<- Roadmap.set_div_specs') ;
    return false ; // pour le a-lien
  },
  // Appelé quand on change les valeurs dans les specs (nom et mdp)
  onchange_affixe:function(nom,mdp){
    BT.add('-> Roadmap.onchange_affixe (nom='+nom+', mdp='+mdp+')') ;
    if( nom != null ) {
      if ( nom == "" ) nom = null ;
      else {
        nom_init = nom.toString();
        nom = this.get_a_correct( nom ) ;
        if( nom_init != nom ){
          F.error(ERRORS.Roadmap.Specs.invalid_nom) 
        }
      }
      this.set(nom,false);
      this.nom = nom ;
    }
    if ( mdp != null ){
      if ( mdp == "" ) mdp = null ;
      else {
        mdp_init = mdp.toString();
        mdp = this.get_a_correct( mdp ) ;
        if( mdp_init != mdp ){
          F.error(ERRORS.Roadmap.Specs.invalid_mdp) }
      }
      this.set(false,mdp);
      this.mdp = mdp ;
    }
    this.loaded = false ;
    var afficher_alerte = nom == false ; // cf. N0006
    this.are_specs_valides(true, afficher_alerte) ;
    this.set_btns_roadmap();
    BT.add('<- Roadmap.onchange_affixe') ;
  },
  
  // => Retourne true si le nom et le mdp de le roadmap ne sont pas vides
  specs_ok: function( with_message ){
    BT.add('-> Roadmap.specs_ok') ;
    if ('undefined' == typeof with_message) with_message = false ;
    this.get();
    var ok = this.nom != null && this.mdp != null ;
    if ( with_message && !ok ) F.error(ERRORS.Roadmap.Specs.requises) ;
    BT.add('<- Roadmap.specs_ok / return : ' + ok) ;
    return ok ;
  },
  
  // => Retourne true si le nom et le mdp sont valides
  are_specs_valides: function(forcer_check, with_message ){
    BT.add('-> Roadmap.are_specs_valides') ;
    if ( 'undefined' == typeof with_message ) with_message = true ;
    if ( 'undefined' == typeof forcer_check ) forcer_check = false ;
    if (this.specs_valides !== null && !forcer_check) return this.specs_valides ;
    this.get();
    try {
      if( this.nom == null ) {
        UI.focus('roadmap_nom') ; 
        throw 'need_a_nom' ;
      } else if( this.mdp == null ) {
        UI.focus('roadmap_mdp') ; 
        throw 'need_a_mdp' ;
      } else if( this.affixe().replace(/[a-zA-Z0-9_-]/g, '') != "" ){
        var nom_is_bad = this.nom.replace(/[a-zA-Z0-9_-]/g, '') != "" ;
        this.set( this.get_a_correct(this.nom), false ) ;
        this.set( false, this.get_a_correct(this.mdp) ) ;
        UI.focus('roadmap_nom') ;
        UI.focus('roadmap_mdp') ;
        UI.focus( nom_is_bad ? 'roadmap_nom' : 'roadmap_mdp') ;
        throw nom_is_bad ? 'invalid_nom' : 'invalid_mdp' ;
      }
      // Tout semble OK
      this.specs_valides = true ;
    } catch( erreur ){ 
      this.specs_valides = false ;
      if ( with_message ) Flash.error( ERRORS.Roadmap.Specs[erreur], {keep:false} ) ;
    }
    // this.set_btns_roadmap() ; // À METTRE AILLEURS, PAS DANS CETTE MÉTHODE
    BT.add('<- Roadmap.are_specs_valides (return: this.specs_valides='+this.specs_valides+')') ;
    return this.specs_valides ;
  },
  get_a_correct: function( from ){
    return from.replace(/ /g, '_').replace(/[^a-zA-Z0-9_-]/g, '') ;
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
    var nomdp = $('select#' + idmenu).val();
    var drm   = nomdp.split('-');
    this.set(drm[0], drm[1]);
    this.open();
  },
  // Ouvre la roadmap courante
  opening: false, // mis à true pendant l'ouverture
  open: function(){
    BT.add('-> Roadmap.open') ;
    this.opening = true ;
    if( this.specs_ok( true ) == false ) return false ;
    Ajax.query({
      data:{
        proc            : "roadmap/load",
        roadmap_nom         : this.nom,
        roadmap_mdp         : this.mdp,
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
      $.proxy(Exercices.reset_liste, Exercices)() ;
      $.proxy(Roadmap.Data.dispatch, Roadmap.Data, roadmap)();
      $.proxy(Roadmap.Data.show, Roadmap.Data)();
      Flash.show(MESSAGES.Roadmap.loaded) ;
    }
    // $.proxy(Roadmap.set_div_specs, Roadmap, ouvert = !this.loaded)() ;
    Exercices.set_boutons() ;
    this.set_btns_roadmap() ;
    this.set_div_specs( ouvert = !this.loaded ) ;
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
        roadmap_mdp     : this.mdp,
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
      if ( !this.creating ){
        // Quand ce n'est pas une création
        if ( this.modified == false ) throw 'unmodified' ;
        if ( this.is_locked() )        throw 'is_locked' ;
      }
      if( this.specs_ok(true) == false ) return this.end_save() ;
    }catch(erreur){
      // F.show("Save interrompu: " + erreur,{keep:true});
      this.saving = false; 
      return false;
    }
    F.show(MESSAGES.Roadmap.saving);
    // -> Requête de sauvegarde ou création
    Ajax.query({
      data:{
        proc            : 'roadmap/save',
        roadmap_nom     : this.nom,
        roadmap_mdp     : this.mdp,
        mail            : User.mail,
        md5             : User.md5,
        creating        : this.creating,
        config_generale : this.Data.get_config_generale(),
        data_exercices  : this.Data.EXERCICES //@TODO: vérifier comment l'ordre est sérialisé
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
    if( ! error_occured ) Flash.show(MESSAGES.Roadmap.saved) ;
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
        this.get();
        if ( this.are_specs_valides(forcer=true) !== true ) throw null ;
      } catch( erreur ){
        return this.end_create(false);
      }
      // Le nom-mdp de la roadmap doit être unique
      Ajax.query({
        data:{proc:'roadmap/check',roadmap_nom:this.nom, roadmap_mdp:this.mdp},
        success : $.proxy(this.create,this),
      })
      BT.add('<- Roadmap.create (attente retour ajax)') ;
      return false ; // pour le a-lien
    } else {
      // Retour Ajax
      BT.add('-> Roadmap.create (retour ajax)') ;
      if ( false == traite_rajax( rajax ) ){
        F.show( MESSAGES.Roadmap.creating ) ;
        this.save() ;
      } else this.end_create(false);
    }
  },
  // Note: comme cette méthode est appelée après différents traitements 
  // indépendants, ce sont ces traitements qui gèrent l'affichage des erreurs
  // Donc ici, il suffit de savoir si la création a pu se faire ou non
  end_create:function(ok){
    if (ok === true) F.show(MESSAGES.Roadmap.created);
    this.creating = false ;
    return false ; // pour certaines méthodes
  },
  
  // --- Méthodes de destruction de la roadmap
  destroying:false,
  destroy: function(){
    this.destroying = true ;
    Ajax.query({
      data:{
        proc: 'roadmap/destroy',
        roadmap_nom : this.nom,
        roadmap_mdp : this.mdp,
        mail        : User.mail,
        password    : User.password
      },
      success: $.proxy(this.end_destroy, this)
    })
  },
  end_destroy:function(rajax){
    traite_rajax( rajax ) ;
    this.destroying = false ;
  },
  
  /*  Peuple le select#roadmaps avec les roadmaps envoyées
      -----------------------------------------------------

    @param   roadmaps    Liste (Array) d'identifiant de roadmap, c'est-à-dire
                         de "nom-mdp". Seul le nom importe pour l'affichage
                         puisque mdp est le mail du possesseur.                

  */
  peuple_menu_roadmaps: function(roadmaps){
    var i, nom, mdp;
    var menu = $('select#roadmaps');
    menu.html("");
    roadmaps.unshift(LOCALE_UI.Roadmap.open_your_rm+"…-");
    for(i in roadmaps){
      idrm = roadmaps[i];
      drm = idrm.split('-') ;
      nom = drm[0]; mdp = drm[1];
      menu.append('<option value="'+idrm+'">' + nom + '</option>');
    }
  },
  // /*
  //     Sous-objet Roadmap.Data
  //     -------------------------
  //     Gère toutes les données de l'roadmap
  // */
  Data:{
    
    class: 'Roadmap.Data',
    
    // -------------------------------------------------------------------
    //  Les données de la Roadmap
    // -------------------------------------------------------------------
    
    // --- Paramètres généraux ---
    DATA_GENERALES:[
      // @WARNING: IL FAUT ABSOLUMENT GARDER LES TROIS PREMIÈRES EN PREMIER
      'down_to_up', 'maj_to_rel', 'start_to_end', 'last_changed'
    ],
    down_to_up      : true,               // cf. N0001
    start_to_end    : true,               // cf. N0002
    maj_to_rel      : true,               // cf. N0003
    last_changed    : 'down_to_up',       // cf. N0004
    
    // --- Les Données générales des exercices ---
    // Pour l'obtenir     : Exercices.ordre()
    // Pour l'actualiser  : Exercices.set_ordre(<liste>);
    EXERCICES  : {
      'ordre' : []      // Liste des ID des exercices dans l'ordre
    },
  
    // Initialisation de toutes les données (nouveau document)
    init_all: function(){
      this.down_to_up     = true ;
      this.start_to_end   = true ;
      this.maj_to_rel     = true ;
      this.last_changed   = 'down_to_up' ;
      this.show() ;
      window.EXERCICES = {length:0} ;
      this.EXERCICES = {
        'ordre': []
      }
    },
    
  //   // Ajoute un identifiant à l'ordre, en vérifiant son existence
  //   add_id: function(id){
  //     if ( this.EXERCICES['ordre'].indexOf(id) >= 0 )
  //       return F.error("L'identifiant "+id+" est déjà connu de nos services…");
  //     else
  //       this.EXERCICES['ordre'].push( id ) ;
  //   },
  //   // Passer à la configuration générale suivante
  //   next_config_generale: function(){
  //     // Index de la nouvelle configuration
  //     var index_config = this.DATA_GENERALES.indexOf( this.last_changed ) ;
  //     index_config += 1 ; if ( index_config > 2 ) index_config = 0 ;
  //     // Modifier le paramètre suivant
  //     var config = this.DATA_GENERALES[index_config] ;
  //     this.toggle( config ) ;
  //     this.last_changed = config.toString() ;
  //     // L'enregistrer ? (sauf si exemple (non, peu importe))
  //     if ($('input[type=checkbox]#save_config_generale_courante').is(':checked')){
  //       $.proxy(Roadmap.save_config_generale, Roadmap)() ;
  //     }
  //   },
  //   // Inverse une donnée générale
  //   // @param   key   La clé, par exemple 'down_to_up'
  //   toggle: function( key ){
  //     this[key] = ! this[key] ;
  //     Roadmap.UI.Set[key]()   ; // dans l'interface
  //   },
    // => Retourne les données de la configuration générale
    get_config_generale:function(){
      return {
        down_to_up          :this.down_to_up, 
        start_to_end        :this.start_to_end,
        maj_to_rel          :this.maj_to_rel,
        last_changed        :this.last_changed
      }
    },
  //   // => Retourne les data à enregistrer dans le fichier exercices.js
  //   data_exercices: function(){
  //     // Pour le moment, seul l'ordre est enregistré
  //     var ordre = this.EXERCICES['ordre'].join('.') ;
  //     return {
  //       'ordre': ordre,
  //     }
  //   },
  //   // => Retourne toutes les données réglées, sous forme de Hash, pour
  //   //    leur enregistrement par exemple.
  //   // 
  //   // @TODO: si de longues listes sont utilisées, penser à les passer en
  //   // string
  //   // get_exercices: function(){
  //   //   return {
  //   //     created_at: null, updated_at: null,
  //   //     exercices: {} // à définir
  //   //   } ; // pour le moment (ensuite : données des exercices)
  //   // },
    
    // Règle l'interface avec les données spécifiées
    show: function(){
      // Afficher les data générales
      var i, cle;
      for(i in this.DATA_GENERALES){ 
        cle = this.DATA_GENERALES[i];
        if ('function' == typeof Roadmap.UI.Set[cle] )
          Roadmap.UI.Set[cle]() ;
        else
          Flash.error("Il faut implémenter Roadmap.UI.Set."+cle,{keep:true});
      }
    },
    
    // Dispatch les données envoyées
    // ------------------------------
    // @param data    Hash des données telles que remontées par la procédure
    //                ajax de chargement de la roadmap.
    //                Ou null si la roadmap n'est pas encore défini
    dispatch: function( data ){
      try {
        if ( 'undefined' == typeof data ) throw 'ERRORS.Roadmap.Data.required' ;
        if ('undefined' != typeof data.data_roadmap)
          this.dispatch_data(data.data_roadmap);
        if ( 'undefined' != typeof data.config_generale )
          this.dispatch_config_generale(data.config_generale) ;
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
    dispatch_config_generale: function(data){
      if ( data == null )
        F.show( "Aucune configuration générale n'est définie pour cette feuille de route.") ;
      else {
        for( cle in data ) this[cle] = data[cle] ;
      }
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
        
    // -------------------------------------------------------------------
    // Sous-objet Roadmap.UI.Set
    // Définit une valeur dans l'interface
    // -------------------------------------------------------------------
    
    Set:{
      // Mets le texte +texte+ dans le SPAN d'identifiant +id+
      set_valeur_texte: function(id, texte){
        $('span#'+id).html( texte ) ;
      },
      down_to_up:function(){
        this.set_valeur_texte('down_to_up',
          LOCALE_UI.Exercices.Config[Roadmap.Data.down_to_up ? 'down_to_up' : 'up_to_down']
        )
      },
      start_to_end:function(){
        this.set_valeur_texte('start_to_end',
          LOCALE_UI.Exercices.Config[Roadmap.Data.start_to_end ? 'start_to_end' : 'end_to_start']
        )
      },
      maj_to_rel:function(){
        this.set_valeur_texte('maj_to_rel',
          LOCALE_UI.Exercices.Config[Roadmap.Data.maj_to_rel ? 'maj_to_rel' : 'rel_to_maj']
          )
      },
      
      // Juste parce que toutes les data sont passées en revue (N0005)
      last_changed: function(){},
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
    var locked = User.md5 != this.md5 ;
    if ( locked == false ) return false ;
    if ('undefined' == typeof with_message) with_message = true ;
    if ( with_message ) F.error(ERRORS.Roadmap.bad_owner) ;
    return true ;
  }
}