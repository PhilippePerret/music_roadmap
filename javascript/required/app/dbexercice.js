/*
    Class DBExercice
    ----------------
    Pour un exercice de la base de données
*/
window.DBExercice = function(dex){
  this.id           = null;
  this.titre        = null;
  this.auteur       = null; // id auteur
  this.recueil      = null; // id recueil
  this.tempo_min    = null;
  this.tempo_max    = null;
  this.duree_min    = null;
  this.duree_max    = null;
  this.types        = [];
  this.has_score    = false;  // fichier PDF
  this.has_extrait  = false;  // Image d'un l'extrait (500x300)
  this.has_vignette = false;  // Vignette (200x100)
  if ('undefined' != typeof dex){
    this.id = dex.i; this.titre = dex.t; this.duree_min = dex.wm; this.duree_max = dex.wx;
    this.types = dex.y; this.has_score = dex.sc; 
    this.has_extrait = dex.ie; this.has_vignette = dex.iv
    this.auteur = dex.a; this.recueil = dex.r; // @note: pas relevé par ajax, mais ajouté après
  }
}

// Retourne la liste des types (humain) de l'exercice, sous forme de liste à virgule.
DBExercice.prototype.types_to_s = function(){
  if(this.types.length == 0) return "";
  var types_str = []
  for(var i in this.types){types_str.push(Exercices.TYPES_EXERCICE[this.types[i]])}
  return types_str.join(', ').toLowerCase();
}
// Retourne la durée max et min de travail sur cet exercice, sous forme "M'SS" à M'SS\""
DBExercice.prototype.duree_travail_to_s = function(){
  if(this.duree_min == null) return "";
  var dmin = Time.seconds_to_horloge(this.duree_min,false,null,"'") + '"';
  var dmax = Time.seconds_to_horloge(this.duree_max,false,null,"'") + '"';
  return dmin + LOCALE_UI.Label.a_to + dmax;
}
// Retourne l'identifiant DOM de l'exercice, constitué de "<auteur id>-<recueil id>-<id ex>"
DBExercice.prototype.dom_id = function(){
  return [this.auteur, this.recueil, this.id].join('-')
}
// Retourne le code HTML du div à insérer dans le listing des exercices de la database
DBExercice.prototype.bd_div = function(){
  var iddom = this.dom_id();
  var idcb  = "cb_dbex-" + iddom;
  return '<div id="div_exercice-'+iddom+'" class="dbe_div_ex">' +
            '<input class="dbe_cb_ex" id="'+idcb+'" type="checkbox" />' +
            this.btn_show_infos() +
            this.lien_to_show_extrait() +
            '<label for="'+idcb+'">' + this.titre + '</label>' +
            this.div_infos() +
          '</div>' ;
}
// Retourne le div caché des infos de l'exercice
DBExercice.prototype.div_infos = function(){
  return '<div id="dbe_infos_ex-'+this.dom_id()+'" class="dbe_infos_ex" style="display:none;">' +
    "(type : " + this.types_to_s() + " — " +
    this.duree_travail_to_s()+")" +
    '</div>';
}
// Retourne le bouton pour voir les infos de l'exercice
DBExercice.prototype.btn_show_infos = function(){
  return '<a href="#" class="fright tiny_btn dbe_btndetail" onclick="$(\'div#dbe_infos_ex-'+this.dom_id()+'\').slideToggle(300);return false;">'+LOCALE_UI.Label.details+'</a>'
}
// Retourne un lien pour voir un extrait de l'exercice
DBExercice.prototype.lien_to_show_extrait = function(){
  if(this.has_extrait == false) return "" ;
  return '<a href="#" class="fright tiny_btn" onclick="return $.proxy(DBE.show_extrait, DBE, \''+this.dom_id()+'\')()">' + LOCALE_UI.Label.extrait + '</a>' ;
}