/*
    DBE -- DataBase Exercice Object
    --------------------------------
*/

window.DBE = {
  ready         :false,   // mis à true quand la base est prête (nom des auteurs et recueils)
  show_details  :false,   // Si true 1/les détails des exercices sont affichés et 2/les
                          // boutons "détails" sont masqués
                          
  // Ouverture de la base de données des exercices
  opening:true,
  open:function(){
    this.opening = true;
    UI.animin($('div#database_exercices'));
    if ( this.ready == false ) this.prepare();
    return this.opening = false;
  },
  close:function(){
    UI.animout($('div#database_exercices'));
  },
  /*
      Méthode centrale qui ajoute à la roadmap les exercices sélectionnnés dans la
      base de données
      ---
      Méthode: on passe simplement en revue toutes les cases à cocher exercice cochées
      et on ajoute à la current roadmap
  */
  add_selected:function(){
    var ary = [];
    $('div#database_exercices input.dbe_cb_ex').map(function(i,o){
      o = $(o);
      if (o.is(':checked')) ary.push( o.attr('id').replace(/^cb_dbex\-/,''))
    });
    if (ary.length == 0) F.error(ERROR.DBExercice.no_exercice_choosed);
    else{ 
      this.close();
      Exercices.Edition.close(); // normalement, c'est logique
      Exercices.add_bde_exercices( ary );
    }
    return false; // pour le a-lien
  },
  
  // Affiche un extrait de l'exercice identifié par +idtotal+ ("<auteur>-<recueil>-<ex>")
  show_extrait:function( idtotal ){
    var src = "data/db_exercices/" + INSTRUMENT + '/' + idtotal.split('-').join('/') + '-extrait.jpg';
    Exercices.show_partition(src);
    return false; // pour le a-lien
  },
  
  // Affiche ou masque les infos (cb options)
  // Méthode appelée quand on clique sur la case à cocher pour afficher ou non tous
  // les détails des exercices
  toggle_show_details:function(){
    this.show_details = $('input[type="checkbox"]#dbe_cb_details').is(':checked');
    this.set_etat_details();
  },
  
  // Affiche ou masque les détails des exercices
  // Appelé dans deux circonstances :
  //  - quand l'utilisateur clique la checkbox générale pour afficher/masquer les détails
  //  - lorsqu'on affiche une liste d'exercices
  set_etat_details:function(conteneur){
    if('undefined'==typeof conteneur){conteneur = ""}else conteneur += " ";
    $('div#database_exercices '+conteneur+'a.dbe_btndetail')[this.show_details ? 'hide' : 'show']();
    $('div#database_exercices '+conteneur+'div.dbe_infos_ex')[this.show_details ? 'show' : 'hide']();
  },
  
  // Affiche ou masque la liste des exercices du recueil d'id complet +idcomplet+ ("auteur-recueil")
  toggle_liste_exercices:function(idcomplet){
    $('div#div_exercices-'+idcomplet).slideToggle(400);
    return false;
  },
  // Chargement des exercices d'un recueil
  // 
  // @param   idcomplet     Id "complet" composé de "<auteur_id>-<recueil_id>"
  // 
  // @note: cette méthode ne peut être appelée que si les exercices ne sont pas chargés.
  // Car une fois chargés, le lien posé sur le recueil est supprimé et remplacé par un
  // titre qui ne fait qu'ouvrir et fermer la liste des exercices.
  // @note: affiche un message pour patienter en attendant la fin du chargement.
  loading: false,
  load_recueil_exercices:function(idcomplet){
    this.loading = true;
    [auteur_id, recueil_id] = idcomplet.split('-');
    Ajax.query({
      data:{
        proc        : 'db_exercices/recueil/load_exercices',
        instrument  : INSTRUMENT,
        auteur_id   : auteur_id,
        recueil_id  : recueil_id,
        lang        : LANG
      },
      success: $.proxy(this.load_recueil_exercices_suite, this)
    });
    $('div#div_exercices-'+idcomplet).html('<span class="blue">'+MESSAGE.thank_to_wait+'</span>');
    return false; // pour le a-lien
  },
  load_recueil_exercices_suite:function(rajax){
    if (false == traite_rajax(rajax)){
      this.display_exercices( rajax.exercices, rajax.auteur_id + "-" + rajax.recueil_id);
      this.set_titre_recueil_to_show_hide_exercices(rajax.auteur_id, rajax.recueil_id);
      // console.dir(rajax.exercices);
    }
    this.loading = false;
  },
  
  // Affiche les exercices (remontés par ajax)
  // 
  // @param ary_exs     Array des exercices, avec des clés unilettre
  // @param idcomplet   Identifiant complet formé de "<id auteur>-<id recueil>"
  // 
  // @products    Ajoute des divs à la liste des exercices du recueil avec des cases à
  //              cocher pour les choisir.
  display_exercices:function(ary_exs, idcomplet){
    var jid = 'div#div_exercices-'+idcomplet ;
    if (ary_exs != null){
      $(jid).html("");
      [auteur_id, recueil_id] = idcomplet.split('-');
      for(var i in ary_exs){
        var hex = ary_exs[i];
        hex.a = auteur_id; hex.r = recueil_id;
        $(jid).append(new DBExercice(hex).bd_div(idcomplet));
      }
    } else {
      $(jid).html(
        '<span class="red block" style="margin-left:1em;">' + MESSAGE.DBExercice.no_exercices_in_recueil +
        '</span>');
    }
    this.set_etat_details(jid);
  },
  
  // return le DIV de l'exercice défini par le hash +hex+ à insérer dans les lites des
  // exercices à choisir dans la database
  div_exercice_in_listing:function(hex, idcomplet){
    var idtotal = idcomplet + "-" + hex.i ; // => "auteur-recueil-idex"
    return '<div id="div_exercice-'+idtotal+'">' +
            hex.t +
            '</div>' ;
  },
  
  /*  Prépare la fenêtre avec les données de base (auteurs et recueils)
      ------------------------------------------------------------------
      Noter qu'au départ, la donnée DB_EXERCICES n'est pas chargée, puisqu'elle dépend
      maintenant de l'instrument de l'utilisateur. Donc il faut commencer par la charger
      en renseignant le src de la balise script `src_db_exercices`.
      
      Le timer_prepare permet d'attendre que DB_EXERCICES soit chargé
  */ 
  timer_prepare:null,
  prepare:function(){
    if ('undefined'==typeof DB_EXERCICES){
      if ( this.timer_prepare == null ){
        if ( $('script#src_db_exercices').length ) $('script#src_db_exercices').remove();
        var src = "javascript/locale/db_exercices/"+LANG+"/"+User.instrument+".js";
        var balscript = '<script id="src_db_exercices" src="' + src + '" type="text/javascript" />' ;
        $('body').append(balscript);
      }
      this.timer_prepare = setTimeout("DBE.prepare()", 100);
      return false;
    } else {
      if ( this.timer_prepare != null ){
        clearTimeout(this.timer_prepare);
        this.timer_prepare = null ;
      } 
    }
    var o = $('div#dbe_listing');
    // Sort authors by id (~name)
    var sorted_authors = [];
    for(auth_id in DB_EXERCICES) sorted_authors.push(auth_id);
    sorted_authors.sort();
    // Prepare each author
    for(var iauth in sorted_authors){
      var auth_id = sorted_authors[iauth];
      o.append(this.prepare_div_auteur(auth_id,DB_EXERCICES[auth_id]));
    }
    // Remplacer le noms des éléments DOM
    var elsdom = {
      'div#dbe_titre'           :"DBExercice.titre + ' "+INSTRUMENT_H.toUpperCase()+"'",
      'a#btn_dbe_add_selected'  :'DBExercice.add_selected',
      'a.cancel'                :'Verb.Cancel',
      'a.close'                 :'Verb.Close',
      'label#dbe_show_details'  :'DBExercice.show_details'
    };
    for(var jid in elsdom){
      $('div#database_exercices '+jid).html(eval("LOCALE_UI."+elsdom[jid]));
    }    
    // Les nombres
    $('span#dbe_libelle_nb_auteurs').html(LOCALE_UI.Label.auteur + "s");
    $('span#dbe_nb_auteurs').html(DBE_DATA.nombre.auteurs);
    $('span#dbe_libelle_nb_recueils').html(LOCALE_UI.Label.recueil + "s");
    $('span#dbe_nb_recueils').html(DBE_DATA.nombre.recueils);
    $('span#dbe_libelle_nb_exercices').html(LOCALE_UI.Label.exercice + "s");
    $('span#dbe_nb_exercices').html(DBE_DATA.nombre.exercices);
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
    for(var irec in dauteur['r']){
      div += this.prepare_div_recueil(id, dauteur['r'][irec]);
    }
    div += '</div>'  ; // fin du div des recueils
    div +=  '</div>' ;
    return div;
  },
  // Prépare le div d'un recueil d'un auteur
  prepare_div_recueil:function(autid, drec){
    var idcomplet = autid + "-" + drec.i;
    return  '<div id="div_receuil-'+idcomplet+'" class="dbe_div_recueil">' +
              '<div class="titre_recueil">' + 
                this.titre_recueil_with_lien(idcomplet,drec) + 
              '</div>' +
              '<div id="div_exercices-'+idcomplet+'" class="dbe_div_exercices"></div>' +
            '</div>';
  },
  
  // Retire le lien sur le titre du recueil et le remplace par un lien pour ouvre/fermer
  // le listing des exercices
  // @note: appelé après la construction de la liste des exercices du recueil
  set_titre_recueil_to_show_hide_exercices:function(autid, recid){
    var idcomplet = autid + "-" + recid ;
    var olien = $('div#div_receuil-'+idcomplet+' a.recueil_title');
    olien.attr('onclick', "return $.proxy(DBE.toggle_liste_exercices, DBE, '"+idcomplet+"')()")
  },
  // Retourne le lien pour le titre d'un recueil, lien permettant de charger les exercices
  // du recueil
  // 
  // @param   idcomplet     Composé de "<recueil_id>-<auteur_id>"
  // @param   drec          Hash des données du recueil dans DB_EXERCICES
  // 
  // @return  Un lien d'identifiant "btn_load_exercices_of-<idcomplet>" qui appelle la 
  //          méthode load_recueil_exercices avec l'identifiant complet
  titre_recueil_with_lien:function(idcomplet,drec){
    return '<a href="#" class="recueil_title" id="btn_load_exercices_of-'+idcomplet+'" ' + 
            'onclick="return $.proxy(DBE.load_recueil_exercices, DBE, \''+idcomplet+'\')()">' +
            drec['t'] + '</a>' ;
  }
}