/*
    Objet Log
    ---------
    Pour la gestion du tableau de bord (historique)
*/
window.Log = {
  
  // CODES HISTORIQUE
  // @TODO: Lorsque Log deviendra une librairie générale, il faudra laisser
  // ce hash dans l'application (il est propre à l'application)
  // Le paramètre `data' contient les propriétés qu'il faut enregistrer 
  // avec la ligne de code. Ce doit être des propriétés accessibles de
  // l'objet transmis en second paramètre de `new'
  DATA_LOGS:{
    // 100-199 : Roadmap
    100:{nomh:"Création de la feuille de route", data:[]},
    // 500-599 : Exercices
    500:{nomh:"Création d'un exercice", data:['id', 'tempo']},
    510:{nomh:"Travail d'un exercice", data:['id','w_duree','tempo']}
  },
  
  // Enregistre une nouvelle ligne de log (historique)
  // @param   code    Le code historique à enregistrer
  // @param   objet   L'objet (instance) visé par la ligne de log
  // @produit : l'enregistrement dans le log des données
  new: function( code, objet, fx_suite ){
    this.adding = true ;
    this.add( this.set_data( code, objet ), fx_suite ) ;
  },
  
  // Ajoute une ligne au log
  // 
  // @param data        Liste (Array) des valeurs à enregistrer
  // @param fx_success  La méthode de retour Ajax (Log.end_add par défaut)
  // @NOTE: NE PAS APPELER DIRECTEMENT CETTE MÉTHODE. UTILISER `new'
  adding:false,
  add: function( data, fx_suite ){
    this.adding = true ;
    fx_success = $.proxy(Log.end_add, Log, fx_suite) ;
    Ajax.query({
      data:{
        proc        : 'log/add',
        roadmap_nom : Roadmap.nom,
        roadmap_mdp : Roadmap.mdp,
        data        : data.join("\t")
      },
      success : fx_success
    })
  },
  end_add: function(fx_suite, rajax){
    traite_rajax( rajax ) ;
    BT.add("Ligne histoire : " + rajax['logline']) ;
    this.adding = false ;
    if('function'==typeof fx_suite) fx_suite();
  },
  
  // Définit les data à envoyer
  // Cf. RefBook > Log  Data enregistrées
  // @param code    Le code log de l'élément (p.e. 510 pour un travail)
  // @param foo     L'instance sur laquelle il va falloir prendre les data
  // @return  La liste (Array) des données à envoyer.
  set_data: function( code, foo ){
    var spec = this.DATA_LOGS[ code ] ;
    if ('undefined' == typeof spec ) return F.error("Impossible de trouver les données du code historique "+code);
    var data = [code] ;
    for(var i in spec.data){
      var k = spec.data[i] ;
      data.push( foo[k] );
    }
    // Une log-note a-t-elle été créée ?
    if ('undefined' != typeof foo['log_note'] && foo['log_note'] != null){
      data.push(foo['log_note'])
    }
    return data ;
  },
}