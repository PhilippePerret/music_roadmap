/*
    Objet RUser
    
    Gérer l'utilisateur courant.
    
    @raccourci : U (pour correspondre au code ruby)
    
*/
window.RUser = {
  SIMPLE_USER : 0,
  SIGNUP      : 1,
  REDACTEUR   : 64,
  ADMIN       : 128,
  STATUT_NAMES: null,       // définit à l'intialisation (init())
  
  statut            : null,
  mode_consultation : this.SIMPLE_USER,
  
  is_admin        : false,
  is_redacteur    : false,
  is_editeur      : false,
  is_signup       : false,
  is_simple_user  : true,
  
  /*
      Initialisation de l'objet
      Noter que cela se produit avant la fin du chargement de la page.
  */
  init: function(){
    my = RUser ;
    my.STATUT_NAMES = {} ;
    my.STATUT_NAMES[ my.SIMPLE_USER ] = "Simple visiteur"   ;
    my.STATUT_NAMES[ my.SIGNUP      ] = "Visiteur inscrit"  ;
    my.STATUT_NAMES[ my.REDACTEUR   ] = "Rédacteur"         ;
    my.STATUT_NAMES[ my.ADMIN       ] = "Administrateur"    ;
  },
  
  as_admin        : function(){ U.check_as( U.ADMIN ) },
  as_redacteur    : function(){ U.check_as( U.REDACTEUR ) },
  as_signup       : function(){ U.check_as( U.SIGNUP ) },
  as_simple_user  : function(){ U.check_as( U.SIMPLE_USER ) },
  as_editeur      : function(){ this.as_admin || this.as_redacteur },
  

  // Méthode [Interne] permettant de connaitre le mode de consultation de 
  // l'utilisateur courant (si c'est un administrateur, il peut visiter
  // le site dans tous les autres états possibles)
  check_as: function( valeur_checked ){
    return (U.mode_consultation & valeur_checked) != 0 ;
  },
  /*
    Définit le statut de l'utilisateur courant.
    @note:  Lire la note [JS0002]
    @note:  Ce statut est défini au chargement de la page suivant le
            module javascript qui est chargé. Pour le moment, il n'y a 
            que le module "when_admin.js" et "when_not_admin.js", mais
            à l'avenir il y aura un module par statut possible (TODO:)
  */
  set_statut: function( statut ){
    my = RUser ;
    statut = parseInt( statut, 10 ) ;
    my.is_admin       = (statut & my.ADMIN )      > 0 ;
    my.is_redacteur   = (statut & my.REDACTEUR)   > 0 ;
    my.is_signup      = (statut & my.SIGNUP)      > 0 ;
    my.is_simple_user = (statut & my.SIMPLE_USER) > 0 ;
    my.is_editeur     = my.is_admin || my.is_redacteur ;
  },
  
  /*
     Méthode permettant de définir le statut de l'utilisateur
     Cf. Note [JS0002]
  */
  set_mode_consultation: function( new_statut ){
    my = RUser ;
    my.mode_consultation = new_statut ;
    F.show( "vous êtes maintenant " + my.STATUT_NAMES[new_statut] ) ;
  }
}

U = RUser ;
U.init();