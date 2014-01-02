// Class REvent
/*
  Pour la gestion des évènements dans la page
  
  Require Ajax.js
*/

window.REvent={
  klass: null,
  ON: true,                     // Si mis à true, les évènements sont ignorés
                                // Utiliser REvent.stop() et REvent.restart()
  FORCE_STOP_EVENT:false,
  ON_KEYPRESS_ON_TEXTAREA: false, // cf. init.js
  LS: ['a', 'select', 'radio', 'form', 'textarea', 'input[type="submit"]',
      'input[type="button"]', 'div[mouse="true"]'],
  EBS:{ // Pour "EventType By Selector"
    'a'         :{selector:"a",         events:"click"  },
    'select'    :{selector:"select",    events:"change" },
    'radio'     :{selector:"radio",     events:"change" },
    'form'      :{selector:"form",      events:"submit" },
    'textarea'  :{selector:'textarea',  events:"focus change keypress"  },
    'input[type="submit"]':{  selector:"input[type=\"submit\"]",events:"submit"},
    'input[type="button"]':{  selector:"input[type=\"button\"]",events:"click"},
    'div[mouse="true"]':{     selector:"div[mouse=\"true\"]",events:"click"}
    },
  init:function(){ this.observe(); },

  /* Placer des observers sur la page
  
    @param  oDom    L'élément DOM de la page visé
    @param  p       Hash contenant la clé selectors contenant la liste des
                    sélecteurs à observer (p.e. ['a', 'textarea'])
  */
  stop: function(){
    REvent.ON = false ;
  },
  // Pour stopper un évènement de n'importe où
  // @usage :   return REvent.stop_event( evt );
  stop_event: function( evt ){
    evt.stopPropagation();
    evt.preventDefault() ;
    return false ;
  },
  restart: function() {
    /*
      En fait, on attend un peu pour remettre en route REvent, pour que
      l'évènement soit fini. Par exemple, quand on sortabilize une liste
      dont les éléments sont des liens, si un observer est posé sur ces liens,
      il serait trigger quand on relâche l'élément. Pour éviter ce comportement,
      on stoppe REvent au début du déplacement (sortable.start) puis on rappelle
      cette méthode à la fin du déplacement (sortable.stop).
    */
    REvent.restart_really.timer = setTimeout("REvent.restart_really()", 500);
  },
  restart_really: function(){
    if (defined(REvent.restart_really.timer)) clearTimeout( REvent.restart_really.timer ) ;
    REvent.ON = true ;
  },
  
  
  /*  Placement de tous les observers sur l'objet +part+
      ---------------------------------------------------
      @param  dom_id  Identifiant ou Objet DOM/jQuery de l'élément sur
                      lequel il faut placer les observers. Par défaut,
                      c'est le body lui-même.
      @produit
        - dimensionnement des textarea
        - selection des input#text
  */
  set_all_observers_on: function( dom_id ){
    var my = REvent ;
    if ( false == Site.AJAX_ENABLED ) return ;
    if ( "undefined" == typeof dom_id ) dom_id = 'body' ;
    // -> Observer les TEXTAREA
    my.observe_textarea( dom_id ) ;
    // -> Observers pour Ajax
    my.observe_for_ajax( dom_id );
    // -> INPUT-TEXT sensibles au focus
    my.observe_input_text( dom_id ) ;
    if(method_exists(Admin.init_part_when_admin) ) Admin.init_part_when_admin();
  },
  
  observe_textarea: function( dom_id ){
    REvent.observe( dom_id, { selectors: ['textarea'] } )
    E.textarea.redim_all( dom_id ) ;
  },
  observe_input_text: function( dom_id ){
    REvent.init_input_text( dom_id ) ;
  },
  
  observe:function(oDom, p){
    var selectors, dsel, handler;
    if(not_defined(oDom) || oDom == null){oDom='body';};
    selectors = this.liste_selectors(p) ;
    while (selector = selectors.shift()){
      dsel=this.EBS[selector];
      if(dsel.handler){ handler=hdl=dsel.handler; }
      else{ handler=$.proxy(this.js_unob,this); }
      $(oDom).find(selector).not('[ajax="false"]').bind(dsel.events,handler);
    }
  },
  
  /*
    Retourne l'élément DOM de l'évènement (instance jQuery)
  */
  target: function(evt){
    return $(evt.currentTarget).eq(0);
  },
  /*
    Placement des observers Ajax
    ----------------------------
    L'idée principale de cette méthode est de court-circuiter le comportement
    normal des liens (a) et boutons (input-submit, input-button).
    Si JS est activé, on passe par la méthode suivante qui va essayer de
    résoudre le lien ou le bouton par Ajax. Par exemple, pour un lien, la
    page sera appelée en se servant de l'href définie pour le lien.
    
  */
  
  observe_for_ajax: function( container ){
    var o ;
    if  ( not_defined( container ) ) o = $("body") ;
        else o = $(container) ;
    o.find('a').bind('click', $.proxy(this.on_click_a_by_ajax, this));
    o.find('a').bind('mouseover', $.proxy(this.on_mouseover_a, this));
    o.find('input[type="button"]').bind('click', $.proxy(this.on_click_button_by_ajax, this));
    o.find('form').bind('submit', $.proxy(this.on_submit_formulaire_by_ajax, this));
    if ( method_exists( REvent.on_click_on_page ) ) {
      if (container != '#body_page') o = $(container).find('#body_page') ;
      o.bind('click', $.proxy(this.on_click_on_page, this));
    }
    
  },
  
  /* 
    Méthode captant un click sur un lien <a> 
    -----------------------------------------
    Trois comportements possibles :
      1.  Pas d'attribut 'ajax' dans la balise => on lit l'adresse du lien
          et on y dirige la page
      2.  Attribut 'ajax' dans la balise, dont la valeur est 'false'
          => on ne fait rien.
      3.  Attribut 'ajax' dans la balise, avec une autre valeur que 'false'.
          Dans ce cas, c'est une "opération" à jouer, on la lit à la place de
          l'href en la traitant pareil. 
  */
  on_click_a_by_ajax: function( evt ){
    if ( ! REvent.ON ) return false ;
    var target, href ;
    target  = this.target(evt);
    attr_ajax = target.attr( 'ajax' ) ;
    if ( attr_ajax == 'false' ) return true ;
    attr_href = defined( attr_ajax ) ? attr_ajax : target.attr( 'href' ) ;
    Ajax.query({ type: 'GET', data: attr_href.urlParams2hash() });
    return false ;
  },
  /* Méthode captant un click sur un boutton (input type=button)*/
  on_click_button_by_ajax: function(evt){
    if ( ! REvent.ON ) return false ;
    target = this.target(evt);
    return false ;
  },
  /*  Méthode captant un click sur un bouton submit 
      Ne pas utiliser pour le moment. Un observer est mis sur le submit
      du formulaire.
  */
  on_click_submit_by_ajax: function(evt){
    if ( ! REvent.ON ) return false ;
    target = this.target(evt);
    return true ;
  },
  /* Méthode captant la soumission du formulaire */
  on_submit_formulaire_by_ajax: function(evt){
    if ( ! REvent.ON ) return false ;
    var target, data ;
    target = this.target(evt);
    data = this.get_data_formulaire( target ) ;
    params = { type: 'POST', data: data } ;
    Ajax.query( params ) ;
    return false ;
  },
  get_data_formulaire: function( target ){
    var data_form, data, k, h ;
    
    dform = REdit.form.data( target ) ;
    data      = dform.action  ;
    // Tout mettre dans data
    for ( k in dform.data ){ data[k] = dform.data[k] ; }
    return data ;
  },
  
  liste_selectors:function(p){
    if(not_defined(p) || p==null){
      return this.LS;
    } else {
      if(not_defined(p.selectors) || p.selectors==null){
        return this.LS;
      } else {
        return p.selectors;
      }
    }
  },
  js_unob:function(evt){
    try{
      if ( ! REvent.ON ) return true ;
      target = this.target(evt);
      // Définition de *** otarget ***
      otarget={jq_target:target,type:target.attr('type'),odom_target:target[0],tag_name:(target[0].tagName).downcase(),event:evt,event_type:evt.type};
      stop_event=target.attr("continue")!="true";
      on_method = 'on_'+otarget.event_type+'_'+otarget.tag_name;
      if(!method_exists(this[on_method]) || this[on_method]==null){return true;}
      if(Flash.on){ Flash.clean(); }
      retour_func=this[on_method](otarget);
      // Si le retour de la fonction est true, on doit stopper l'évènement
      if( retour_func == false ){ stop_event=false; }
      if(stop_event || this.FORCE_STOP_EVENT){
        evt.stopPropagation();
        evt.preventDefault() ;
        if (method_exists(evt.cancelBubble)) evt.cancelBubble() ; // IE
        return false;
        }
      else{return true;}
    } catch( erreur ){
      // On peut forcer l'arrivée ici, sans affichage d'erreur et avec
      // un interruption de l'évènement en utilisant :
      //    throw 0
      if( erreur != 0 ) F.error("Une erreur est survenue  "+erreur+"");
      evt.preventDefault() ;
      evt.stopPropagation();
      if (method_exists(evt.cancelBubble)) evt.cancelBubble() ; // IE
      // $(evt).stop();
      return false;
    }
  },
  on_focus_textarea:function(otarget){
    // Flash.show("Focus dans un textarea");
    return false;
  },
  on_change_textarea:function(otarget){
    // Flash.show("Changement de la valeur du textarea");
    return false;
  },
  on_keypress_textarea:function(otarget){
    if (      ! REvent.ON 
          ||  ! this.ON_KEYPRESS_ON_TEXTAREA 
          ||    (BoiteEdition && BoiteEdition.ON)
        ) return false ;
    return REdit.textarea.on_keypress( otarget )
  },
  on_click_a:function(otarget){
    if ( ! REvent.ON ) return false ;
    p={data:otarget.jq_target.attr("href").urlParams2hash()};
    return Ajax.query(p);
  },
  on_mouseover_a: function(evt){
    // Attenion : cette méthode n'est pas appelée avec otarget, mais
    // avec l'évènement lui-même. Elle ne fait pas partie des méthodes
    // qui l'entourent mais a été ajoutée pour les Rubysites.
    target = this.target(evt);
    target.css('cursor', 'pointer');
  },
  on_submit_form:function(otarget){
    if ( ! REvent.ON ){ 
      return false ; 
    }
    var data = this.get_data_formulaire( otarget.jq_target ) ;
    return Ajax.query( { type:'POST', data: data });
  },
  /*
    Méthodes UI
  */
  select_on_focus: function(evt){
    target = this.target(evt);
    target.select();
  },
  /*
    Méthodes d'initialisation
  */
  init_input_text: function( container ){
    if ( not_defined( container )) container = 'body'
    $(container).find('input[type="text"]').bind('focus', $.proxy(this.select_on_focus,this));
  },
  /*  Affecte une méthode à la place d'un href de bouton-lien
      --------------------------------------------------------
      @param  btn   
              Identifiant jQuery (p.e. "a#monline") ou objet DOM/jQ 
              du lien-bouton ou du bouton.
      @param  method
              La méthode (référence => sans parenthèses)
      @param  obj
              L'object de la méthode (donc la méthode doit impérativement
              appartenir à un objet).
      @param  unbind
              Définit s'il faut supprimer ou non les autres observers
              Trois valeurs possibles :
              false   => Conserver les autres observers (par défaut)
              true    => Supprime l'observer 'click'
              'all'   => Supprime tous les observers
  */
  observe_btn_or_a_with_method: function( btn, method, obj, unbind ){
    var o = $(btn) ;
    if ( "undefined" == typeof unbind ) unbind = false ;
    if ( unbind ){ 
      if ( unbind == 'all' ) o.unbind();
      else o.unbind( 'click' ) ;
    }
    o.bind( 'click', $.proxy( obj.method, obj ) ) ;
  }

}
REvent.klass=REvent;