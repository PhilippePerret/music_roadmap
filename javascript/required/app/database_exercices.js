/*
    DBE -- DataBase Exercice Object
    --------------------------------
*/

window.DBE = {
  ready: false, // mis à true quand la base est prête (nom des auteurs et recueils)

  // Ouverture de la base de données des exercices
  opening:true,
  open:function(){
    this.opening = true;
    $('div#database_exercices').toggle('slide',{},750);
    if ( this.ready == false ) this.prepare();
    return this.opening = false;
  },
  
  // Prépare la fenêtre avec les données de base (auteurs et recueils)
  prepare:function(){
    var o = $('div#database_exercices');
    for(auth_id in DB_EXERCICES){
      o.append(this.prepare_div_auteur(auth_id,DB_EXERCICES[auth_id]));
    }
    this.ready = true;
  },
  
  // Ouvre ou ferme la liste des recueils de l'auteur cliqué
  toggle_recueils:function(foo){
    var autid;
    if('string' == typeof foo) autid = foo;
    else autid = $(foo).attr('data-auteur');
    $('div#div_recueils_auteur-'+autid).slideToggle();
    return false; // pour le a-lien
  },
  // Prépare le div d'un auteur
  // 
  // @note: quand on clique sur le nom de l'auteur, on affiche ses recueils
  //        quand on clique sur un recueil, on charge les exercices et on les affiche
  prepare_div_auteur:function(id, dauteur){
    var div = '<div id="div_auteur-'+id+'" class="dbe_div_auteur">' 
    div += '<a href="#" class="dbe_auteur" data-auteur="'+id+'" onclick="return $.proxy(DBE.toggle_recueils, DBE, this)();">' + 
            dauteur['n'] + '</a>';
    div += '<div id="div_recueils_auteur-'+id+'" class="dbe_div_recueils" style="display:none">';
    for(var recid in dauteur['r']){
      div += this.prepare_div_recueil(id, recid, dauteur['r'][recid]);
    }
    div += '</div>'  ; // fin du div des recueils
    div +=  '</div>' ;
    return div;
  },
  // Prépare le div d'un recueil d'un auteur
  prepare_div_recueil:function(autid, recid, drec){
    var idcomp = recid + "-" + autid ;
    var div = '<div id="div_receuil-'+idcomp+'" class="dbe_div_recueil">' ;
    div += '<div class="titre_recueil">' + drec['t'] + '</div>';
    div += '<div id="div_exercices-'+idcomp+'"></div>';
    div += '</div>';
    return div;
  }
}