window.RDom = {
  /*
    Recherche sur les parents d'un élément. La méthode remonte la 
    chaîne des parents jusqu'à trouver ou non le parent cherché.
    
    @param  o           L'enfant (objet DOM ou jquery)
    @param  params      Les paramètres de la recherche (Hash)
                        attribute:    Le parent doit contenir cet attribut
                        tagname:      Le parent doit avoir ce tag
  */
  parent_with: function( o, params ){
    // console.dir({
    //   method: "RDom::parent_with",
    //   params: params,
    //   odom: o
    // });
    
    // Dans le cas où c'est un objet jQuery qui a été envoyé
    if( not_defined(o.parentNode) ) o = o[0] ;
    
    // On cherche en fonction de la recherche spécifiée
    if ( defined( params.attribute ) )
      return this.parent_with_attribute( o, params.attribute ) ;
    else if ( defined( params.tagname ) )
      return this.parent_with_tagname( o, params.tagname ) ;
    return null ;
  },
  /* 
    Remonte les ascendants de O jusqu'à trouver un parent qui
    définisse l'attribut ATTR_NAME
    
    @param  o         L'élément DOM (pas jquery) à partir duquel il faut
                      chercher (on ne le cherche pas dans cet élément)
                      
    @param attr_name  Nom de l'attribut qu'on doit trouver.
    
    @return: le parent trouvé (objet jQuery) ou null
  */
  parent_with_attribute: function( o, attr_name ){
    var loop_max = 100, iloop = 0 ; // pour éviter les infinite loops
    while ( (o.tagName != 'body') && (o = o.parentNode) ) {
      if ("undefined" != typeof $(o).attr(attr_name) ) return o ;
      ++ iloop; 
      if (iloop > loop_max) {
        var merr = "Problème de boucle infinie dans UI.parent_with_attribute" ; 
        alert(merr);
        return null;
      }
    }
    return null ; // => parent non trouvé
  },
  parent_with_tagname: function( o, tag_name){
    tag_name = tag_name.toUpperCase() ;
    while ( o = o.parentNode ){ if (o.tagName == tag_name ) return o; }
    return null ; // => parent non trouvé
  },
}