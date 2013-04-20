if('undefined' == typeof window.Exercices){ 
  console.log("Exercices non défini (dans le normal)");
  window.Exercices = {};}
$.extend(window.Exercices,{
  ERROR: {
  },
  modified: false,
  
  set_modified: function(ismod){
    if ('undefined' == typeof ismod ) ismod = true ;
    BT.add("-> Exercices.set_modified("+ismod.toString()+")");
    this.modified = ismod ;
    if ( ismod ) $.proxy(Roadmap.set_modified,Roadmap, true)() ;
    BT.add("<- Exercices.set_modified");
  },
  
  // Remet la liste des exercices à rien
  reset_liste: function(){
    window.EXERCICES = {length:0} ;
    $('ul#exercices').html("") ;
  },
  
  // Demande de création d'un exercice
  id_new_exercice : null,    // Pour savoir si c'est un nouvel exercice
  new: function(){
    if (User.need_to_signin()) return false ;
    if ( Roadmap.is_locked() ) return false ;
    with(this.Edition){
      open() ;
      clear_form() ;
      this.id_new_exercice = set_new_id() ;
      set_btn_save(LOCALE_UI.Exercice.create_new_exercice) ;
    }
    return false ; // pour le a-link
  },
  
  // Sauvegarde de l'exercice (nouveau ou ancien)
  saving:false,
  save: function(){
    this.saving = true ;
    if ( User.is_not_owner() ) return this.saving = false ;
    var data = this.Edition.get_values() ;
    try{
      if ( data['id']         == "" )               throw 'id_required';
      if ( data['titre']      == "" )               throw 'title_required';
      if ( data['tempo_min'] >= data['tempo_max'])  throw 'min_sup_to_min';
      if ( data['tempo'] < data['tempo_min'])       throw 'tempo_inf_to_min' ;
    } catch( cle_erreur ) {
      F.error( ERRORS.Exercices.Edit[cle_erreur] ) ;
      return this.saving = false ;
    }
    var iex = exercice( data['id'] ) ;
    iex.update( data ) ;
    iex.save( $.proxy( this.save_suite, this, data['id']) ) ;
  },
  // Sauvegarde de tous les exercices
  // ---------------------------------
  liste_save_all: null,
  liste_saved   : null, // pour vérification
  saving_all:false,
  save_all: function( fx_suite ){
    if (this.liste_save_all == null ){
      // départ
      this.saving_all = true ;
      this.liste_saved = [] ;
      this.liste_save_all = Exercices.ordre().join('-').split('-');
    }
    if ( this.liste_save_all.length > 0 ){
      var id = this.liste_save_all.shift();
      this.liste_saved.push(id);
      exercice(id).save($.proxy(this.save_all,this,fx_suite));
    } else {
      // Fin de la sauvegarde de chaque exercice
      this.liste_save_all = null ;
      if ( Roadmap.creating ) $.proxy(Roadmap.end_create,Roadmap,true)() ;
      if ('function' == typeof fx_suite) fx_suite() ;
    }
  },
  // Méthode appelée après la sauvegarde de l'exercice
  // Elle va construire ou actualiser l'élément DOM de l'exercice.
  // @param   id    L'identifiant de l'exercice enregistré (new or old)
  save_suite: function(id, rajax){
    BT.add("-> Exercices.save_suite");
    if ( traite_rajax( rajax )){
      // en cas d'erreur
      this.saving = false ;
    } else {
      var iex = exercice( id ) ;
      iex.build() ;
      this.Edition.close() ;
      // Actualise aussi l'ordre des paragraphes (donc l'appeler forcément
      // après la construction de l'exercice)
      this.save_ordre($.proxy(this.end_save, this)); 
      this.set_boutons() ;
    }
    BT.add("<- Exercices.save_suite");
  },
  // Fin de la procédure de sauvegarde de l'exercice
  end_save: function(rajax){
    BT.add("-> Exercices.end_save");
    traite_rajax( rajax ) ;
    if ( this.id_new_exercice ){ // Création
      Log.new(500, exercice(this.id_new_exercice)) ;
    }
    this.id_new_exercice = null ; // Toujours
    this.saving = false ;
    BT.add("<- Exercices.end_save");
  },
  // Retourne l'ordre des exercices
  // @note: Raccourci pour Roadmap.Data.EXERCICES['ordre']
  ordre: function(){
    return Roadmap.Data.EXERCICES['ordre'] ;
  },
  // Définit le nouvel ordre
  // @note: Raccourci pour Roadmap.Data.EXERCICES['ordre'] = <liste>
  set_ordre: function( liste ){
    Roadmap.Data.EXERCICES['ordre'] = liste ;
  },
  /*
      Sélection
      ---------
  */
  selections: [],         // La liste des sélections. cf. N0005
  selected: null,         // La sélection
  // Sélection/déselection d'un exercice
  select: function(id){
    // this.deselect_all() ; // toujours
    if (this.selected != null) this.selected.deselect();
    exercice(id).select();
    this.selections.push( id ) ;
    this.selected = exercice(id);
  },
  deselect: function(id){
    var ex = exercice(id)
    ex.deselect();
    if ( ex.playing ) ex.stop();
    this.selections.splice(this.selections.indexOf(id), 1) ;
  },
  deselect_all: function(){
    var i, id ;
    for(i in this.selections) exercice(this.selections[i]).deselect() ;
    this.selections = [] ;
  },
  // Importation d'un exercice
  import: function(fct_success){
    var path = $('input#path_to_exercice').val() ;
    try{
      if ( path == "" ) 
        throw "Vous devez indiquer le chemin de l'exercice !" ;
      if ( path.indexOf('/') < 0 ) 
        throw "Vos chemins sont mal formatés (requis : “feuille/mail/index,etc.”)";
      if ( path.replace(/[a-zA-Z0-9\/,_-]/g, '') != "" )
        throw "Vos chemins contiennent des caractères illégaux…"
    }catch(erreur){ return F.error( erreur )}
    // --- sans erreur ---
    if ('undefined' == typeof fct_success)
      fct_success = $.proxy(this.end_import, this) ;
    Ajax.query({
      data:{
        proc              : 'exercice/import',
        roadmap_nom       : Roadmap.nom,
        user_mail         : User.mail,
        data              : path
      },
      success : fct_success
    });
    return false ; // pour le a-lien
  },
  end_import:function (rajax){
    if (rajax['error'] != null ) F.error( rajax['error']) ; // mais on poursuit
    else this.Edition.close() ;
    var i ;
    for (i in rajax['exercices']) new Exercice(rajax['exercices'][i]).build();
    this.save_ordre(); // relevé dans le DOM
  },
  // Mise en édition d'un exercice
  edit: function(id){
    this.id_new_exercice = null ;
    exercice( id ).edit() ;
  },
  // Définit la montée de tempo prévue pour la prochaine fois
  // @param id          Identifiant de l'exercice
  // @param increment   Le nombre de pulsation (peut être négatif)
  //                    OU LE PLUS SOUVENT : le select
  // @note: Au prochain chargement, la méthode `monte_tempo' de l'exercice sera
  // appelé pour changer son tempo.
  set_up_tempo: function(id, osel){
    if ('undefined' == typeof osel ) increment = 2 ;
    else {
      increment = osel.value ;
      osel.selectedIndex = 0 ;
    }
    var ex = exercice(id) ;
    ex.up_tempo = increment ;
    ex.save() ;
    
  },
  // Suppression d'un exercice (le retire simplement de la liste, sauf si
  // +destroy+ est mis à true, dans lequel cas on le détruit complètement)
  deleting:false,
  delete: function(id, destroy){
    if (User.is_not_owner()) return false ;
    this.deleting = true ;
    if('undefined' == typeof destroy) destroy = false;
    var ex = exercice(id)
    ex.remove();
    this.save_ordre($.proxy(this.suite_delete, this, id, destroy));
    delete EXERCICES[this.id];
    delete ex;
  },
  // Suite de la suppression de l'exercice. Procède à la destruction complète
  // de l'exercice +id+ si +destroy+ est true.
  suite_delete:function(id, destroy, rajax){
    if( false == traite_rajax(rajax) ){
      if ( destroy == true ){
        Ajax.query({
          data:{
            proc              :"exercice/destroy",
            roadmap_nom       : Roadmap.nom,
            user_mail         : User.mail,
            user_md5          : User.md5,
            exercice_id       :id
          },
          success: $.proxy(this.end_delete, this)
        })
      } else {
        this.deleting = false ;
      }
    }
  },
  end_delete:function(rajax){
    traite_rajax(rajax);
    this.deleting = false ;
  },
  // Fait jouer le métronome au tempo de l'exercice
  play: function(id){
    exercice(id).play() ;
  },
  // Lancer les exercices ou passe au suivant
  // @note: il faudrait tenir compte de start_to_end des config générales
  cur_exercice      : null,   // L'exercice en cours de jeu (métronome)
  suitex_ordre      : null,   // La suite d'exercice, dans un sens ou l'autre
  suitex: function(){
    var len = this.ordre().length ;
    if ( len.length == 0 ){
      return F.error("Il n'y a aucun exercice à jouer ! Créez-en un d'abord ;-).");
    }
    if ( this.cur_exercice == null ){
      this.deselect_all() ;
      // Premier exercice à utiliser
      this.suitex_ordre = this.ordre().join('-') ;
      this.suitex_ordre = this.suitex_ordre.split('-') ;
      if (!Roadmap.Data.start_to_end) this.suitex_ordre.reverse();
      this.start_suitex() ;
    } else {
      this.deselect(this.cur_exercice.id) ; // stop aussi le métronome
      this.cur_exercice = null ;
    }
    if ( this.suitex_ordre.length > 0 ){
      if ( this.suitex_ordre.length == 1 ){
        $('a#btn_stop_exercices').hide() ;
        $('a#btn_exercices_run').html("Sonner la fin des exercices") ;
      }
      // On passe au suivant
      this.cur_exercice = exercice( this.suitex_ordre.shift() ) ;
      this.cur_exercice.play() ; // pour le lancer
    } else {
      // Il n'y a plus d'exercice
      this.end_suitex() ;
    }
    return false ;
  },
  // Démarrage du jeu des exercices
  start_suitex: function(){
    $('a#btn_stop_exercices').show() ;
    $('a#btn_exercices_run').html("Passer à l'exercice suivant").addClass('moyen') ;
  },
  // Met fin au jeu des exercices
  // @note: dans tous les cas, on passe par cette méthode
  end_suitex: function( forcer_arret ){
    if( forcer_arret === true ) this.cur_exercice.play(); // pour l'arrêter
    Metronome.stop() ;
    this.deselect_all();
    this.cur_exercice = null ;
    $('a#btn_stop_exercices').hide() ;
    $('a#btn_exercices_run').html("Lancer les exercices").removeClass('gros') ;
    return false ;
  },
  // Méthode appelée quand on change le tempo d'un exercice
  onchange_tempo: function(id, tempo){
    var iex = exercice( id )
    iex.update({tempo:tempo}) ;
    iex.save() ;
    if (iex.playing) Metronome.update( tempo ) ;
  },
  /*
      Déplacement des exercices
  */
  // Méthode pour activer et désactiver le déplacement
  moving: false,
  move: function(){
    this.moving = !this.moving;
    var oex = $('ul#exercices')
    oex.sortable('option', 'disabled', this.moving?false:true);
    oex[this.moving?'disableSelection':'enableSelection']() ;
    this.set_btn_move();
    if (this.moving) 
      F.show("Pensez à désactiver le déplacement quand vous avez fini pour avoir à nouveau accès aux réglages de l'exercice.");
    else
      this.save_ordre() ;
  },
  // Masquer/afficher les boutons propres aux exercices en fonction de la
  // présence ou non d'exercices
  // 
  set_boutons:function(){
    BT.add('-> Exercices.set_boutons (EXERCICES.length='+EXERCICES.length+')') ;
    var locked = Roadmap.is_locked(0) ;
    // Boutons généraux
    var m = EXERCICES.length > 0 ? 'show' : 'hide' ;
    $('a#btn_exercices_run')[m]() ;
    this.set_btn_move(locked) ;
    this.set_btn_create(locked);
    this.set_btns_edition(locked);
    this.set_btn_next_config_generale(locked);
    BT.add('<- Exercices.set_boutons') ;
  },
  // Règle les boutons d'édition de chaque exercice en fonction de la 
  // protection de la rm
  set_btns_edition:function(locked){
    if ('undefined' == typeof locked) locked = Roadmap.is_locked(0) ;
    $('ul#exercices a.btn_del').toggleClass('invisible', locked) ;
    $('ul#exercices a.btn_edit').toggleClass('invisible', locked) ;
  },
  // Règle le bouton pour enregistrer la configuration suivante
  set_btn_next_config_generale:function(locked){
    if ('undefined' == typeof locked) locked = Roadmap.is_locked(0) ;
    $('div#div_cb_save_config').toggleClass('invisible', locked) ;
    if( locked ){
      $('input#save_config_generale_courante').attr('checked',false);
    }
  },
  // Règle le bouton pour créer un nouvel exercice/morceau
  set_btn_create:function(locked){
    if ('undefined' == typeof locked) locked = Roadmap.is_locked(0) ;
    $('a#btn_exercice_create').toggleClass('invisible', locked) ;
  },
  // Règle le bouton pour déplacer les exercices
  set_btn_move: function(locked){
    var btn = $('a#btn_exercices_move')
    if ('undefined' == typeof locked) locked = Roadmap.is_locked(0) ;
    btn.toggleClass('invisible', EXERCICES.length == 0 || locked) ;
    if ( EXERCICES.length > 0 && !locked ) {
      // Quand il y a des exercices et que la RM n'est pas protégée
      btn.html(this.moving?"Stopper les déplacements":"Activer le déplacement");
      btn.attr('style', this.moving?"background-color:#FF98CF !important":'');
    }
    return false ; // pour le a-lien
  },
  // Méthode appelée quand on a fini de déplacer un exercice
  on_stop_dragging: function(evt,ui){
    
  },
  // Sauvegarde de l'ordre des exercices
  save_ordre: function(fx_suite){
    this.set_ordre( this.releve_ordre() ) ;
    $.proxy(Roadmap.save_data_exercices, Roadmap, fx_suite)();
  },
  // Relève l'ordre des exercices dans le document
  releve_ordre: function(){
    var ordre = [] ;
    $('ul#exercices > li.ex').map(function(i,o){ordre.push(o.id.split('-')[1])});
    return ordre ;
  },
  // Affiche la path de cet exercice (pour une copie ailleurs)
  show_path: function(id){
    var mes = 'Le chemin de cet exercice est : <input type="text" value="' +
     Roadmap.nom + "/" + User.mail + "/" + id + '" onfocus="this.select()" />';
    F.show(mes, {timer:false}) ;
    return false ; //pour le a-lien
  },
  
  
  // -------------------------------------------------------------------
  //  Sous objet Exercices.Edition
  // -------------------------------------------------------------------
  
  Edition: {
    class: "Exercices.Edition",
    // Fill exercice form with values in +data+
    set_values:function(data){ // @testok
      for(var k in data){
        switch( k ){
          case 'types': this.coche_types(data[k]); break;
          case 'image': break; // ne rien faire
          default:$('table#exercice_form #exercice_'+k).val(data[k]);
        }
      };
    },
    // Return values from the exercice form
    get_values:function(){ // @testok
      var data = {}, id, k, i ;
      for(i in EXERCICE_PROPERTIES){
        k = EXERCICE_PROPERTIES[i];
        oid = 'table#exercice_form #exercice_' + k ;
        switch ( k ){
          case 'types': data['types'] = this.pickup_types(); break;
          case 'tempo':
          case 'tempo_min':
          case 'tempo_max': data[k] = parseInt($(oid).val(),10); break;
          case 'obligatory':
          case 'with_next': data[k] = $(oid).is(':checked'); break;
          default :
            if ( $(oid).length ){
              var val = $(oid).val() ;
              data[k] = val ;
            }
        }
      }
      // On retourne le Hash ramassé
      return data ;
    },
    
    // Retourne un identifiant unique (inexistant)
    new_id: function(){
      var i = 0 ;
      while( true ){
        istr = (++i).toString() ;
        if ('undefined' == typeof EXERCICES[istr]) return istr ;
      }
    },
    // Met un ID inexistant dans le champ (pour création)
    // Retourne cet identifiant
    set_new_id: function(){
      var newid = this.new_id() ;
      $('table#exercice_form input#exercice_id').val( newid ) ;
      return newid ;
    },
    // Prépare le formulaire (à l'ouverture de l'application)
    prepared:false,   // Mis à true quand la boite est prête
    preparing:false,
    prepare:function(){
      this.preparing = true ;
      // Tempos
      this.menus_tempo_populate();
      // Types
      this.types_populate();
      $('a#btn_toggle_types_exercices').html(LOCALE_UI.Verb.modify);
      this.prepared = true ;
      this.preparing = false ;
      $.proxy(UI.set_ready, UI, 'exedition')();
    },
    // Ouvre le formulaire
    open: function(){ // @testok
      if ( User.is_not_owner() ) return false;
      $('table#exercice_form').toggle('slide',{},750);
      document.location.hash = '#bande_logo' ;
      return false ;
    },
    // Ferme le formulaire
    close: function(){ // @testok
      $('table#exercice_form').toggle('slide',{},750);
    },
    // Nettoie le formulaire
    clear_form:function(){
      var i, k;
      for(i in EXERCICE_PROPERTIES){
        k = EXERCICE_PROPERTIES[i];
        oid = 'table#exercice_form #exercice_' + k ;
        if ( $(oid).length ) $(oid).val("") ;
      }
    },
    // Définit le nom du bouton pour sauver l'exercice
    set_btn_save: function(nom){
      $('a#btn_exercice_save').html( nom ) ;
    },
    // Peuplement des types
    // @note: TYPES est défini dans les locales constants.js
    types_populated:false,
    types_populating:false,
    types_populate:function(){ // @testok
      // if ( this.types_populated ) return false ;
      this.types_populating = true ;
      $('div#exercice_cbs_types').html('');
      for(var idtype in Exercices.TYPES_EXERCICE){
        // On crée un checkbox par type
        var id = "exercice_type_" + idtype ;
        $('div#exercice_cbs_types').append(
          '<span>' +
            '<input id="'+id+'" type="checkbox" />' +
            '<label for="'+id+'">'+Exercices.TYPES_EXERCICE[idtype]+'</label>' +
          '</span>'
          )
      }
      // Il faut ajouter un clear both en dessous
      $('div#exercice_cbs_types').append('<div style="clear:both;"></div>');
      this.types_populated  = true ;
      this.types_populating = false ;
    },
    // Ouvre et ferme la boite des types
    toggle_types:function(){ // @testok
      $('div#exercice_cbs_types').toggle();
      var is_ouvert = $('div#exercice_cbs_types').is(':visible');
      $('a#btn_toggle_types_exercices').html(
        LOCALE_UI.Verb[is_ouvert?'close':'modify']);
      return false; // pour le a-lien
    },
    // Coche les types de l'exercice
    coche_types:function(checked){ // @testok
      // On décoche tout
      $('div#exercice_cbs_types input[type="checkbox"]').removeAttr('checked',false);
      // Et on coche les cochés
      // @note: dans Firefox (?) après avoir mis checked à false (ci-dessus),
      // on ne peut plus sélectionner par 'checked',true, donc j'utilise
      // un clic sur le label pour cocher le type
      for(var i in checked){
        $('div#exercice_cbs_types label[for=exercice_type_'+checked[i]+']').trigger('click');
        // var o = $('div#exercice_cbs_types input#exercice_type_'+checked[i])
        // o.attr('checked',true);
      }
    },
    // Ramasse les types cochés
    // @return la liste des identifiants des types cochés
    pickup_types:function(){ // @testok
      var checked = [] ;
      for(var id in Exercices.TYPES_EXERCICE){
        if ( $('input#exercice_type_'+id).is(':checked') ) checked.push(id);
      }
      return checked;
    },
    // Peuplement des menus tempo
    options_tempo: null,
    menus_tempo_populate: function(){
      $('select.tempo').map(function(i,o){
        $.proxy(Exercices.Edition.peuple_menu_tempo,Exercices.Edition)($(o).attr('id')) ;
      });
    },
    // Peuple un menu tempo en particulier
    peuple_menu_tempo: function(id){
      $('select#' + id).append( this.options_list() ) ;
    },
    // Retourne la liste des options
    from  : 25, // important pour savoir les options à prendre
    to    : 240,
    options_list: function(min, max){
      var no_min = 'undefined' == typeof min || min == null ;
      var no_max = 'undefined' == typeof max || max == null ;
      if ( this.options_tempo == null ){
        this.options_tempo = this.build_options_list(this.from , this.to) ;
      }
      if (no_min && no_max ) return this.options_tempo.join("") ;
      if ( 'undefined'==typeof(min) || min == null ) min = 25 ;
      if ( 'undefined'==typeof(max) || max == null ) max = 240 ;
      return this.options_tempo.slice( min - this.from, max - this.from + 1 ).join("") ;
    },
    // Construit la liste des <options>
    build_options_list:function(from,to){
      options = [] ;
      for(var itempo = from ; itempo < to ; ++itempo ){
        options.push('<option value="'+itempo+'">'+itempo+'</option>') ;
      }
      return options ;
    },
  },
})