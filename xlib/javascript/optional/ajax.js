/*
    Objet Ajax
    ----------
    Gestion complet du traitement Ajax
    
    Note : si le fichier est utilisé comme brique, il faut régler la valeur
    Ajax.R_AJAX_FILENAME ci-dessous qui détermine le fichier qui sera 
    appelé en ajax (par défaut : "ajax.rb" à la racine du site).
    
    @REQUIS
    
      - La brique Flash gérant les messages à l'utilisateur
      - Dans le DOM, un élément (semblable à une lumière/led) qui porte 
        l'identifiant `led_ajax`, pour montrer qu'un traitement Ajax est en
        train de se faire.
    
*/
window.Ajax = {
  
  klass:              null,
  R_AJAX_FILENAME:    './ajax.rb',
  ON:                 false,
  success_poursuivre: null,
  
  /*
      Requête Ajax
      ------------
      @param  p     Objet contenant les informations sur la requête.
                    p.data : objet contenant les données à envoyer. Ou null.
  */
  query:function(p){
    var my = Ajax ;
    // if ( my.ON ) return false ;
    // my.ON = true ;
    // Flash.clean();

    p = my.surdefine_p( p ) ;
    p = my.formate_returned_params( p ) ;
    p = my.formate_data_send( p ) ;

    p_ajax = {
      url         : this.R_AJAX_FILENAME,
      type        : p.type         || 'GET',
      data        : p.data,
      beforeSend  : p.before_send  || my.before_send,
      success     : my.success,
      error       : my.error
      };
    $.ajax( p_ajax );
    return false ; // pour interrompre le lien
  },
  // Surdéfinit le paramètre envoyé à query (p)
  surdefine_p: function(p){
    var my = Ajax ;
    if ( 'undefined' == typeof p ) p = null ;
    if ( p == null ) p = {} ;
    if ( 'undefined' == typeof( p.success ) ) p.success = null ;
    my.success_poursuivre = p.success ;
    my.error_poursuivre   = p.error   ;
    // Toujours transformer les données envoyées en objet
    if ( p.data == null ) p.data = {} ;
    // Ajouter les cookies du document
    p.data['cookies'] = document.cookie ;
    return p ;
  },
  // Met en forme les data qui seront envoyées
  formate_data_send: function(p){
    if ( 'undefined' == typeof p.data.returned ) return p ;
    if (typeof p.data.returned == 'string' ) p.data.returned = [p.data.returned] ;
    p.data.returned = p.data.returned.join(',') ;
    return p ;
  },
  // Met en forme la donnée des paramètres à retourner par ajax
  formate_returned_params: function(p){
    if ( 'undefined' == typeof p.data.returned_params ) return p ;
    if ( typeof p.data.returned_params == 'string' ) 
      p.data.returned_params = [p.data.returned_params] ;
    p.data.returned_params = p.data.returned_params.join(',') ;
    return p ;
  },
  /*
      Retour de la méthode Ajax.query en cas de succès.
      
      @param  r   L'objet retourné par le script ajax sur le site.
                  cf. l'objet ruby RETOUR_AJAX dans le script ruby qui gère
                  la captation des requêtes Ajax.
  */
  success:function( r ){
    var my = Ajax ;
    if ( "undefined" != typeof( r ) && r != null && 'undefined' != typeof( r.cookies ) ) 
      my.cookies_on_success( r.cookies ) ;
    if ( r.dom != null ) my.feed_parts_with( r.dom ) ;
    if ( my.success_poursuivre != null ) {
      try { my.success_poursuivre( r ) ; } 
      catch ( error ){ F.error( error ) ; }
    }
    my.led_off() ; // On éteint la lumière allumée
  },
  /*
      On traite les cookies retournés (en les créant)
  */
  cookies_on_success: function( cookies ){
    var icoo ; 
    for ( cookie_name in cookies ){
      cookie_data     = cookies[cookie_name] ;
      icoo = new Cookie( cookie_name )  ;
      icoo.set_value( cookie_data['value'] )     ;
      icoo.expire_in( cookie_data['nb_jours'] ) ;
      icoo.create() ;
    }
    
  },
  /*

    Met les textes retournés par Ajax dans leur div
    -----------------------------------------------
    Par convention, une clé définie dans le retour peut correspondre à
    un identifiant DOM dans la page. Si c'est le cas, la méthode met la
    valeur de la clé du retour dans l'élément DOM (remplacement complet).
      
  */
  feed_parts_with: function( r ){
    // Pour savoir si des observers doivent être replacés
    // @TODO: il faut remettre la brique REVENT, peut-être en la nommant
    // autrement (noter qu'il y en a une aussi plus bas)
    // init_part_exists = method_exists( REvent.set_all_observers_on )
    // Boucle sur toutes les clés retournées
    for( key in r ){
      content = r[key] ;
      if ( content == null ){ 
        // console.log("Contenu vide (je continue)") ;
        continue ;
      }
      dom_id  = "#"+key ;
      if ($(dom_id).length == 0 ){ 
        // console.log("Élément DOM introuvable. Je continue.") ;
        continue ; 
      }
      // Contenu + observers sur élément DOM
      $(dom_id).html(content) ;
      if ( $(dom_id).is(":visible") == false ){ 
        $(dom_id).show() ;
        $(dom_id).fadeIn() ;
      }
      // if ( init_part_exists ) REvent.set_all_observers_on( dom_id ) ;
      if ( key == 'flash' && content.indexOf('warning') === false) {
        Flash.set_timer() ;
      }
    }
  },
  error:function( r ){
    Ajax.led_off() ;
    if (console){
      console.log("# ERREUR #") ;
      console.dir( r ) ;
    }
    if ( 'undefined' != typeof r.responseText ){
      // Erreur système
      err_html=r.responseText;
      err_code=r.status;
      err_status=r.responseStatus;
      F.warning( err_html ) ;
    } else if ( 'undefined' != typeof( r.flash ) && r.flash != "" ){
      // Erreur gérée au niveau de ruby et mise dans 'flash'
      $('#flash').html(r.flash)
    }
    if ( Ajax.error_poursuivre != null ) {
      try { Ajax.error_poursuivre( r ) ; } 
          catch ( error ) { F.error( error ) ; }
    }
  },
  before_send:function(p){
    meth = 'before_send' ;
    Ajax.led_on() ;
  },
  get_route:function(route, p){
    if('undefined'==typeof(p)){ p = null; }
    if(!isset(p.container)){    p.container = null; }
    this.query({p:route,container:p.container});
  },
  led_on: function(){
    $('#led_ajax').css('visibility', "visible");
  },
  led_off: function(){
    $('#led_ajax').css('visibility', "hidden");
    Ajax.ON = false ;
  },
}
function render(route){Ajax.get_route(route);}
Ajax.klass=Ajax;
