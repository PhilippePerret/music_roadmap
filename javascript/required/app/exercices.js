if('undefined' == typeof window.Exercices){ 
  window.Exercices = {};}
$.extend(window.Exercices,{
  ERROR: {
  },
  modified: false,
  
  tone         :null,    // Scale of the day (Integer 0 (C) <-> 23 (Bm))
  
  // Les couleurs à utiliser en fonction du type de l'exercice
  // Cf. dans les fichiers localisés pour avoir tous les types
  COLORS_FOR_TYPE:{
    'WT':'404060', // pour simplifier code (fond de colonne working time in report)
    
    'GA':'F00', 
    'AR':'00F',
    'AC':'0F0',  
    'LH':'FF0', 
    'RH':'0FF', 
    'RY':'F0F',
    
    'TI':"500",
    'SX':"005",
    'OC':"050",

    'PC':"550",
    'LG':"055",
    'TR':"A55555",
    
    'TM':"F88",
    'NR':"8F8",
    'NT':"88F",
    
    'CH':"FF8",
    'PG':"F8F",
    'DL':"8FF",
    'EX':"888"
    
    },
  
  set_modified: function(ismod){
    if ('undefined' == typeof ismod ) ismod = true ;
    BT.add("-> Exercices.set_modified("+ismod.toString()+")");
    this.modified = ismod ;
    if ( ismod ) $.proxy(Roadmap.set_modified,Roadmap, true)() ;
    BT.add("<- Exercices.set_modified");
  },
  
  // Empty exercice list
  reset_liste: function(){
    window.EXERCICES = {length:0} ;
    $('ul#exercices').html("") ;
  },
  
  // Affiche la partition de source +src+
  showing_partition:false,
  show_partition:function(src, options){
    $('div#partition img#img_partition').attr('src', src);
    var o = $('div#partition');
    o.show();
    o.animate({opacity:1},500);
    return false; // pour le a-lien
  },
  // Ferme la partition ouverte
  hide_partition:function(){
    var o = $('div#partition');
    o.animate({opacity:0},500,function(){o.hide()});
    return false;
  },
  
  // Return Tone of the day (if not defined, 0 for "C")
  _tone:function(){
    if (this.tone === null) this.tone = Roadmap.Data.tone;
    return this.tone;
  },
  // Return Harmonic sequence of the day
  // @note: Shortcut for:
  _config:function(){return Roadmap.Data.get_general_config()},
  
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
  
  /*  Ajout d'exercices de la database exercices
      -------------------------------------------
      La méthode est appelée par DBE (database_exercices.js) après relève des exercices
      sélectionnée.
      
      @param  ary_exs   Array of "<instrument>-<auteur>-<recueil>-<id exercices>"
      
      @products   Add the choosen exercice to the current roadmap and display them
      @remind     Each DBE exercice is duplicated in the roadmap exercices folder, except
                  images and other fixed information, so the user can set his own tempi,
                  notes, etc.
      
  */
  adding_bde_exercices:false,
  add_bde_exercices:function(ary_exs){
    this.adding_bde_exercices = true ;
    Ajax.query({
      data:{
        proc        : 'exercice/add_from_dbe',
        instrument  : INSTRUMENT,
        bde_exs     : ary_exs.join(','),
        roadmap     : Roadmap.nom,
        mail        : User.mail,
        md5         : User.md5,
        lang        : LANG
      },
      success: $.proxy(this.add_bde_exercices_suite, this)
    })
  },
  // Suite of precedente
  add_bde_exercices_suite:function(rajax){
    if(false == traite_rajax(rajax)){ //=> on success
      F.show(MESSAGE.DBExercice.added);
      // Et il faut actualiser l'affichage de la roadmap
      Roadmap.open();
    }
    this.adding_bde_exercices = false ;
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
      F.error( ERROR.Exercices.Edit[cle_erreur] ) ;
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
    return Roadmap.Data.EXERCICES.ordre ;
  },
  // Définit le nouvel ordre
  // @note: Raccourci pour Roadmap.Data.EXERCICES['ordre'] = <liste>
  set_ordre: function( liste ){
    Roadmap.Data.EXERCICES.ordre = liste ;
  },
  
  // @note: Called by Roadmap.Data.tone() when configuration change
  // or when user changes seance tone
  set_tones_of_exercices:function(){
    var i, idex, ordre = this.ordre();
    for(i in ordre){
      idex = ordre[i];
      EXERCICES[idex].set_tone();
    }
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
  deselect: function(id, fx_suite){
    var ex = exercice(id)
    ex.deselect();
    if ( ex.playing ){ 
      ex.fx_to_follow_stop = fx_suite;
      ex.stop();
    }
    this.selections.splice(this.selections.indexOf(id), 1) ;
  },
  deselect_all: function(){
    var i, id ;
    for(i in this.selections) exercice(this.selections[i]).deselect() ;
    this.selections = [] ;
  },
  /*
   *  Load all exercices of +list_ids+
   *
   *  This method is used by the Rapport object to load all exercices of
   *  sessions, when they've been deleted by user
   *
   *  If +fx_suite+ is defined, call this method after loading
   *
   */
  loading:false,
  load:function(list_ids, fx_suite){
    this.loading = true;
    Ajax.query({
      data:{
        proc      :'exercice/load',
        rm_nom    :Roadmap.nom,
        rm_mail   :User.mail,
        md5       :User.md5,
        ids       :list_ids.join(',')
      },
      success:$.proxy(this.load_suite, this, fx_suite)
    });
  },
  load_suite:function(fx_suite, rajax){
    if(false == traite_rajax(rajax)){
      // rajax.load_errors contient les erreurs au chargement (exercices non trouvés,
      // problèmes en chargeant et interprétant le fichier JSON)
      if(rajax.load_errors.length > 0){
        F.error(  "Des erreurs ont été rencontrées au cours du chargement des exercices:<br>"+
                  rajax.load_errors.join('<br>'));
      }
      for(var iex in rajax.exercices) new Exercice(rajax.exercices[iex]);
    }
    this.loading = false;
    if('function'== typeof fx_suite) fx_suite();
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
        proc      :'exercice/import',
        rm_nom    :Roadmap.nom,
        rm_mail   :User.mail,
        md5       :User.md5,
        data      :path
      },
      success : fct_success
    });
    return false ; // pour le a-lien
  },
  end_import:function (rajax){
    if (rajax['error'] != null ) F.error( rajax['error']) ; // mais on poursuit
    else this.Edition.close();
    for (var i in rajax['exercices']) new Exercice(rajax['exercices'][i]).build();
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
    UI.set_visible('a#btn_seance_play', EXERCICES.length > 0);
    this.set_btn_move(locked) ;
    this.set_btn_create(locked);
    this.set_btns_edition(locked);
    this.set_btn_next_general_config(locked);
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
  set_btn_next_general_config:function(locked){
    $('div#div_cb_save_config').toggleClass('invisible', locked) ;
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
  /*  Set tone of every displayed exercice when tone is changed in general
   *  config.
   */
  set_tones:function(){
    var ordre = this.ordre();
    for(var i in ordre) exercice(ordre[i]).set_tone();
  },
  // -------------------------------------------------------------------
  //  Sous objet Exercices.Edition
  // -------------------------------------------------------------------
  
  Edition: {
    class: "Exercices.Edition",
    
    // Les propriétés de l'exercice de type checkbox
    FORM_CBS:['obligatory', 'with_next', 'symetric'], 
    
    // Fill exercice form with values in +data+
    set_values:function(data){
      this.clear_form();
      for(var k in data){
        switch( k ){
          case 'types': this.coche_types(data[k]); break;
          case 'image': break; // ne rien faire
          default:
            var o = $('table#exercice_form #exercice_'+k);
            if (this.FORM_CBS.indexOf(k) >= 0){
              o[0].checked = data[k];
            } else {
              o.val(data[k]);
            }
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
          case 'types'      : data['types'] = this.pickup_types(); break;
          case 'nb_mesures' :
          case 'nb_temps'   :
            val = $(oid).val();
            if (val != "") val = parseInt(val,10);
            data[k] = val
            break;
          case 'tempo'      :
          case 'tempo_min'  :
          case 'tempo_max'  : 
            data[k] = parseInt($(oid).val(),10); 
            break;
          // Par défaut
          default :
            // Les checkbox du formulaire
            if (this.FORM_CBS.indexOf(k) >= 0){
              data[k] = $(oid).is(':checked');
            } else {
              if ( $(oid).length ){
                var val = $(oid).val() ;
                data[k] = val ;
              }
            }
        }
      }
      // On retourne le Hash ramassé
      return data ;
    },
    
    // Retourne un identifiant unique (inexistant)
    new_id: function(){
      return Roadmap.next_id_exercice();
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
    preparing:false,  // Mis à true pendant la préparation de la boite
    prepare:function(){
      this.preparing = true ;
      // Tempos
      this.menus_tempo_populate();
      // Tonalités
      this.peuple_menu_tones();
      // Suites harmoniques
      this.peuple_menu_suites_harmoniques();
      // Types
      this.types_populate();
      
      // Labels, boutons et autres textes
      var h = {
        "a#btn_toggle_types_exercices"    :LOCALE_UI.Verb.modify,
        "a#seach_ex_in_database"          :LOCALE_UI.DBExercice.search_in_db
      }
      for(jid in h){ $('table#exercice_form ' + jid).html(h[jid])}

      this.prepared = true ;
      this.preparing = false ;
      $.proxy(UI.set_ready, UI, 'exedition')();
    },
    // Ouvre le formulaire
    open: function(){ // @testok
      if ( User.is_not_owner() ) return false;
      var o = $('table#exercice_form');
      o.show();
      o.animate({opacity:1},400);
      document.location.hash = '#bande_logo' ;
      return false ;
    },
    // Ferme le formulaire
    close: function(){ // @testok
      var o = $('table#exercice_form');
      o.animate({opacity:0},400,function(){o.hide()});
      return false;
    },
    // Nettoie le formulaire
    clear_form:function(){
      var i, k;
      // On vide tous les champs propriété quand ils existent
      for(i in EXERCICE_PROPERTIES){
        k = EXERCICE_PROPERTIES[i];
        oid = 'table#exercice_form #exercice_' + k ;
        if ( $(oid).length ) $(oid).val("") ;
      }
      // On décoche toutes les checkboxes
      for(i in this.FORM_CBS){
        $('input#exercice_'+this.FORM_CBS[i])[0].checked = false;
      }
      // On décoche tous les types
      $('div#exercice_cbs_types input[type="checkbox"]').map(function(i,o){
        o.checked = false;
      });
    },
    // Définit le nom du bouton pour sauver l'exercice
    set_btn_save: function(nom){
      $('a#btn_exercice_save').html( nom ) ;
    },
    // Peuplement des types
    // @note: TYPES est défini dans les locales constants.js
    // 
    // @param inner   If not defined, the div#exercice_cbs_types, otherwise, the container
    //                of the checkboxes.
    types_populating:false,
    types_populate:function(inner, prefix){
      if('undefined'==typeof inner){
        inner   = $('div#exercice_cbs_types');
        prefix  = "";
      } else {inner = $(inner);}
      this.types_populating = true ;
      inner.html('');
      for(var idtype in Exercices.TYPES_EXERCICE){
        if(idtype == 'WT') continue;
        // On crée un checkbox par type
        var id = prefix + "exercice_type_" + idtype ;
        if ($(id).length) return false; // déjà préparés
        inner.append(
          '<span>' +
            '<input id="'+id+'" type="checkbox" />' +
            '<label for="'+id+'">'+Exercices.TYPES_EXERCICE[idtype]+'</label>' +
          '</span>'
          )
      }
      // Il faut ajouter un clear both en dessous
      inner.append('<div style="clear:both;"></div>');
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
      for(var i in checked){
        $('div#exercice_cbs_types input#exercice_type_'+checked[i])[0].checked = true;
      }
    },
    // Ramasse les types cochés
    // @return la liste des identifiants des types cochés
    // 
    // @param   prefix    If provided, it's the prefix provided to build the list
    //                    Default: ""
    pickup_types:function(prefix){
      if ('undefined'==typeof prefix) prefix = "" ;
      var checked = [] ;
      var amorce = 'input#'+prefix+'exercice_type_' ;
      for(var id in Exercices.TYPES_EXERCICE){
        if ( $(amorce+id).is(':checked') ) checked.push(id);
      }
      return checked;
    },
    // Peuple le menu des tonalités
    // Si +oselect+ n'est pas défini, on prend le menu du formulaire exercice
    peuple_menu_tones:function(oselect){
      var itone, option, dtone = IDSCALE_TO_HSCALE;
      if('undefined'==typeof oselect) oselect = $('select#exercice_tone');
      else oselect = $(oselect);
      oselect.append('<option value="">--</option>');
      for(itone in dtone){
        if(itone.start_with("bis"))continue;
        option = '<option value="'+itone+'">'+dtone[itone]['double']+'</option>';
        oselect.append(option);
      }
    },
    // Peuplement du menu suites harmoniques
    // Si +oselect+ n'est pas fourni, on prend select#exercice_suite
    peuple_menu_suites_harmoniques:function(oselect){
      var k, val;
      if('undefined' == typeof oselect)oselect = $('select#exercice_suite');
      else oselect = $(oselect);
      oselect.html('');
      for(k in Exercices.TYPES_SUITE_HARMONIQUE){
        if (k.length == 2){
          val = Exercices.TYPES_SUITE_HARMONIQUE[k];
          oselect.append('<option value="'+k+'">'+val+'</option>');
        }
      }
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
      return UI.options_from_to(from,to);
    },
    // Return options (Dom element) for a select tons (i.e. without select tag)
    options_for_tones:null, // to build it only once
    options_of_select_tones:function(){
      if(this.options_tones == null){
        this.options_for_tones = '<option value="">--</option>';
        for(var idtone in IDSCALE_TO_HSCALE){
          this.options_for_tones += '<option value="'+ idtone + '">' + 
                                      IDSCALE_TO_HSCALE[idtone].uniq +
                                    '</option>';
        }
      }
      return this.options_for_tones;
    }
  },
})