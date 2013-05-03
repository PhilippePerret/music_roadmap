/*
    Rapport de travail
    ------------------
    Object Rapport
    
*/
window.Rapport = {
  ready   :false,
  data    :null,    // data
  
  /*  Affichage du rapport de travail
  */
  show:function(params){
    this.prepare();
    UI.open_volet('rapport');
    this.load(); // par défaut, le rapport du mois
    return false;//for a-link
  },
  show_section:function(){
    UI.animin($('section#rapport'));
  },
  hide_section:function(){
    UI.animout($('section#rapport'));
    return false;//for a-link
  },
  loading: false,
  load:function(params){
    this.loading = true;
    if ('undefined'==typeof params) params = {};
    Ajax.query({
      data:{
        proc      :'rapport/load',
        rm_nom    :Roadmap.nom,
        mail      :User.mail,
        md5       :User.md5,
        options   :params
      },
      success:$.proxy(this.load_suite, this)
    });
    return false;
  },
  load_suite:function(rajax){
    if(false == traite_rajax(rajax)){
      this.data = rajax.data_rapport ;
      this.Cal.build();
    }
    this.loading = false;
  },
  
  LOCALES: {
    'div#rapport_titre'                 :'titre',
    'div#rapport_cal_legends_titre'     :'legends_titre',
    'a.btns_rapport_close'              :'btns_close',
    'span#rapport_cal_by_ex_titre'      :'titre_by_ex',
    'span#rapport_day_by_ex_titre'      :'titre_by_ex',
    'span#rapport_cal_by_type_titre'    :'titre_by_type',
    'span#rapport_cal_total_wk_libelle' :'total_working_time',
    'span#rapport_day_by_type_titre'    :'titre_by_type',
    'a#btn_cal_open_legend'             :'btn_open_legend',
    'a#btn_cal_open_by_ex'              :'btn_open_by_ex',
    'a#btn_cal_open_by_type'            :'btn_open_by_type',
    'span.per_month'                    :'per_month',
    'span#section_rapport_byday_titre'  :'rapport_du'
    
  },
  prepare:function(){
    if(this.ready) return;
    // Nom du jour de la semaine
    for(var i=0; i<7; ++i)$('td#calendar_day_name-'+i).html(LOCALE_UI.JOURS[i]);
    // Other Dom elements
    for(var jid in this.LOCALES) $('section#rapport '+jid).html(LOCALE_UI.Rapport[this.LOCALES[jid]]);
    this.ready = true;
  },
  
  /* -------------------------------------------------------------------
   *  Report methods for tunes
   -------------------------------------------------------------------*/
  ByTune:{
    tunes         :null,
    tunes_sorted  :null,
    
    // Get tunes of seance
    tunes_of_seance:function(dseance){
      var hex, htune;
      if(this.tunes==null)this.tunes={};
      for(var i in dseance.exercices){
        hex = dseance.exercices[i];
      }
    },
    // Sort tunes by working times
    sort_tunes:function(){
      this.tunes_sorted = [];
      for(var idtune in this.tunes)this.tunes_sorted.push([idtune, this.tunes[idtune].time]);
      this.tunes_sorted.sort(function(a,b){return a[1] < b[1]});
    }
  },
  /* -------------------------------------------------------------------
   *  Report methods for an exercice
   -------------------------------------------------------------------*/
  ByEx:{
    /* Hash of exercices
     * An hash where key is the exercice ID and value is a hash with:
     *  id:<ex ID>, time:<total working time>, tempi:<sorted tempos>,
     *  instance:<Exercice instance>
     *
     */
    exercices:null,
    
    /*  Exercices sorted by working time
     *  An Array of arrays containing [<ex id>, <working time>]
     */
    exercices_sorted:null,
    
    /*  Total working time (used for build month)
     */
    total_working_time:null,
    
    /*
     * main to build the exercice list of the whole month
     */
    build_month:function(){
      this.exercices = {};
      this.total_working_time = 0;
      for(var day in Rapport.data.seances)this.build_exercices_of_seance(Rapport.data.seances[day], true);
      return this.build_divs();
    },
    /* Main -- Build divs for all exercices of session dseance
     *
     */
    build_exercices_of_seance:function(dseance, onlydata){
      var onlydata = 'undefined'!=typeof(onlydata) && onlydata == true;
      if(!onlydata){this.exercices = {};this.total_working_time=0}
      this.ary_exercices_to_hash(dseance); // => this.exercices
      if(!onlydata) return this.build_divs();
    },
    
    /*
     * Build all divs of exercices
     *
     * @products    Also calculates the total working time
     */
    build_divs:function(){
      var i, divs = "";
      this.sort_exercices();
      for(i in this.exercices_sorted){
        this.total_working_time += this.exercices_sorted[i][1];
        divs += this.div_exercice(this.exercices[this.exercices_sorted[i][0]]);
      }
      return divs;
    },
    /* Build the div-line for the exercice +hex+
     *
     */
    div_exercice:function(hex){
      return  '<div class="rapport_div_ex">' +
                '<div class="fleft">' + hex.instance.vignette_listing() + '</div>' +
                '<div class="titre">' + hex.instance.titre_complet() + '</div>' +
                '<div class="time">' + 
                  LOCALE_UI.Label.Working_time + LOCALE_UI.colon +
                  '<span class="bold">'+Time.seconds_to_horloge(hex.time,true)+'</span>'+
                '</div>' +
                '<div class="types">' +
                  LOCALE_UI.Exercices.Edition.types_of_exercice + LOCALE_UI.colon +
                  hex.instance.types_as_human() +
                '</div>' +
                '<div style="clear:both;"></div>' +
              '</div>';
    },
    /* Defines the `exercices' property (@see property definition above)
     *
     */
    ary_exercices_to_hash:function(dseance){
      var i, hex;
      for(i in dseance.exercices){
        hex = dseance.exercices[i];
        dex = this.exercices[hex.id];
        if('undefined' == typeof dex){
          this.exercices[hex.id] = {
            id:hex.id, time:0, tempi:[], instance:exercice(hex.id)
          }
          dex = this.exercices[hex.id];
        }
        dex.time += hex.time;
        if(dex.tempi.indexOf(hex.tempo) < 0) dex.tempi.push(hex.tempo);
      }
      // Sort tempi
      for(var idex in this.exercices)this.exercices[idex].tempi.sort();
    },
    sort_exercices:function(){
      this.exercices_sorted = [];
      for(var idex in this.exercices)this.exercices_sorted.push([idex, this.exercices[idex].time]);
      this.exercices_sorted.sort(function(a,b){return a[1] < b[1]});
    }
  },
  /* -------------------------------------------------------------------
   *  Report methods for an difficulty type
   -------------------------------------------------------------------*/
  ByType:{
    types:null,
    types_sorted:null,
    options:{
      with_exercices_list :true,
      init_all            :false,
      build_divs_type     :false
      },
    
    /*  Build display for current month
     *
     */
    build_month:function(){
      this.options.with_exercices_list  = false;
      this.options.init_all             = false;
      this.options.build_divs_type      = false;
      this.types = {};
      for(var day in Rapport.data.seances)this.build_seance(Rapport.data.seances[day]);
      return this.build_all_divs_type();
    },
    
    /*  Build display for seance +dseance+
     *  Either for day-display or month-display
     */
    build_seance:function(dseance, options){
      if('undefined' != typeof options){for(var k in options)this.options[k] = options[k];}
      if(this.options.init_all){this.types={};this.types_sorted=[];}
      this.ary_exercices_to_types_hash(dseance);//=>types et types_sorted
      if(this.options.build_divs_type) return this.build_all_divs_type();
    },
    build_all_divs_type:function(){
      this.sort_by_type();
      if(this.types_sorted == null || this.types_sorted.length == 0)return "";
      var divs = ""
      for(var i in this.types_sorted){
        divs += this.build_div_type(this.types_sorted[i][0]);
      }
      return divs;
    },
    // Return the div for type +idtype+
    build_div_type:function(idtype){
      return '<div>' +
              '<span class="legend_type">' +
                '<span class="legend_type_color" style="background-color:#'+Exercices.COLORS_FOR_TYPE[idtype]+'"></span>' +
                '<span class="type">' + 
                  Exercices.TYPES_EXERCICE[idtype] +
                '</span>'+
                '<span class="time">' +
                  Time.seconds_to_horloge(this.types[idtype].time,true) + 
                '</span>' +
                this.exercices_as_human_list(idtype) +
              '</span>' +
              '</div>';
    },
    exercices_as_human_list:function(idtype){
      if(this.options.with_exercices_list == false) return "";
      var list  = [];
      var exs   = this.types[idtype].exercices;
      for(var i in exs) list.push(exercice(exs[i]).titre_complet());
      return '<div class="mini">'+list.join(', ')+'.</div>';
    },
    ary_exercices_to_types_hash:function(dseance){
      var i, hex, itype, idtype, htype;
      for(i in dseance.exercices){
        hex = dseance.exercices[i];
        iex = exercice(hex.id);
        if(iex.types == null) continue;
        for(itype in iex.types){
          idtype = iex.types[itype];
          if('undefined' == typeof this.types[idtype]){
            this.types[idtype] = {id:idtype, time:0, exercices:[]}
          }
          htype = this.types[idtype];
          htype.time += hex.time;
          if(htype.exercices.indexOf(hex.id) < 0) htype.exercices.push(hex.id);
        }
      }
    },
    // Sort by working time
    sort_by_type:function(){
      // prepare types_sorted
      this.types_sorted = [];
      for(var idtype in this.types)this.types_sorted.push([idtype, this.types[idtype].time]);
      this.types_sorted.sort(function(a,b){return a[1] < b[1]});
    }
  },
  
  /* -------------------------------------------------------------------
   *  Building of the By-Day Report
   *
   *  Display report for the selected day in the calendar.
   *
   -------------------------------------------------------------------*/
  ByDay: {
    data_seance:null,       // Data of the day to display
    /*
     *  Main build method
     *
     *  Building a listing of each exercice played during the seance +seance_name+
     *
     * @param   seance_name   String YYMMDD of the seance to display. If not provided
     *                        the seance of current day.
     */
    build:function(seance_day){
      if ('undefined' == typeof seance_day){
        var today = new Date();
        seance_day = Time.date_to_yymmdd(new Date);
      }
      this.data_seance = Rapport.data.seances[seance_day];
      this.set_current_day(seance_day);
      this.build_seance();
    },
    
    /* Build report for seance of data +data+
     *
     * @produts  Defines content for exercice list and type list.
     */
    build_seance:function(){
      var data = this.data_seance;
      if('undefined'==typeof data || data == null) return ERROR.Rapport.no_data_for_day;
      $('div#rapport_day_by_ex_content').html(
        Rapport.ByEx.build_exercices_of_seance(this.data_seance));
      var opts = {with_exercices_list:true, init_all:true,build_divs_type:true};
      $('div#rapport_day_by_type_content').html(
        Rapport.ByType.build_seance(this.data_seance,opts));
    },    
    // Set current day to all span.per_day
    set_current_day:function(yymmdd){
      $('span.per_day').html(Time.ymd_to_d_m_y(yymmdd));
    }
  },
  // -------------------------------------------------------------------
  //  Building Month Report
  // -------------------------------------------------------------------
  Cal: {
    
    /* Temps maximum dans une cellule
     * Par défaut, on peut mettre 6 heures de travail dans la cellule sur l'axe Y.
     * Ce nombre peut être modifié par les options/préférences de l'utilisateur.     */
    TEMPS_MAX_IN_CELL     :6*3600,
    /* Hauteur en pixel d'une cellule du calendrier
     * On la lit dans le document pour adapter exactement les blocs (colonnes-div)
     * de temps de travail */
    HEIGHT_CELL_DAY       :null,
    /* Valeur du pixel en seconde
     * Calculé d'après les deux pseudo-constantes précédentes, permet de connaitre
     * la taille d'une durée en pixels */
    PIXELS_PER_SECOND     :null,
    /* Largeur d'une colonne pour le temps total de travail en pixels */
    WIDTH_COL_WORKING_TIME: 30,
    WIDTH_COL_PER_TYPE    : 10,       // Largeur des colonne pour le temps par type
    types_used_in_month   :null,     // Liste des types utilisés dans le mois
    
    cur_week_day:null,                // "Week-day" of current selection (default:today)
    
    /* Building month report
     *
     * @note:   Calls ByDay.build at the end of process with the current day, to build
     *          the "by-exercice" report.
     */
    build:function(){
      var iweek, iday, seance_name, td, today_number, day_number = 0;
      this.numerote_days();
      this.set_month(Rapport.data.month);
      this.calc_pixel_per_second();
      this.types_used_in_month = ['WT'];
      today_number = new Date().getDate();
      var firstday = Rapport.data.first_month_day;
      var lastday  = Rapport.data.last_month_day;
      for(iweek = 0; iweek < 5; ++iweek){
        for(iday = 0; iday < 7; ++iday){
          if ((iweek == 0 && iday < firstday) || (iweek == 4 && iday > lastday)) continue;
          day_number += 1;
          seance_name = Time.yymmdd(Rapport.data.year, Rapport.data.month+1, day_number);
          if(day_number == today_number)this.select(iweek,iday);
          td = $('td#calendar_day-'+iweek+'-'+iday);
          td.find('div.calendar_day_content').html(this.cell_temps_travail_jour(seance_name));
        }
      }
      this.legende_types();
      $('div#rapport_cal_by_type_content').html(Rapport.ByType.build_month());
      $('div#rapport_cal_by_ex_content').html(Rapport.ByEx.build_month());
      $('span#rapport_cal_total_working_time').html(Time.seconds_to_horloge(Rapport.ByEx.total_working_time,true));
      Rapport.ByDay.build();
    },

    /*  Open a division (legend, details per exercice, etc.) in cal section
     *
     */
    open:function(key){
      $('div#rapport_cal_'+key).slideToggle();
      return false;
    },
    /* Method called when we click on a day in the calendar
     *
     * @param   rowcol    The row and the col of the day clicked ("row-col").
     *                    Is the i-week and i-day value in the table.
     *
     * @products:   Display the seance of the day.
     */
    onclick_cell:function(rowcol){
      var isem, iday;
      [isem, iday] = rowcol.split('-');
      this.select(isem,iday);
      Rapport.ByDay.build(this.day_of_cell(isem,iday));
    },
    
    select:function(iweek, iday){
      if(this.cur_week_day != null) $('td#calendar_day-'+this.cur_week_day).removeClass('selected');
      this.cur_week_day = iweek+'-'+iday;
      $('td#calendar_day-'+this.cur_week_day).addClass('selected');
    },
    
    // Return the YYMMDD of day of cell iweek-iday
    day_of_cell:function(iweek,iday){
      iweek = parseInt(iweek,10); iday = parseInt(iday,10);
      var jour = (iday + (iweek * 7) - Rapport.data.first_month_day + 1).toString() ;
      if(jour.length < 2) jour = "0"+jour;
      var mois = (Rapport.data.month+1).toString();
      if(mois.length < 2) mois = "0"+mois;
      var year = Rapport.data.year.toString().substring(2);
      console.log("Jour : "+year+mois+jour);
      return year+mois+jour;
    },

    // Affichage de la légende des types utilisés au cours du mois
    legende_types:function(){
      var divs = "", idtype, i;
      for(i in this.types_used_in_month){
        idtype = this.types_used_in_month[i];
        divs += '<span class="legend_type">' +
                '<span class="legend_type_color" style="background-color:#'+Exercices.COLORS_FOR_TYPE[idtype]+'"></span>' +
                '<span class="legend_type_name">'+Exercices.TYPES_EXERCICE[idtype]+'</span>' +
                '</span>';
      }
      $('div#rapport_cal_legends').html(divs);
    },
    
    cell_temps_travail_jour:function(seance_name){
      var dseance = Rapport.data.seances[seance_name];
      if ('undefined' == typeof dseance) return "";
      
      // La colonne pour la durée de travail de la séance
      var div_temps_travail = this.div_col_working_time_jour(dseance);

      // Le texte du temps de travail
      var div_temps_travail_string = this.div_str_working_time_jour(dseance);
      
      // Les colonnes pour la durée de travail par type d'exercice
      var divs_types  = this.divs_col_per_types(dseance);
      
      return div_temps_travail_string + divs_types + div_temps_travail;
    },
    
    // Retourne le nombre de pixels en hauteur pour le temps donné
    seconds_to_height:function(tps){
      var h = parseInt(tps * this.PIXELS_PER_SECOND, 10);
      if (h < 4) h = 4;
      return h;
    },
    
    // Retourne le div affichant en clair la durée de travail du jour
    div_str_working_time_jour:function(dseance){
      var horloge = Time.seconds_to_horloge(dseance.working_time, complet=true);
      return '<div class="str_wk">'+horloge+'</div>';
    },
    
    // Retourne le div-colonne pour la durée de travail du jour
    div_col_working_time_jour:function(dseance){
      var temps_travail = this.temps_travail_seance(dseance);
      Rapport.data.seances[dseance.day].working_time = temps_travail;
      var hdiv = this.seconds_to_height(temps_travail);
      var mgt = this.HEIGHT_CELL_DAY - hdiv;
      var sty = [];
      sty.push("width:"+this.WIDTH_COL_WORKING_TIME+"px");
      sty.push('height:'+hdiv+'px');
      sty.push('margin-top:'+mgt+'px');
      sty.push('background-color:#'+Exercices.COLORS_FOR_TYPE['WT']);
      return '<div class="col_wk" style="'+sty.join(';')+';"></div>';
    },
    
    // Retourne les divs contenant les colonnes par type.
    divs_col_per_types:function(dseance){
      var ary_types  = this.sort_worked_types(dseance).reverse();
      divs = "";
      for(var itype in ary_types){
        var dtype = ary_types[itype];
        var idtype = dtype[0];
        if(this.types_used_in_month.indexOf(idtype)<0)this.types_used_in_month.push(idtype);
        divs += this.div_temps_travail_type({id:idtype,time:dtype[1],index:itype});
      }
      return divs;
    },
    /* Return total working time for the seance +dseance+
     *
     * @param   dseance   Hash des données telles que remontées par ajax, c'est-à-dire
     *                    les données du fichier marshal de la séance.
     *
     * @return Number of secondes for the session
     *
     * @note:   Calculated with the time of exercices
     *
     */
    temps_travail_seance:function(dseance){
      return this.temps_travail_seance_par_exercices(dseance);
    },
    temps_travail_seance_par_exercices:function(dseance){
      var i, hex, temps = 0;
      for(i in dseance.exercices) temps += dseance.exercices[i].time;
      return temps;
    },
    // @param   htype    Hash containing {id:<id du type>, time:<temps de travail>, index:<indice>}
    div_temps_travail_type:function(htype){
      var sty = [];
      var hdiv = parseInt(this.PIXELS_PER_SECOND * htype.time,10);
      if(hdiv < 4) hdiv = 4;
      var mgt = this.HEIGHT_CELL_DAY - hdiv;
      sty.push('width:'+this.WIDTH_COL_PER_TYPE+'px');
      sty.push('margin-top:'+mgt+'px');
      sty.push('height:'+hdiv+'px');
      sty.push('background-color:#'+Exercices.COLORS_FOR_TYPE[htype.id]);
      return '<div class="col_ty" style="'+sty.join(';')+'"></div>';
    },
    // Retourne les 6 types (ou moins si moins de types) les plus travaillés
    // au cours de la séance. 
    // @return Un Array d'élément Array contenant [<id du type>, <temps de travail>]
    sort_worked_types:function(dseance){
      var data_per_type = {};
      for(var index in dseance.exercices){
        var hex = dseance.exercices[index];
        var iex = exercice(hex.id);
        var types_ex = iex.types;
        for(var itype in types_ex){
          var type = types_ex[itype];
          if('undefined' == typeof data_per_type[type])data_per_type[type] = 0;
          data_per_type[type] += hex.time;
        }
      }
      // On classe les types par temps de travail, pour ne garder que les
      // N (6) types les plus travaillés
      ary_to_sort = [];
      for(var idtype in data_per_type){
          ary_to_sort.push([idtype, data_per_type[idtype]]);
      }
      ary_to_sort.sort(function(a,b){return a[1]<b[1]});
      ary_to_sort
      ary_to_sort = ary_to_sort.slice(0,6);
      
      return ary_to_sort;
    },
    calc_pixel_per_second:function(){
      this.HEIGHT_CELL_DAY = $('td.calendar_day').height();
      this.PIXELS_PER_SECOND = this.HEIGHT_CELL_DAY / this.TEMPS_MAX_IN_CELL;
    },
    
    // Show previous or next month
    previous:function(){return this.sibling(false)},
    next:function(){    return this.sibling(true)},
    sibling:function(next){
      var year, month;
      year  = Rapport.data.year;
      month = Rapport.data.month;
      if (next && month == 11){month = 0; year += 1}
      else if (next == false && month == 0){month = 11;year -= 1} 
      else month += next ? 1 : -1;
      Rapport.load({month:month+1, year:year});
      return false;//for a-link
    },
    // Return TD id of day iweek-iday
    td_id:function(iweek,iday){
      return 'td#calendar_day-'+iweek+'-'+iday;
    },
    // Show/Hide a day TD
    show_day:function(iweek,iday){UI.set_visible(this.td_id(iweek,iday))},
    hide_day:function(iweek,iday){UI.set_invisible(this.td_id(iweek,iday))},
    // Réglage du nom du mois courant
    set_month:function(imonth){
      $('span#calendar_current_month').html(
        LOCALE_UI.MOIS[imonth].toUpperCase() + ' ' + Rapport.data.year);
    },
    // Numérote et cache les jours du mois
    numerote_days:function(){
      var iweek, iday;
      var hidden_day, day_number = 0;
      for(iweek = 0; iweek < 5; ++iweek){
        for(iday = 0; iday < 7; ++iday){
          hidden_day = false;
          if (iweek == 0 || iweek == 4){
            hidden_day = (iweek == 0 && iday < Rapport.data.first_month_day) || (iweek == 4 && iday > Rapport.data.last_month_day);
            if(hidden_day) this.hide_day(iweek,iday);
            else this.show_day(iweek,iday);
          }
          if( !hidden_day ){
            day_number += 1; 
            $(this.td_id(iweek,iday)+' div.calendar_day_number').html(day_number);
          }
        }
      }
    },
  }
}