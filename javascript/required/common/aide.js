/*
    Objet Aide
    ==========
    
    @note: sera à mettre dans la librairie générale quand OK
    
    Shortcut : H (comme “Help”)
    
    REQUIS
    ------
      • L'objet JS Flash (flash.js - librairie générale)
      • L'objet JS Ajax (ajax.js - librairie générale)
      • L'objet JS UI (ui.js - librairie générale)
      • Le fichier ajax.rb en racine (le prendre dans les exercices musicaux)
      • La feuille de style "aide.css" chargée
      • Un dossier "./data/aide/" contenant les textes d'aide (HTML ou ruby)
      • Le dossier './ruby/procedure/aide/ contenant tous les scripts utiles
        et principalement : load.rb
      • Definition of JS constant LANG (current language, in two letters)
    
    UTILISATION
    -----------
    
    Dans l'interface ou le texte de l'aide, on peut utiliser :
    
      <aide value="<path/to/aide/file>"></aide>
        Met une image "?" qui ouvre le texte d'aide <path/to/aide/file>
        
      <aide value="<id texte aide>" title="TITRE" />
      <aide value="<id texte>">TITRE</aide>
        Met le texte <titre> en texte cliquable qui ouvre l'aide
        
      <aide id="<id a-lien dom>" value="...">...</aide>
        Met un ID au a-lien créé dans le DOM
        
      <focus value="<id élément interface>" title="<texte du lien>" />
        Dans le texte de l'aide, crée un a-lien qui, lorsqu'on clique dessus, ferme 
        provisoirement l'aide pour mettre en exergue l'élément <id élément> de l'interface.
        <id élément interface> est l'identifiant simple, sans "#"
*/
window.Aide = {
  class         : "Aide",
  built         : false,      // Mis à true quand la section d'aide est construite
  osection      : null,       // Objet jQuery de la section d'aide
  obande_titre  : null,       // Objet jQuery de la bande de titre
  ocontent      : null,       // Objet jQuery du contenu
  TEXTS         : {length:0}, // Les textes déjà chargés, ID en clé
  displayed     : false,      // Mis à true quand l'aide est affichée
  options_disp  : null,       // Les options d'affichage
  
  // Initialise l'objet Aide (@note: à appeler dans $(document).ready)
  inited    : false,
  initing   : false,
  init: function( forcer ){
    if ( 'undefined' == typeof forcer ) forcer = false ;
    if ( this.inited && ! forcer ) return ;
    this.initing = true ;
    this.reset();
    if (this.section().length == 0) return F.error( "Impossible d'afficher l'aide…");
    this.section().draggable({ disabled:true }) ;
    this.bande_titre().bind('mousedown', $.proxy(this.moveon,this));
    this.bande_titre().bind('mouseup', $.proxy(this.moveoff,this));
    UI.humanize('section#aide');
    if (this.displayed) this.close();
    this.inited   = true ;
    this.initing  = false ;
  },
  
  // Reset complet (pour tests essentiellement)
  reset:function(){
    this.TEXTS        = {length:0} ;
    this.osection     = null ;
    this.ocontent     = null ;
    this.obande_titre = null ;
    $('section#aide').remove(); // Si existe
    this.build();
  },
  // Appeler cette méthode avant un appel à Aide.show pour définir les
  // options d'affichage. 
  // @Noter que ces options sont ré-initialisées à chaque fois, après 
  // l'affichage.
  // Options
  // -------
  //    bandeau_titre     Si false, masque le bandeau_titre
  // 
  OPTIONS: ['bandeau_titre'],
  options:function(new_options){
    if ('undefined' == typeof new_options) new_options = null ;
    this.options_disp = new_options ;
  },
  // Méthode appelée après l'affichage pour régler les options
  apply_options:function(){
    if ( this.options_disp == null ) return ;
    var i, key, method;
    for(i in this.OPTIONS){
      key = this.OPTIONS[i] ;
      if ('undefined' != typeof this.options_disp[key] ){
        method = Aide['apply_option_'+key] ;
        if('function' == typeof method) method(this.options_disp[key]);
        else F.error("# ERREUR FONCTIONNELLE [Aide.js] : l'option d'affichage " + key + " n'est pas définie");
      }
    }
  },
  /*
      Le traitement des options d'affichage
      --------------------------------------
      Une option de nom <nom option> doit avoir sa méthode
      apply_option_<nom option>:function(valeur)
      
      Chaque méthode doit remettre la valeur par défaut après le traitement
  */
  apply_option_bandeau_titre:function( valeur ){
    var titre = valeur ? LOCALE_UI.Id.span.section_aide_titre : '&nbsp;'
    $('section#aide div#aide_bande_titre span#section_aide_titre').html( titre )
    Aide.options_disp['bandeau_titre'] = true ;
  },

  // --- DOM Éléments ---
  
  // Retourne l'objet jQuery de la section d'aide
  section: function(){
    if (this.osection == null) this.osection = $('section#aide') ;
    return this.osection ;
  },
  // Retourne l'objet jQuery de la bande de titre
  bande_titre: function(){
    if (this.obande_titre == null ) this.obande_titre = $('section#aide div#aide_bande_titre') ;
    return this.obande_titre ;
  },
  // Retourne l'objet jQuery du div content de l'aide (affichant les textes)
  content: function(){
    if (this.ocontent == null) this.ocontent = this.section().find('div#aide_content');
    return this.ocontent ;
  },
  // Retourne l'objet jQuery du texte d'aide d'ID +id+
  // @note: C'est le div principal de l'aide identifiée par +id+
  jqtext: function(id){ return $('div#'+Aide.otextid(id))},
  // => Retourne l'identifiant DOM du texte d'aide +id+
  otextid: function(id){return 'aide_text_id-'+Aide.TEXTS[id].uid;},
  // => Retourn true si le texte d'aide d'ID +id+ est déjà affiché
  jqtext_exists: function(id){return Aide.jqtext(id).length > 0},
  
  // --- Méthodes générales --- 
  
  // => Ouvre/affiche la section d'aide
  open: function(){
    this.section().show();
    this.displayed = true ;
    return false; // pour le a-lien
  },
  // Ferme la section d'aide entière
  close: function(){
    this.section().hide();
    this.displayed = false ;
    return false ; // pour le a-lien
  },
  
  // --- Méthodes d'affichage ---
  
  // Demande d'affichage du texte d'aide d'identifiant +id+
  // C'est la méthode principale qui doit être appelée de l'extérieur, par
  //    Aide.show(<id>[, <fonction pour suivre>])
  // 
  // @param   id    Identifiant de l'aide, un chemin relatif à partir du
  //                dossier ./data/aide/
  // @param   fx_suite  La fonction pour suivre.
  fx_pour_suivre_show: null,
  showing:false, // mis à true pendant l'affichage/chargement d'une aide
  show: function( id, fx_suite ){
    BT.add("-> Aide.show(id:"+id+")");
    this.showing = true ;
    this.fx_pour_suivre_show = fx_suite ;
    this.get(id, $.proxy(this.show_text, this, id));
    BT.add("<- Aide.show(id:"+id+")");
    return false ; // pour le a-lien
  },
  // Affichage de l'aide (note: à n'appeler que lorsque l'aide est chargée)
  // @Note: Si le texte est déjà affiché, on le rejoint
  // @Note: Si une méthode de suite est définie (second paramètre de show),
  // elle est appelée.
  show_text: function(id){
    try{
      this.apply_options(); // On applique les options d'affichage
      if ( false == this.jqtext_exists(id) ) this.put_in_section(id);
      if ( false == this.displayed ) this.open();
      this.scroll_to(id);
      if ('function' == typeof this.fx_pour_suivre_show) this.fx_pour_suivre_show();
      this.showing = false ;
    }catch(erreur){return F.error("[Aide.show_text] " + erreur)}
  },
  
  // --- Méthodes pratiques ---
  
  // Focus un élément de l'interface
  /*
      Focus sur un élément de l'interface
      ------------------------------------
      Dans l'aide on définit <focus value="<id à focusser>" title="<titre>"/>
      qui sera remplacé par un lien "Montrer <titre>" (par exemple "Montrer
      le bouton “Save”").
      Le texte d'aide disparait lentement (fade) pendant quelques secondes et
      l'élément est mis en exergue
      
      @note:  Les parents de l'élément sont rendus visibles pour le montrer.
              À la fin de l'opération, ils sont remis dans leur état initial.
      
  */
  /*  Hash des paramètres de l'élément focussé et ses parents
      --------------------------------------------------------
      Chaque élément est connu par son ID qui sert de clé :
         p.e. FOCUS[id] = {data}
      Les data contiennent :
        focus_by:  'display'/'visibility'
        visible:    true/false
        tag:        le tagName de l'élément (minusculinisé)
  */
  FOCUS:{},
  /*  Hash des data du focus courant (clignotant, etc.) */
  data_focus:{},
  focus: function(jid, debut){
    if( jid.indexOf('#') < 0 ) jid = "#"+jid ;
    var e = $(jid);
    if ('undefined' == typeof debut){ 
      // Il faut rendre l'élément visible (quel que soit l'état des parents)
      if( this.is_focus_visible(e) == false ) this.rend_focus_visible( e );
      debut = true ;
    }
    if ( debut ){  // DÉBUT DU FOCUS
      try{ $('body').scrollTo(e, {offsetTop:"60"}) }
      catch(erreur){/* se produit pendant les tests */}
      this.define_data_focus_with(e);
      this.start_clignotant();
    } else {      // FIN DU FOCUS
      this.stop_clignotant();
      this.remettre_invisible();
    }
    return false ; // Pour le a-lien
  },
  // Lance le clignotement
  start_clignotant:function(){
    this.section().fadeOut('slow');
    this.data_focus.obj.css(this.data_focus.STYLE);
    this.data_focus.timer = setInterval("$.proxy(Aide.clignote,Aide)()", 0.2*1000);
    return true ;
  },
  // Clignoter le focus dans la page
  clignote:function(){
    var i = ++ this.data_focus.i ;
    var paire = ( i/2 == parseInt(i/2,10));
    this.data_focus.obj.css(paire ? this.data_focus.props : this.data_focus.STYLE) ;
    if ( i > 9 ) this.focus(this.data_focus.jid, false) ;
  },
  // Arrête le clignotement
  stop_clignotant:function(){
    clearInterval(this.data_focus.timer); this.data_focus.timer = null;
    this.data_focus.obj.css(this.data_focus.props);
    this.section().fadeIn('slow');
  },
  // Règle les data_focus pour le clignotant
  // @param   jo    Objet jQuery ou identifiant jQuery
  define_data_focus_with:function(jo){
    jo = $(jo);
    this.data_focus = {
      timer:null, i:0,
      obj:jo,     jid:("li#" + jo.attr('id')),
      props     :{'border':jo.css('border'),'background-color':jo.css('background-color')},
      STYLE     :{'border':"2px solid red", 'background-color':"#fcc"}
    }
    return true ;
  },
  // Enregistre l'état de l'élément dans FOCUS
  // @param ojq   Objet jQuery de l'élément
  // @param data  Les données (focus_by, visible)
  add_to_focus:function(ojq, data){
    var id = ojq.attr('id') ;
    data.tag = ojq[0].tagName.toLowerCase();
    this.FOCUS[id] = data ;
  },
  // => Retourne true si l'élément +ojq+ (objet jQuery) est visible
  // @return true si l'élément à focus est visible et false dans le cas
  // contraire
  is_focus_visible: function(ojq){
    ojq = $(ojq);
    if ( this.is_visible(ojq) ) return true ;
    // Dans le cas contraire, il faut remonter les parents jusqu'au premier
    // parent visible
    while ( this.is_visible( ojq = ojq.parent() ) == false ) {}
    return false; // pour indiquer qu'il faudra rendre visible
  },
  // Test la visibilité d'un élément et l'enregistre dans FOCUS
  // @note: la méthode is(':visible') jQuery ne test que le display, donc
  // on teste aussi ici la visibilité
  is_visible:function(ojq){
    var id, focby ;
    ojq = $(ojq);
    id  = ojq.attr('id');
    var vis = ojq.is(':visible') ;
    if ( vis ){ 
      vis = ojq.css('visibility') != 'hidden' ;
      focby = 'visibility'; // pas juste si visible mais peu importe
    } else {
      focby = 'display';
    }
    // On mémorise cet élément (même s'il est visible)
    this.add_to_focus(ojq, {visible:vis, focus_by:focby})
    return vis ;
  },
  // Rend visible un élément non visible (pour le focusser)
  // @note: tous les éléments parents non visibles ont été enregistrés 
  //        préalablement dans FOCUS (cf. is_focus_visible)
  rend_focus_visible: function(){
    var id, data, o ;
    for(id in this.FOCUS){
      data = this.FOCUS[id] ;
      o = $(data.tag + "#" + id) ;
      o.show(); // Ça ne mange pas de pain
      o.attr('style', 'visibility:visible');
    }
  },
  // Remet dans leur état toute la famille d'éléments qui a permis de
  // rendre l'élément à focuser visible
  remettre_invisible: function(){
    if( this.FOCUS == {} ) return ;
    var id, data, o;
    for(id in this.FOCUS){
      data = this.FOCUS[id] ;
      if (data.visible == false){
        // Il faut remettre l'élément dans son état
        o = $(data.tag+"#"+id);
        if ( data.focus_by == 'display' ) o.hide();
        else o.css('visibility','visible');          
      }
    }
    // Dans tous les cas, on reset FOCUS
    this.FOCUS = {};
  },
  
  // Scroll jusqu'au texte d'ID +id+
  scroll_to: function(id){
    try {
      this.content().scrollTo( this.jqtext(id), { offsetTop:"60" });
    } catch(erreur) { F.warning( "[Aide.scroll_to] " + erreur )}
  },
  
  // --- Protected methods ---
  
  // Détruit le texte d'aide d'identifiant +id+ de la fenêtre d'aide
  // 
  // @note: la méthode peut être appelée sur un identifiant qui n'existe pas, donc
  // il faut vérifier avant que le texte d'aide demandé soit bien affiché.
  remove: function(id){
    if ('undefined' == typeof this.TEXTS[id]) return false ;
    this.jqtext(id).remove();
    delete this.TEXTS[id];
    return false;
  },
  // => Insère le texte de l'aide dans la section
  // 
  // @param id    ID du texte d'aide à afficher
  // @param keep  Si true on laisse le texte actuelle affiché (true par défaut)
  // 
  put_in_section: function(id, keep){
    BT.add("-> Aide.put_in_section(id:"+id+", keep:"+keep+")");
    if( 'undefined' == typeof keep ) keep = true ;
    var div = this.div_aide(id) ;
    this.content()[keep ? 'append' : 'html'](div);
    UI.humanize(div);
    BT.add("<- Aide.put_in_section");
  },
  // Retourne le div d'aide préparé pour l'aide d'ID +id+
  // @note: avec ID unique et bouton de fermeture
  div_aide: function(id){
    var daide = this.TEXTS[id] ;
    var btns = '<div class="btns">'+
            '<a onclick="return $.proxy(H.remove,H,\''+id+'\')()">'+
            'retirer</a>' +  '</div>';
    return '<div class="aide_text" id="aide_text_id-'+daide.uid+'">' +
            btns + 
            '<div class="flash" style="position:absolute;top:1em;left:1em;"></div>' + 
            '<div class="aide_text_content">' + daide.text + '</div>' +
            btns + 
            '</div>';
  },
  // => Définit (dans tous les cas) le texte d'aide
  get: function(id, fx_suite){
    if('undefined' == typeof this.TEXTS[id]){
      this.loading_required = true ; // juste pour les tests
      this.load(id, fx_suite);
    } else {
      this.loading_required = false ; // juste pour les tests
      // Le texte est chargé, on peut directement passer à la suite
      if('function' == typeof fx_suite) fx_suite(id) ;
    }
  },

  // Retourne l'identifiant DOM unique pour l'aide courante
  uid: function(id){
    var uid = id.replace(/\//g,'').replace(/-/g,'');
      // Je ne sais pas pourquoi /\/-/g n'est pas possible…
    uid = uid.substring(0, uid.lastIndexOf('.'));
    return uid + (new Date().valueOf().toString()) ;
  },
  
  // Charge le texte d'aide d'ID +id+
  loading: false,
  load: function(id, fx_suite){
    this.loading = true ;
    // Par défaut, la méthode ne fait rienf
    if ('undefined' == typeof fx_suite) fx_suite = null ;
    Ajax.query({
      data    : {proc:'aide/load', aide_id:id, lang: LANG || 'en'},
      success : $.proxy(Aide.end_load, Aide, fx_suite)
    });
  },
  // Retour ajax de la précédente, pour suivre
  end_load: function(fx_suite, rajax){
    if (false == traite_rajax(rajax) /* => pas d'erreur */){
      var id = rajax.aide_id ;
      this.TEXTS[id] = {
        id  : id,
        uid : this.uid(id),
        text: rajax.aide_text
        };
      ++ this.TEXTS.length ;
      this.loading = false ;
      if ( 'function' == typeof fx_suite ) fx_suite();
    }
  },
  
  // Appelée quand la souris est pressée sur la bande (draggable)
  moveon: function(){
    this.section().draggable('option','disabled', false);
    this.section().addClass('moving');
  },
  // Appelée quand la souris est relâchée de la bande draggable
  moveoff: function(){
    this.section().draggable('option','disabled', true);
    this.section().removeClass('moving');
  },
  
  // Construit la section d'aide (à l'initialisation)
  build: function(){
    // if($('section#aide').length) $('section#aide').remove(); // ÇA PLANTE LES TESTS ????....
    $('body').append(
      '<section id="aide" style="display:none;">' +
        '<div id="aide_bande_titre">'+
          '<a class="btn_close" href="#" onclick="return $.proxy(Aide.close,Aide)()"></a>' +
          '<span id="section_aide_move_txt">' + LOCALE_UI.Id.span.section_aide_move_txt + '</span>'+
          '<span id="section_aide_titre">AIDE</span>'+
        '</div>' +
        '<div id="aide_content"></div>' +
      '</section>');
    Aide.built = true ;
  }
}
window.H = Aide ;