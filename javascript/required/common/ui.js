if('undefined'==typeof UI) UI = {} ;
$.extend(UI,{
  
  /*  Big method to "humanize" User Interface
   *  ----------------------------------------
   *    - Replace all coded tag (image, aide, focus, ...) with a valid HTML code
   *    - Localize texts, according to LOCALE_UI.Class/Id
   *   
   *    @param  inner  DOM Element or jid ('<tag>#<id>') to humanize. If not provided, the body
   *   
   */
  humanize:function(inner){
    if ('undefined' == typeof inner ) inner = $('body');
    else inner = $(inner);
    this.set_liens_aide(inner);
    this.set_focus(inner);
    this.set_src_images(inner);
    this.set_js_locales(inner);
  },
  
  // Walk through LOCALE_UI.Class and LOCALE_UI.Id to set the localized text.
  // @note this is not the method which set the localized text that must be loaded by
  // Ajax, but only the JS Locales
  set_js_locales:function(inner){
    if('undefined' == typeof LOCALE_UI) return ;
    if('undefined' != typeof LOCALE_UI.Class) this.set_js_locales_by_class(inner);
    if('undefined' != typeof LOCALE_UI.Id)    this.set_js_locales_by_id(inner);
  },
  set_js_locales_by_class:function(inner){
    for(var css in LOCALE_UI.Class) $(inner).find('*.'+css).html(LOCALE_UI.Class[css]);
  },
  set_js_locales_by_id:function(inner){
    for(var tag in LOCALE_UI.Id){
      for(var id in LOCALE_UI.Id[tag])$(inner).find(tag+'#'+id).html(LOCALE_UI.Id[tag][id]);
    } 
  },
  // Remplace les balises '<aide value="<id aide>">' par des pictogrammes
  // cliquable ou un texte si l'attribut 'title' est défini
  nbhelplink:0,
  set_liens_aide: function(inner){
    var title, uid, id, css, sty;
    $(inner).find('aide').map(function(i,o){
      o = $(o);
      uid = o.attr('id');
      if ( ! uid ) uid = "helplink" + (++ UI.nbhelplink);
      id = ' id="'+uid+'"';
      css = o.attr('class'); sty = o.attr('style');
      o.replaceWith(
        '<a'+id+' href="#" onclick="return $.proxy(H.show,H,\'' +
        o.attr('value')+'\')()">'+ UI.lien_title( o ) + '</a>'
        );
      $('#'+uid).attr('style', sty);
      // Set class css
      if('undefined' == typeof css) css = [];
      else if(css != "") css = css.split(' ');
      else css = [];
      css.push('aide_lien');
      $('#'+uid).addClass(css.join(' '));
    });
  },
  // Remplace les balises '<focus value="<jq-id élément>" title="<titre>" />
  // par des liens cliquable mettant l'élément en exercuce
  set_focus: function(inner){
    var jid, tit ;
    $(inner).find('focus').map(function(i,o){
      o   = $(o);
      jid = o.attr('value');
      o.replaceWith(
        '<a id="' + o.attr('id') + '" ' +
        'class="aide_focus" href="#" onclick="return $.proxy(H.focus,H,\'' + 
        jid+'\')()">&nbsp;' + UI.lien_title(o) + '&nbsp;</a>' );
    })
  },
  // => Retourne le titre du lien
  // Si "title" existe ou un texte dans la balise aide, c'est le titre, sinon
  // on met le picto du point d'interrogation
  lien_title: function( o ){
    var atitle = o.attr('title') ;
    var html   = o.html().trim() ;
    if ( 'undefined' != typeof atitle){
      atitle = atitle.trim(); if ( atitle != "" ) return atitle;}
    else if ( html != "" )  return html ;
    else return '<img src="'+UI.path_image('interrogation.png')+'" class="picto_aide" />';
  },
  
  // Fait apparaitre par l'opacité l'élément o
  // @note: l'élément doit avoir été défini avec display:none;opacity:0
  // 
  // @param   o         jQuery Element ou JID (<tag>#<id>)
  // @param   params    Parameters. Pour le moment, seulement :duree, la durée
  //                    (default: 500)
  // 
  animin:function(o,params){
    if('undefined'==typeof params)params={};
    if('undefined'==typeof params.duree) params.duree = 500;
    $(o).css('opacity', '0').show();
    $(o).animate({opacity:1}, params.duree);
  },
  // Inverse de la précédente
  animout:function(o,params){
    if('undefined'==typeof params)params={};
    if('undefined'==typeof params.duree) params.duree = 500;
    $(o).animate({opacity:0},params.duree,function(){$(o).hide()});
  },
  
  /*  App Status while loading
      -------------------------
  */
  
  ready:false,
  // Hash mémorisant les éléments à surveiller au démarrage. Le hash est 
  // donné ici en exemple mais il doit être défini en dehors de cette 
  // librairie commune, par UI.ready_states = ...
  // ready_states:{
  //   length      : -1,       // calculé ci-dessous
  //   not_readies : null,     // compte à rebours
  //   jquery      : false,    // mis à true à la fin du document.ready de jQuery
  //   exedition   : false,    // formulaire exercice
  //    home_text :false        // Text d'accueil
  // },
  // 
  // @param   foo   Attribute of ready_states to set to +is_ready+
  // @param   is_ready  True (Default) if +foo+ is ready, false otherwise
  // 
  set_ready:function(foo,is_ready){
    if ( this.ready_states.length == -1 ){
      // => Lancement
      this.ready = false ;
      for(var i in this.ready_states) ++ this.ready_states.length ;
      -- this.ready_states.length ; // enlever le length lui-même
      this.ready_states.not_readies = parseInt(this.ready_states.length,10);
    }
    if ('undefined' == typeof is_ready) is_ready = true ;
    this.ready_states[foo] = is_ready ;
    this.ready_states.not_readies += is_ready ? -1 : 1 ;
    // Est-ce la fin ?
    if (this.ready_states.not_readies == 0){
      // => Fin
      this.ready = true ; // à utiliser par exemple par Watir
    }
  },
  // Ajouter un élément au bout du body (pour tests)
  add_body: function(code_o){
    return this.add( 'body', code_o ) ;
  },
  // Ajouter l'élément +code+ à l'élément +jid+
  add: function(jid, code){
    $(jid).append( code );
    return true ;
  },
  // Supprime les éléments correspondant à +jid+ de la page
  // @param   jid     Spécification de l'élément jQuery (p.e. "div#monid")
  // @param   onlyin  Si true, détruit seulement l'intérieur de l'élément
  //                  Si false, détruit l'élément lui-même
  remove: function(jid, onlyin){
    if ( onlyin ) $(jid).html('') ;
    else $(jid).remove();
  },
  // Focus dans un champ s'il existe (et met sa valeur à +content+ si elle 
  // est définie)
  focus: function(id, content){
    if ( id.indexOf('#') < 0 ) id = '#' + id ;
    if ( 'undefined' != typeof content) $(id).val(content) ;
    $(id).focus();    
  },
});