/*
  ----------------------------------------------------------------------
  
  • Object  UI
            UI.ANY    N'importe quel type d'élément DOM
            UI.A      Pour interagir avec les liens <a...>...</a>
            UI.Form   Pour les formulaires
            UI.InputSubmmit   Pour les boutons de soumission
            UI.InputText      Pour les input text
            UI.Textarea       Pour les textarea
            
  • Class   Button (en fait un <A>)
  
  ----------------------------------------------------------------------
  
  • Object UI
    Pour User Interface / Interaction avec l'utilisateur
    Cet objet contient notamment la gestion de la sélection du document ou
    encore les boutons (class Button).
  
  • Class Button    Permet d'afficher et de gérer des boutons à l'écran.
  
  -------------------------------------------------------------------
  === Les méthodes `data' ===
  
  Toutes les méthodes `data' de ces objets JS renvoie les données sur
  l'élément DOM voulu. C'est un Hash contenant les attributs de l'élément
  ainsi que l'analyse de son href (pour un lien) ou de son action (pour
  un formulaire)
  
  Toutes ces méthodes reçoivent deux arguments :
    - L'identifiant jQuery ou l'abjet DOM ou jQuery de l'élément
    - L'option 'compact'.
  L'option 'compact' concerne les liens (attribut :href) et les formu-
  laires (attribut :action).
  Si l'option 'compact' est mise à true (false par défaut), toutes les
  données sont mises au même niveau, au premier niveau du hash retourné.
  Si l'option 'compact' est mise à false (valeur par défaut), les data
  retournées contiennent une clé :url qui contient l'adresse de 
  l'attribut et :params_url qui a pour valeur un hash où les paramètres
  sont dispatchés. 
  Exemple :
    Soit un formulaire :
    <form ... action="mon_adresse.rb?vari=12&varu=u" ...>
      <input type="hidden" id="idmyhide" name="namemyhide", 
          value="vhide" />
      ...
    </form>
    OU un lien :
    <a href="mon_adresse.rb?vari=12&varu=u" ...>
    
  Dans ces deux cas (l'adresse est volontairement la même pour 
  l'exemple), on aura :
    Si COMPACT =...     La donnée retournée sera...      
      
      FALSE               {
          si formulaire ->  action: "mon_adresse.rb?vari=12&varu=u",
                si lien ->  href: "mon_adresse.rb?vari=12&varu=u",
                            url: "mon_adresse.rb",
                            // === ICI LE POINT À NOTER ===
                            params_url: {vari:'12', varu:'u'},
          si formulaire ->  data: { namemyhide: "vhide" }
                            // === FIN POINT À NOTER ===
                            ... autres attributs ...
                          }
      
      TRUE                {
          si formulaire ->  action: "mon_adresse.rb?vari=12&varu=u",
                si lien ->  href: "mon_adresse.rb?vari=12&varu=u",
                            url: "mon_adresse",
                            // === ICI LE POINT À NOTER ===
                            vari: '12',
                            varu: 'u',
          si formulaire ->  namemyhide: 'vhide',
                            // === FIN POINT À NOTER ===
                            ... autres données ...
                          }
*/
window.UI = {
  
  
  // Définit la visibilité de l'élément et retourne son état
  set_visible: function(o, visible){
    if ('undefined' == visible ) visible = true ;
    $(o).css('visibility', visible ? 'visible' : 'hidden' ) ;
    $(o).removeClass(visible ? 'invisible' : 'visible');
    $(o).addClass(visible ? 'visible' : 'invisible');
    return visible ;
  },
  
  // Permet de rendre l'élément DOM +id+ déplaçable (quand on garde la
  // souris pressée)
  // 
  // @usage:
  //  Par exemple dans le DIV qui fait une bande supérieure à une boite :
  //    onmousedown="UI.set_draggable('monparent')" 
  //    onmouseup="UI.unset_draggable('monparent')"
  //    (ou placer des observers moins intrusifs)
  // 
  //  Au chargement de la page, l'élément à déplacer doit avoir été déclaré
  //  avec : <jQueryElement>.draggable({disabled:true})
  // 
  // @param id  L'identifiant (qui peut être complexe, comme `section#sonid')
  current_css_dragging: null, // pour conserver la bordure de l'élément
  set_draggable: function( jqid ){
    UI.current_css_dragging = $(jqid).css('opacity') ;
    $(jqid).css('opacity', "0.85") ;
    $(jqid).draggable('option','disabled', false);
  },
  unset_draggable: function( jqid ){
    $(jqid).draggable('option', 'disabled', true);
    $(jqid).css('opacity', UI.current_css_dragging) ;
  },
  
  // Met l'élément +odom+ au premier plan (en jouant sur son z-index)
  premier_plan_zindex : null, // l'ancien z-index de l'élément au premier plan
  premier_plan_id     : null, // l'objet jQuery mis au premier plan
  set_premier_plan: function(odom){
    odom = $(odom) ;
    if (UI.premier_plan_id){
      if ( odom.attr('id') == UI.premier_plan_id ) return ;
      $('#'+UI.premier_plan_id).css('zIndex', UI.premier_plan_zindex) ;
    } 
    UI.premier_plan_id      = odom.attr('id') ;
    UI.premier_plan_zindex  = odom.css('zIndex') ;
    odom.css('zIndex', 1000) ;
  },
  // Inverse la visibilité de l'élément jQuery +e+
  toggleVisibility: function(e){
    var cur = $(e).css('visibility') ;
    $(e).css('visibility', cur == 'hidden' ? 'visible' : 'hidden') ;
  },
  
  // UI.ANY
  // Méthode fonctionnant pour n'importe quel type d'élément DOM
  ANY: {
    
    // => Hash de toutes les données d'un objet DOM quelconque
    // -------------------------------------------------------
    // @usage             
    //          var data = UI.ANY.data(<id/obj>[, true]);
    // 
    // Cf. haut de page pour description des arguments
    // 
    data: function( o, compact ){
      var o_jq, o_dom, objet ;
      o_jq = $(o) ;
      o_dom = o_jq[0] ;
      switch( o_dom.tagName ){
        case 'A':
          objet = UI.A ;
          break ;
        case 'INPUT':
          switch( o_jq.attr('type').toUpperCase() ){
            case 'SUBMIT':
              objet = UI.InputSubmit ;
              break ;
            default:
              return UI.ANY.attributes( o ) ;
          }
          break ;
        case 'FORM' :
          objet = UI.Form ;
          break ;
        default:
          return UI.ANY.attributes( o ) ;
      }
      return objet.data( o, compact );
    },
    // Reçoit une donnée str +uri+ de type '<adresse>?<parametres>' et 
    // renvoie un Hash contenant les données dispatché.
    // Cf. haut de page pour la description des arguments.
    // 
    data_uri: function( uri, compact ){
      if ("undefined" == typeof compact ) compact = false ;
      // Traitement des paramètres (if any)
      if ( uri.indexOf( '?') > -1 ){
        duri    = uri.split('?') ;
        duri[1] = duri[1].urlParams2hash() ;
      } else {
        duri = [ uri, {} ] ;
      }
      // Composition de la donnée finale
      var data = {}
      data.url    = duri[ 0 ] ; // dans tous les cas
      params_url  = duri[ 1 ] ; // pour la clarté du code
      if ( compact ) $.extend( data, params_url ) ;
      else data.params_url = params_url ;

      return data ;
    },
    // => Hash de tous les attributs de l'élément DOM/jQ +o+
    // @usage   var attrs = UI.ANY.attributes( <id or DOM object> )
    // 
    attributes: function( o ){
      var _i, _len, attrs, dattr, o_notjq, data = {} ;
      o = $(o) ;
      o_notjq = o[0] ;
      attrs = o_notjq.attributes ;
      for(_i = 0,_len=attrs.length;_i<_len;++_i){
        dattr = attrs[_i] ; data[dattr.name] = dattr.value; }
      return data ;
    }
  },
  // / fin de UI.ANY
  
  // -------------------------------------------------------------------
  /*  UI.InputSubmit     Pour les boutons de soumission
  */
  InputSubmit: {
    
    // => Data du bouton submit + data du formulaire associé
    // ------------------------------------------------------
    // @usage   
    //    UI.InputSubmit.data( <id submit / DOM/jQ object>[, compact])
    // Cf. haut de page pour la description des arguments.
    // Fonctionnement : on prend les arguments du bouton submit, on
    // cherche son formulaire pour en connaître toutes les data et on
    // les renvoie toutes.
    data: function( o, compact ){
      var o_jq  = $(o);
      var oform = RDom.parent_with({tagname: 'FORM'}) ;
      var data_form = UI.Form.data( oform, compact ) ;
      var data_subm = UI.ANY.attributes( o_jq ) ;
      return $.extend( data_subm, data_form ) ;
    }
    
  }, // /fin UI.InputSubmit
  // -------------------------------------------------------------------
  /*
      UI.InputText
      ------------
  */
  InputText:{
  
    // => Data de l'input text (=> ses attributs)
    // Cf. haut de page pour détail des arguments
    data: function( o, compact ){
      return UI.ANY.attributes( o, compact ) ;
    },
    
    // Place un observeur sur tous les champs de texte input#text pour
    // sélectionner le texte quand on focusse dans le champ
    // @usage : dans le $(document).ready, ajouter :
    //          UI.InputText.select_on_focus() ;
    select_on_focus: function(){
      $('input[type=text]').bind('focus', function(evt){ evt.target.select() });
    },
  },
  
  // Fin UI.InputText
  // -------------------------------------------------------------------
  /*
      UI.Textarea
      -----------
  */
  Textarea: {
    
    // Adapte la taille du textarea +o+ en fonction de son contenu
    // @param   o   Objet jQuery ou DOM
    // @usage   UI.Textarea.adapt(<o>)
    adapt: function( o ){
      var o     = $(o) ;
      var odom  = o[0] ;
      if ( odom.tagName != 'TEXTAREA' ) return ;
      var oh    = odom.offsetHeight ;
      if( oh == 0 ) return ; // not displayed
      sh = odom.scrollHeight ;
      if ( oh >= (sh + 10) ) return ;
      o.css( 'height', (sh + 20) + "px" ) ;
    },
    // Place un observeur sur tous les champs de texte input#text pour
    // sélectionner le texte quand on focusse dans le champ
    // @usage : dans le $(document).ready, ajouter :
    //          UI.InputText.select_on_focus() ;
    select_on_focus: function(){
      $('input[type=text]').bind('focus', function(evt){ evt.target.select() });
    },
    
  },
  
  // -------------------------------------------------------------------
  /*  UI.Form     Pour les formulaires
  */
  Form: {
    /*  => Data du formulaire
        ---------------------
        // Cf. haut de page pour détail des arguments
    */
    data: function( fo, compact ){
      var dform, receveur, data_in_form ;
      fo = $(fo) ;
      if ( fo.length == 0 ){
        F.error( "Formulaire "+ fo +" introuvable… Je ne peux pas renvoyer ses data.");
        return null ;
      }
      if ("undefined" == typeof compact) compact = false ;

      // Données de l'action
      data_action = fo.attr('action').urlParams2hash() ;

      if ( compact ) {
        dform = data_action ; 
        receveur = dform ; 
      } else { 
        dform = { action: data_action, data: {} } ;
        receveur = dform.data ;
      }
      
      // Données dans le formulaire
      data_in_form = fo.serializeArray() ;
      for (k in data_in_form) { h = data_in_form[k] ;
                                receveur[h.name] = h.value ;
                              }
      return dform ; 
      
    }
  },
  /*  UI.A  Pour les liens
  */
  A: {

    /*
      => Data du lien passé en argument
      ----------------------------------
      i.e. un hash contenant la valeur de tous ses attributs + une
      donnée 'data_href' qui décomposer l'attribut href, s'il contient
      des ?..&..&...
      @param  ol        Identifiant ou objet DOM / jQuery du lien
      @param  compact     true / false (par défaut)   
              Si true, tous les paramètres que peut contenir le lien 
              seront mis au premier niveau du hash retourné. Si l'href
              contient une url et des paramètres, ils seront mis au 1er
              niveau :
                {
                  url:        <adresse>
                  <param 1>:  <valeur de param 1>
                  <param 2>:  <valeur de param 2>
                  etc.
                  autres données du lien (id, class, etc.)
                }
              Si compact est faux (par défaut), les paramètres se 
              trouveront dans la clé `params_url', sous forme de Hash.
    */
    data: function( o, compact ){
      var data, data_uri, url, _k ;
      if ( "undefined" == typeof o ){
        alert("Aucun objet n'a été envoyé à UI.A.data...") ; return {};}
      if ("undefined" == typeof compact ) compact = false ;
      o = $(o) ;
      data = UI.ANY.attributes( o ) ;
      // Analyse de l'url
      data_uri = UI.ANY.data_uri( data.href, compact ) ;
      if ( compact ) $.extend( data, data_uri ) ;
      else {
        data.url        = data_uri.url ;
        data.params_url = data_uri.params_url ;
      }
      return data ;
    }
  },

  /*
    Renvoie la partie de l'élément DOM où a cliqué la souris

    @param  evt   L'évènement click (capté par la fonction appelante)
    @param  ino   L'identifiant que doit avoir l'élément DOM pour que
                  la recherche ait lieu (pour éviter d'être appelé avec
                  un autre trigger)

    @return   null si mauvais container (ino) ou clic dans le tiers centre
              de l'objet DOM.
              'right' si le clic s'est fait sur le tiers droit du container
              'left'  si le clic s'est fait sur le tiers gauche du container
  */
  quel_cote_clicked: function( evt, ino ){
    var tg, left, width, mouse_y, tiers, max_left, min_right ;
    tg = evt.currentTarget || evt.delegateTarget ;
    if ( $(tg).attr('id') != ino ) return null ;
    left  = tg.offsetLeft ;
    width = tg.offsetWidth ;
    mouse_y = parseInt(evt.pageX, 10) ;
    tiers   = parseInt( width / 3, 10) ;
    min_right = left + width - tiers ;
    if ( mouse_y > min_right && mouse_y < (width + left) ) return 'right' ;
    max_left  = left + tiers ;
    if ( mouse_y > left && mouse_y < max_left ) return 'left' ;
    return null ; // quand au centre
  },
  /*
    UI.Selection.
  */
  Selection: {
    
    /*  UI.Selection.in
        
        Renvoie le texte sélectionné dans un textarea envoyé en paramètre.
        @return   Un Hash contenant 'content', 'start' et 'end'
        
    */
    in: function( o ) {
    	var t     = o.value           ;
    	var start = o.selectionStart  ;
    	var end   = o.selectionEnd    ;
    	return {content	:	t.substring(start, end), start:	start, end:	end };
    },
    
    /*  UI.Selection.previous_word( textarea )
      
        Renvoie un hash contenant :
          word    : le mot se trouvant avant le curseur
          offset  : le décalage du mot dans le texte complet
        
    */
    previous_word: function( o ) {
      var sel, content, start, _i, word, lettre ;
      var delims = "  \n\t\r" ;
      sel     = this.in( o ) ;
      content = o.value ;
      start   = sel.start   ;
      word    = "" ;
      for( _i = start - 1 ; _i >= 0 ; --_i ){
        if ( delims.indexOf( content[_i] ) >= 0 ) break ;
        word = content[_i] + word ;
      }
      return {word: word, offset: start } ;
    },
    /*  UI.Selection.set_in( <element dom>, <texte> )
    
        Remplace la sélection actuelle par le texte fourni
        
        @param  o   Le textarea (ou l'input text ?)
        @param  inserted_text   Le texte à inséré
        @param  params          Divers paramètres (cf. ci-dessous)
        
        params peut définir :
          start           Le décalage du texte à insérer (utile par exemple 
                          pour l'autocomplétion)
                          Par défaut, le début de la sélection courante.
          end             Le décalage du début du texte après à récupérer
                          Par défaut, la fin de la sélection courante.
          cursor_start    Le décalage du début de la re-sélection après
                          l'insertion. [optionnel]
          cursor_end      Le décalage de la fin de la re-sélection après
                          l'insertion. [optionnel, mais doit être défini
                          si cursor_start est défini]
          cursor_offset   Position du curseur après l'insertion (donc
                          pas de sélection, ça correspond à un cursor_start
                          et cursor_end identiques)
          select_after    Pour savoir où se placer après. Forcément mis à true

    */
    set_in: function ( o, inserted_text, params ) {
      var content, sel, start, end, scroll, before, after ;
      
      if ( not_defined( params ) ) params = {} ;

    	content = o.value ;
      sel     = this.in( o )
    	scroll  = o.scrollTop ;
    	if ( defined( params.start ) ) start = params.start ;
    	else start = sel.start ;
    	if ( defined( params.end ) ) end = params.end ;
    	else end  = sel.end ;
    	
    	before  = content.substring(0, start);
    	after   = content.substring(end, content.length);

      // Mettre le nouveau texte
    	o.value = before + inserted_text + after ;

      // Re-sélection du texte inséré
      
      // Définition de la position exacte du curseur
      if ( defined( params.cursor_offset ) ){
        cursor_start  = params.cursor_offset ;
        cursor_end    = params.cursor_offset ;
      }
      // Définition d'une sélection exacte
      else if ( defined( params.cursor_start ) && defined( params.cursor_end ) ){
        cursor_start  = params.cursor_start ;
        cursor_end    = params.cursor_end   ;
      }
      // Se placer après le texte inséré
      else if ( select_after ) {
        cursor_start  = start + inserted_text.length  ;
        cursor_end    = cursor_start                  ;
      }
      // Par défaut, on sélectionne le texte inséré
      else {
        cursor_start  = start ;
        cursor_end    = start + inserted_text.length ;
      }
      
      // Sélection
    	o.setSelectionRange( cursor_start, cursor_end ) ;
    	  
  	  o.focus();

    	o.scrollTop = scroll ;
    	return true ;
    }

  },
  
  /*  Objet UI.Button
  
      @note:  Cet objet n'est pas à confondre avec la méthode `button'
              (cf. plus bas). Cet objet permet d'interagir avec un 
              bouton (input[type="button"]) dans la page.
  */
  Button: {
    // => Data du bouton
    // Les data du bouton, c'est-à-dire les attributs.
    data: function( o ){
      return UI.ANY.attributes( o ) ;
    }
  },
  
  /* = Un Bouton pour la page =
  
    @param  attrs   Attributs du bouton
    @return: L'instance Button du nouveau bouton construit
  */
  button: function( attrs ){
    return new Button( attrs ) ;
  },
  /*
    Récupère la sélection courante dans la fenêtre
    
    @return: le noeud (anchorNode) contenant la sélection.
    
  */
  get_selection: function(){
    var s = null ;
    if (window.getSelection)        s = window.getSelection() ; 
    else if (document.getSelection) s = document.getSelection() ; 
    else s = document.selection.createRange();//.text ; 
    return s ;
    // if ( s == null )  return null ;
    // else              return s.anchorNode ;
  },
  
  selection_container: function(){
    var s;
    s = this.get_selection();
    return s.anchorNode.parentNode;
  },
  
  // Si un texte est sélectionné, sans les balises, le père du texte
  // est l'élément DOM (p.e. 'div') qui le contient. Pour obtenir vraiment
  // l'élément DOM qui contient le container, on utilise cette méthode
  parent_of_selection_container: function(){
    var s;
    s = this.get_selection();
    return s.anchorNode.parentNode.parentNode;    
  },
  
  toggle: function( o ){
    // if( $(o).is(':visible') ) $(o).fadeOut();
    // else                      $(o).fadeIn(4 * 1000);
    // TODO: peut-être faire une méthode `toggle_slide' pour que tous
    // les éléments qui appellent toggle ne fonctionnent pas en slide ?
    // Une vérification est fait sur o, car ça peut être l'identifiant
    // sans '#' ni '.'
    if ('string' == typeof o ){
      if ( o.indexOf('#') < 0 && o.indexOf('.') < 0 ) o = "#" + o ;
    }
    if( $(o).is(':visible') ) $(o).slideUp();
    else                      $(o).slideDown();
    return false ;
  },

}

/*
  Class Button

  @note:  On appelle ça un "bouton" mais en réalité il s'agit de lien <a>
          avec class css de la catégorie button (cf. lib/theme/css/button/)
          Il est cependant tout à fait possible de faire un lien normal.
  @note:  Javascript doit être activé pour utiliser cette classe, donc,
          forcément aussi, ce lien réagira à REvent, sauf s'il contient un
          attribut 'ajax' mis à false.
  
  Pour gérer les boutons (les créer, etc.)
  
  @usage: Création du bouton : new Button( <paramètres> )
  
  <paramètres> peut contenir principalement :
                                                            Par défaut :
    left:   (int) Décalage par rapport à la marge gauche      20
    top:    (int) Décalage par rapport au haut de page        20
    class:  (str) La/les classes CSS                          medium_btn fixed foreground
    name:   (str) Le nom du bouton                            OK
    ajax:   (str) Pour savoir si le lien ne doit pas réagir
            au évènement (="false") ou pour définir l'opération
            qui devra être exécutée.                          non défini
*/
function Button( params ) {
  // Propriétés
  this.params = null ;
  this.id     = null ;
  this['name']   = null ;
  this['css']    = null ; // la class CSS du bouton
  this['style']  = null ;
  this['ajax']   = null ; // "" ou "false" ou définition opération
  
  // --- Affichage du bouton ---
  this.show = function( params ) {
    if ( not_defined( params ) ) params = {} ;
    $('body').append( this.to_html() ) ;
  };
  // --- Construction du code du bouton ---
  this.to_html = function(){
    return '<a' +
            ' href="' + this['id']    +'"'  +
            ' href="' + this['href']  +'"'  + 
              this.def_style()              +
            ' class="'+ this['css']   +'"'  +
              this.def_ajax()               +
            '>' + this['name'] + '</a>' ;
  };
  
  // Retourne le code ajax à inscrire dans le lien
  this.def_ajax = function() {
    if ( this['ajax'] == "" ) return "" ;
                      else return ' ajax="' + this['ajax'] + '"' ;
  };
  // Retourne le style pour le lien
  this.def_style = function(){
    var styles = "" ;
    if ( defined( this['left'] ) ) styles += "left:"+this['left']+"px;" ;
    if ( defined( this['top'] )  ) styles += "top:"+this['top']+"px;" ;
    return 'style="' + styles + '"' ;
  };
  
  // --- Définir un identifiant unique ---
  this.uniq_id = function(){
    var ibtn = 0 ;
    while( $("btn"+(++ibtn)).length > 0 ){}
    return "btn" + ibtn ;
  };
  // --- Définition des paramètres par défaut ---
  this.default_params = function( button ){
    var _i, _len, liste, data_prop, prop_name ;
    if ( not_defined( button ) ) button = {} ;
    liste = [
      ['name'   , "OK"                ],
      ['href'   , "#"                 ],
      ['id'     , this.uniq_id()      ],
      ['css'    , "medium_btn fixed"  ],
      ['left'   , 20                  ],
      ['top'    , 20                  ],
      ['ajax'   , ""                  ]
    ]
    for( _i = 0, _len=liste.length;_i<_len;++_i){
      data_prop = liste[_i] ;
      prop_name = data_prop[0] ;
      if ( defined( button[prop_name] ) ) continue ;
      console.log("Définition de " + prop_name) ;
      button[prop_name] = data_prop[ 1 ] ;
    }

    button.css += " foreground" ;
    this['name']   = button.name ;
    this['ajax']   = button.ajax ;
    this['css']    = button.css  ;
  };
  params = this.default_params( params ) ;

}