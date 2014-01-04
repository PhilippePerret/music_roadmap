/**
  * @module UI_shortcuts
  *
  * @class UI.Shortcuts
  * @static
  */
if(undefined == window.UI) UI = {}
UI.Shortcuts = {
  current:null,           // Current table for display
  /*
      Main function to call
      Build a "shortcuts table" in +conteneur+ with +data+
      
      @param  conteneur     A JID (tag#id)
      @param  data          An Hash containing:
                            shortcuts:    List of shortcuts (see `build_table' below)
                                          OR String Key in SHORTCUTS (cf. in 'locale')
                            options:      Hash of options containing:
                                current:      (bool) If true, current shortcuts for
                                              display the "panic window of shorcuts"
                                open:         (bool) If true, the table is opened
  */
  build:function(conteneur,data){
    if('undefined'==typeof data.options){
      data.options = {open:true, current:false};
    }
    data.options.id = conteneur.split('#')[1];
    var tbl_shortcuts = this.build_table(data.shortcuts,data.options);
    $(conteneur).html(tbl_shortcuts);
    if (data.current == true) this.current == tbl_shortcuts;
  },
  /* Construction de la table à partir des données +data+
  
    @param  data    Un Array contenant des Hash contenant:
                    (OU la clé dans SHORTCUTS avec en valeur les données)
                    key:        Le raccourci. Soit un string si c'est une touche seule
                                soit un Array des touches. Ce sont les noms simples,
                                par exemple "S" pour la touche "s" correspondant à 
                                l'image du dossier img/clavier/ (K_S.png)
                    effect:     L'effet. String.
    @param  options   Hash of options
                      id:       ID of the conteneur (NOT jid, only ID)
                      open:     If false, the table is hidden
  */
  build_table:function(data, options){
    if('string'==typeof data) data = SHORTCUTS[data];
    if('undefined'==typeof options.open) options.open = true;
    var tbl_id = "shortcuts_"+options.id;
    var tbl = '<div class="table_shortcuts" id="'+tbl_id+'">';
    tbl += this.title_link(tbl_id);
    var disp = options.open ? 'block':'none';
    tbl += '<div class="shortcuts" style="display:'+disp+';">';
    for(var i in data){
      var hdata = data[i];
      tbl += '<div class="shortcut">' +
                '<span class="key">'+this.images_keys(hdata.key)+'</span>' +
                '<span class="effect">'+hdata.effect+'</span>'+
              '</div>';
    }
    tbl += '</div>'; // fin de la liste des shortcuts
    tbl += '</div>'; // fin de la table
    return tbl;
  },
  // Return the title link (to open/close shortcut list)
  title_link:function(tbl_id){
    var jdiv = "$('div#"+tbl_id+" div.shortcuts')";
    return  '<div class="titre">' +
              '<a href="#" onclick="'+jdiv+'.slideToggle();return false;">' +
              LOCALE_UI.Shortcut.titre + '</a>' +
            '</div>';
  },
  // Retourne les images des touches
  images_keys:function(keys){
    var imgs = "";
    if(keys.indexOf(' ') > -1) keys = keys.split(' ')
    if('string' == typeof keys) keys = [keys];
    for(var i in keys){
      var src = UI.path_image('clavier/K_'+keys[i]+'.png');
      imgs += '<img class="shortcut" src="'+src+'" />';
    }
    return imgs;
  }
  
}