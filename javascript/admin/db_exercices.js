/*
    Pour ajouter des fiches d'exercices
    -----------------------------------
    @note: ce javascript n'est chargé qu'en offline
    
*/
window.AdminDBE = {
  form_is_built: false,
  folder_exercice:null,         // Le path relatif au dossier de l'exercice
  
  // Main function
  new_exercice:function(){
    if (this.form_is_built == false )this.build_form();
    return false;//pr le a-lien
  },
  
  // Save current exercice
  saving_exercice:false,
  save_exercice:function(){
    this.saving_exercice = true;
    var data = this.get_values();
    data.folder = this.folder_exercice;
    // @TODO: On pourra ajouter "update:true" pour utiliser cette méthode
    // quand on voudra updater des exercices.
    console.dir(data);
    Ajax.query({
      data:{
        proc: 'db_exercices/exercice/save',
        data: data
      },
      success:$.proxy(this.retour_save_exercice, this)
    });
    return false;//pour le a-lien
  },
  retour_save_exercice:function(rajax){
    if(traite_rajax(rajax)==false){
      F.show("Exercice enregistré dans la DBE.");
    }
    this.saving_exercice = false;
  },
  
  // Récupère les valeurs de l'exercice
  DB_KEYS_FIELDS: {
    'affixe': 'input_text', 
    'titre_fr': 'input_text', 'titre_en':'input_text', 
    'suite': 'select', 'tempo_min':'select', 'tempo_max':'select', 
    'nb_temps':'select', 'duree_temps':'select', 
    'metrique':'input_text',
    'nb_mesures':'input_text', 
    'tone':'select',
    'note_fr':'textarea', 'note_en':'textarea',
    'symetric':'checkbox'
    },
  DBE_KEYS_CHECKBOXES: ['symetric'], // WARNING: SI AJOUT, AJOUTER AUSSI DANS DB_KEYS_FIELDS
  get_values:function(){
    var k, ktype, data = {}, val = null, tag, jid;
    for(k in this.DB_KEYS_FIELDS){
      ktype = this.DB_KEYS_FIELDS[k];
      switch(ktype){
        case 'input_text' : tag = "input";    break;
        case 'textarea'   : tag = "textarea"; break;
        case 'select'     : tag = "select";   break;
        case 'checkbox'   : tag = "input[type=\"checkbox\"]"; break;
      }
      jid = tag + '#dbe_' + k ;
      switch(ktype){
        case 'checkbox':
          val = $(jid).is(':checked');
          break;
        default:
          val = $(jid).val();
      }
      data[k] = val;
    }
    data.types = Exercices.Edition.pickup_types('dbe_').join(',');
    return data;
  },
  // Pour choisir le dossier
  on_choose_folder:function(folder){
    this.folder_exercice = folder;
    $('div#div_dbe_folder_exercice').html("Exercice dans : "+folder);
    $('div#div_dbe_choose_folder').remove();
    $('input#dbe_affixe').select();
  },
  // Appelé par le lien "suivant naturel" à côté du nom du fichier, pour passer
  // au fichier d'indice suivant.
  // Note: si le même numéro est trouvé dans les titres français et anglais, on les
  // change aussi
  next_affixe:function(){
    var oaffixe = $('input#dbe_affixe');
    var current = oaffixe.val();
    if (current == "") current = "0";
    var cur_len = current.length;
    var suivant = (parseInt(current,10) + 1).toString();
    oaffixe.val(suivant);
    var titfr = $('input#dbe_titre_fr').val();
    var titen = $('input#dbe_titre_en').val();
    if(titfr.substr(-cur_len) == current){
      $('input#dbe_titre_fr').val(titfr.substr(0,titfr.length-cur_len)+suivant);
    }
    if(titen.substr(-cur_len) == current){
      $('input#dbe_titre_en').val(titen.substr(0,titen.length-cur_len)+suivant);
    }
    return false;
  },
  // Appelé quand on fixe le nombre de mesures
  // Permet de calculer une valeur entrée en opération
  onset_nb_mesures:function(ope){
    return eval(ope).toString();
  },
  // Appelé quand on règle le tempo max, pour régler automatiquement
  // le tempo min
  onset_tempo_max:function(tempo_str){
    var min = parseInt(tempo_str,10) - 20;
    $('select#dbe_tempo_min').val(min);
  },
  // Appelé quand on règle le nombre de temps d'une mesure pour
  // régler automatiquement la métrique
  onset_nb_or_duree_temps:function(){
    var metrique = null;
    var nb_tps    = parseInt($('select#dbe_nb_temps').val(),10);
    var duree_tps = parseInt($('select#dbe_duree_temps').val(),10);
    switch(duree_tps){
      case 2:
        switch(nb_tps){
          case 2: metrique = "C barré";break;
        }
        break;
      case 4:
        switch(nb_tps){
          case 4: metrique = "C";break;
        }
        break;
      case 6:
        switch(nb_tps){
          case 1: metrique = "3/8";break;
          case 2: metrique = "6/8";break;
          case 4: metrique = "12/8";break;
        }
        break;
      case 8:
        switch(nb_tps){
          case 3: metrique = "3/8";break;
        }
        break;
    }
    if(metrique==null)metrique = nb_tps+"/"+duree_tps;
    $('input#dbe_metrique').val(metrique);
  },
  // Pour décocher tous les types
  decoche_all_types:function(){
    for(var idtype in Exercices.TYPES_EXERCICE){
      if(idtype == 'WT') continue;
      var id = "dbe_exercice_type_" + idtype ;
      document.getElementById(id).checked = false;
    }
    return false;//pour le a-lien
  },
  // Pour sélectionner le dossier
  folder_list:function(folder){
    if(folder.substr(-2)=="..")folder = folder.split('/').slice(0,-2).join('/');
    Ajax.query({
      data:{
        proc:'app/finder/get_folder',
        folder:folder,
        only_folders:true
      },
      success:$.proxy(this.retour_folder_list, this)
    });
    return false;//pour le a-lien
  },
  // On reçoit la liste des dossiers, on les affiche
  retour_folder_list:function(rajax){
    traite_rajax(rajax);
    if('undefined' != typeof rajax.folder_list){
      this.affiche_liste_folders(rajax.folder_list, rajax.folder);
    }
  },
  affiche_liste_folders:function(liste, dossier){
    var o = $('div#div_dbe_choose_folder');
    o.html('');
    // Toujours ajouter un "." pour remonter
    o.append(this.folder_line('..', dossier));
    // Une rangée pour chaque dossier
    for(var i in liste){
      var name = liste[i];
      o.append(this.folder_line(name,dossier));
    }
  },
  folder_line:function(name, dossier){
    var path = dossier+'/'+name;
    return '<div>'+
            '<a class="fright choose" onclick="return $.proxy(AdminDBE.on_choose_folder,AdminDBE,'+
            "'"+path+"'" + ')()">Choisir</a>'+
            '<a onclick="return $.proxy(AdminDBE.folder_list,AdminDBE,'+
            "'"+path+"'"+')()">'+name+'</a>'+
            '</div>'
  },
  // Construction du formulaire
  build_form:function(){
    
    /* = Construction formulaire = */
    var form = '<div id="admindbe_form_ex">';
    form += this.close_button();
    form += this.div_choose_folder();
    form += this.title_fields();
    form += this.checkboxes_fields();
    form += '<fieldset><legend>Tonalité</legend>';
    form += this.tone_fields();
    form += this.suite_fields();
    form += '</fieldset>';
    form += '<fieldset><legend>Durée de l\'exercice</legend>';
    form += this.tempi_fields();
    form += this.nb_mesures_fields();
    form += '</fieldset>';
    form += this.metrique_fields();
    form += this.types_fields();
    form += this.note_fields();
    form += this.buttons();
    form += '</div>';
    
    /* = Affichage et réglage formulaire = */
    $('body').append(form);
    // On peuple les menus
    with(Exercices.Edition){
      peuple_menu_suites_harmoniques('select#dbe_suite');
      types_populate('div#div_dbe_types', 'dbe_');
      peuple_menu_tones('select#dbe_tone');
    }
    var options_tempo = UI.options_from_to(40, 220);;
    $('select#dbe_tempo_min').html(options_tempo);
    $('select#dbe_tempo_max').html(options_tempo);
    $('select#dbe_nb_temps').html(UI.options_from_to(1, 12));
    
    // Observer sur le focus
    $('div#admindbe_form_ex input[type="text"]').bind('focus',function(evt){ evt.target.select()});
    this.form_is_built = true;
    return true;
  },
  // Les champs note(anglais et français)
  note_fields:function(){
    return '<fieldset><legend>Notes</legend>' +
            '<span class="libelle block">Français&nbsp;&nbsp;/&nbsp;&nbsp;Anglais</span>'+
            '<textarea id="dbe_note_fr" class="form" style="width:45%;"></textarea>'+
            '<textarea id="dbe_note_en" class="form" style="width:45%;"></textarea>'+
            '</fieldset>';
  },
  // Les boutons
  buttons:function(){
    var onclick = "return $.proxy(AdminDBE.save_exercice, AdminDBE)()";
    return '<div class="buttons">'+
            '<a href="#" class="big btn" onclick="'+onclick+'">Enregistrer</a>'+
            '</div>'
  },
  // Div pour choisir le dossier
  div_choose_folder:function(){
    return  '<div>'+
              '<div id="div_dbe_folder_exercice"></div>'+
              '<div id="div_dbe_choose_folder">' +
              '<a href="#" onclick="return $.proxy(AdminDBE.folder_list,AdminDBE,\'data/db_exercices\')()">Mettre dans…</a>'+
              '</div>'+
            '</div>';
  },
  close_button:function(){
    return '<a href="#" class="fright" onclick="$(\'div#admindbe_form_ex\').remove();return false;">Quitter</a>';
  },
  // Title fields
  title_fields:function(){
    return '<div id="div_affixe_field">' +
            '<span class="libelle">Nom fichier</span>'+
            '<span class="field">'+
              '<input type="text" id="dbe_affixe" />.yml &nbsp; '+
              '<a href="#" onclick="return AdminDBE.next_affixe();">suivant naturel</a>'+
            '</span>'+
            '</div>'+
            '<div id="div_title_fields">' +
            '<span class="libelle">Titre FR</span>'+
            '<span class="field"><input type="text" id="dbe_titre_fr" /></span>' +
            '<span class="libelle">Titre EN</span>'+
            '<span class="field"><input type="text" id="dbe_titre_en" /></span>' +
          '</div>';
  },
  // Plusieurs champs avec seulement une case à cocher
  checkboxes_fields:function(){
    var fields = '<fieldset id="dbe_fs_options"><legend>Options</legend>';
    for(var i in this.DBE_KEYS_CHECKBOXES){
      var k = this.DBE_KEYS_CHECKBOXES[i];
      fields += '<input type="checkbox" id="dbe_'+k+'" />' +
                '<label for="dbe_'+k+'">' + k + '</label>';
    }
    fields += '</fieldset>';
    return fields;
  },
  // Menu des tempi max et min
  tempi_fields:function(){
    return '<span class="libelle">Tempo max</span>'+
    '<span class="field"><select id="dbe_tempo_max" onchange="AdminDBE.onset_tempo_max(this.value)"></select></span>'+
    '<span class="libelle">Tempo min</span>'+
    '<span class="field"><select id="dbe_tempo_min"></select></span>';
  },
  // Pour le nombre de mesures
  nb_mesures_fields:function(){
    return '<span class="libelle">Nombre mesures</span>'+
            '<span class="field">'+
              '<input type="text" id="dbe_nb_mesures" style="width:100px;" onchange="this.value=AdminDBE.onset_nb_mesures(this.value)" />'+
            '</span>';
  },
  // Menu des tonalités
  tone_fields:function(){
    return '<span class="libelle">Tonalité</span>'+
            '<span class="field"><select id="dbe_tone"></select></span>';
  },
  // Menu des suites harmoniques
  suite_fields:function(){
    return  '<span class="libelle">Suite harm.</span>'+
            '<span class="field"><select id="dbe_suite"></select></span>';
  },
  types_fields:function(){
    return  '<fieldset id="admindbe_div_types">'+
              '<legend>Types</legend>'+
              '<a href="#" class="fright mini" onclick="return $.proxy(AdminDBE.decoche_all_types,AdminDBE)();">Tout décocher</a>'+
              '<div id="div_dbe_types"></div>'+
            '</fieldset>';
  },
  // Menu des tonalités
  // Champ pour le nom de mesures
  // Champs pour la métrique
  metrique_fields:function(){
    var opts_duree = "";
    var hduree = {1:"ronde", 2:"Blanche", 3:"Blanche .", 4:"Noire", 6:"Noire .",
                  8:"Croche", 12:"Croche ."};
    for(var nb in hduree){
      opts_duree += '<option value="'+nb+'">'+hduree[nb]+'</option>';
    }
    return '<fieldset id="admindbe_fs_metrique">'+
            '<legend>Métrique</legend>'+
            '<span class="libelle">Nombre de temps</span>'+
            '<span class="field"><select id="dbe_nb_temps" onchange="$.proxy(AdminDBE.onset_nb_or_duree_temps,AdminDBE)()"></select></span>'+
            '<span class="libelle">Durée du temps</span>'+
            '<span class="field"><select id="dbe_duree_temps" onchange="$.proxy(AdminDBE.onset_nb_or_duree_temps,AdminDBE)()">'+
              opts_duree + '</select></span>'+
            '<span class="libelle">Métrique</span>'+
            '<span class="field"><input type="text" id="dbe_metrique" style="width:60px;" /></span>'+
            '</fieldset>';
  }
}