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
    'span#rapport_cal_by_tone_titre'    :'titre_by_tone',
    'span#rapport_cal_total_wk_libelle' :'total_working_time',
    'span#rapport_day_by_type_titre'    :'titre_by_type',
    'span#rapport_day_by_tone_titre'    :'titre_by_tone',
    'a#btn_cal_open_legend'             :'btn_open_legend',
    'a#btn_cal_open_by_ex'              :'btn_open_by_ex',
    'a#btn_cal_open_by_type'            :'btn_open_by_type',
    'a#btn_cal_open_by_tone'            :'btn_open_by_tone',
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
  
  /*  Main method to calculte all values and dispatch them
   *
   *  Used for month calculation. For a seance, use calculate_seance
   *
   */
  CALC_day            :null,    // Current day calculated (String YYMMDD)
  number_of_days      :null,    // Number of days of the period of report (set by ruby)
  days_until_today    :null,    // Number of days from first day of period of report
                                // until today. NULL if today is outside the period.
  days_for_average    :null,    // (calculated here) Number of day to considere to calc
                                // the average of time. Either the total number of days of
                                // the period or the number of days until today.
                                // @see set_number_days_for_average
  total_working_time  :null,
  seances             :null,
  exercices           :null,
  exercices_sorted    :null,
  types               :null,
  types_sorted        :null,
  tones               :null,
  tones_sorted        :null,
  /*  
   *  Starting Calculated method
   *  We must be sure that all exercices of the period are loaded. Then we
   *  can calculate all period values.
   */
  CALC:function(){
    this.set_number_days_for_average();
    this.CALC_init_all();
    this.CALC_load_all_exercices();
  },
  // Define the number of days to considere for the calc of average times
  set_number_days_for_average:function(){
    this.number_of_days = parseInt(this.data.number_of_days, 10);
    this.days_until_today = this.data.days_until_today;
    if(this.days_until_today != null){
      this.days_until_today = parseInt(this.days_until_today,10);
      this.days_for_average = this.days_until_today;
    }
    else this.days_for_average = parseInt(this.number_of_days,10);
  },
  // Cherche et appelle le chargement de tous les exercices qui 
  // ne sont pas chargé.
  // Id Est les exercices de sessions précédentes, exercices qui
  // ont été effacés.
  CALC_load_all_exercices:function(){
    var day, iex, idex, unloaded = [];
    for(day in this.data.seances){
      for(iex in this.data.seances[day].exercices){
        idex = this.data.seances[day].exercices[iex].id;
        if( !exercice(idex).loaded && unloaded.indexOf(idex) < 0) unloaded.push(idex);
      }
    }
    if( unloaded.length == 0 ) this.CALC_proceed();
    else Exercices.load(unloaded, $.proxy(this.CALC_proceed,this));
  },
  // When all exercices are loaded, we can proceed
  CALC_proceed:function(){
    for(var day in this.data.seances) this.CALC_seance(this.data.seances[day]);
    this.CALC_sort_values();
    // Maintenant, on peut construire le détail de la séance du jour
    Rapport.ByDay.build();
    
  },
  /*  Initialize all values to calculate
   *
   */
  CALC_init_all:function(){
    this.total_working_time = 0;
    [this.seances, this.exercices, this.types, this.tones] = [{}, {}, {}, {}];
    [this.exercices_sorted, this.types_sorted, this.tones_sorted] = [[],[],[]];
  },
  /*  Sort all values collected to define the <foo>_sorted properties
   *  of the report.
   */
  CALC_sort_values:function(){
    var idlist;
    var ids_list  = ['types', 'tones', 'exercices'];
    for(var ilist in ids_list){
      idlist  = ids_list[ilist];
      this[idlist+'_sorted'] = this.CALC_sort_list(this[idlist]);
    }
    for(var day in this.seances){for(var ilist in ids_list){
      idlist  = ids_list[ilist];
      this.seances[day][idlist+'_sorted'] = this.CALC_sort_list(this.seances[day][idlist]);
    }}
  },
  CALC_sort_list:function(list){
    list_to_sort = [];
    for(var id in list) list_to_sort.push([id, list[id].time]);
    list_to_sort.sort(function(a,b){return a[1] < b[1]});
    return list_to_sort;
  },
  /*  Calculate values for a seance (in fact a day)
   *
   *  @products Defines (incremente)
   *    day       :Day of the seance
   *    time      :Total working time of the seance (calculated on the exercices)
   *    tones     :Hash of data tones (cf. below)
   *    types     :Hash of data types (cf. below)
   *    exercices :Hash of data exercices (cf. below)
   *
   */
  CALC_seance:function(dseance){
    var idex;
    var day = dseance.day.toString();
    this.CALC_day = day;
    this.seances[day] = {
      day         :day,
      time        :0,
      exercices   :{},        // key=<ex id> value=<ex working time in seance>
      exercices_sorted:[],
      types       :{},        // key=<type id> valeur=<type working time in seance>
      types_sorted:[],
      tones       :{}, 
      tones_sorted:[]
    }
    for(var iex in dseance.exercices){
      idex = dseance.exercices[iex].id;
      this.CALC_exercice(dseance.exercices[iex]);
    }
  },
  /*  Calculates values of exercice from +hex+
   *
   *  @param    hex   An Hash containing :id, :time, :tone and :tone as Hash
   *                  recorded in the seance file.
   *
   *  @products
   *    - Initialize exercices[<id ex>] if needed
   *    - Add the working time of the ex in the total working time
   *    - Add the working time of the ex in the working time of current session calculated
   *    - Add the working time of the ex to the ex
   *    - Add exercices to seance
   *    - Add the tone of ex to tones + working time
   *    - Add the types of ex to types + working time
   */
  CALC_exercice:function(hex){
    var wtime   = hex.time;
    var idex    = hex.id;
    var wtone   = hex.tone;
    var seance  = this.seances[this.CALC_day];
    if('undefined'==typeof this.exercices[idex]) this.CALC_initialize_exercice(idex);
    var dex = this.exercices[idex];
    // Working time
    this.total_working_time += wtime;
    dex.time                += wtime;
    seance.time             += wtime;
    // Tempo
    if('undefined' == typeof dex.tempi[hex.tempo]) dex.tempi[hex.tempo] = 0;
    dex.tempi[hex.tempo] += wtime;
    if('undefined'==typeof seance.exercices[idex]) seance.exercices[idex] = {id:idex, time:0};
    seance.exercices[idex].time += wtime;
    // Types
    // -----
    for(var itype in dex.instance.types){
      var idtype = dex.instance.types[itype];
      if('undefined'==typeof seance.types[idtype])  seance.types[idtype]={id:idtype, time:0,exercices:[]};
      if('undefined'==typeof this.types[idtype])    this.types[idtype]  ={id:idtype, time:0,exercices:[]};
      seance.types[idtype].time += wtime;
      seance.types[idtype].exercices.push(idex);
      this.types[idtype].time += wtime
      this.types[idtype].exercices.push(idex);
    }
    // Tones
    // -----
    // @rappel: peu importe que l'exercice soit "à tonalité fixe", c'est toujours
    // la tonalité enregistrée dans le hex de l'exercice dans la séance qui définit
    // la tonalité à laquelle a été travaillé l'exercice.
    if('undefined'==typeof this.tones[wtone])   this.tones[wtone]   = {id:wtone, time:0,exercices:[]};
    if('undefined'==typeof seance.tones[wtone]) seance.tones[wtone] = {id:wtone, time:0,exercices:[]};
    if('undefined'==typeof dex.tones[wtone])    dex.tones[wtone]    = 0;
    this.tones[wtone].time += wtime;
    this.tones[wtone].exercices.push(idex);
    seance.tones[wtone].time += wtime;
    seance.tones[wtone].exercices.push(idex);
    dex.tones[wtone] += wtime;
  },
  /*  Initialize a new exercice calculated
   *
   */
  CALC_initialize_exercice:function(idex){
    this.exercices[idex] = {
      id: idex, instance:exercice(idex), time:0, tones:{}, tempi:{}
    }
  },
  /*
   * Main method which build divs for a sorted thing
   *
   * * PARAMS
   *    :sorted::     Sorted list containing paires with [id, time]
   *    :fx::         Building method. It must return the code HTML of the
   *                  div for the thing <id>.
   */
  building_loop:function(sorted, fx){
    var divs = "";
    for(var i in sorted){
      var id = sorted[i][0];
      divs += fx(id);
    }
    return divs;
  },
  // Return exercice list +ids+ as human list (whole title of exercices)
  exercices_as_human_list:function(ids){
    var list  = [];
    for(var i in ids) list.push(exercice(ids[i]).titre_complet());
    return '<div class="mini">'+list.join(', ')+'.</div>';
  },
  // Return average time of +time+ according to period days
  // @param   time    Total time
  // @param   as_f    If true (default:false) return a float number. Otherwise
  //                  return a clocktime
  average_for_time:function(time, as_f){
    var av = time / this.days_for_average;
    if(as_f == true) return av;
    return Time.seconds_to_horloge(av, false, ':', "'", '"');
  },
  /* -------------------------------------------------------------------
   *  Report methods for an exercice
   -------------------------------------------------------------------*/
  ByEx:{
    cur_day: null,
    
    /*  Build all divs for exercices of the current period (generaly the month)
     *
     */
    build_divs_of_month:function(){
      return Rapport.building_loop(Rapport.exercices_sorted, $.proxy(this.div_exercice_month,this));
    },
    /* Main -- Build divs for all exercices of session dseance
     *
     * C'est l'affichage du détail du jour sélectionné dans le calendrier, ou
     * le jour courant en fin de séance.
     *
     */
    build_divs_of_seance:function(dseance){
      this.cur_day = dseance.day;
      return Rapport.building_loop(
                Rapport.seances[dseance.day].exercices_sorted,
                $.proxy(this.div_exercice_seance, this)
                );
    },
    div_exercice_month:function(idex){
      return this.div_exercice(Rapport.exercices[idex]);
    },
    div_exercice_seance:function(idex){
      return this.div_exercice(Rapport.seances[this.cur_day].exercices[idex]);
    },
    /* Build the div-line for the exercice defined by +hex+
     *
     * @note:   +hex+ only contains specific information. To get all information
     *          about ex, we need Rapport.exercices[<id ex>]
     */
    div_exercice:function(hex){
      var gex;
      if('undefined' == typeof hex.instance) gex = Rapport.exercices[hex.id];
      else gex = hex;
      return  '<div class="rapport_div_ex">' +
                '<div class="fleft">' + gex.instance.vignette_listing() + '</div>' +
                '<div class="titre">' + gex.instance.titre_complet() + '</div>' +
                '<div class="time">' + 
                  LOCALE_UI.Label.Working_time + LOCALE_UI.colon +
                  '<span class="bold">'+Time.seconds_to_horloge(hex.time,true)+'</span>'+
                '</div>' +
                '<div class="types">' +
                  LOCALE_UI.Exercices.Edition.types_of_exercice + LOCALE_UI.colon +
                  gex.instance.types_as_human() +
                '</div>' +
                '<div style="clear:both;"></div>' +
              '</div>';
    }
  },
  /* -------------------------------------------------------------------
   *  Report methods for tones
   -------------------------------------------------------------------*/
  ByTone:{
    seance:null,                // current seance for building (in Rapport.seances)
    with_exercices_list:false,  // If true, return exercices list
    with_moyenne:false,         // If true, print the average time per day
    /*  Build display for current month
     *
     */
    build_divs_of_month:function(){
      this.with_exercices_list  =false;
      this.with_moyenne         =true;
      return Rapport.building_loop(Rapport.tones_sorted, $.proxy(this.div_tone_month,this));
    },
    build_divs_of_seance:function(seance){
      this.seance = Rapport.seances[seance.day];
      this.with_exercices_list  =true;
      this.with_moyenne         =false;
      return Rapport.building_loop(
          Rapport.seances[seance.day].tones_sorted,
          $.proxy(this.div_tone_seance,this)
        )
    },
    // Build the div for tone +idtone+ for the month
    div_tone_month:function(idtone){
      return this.div_tone(Rapport.tones[idtone]);
    },
    // Build div for tone +idtone+ for current seance
    div_tone_seance:function(idtone){
      return this.div_tone(this.seance.tones[idtone]);
    },
    
    // Return the div for tone +idtone+
    div_tone:function(hex){
      var idtone = hex.id;
      var div = '<div>' +
        '<span class="legend_tone">' +
          '<span class="tone">' + IDSCALE_TO_HSCALE[idtone]['double'] + '</span>' +
          '<span class="time">' + 
            Time.seconds_to_horloge(hex.time,true) + this.moyenne_for(hex) + 
          '</span>';
      if(this.with_exercices_list) div += Rapport.exercices_as_human_list(hex.exercices);
      div += '</span>' + '</div>';
      return div;
    },
    // Return a string " (<time>/day)" for the tone +hex+
    moyenne_for:function(hex){
      if( ! this.with_moyenne) return "";
      return " ("+Rapport.average_for_time(hex.time)+"/"+LOCALE_UI.Label.day+")";
    }
  },
  
  /* -------------------------------------------------------------------
   *  Report methods for an difficulty type
   -------------------------------------------------------------------*/
  ByType:{
    seance:null,                // current seance for building (in Rapport.seances)
    with_exercices_list:false,  // If true, return exercices list
    with_moyenne:false,         // If true, print the average time per day
    /*  Build display for current month
     *
     */
    build_divs_of_month:function(){
      this.with_exercices_list  =false;
      this.with_moyenne         =true;
      return Rapport.building_loop(Rapport.types_sorted, $.proxy(this.div_type_month,this));
    },
    build_divs_of_seance:function(seance){
      this.seance = Rapport.seances[seance.day];
      this.with_exercices_list  =true;
      this.with_moyenne         =false;
      return Rapport.building_loop(
          Rapport.seances[seance.day].types_sorted,
          $.proxy(this.div_type_seance,this)
        )
    },
    // Build the div for type idtype for the month
    div_type_month:function(idtype){
      return this.div_type(Rapport.types[idtype]);
    },
    // Build div for type idtype for current seance
    div_type_seance:function(idtype){
      return this.div_type(this.seance.types[idtype]);
    },
    
    // Return the div for type +idtype+
    div_type:function(hex){
      var idtype = hex.id;
      var div = '<div>' +
        '<span class="legend_type">' +
          '<span class="legend_type_color" style="background-color:#'+Exercices.COLORS_FOR_TYPE[idtype]+'"></span>' +
          '<span class="type">' + Exercices.TYPES_EXERCICE[idtype] + '</span>'+
          '<span class="time">' + 
            Time.seconds_to_horloge(hex.time,true) + this.moyenne_for(hex) +
          '</span>';
      if(this.with_exercices_list) div += Rapport.exercices_as_human_list(hex.exercices);
      div += '</span>' + '</div>';
      return div;
    },
    // Return a string " (<time>/day)" for the type +hex+
    moyenne_for:function(hex){
      if( ! this.with_moyenne) return "";
      return " ("+Rapport.average_for_time(hex.time)+"/"+LOCALE_UI.Label.day+")";
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
      if ('undefined' == typeof seance_day) seance_day = Time.date_to_yymmdd(new Date);
      this.data_seance = Rapport.data.seances[seance_day];
      this.set_current_day(seance_day);
      this.build_seance();
    },
    
    /* Build report for seance of current day
     *
     * @produts  Defines content for exercice list and type list.
     */
    build_seance:function(){
      var data = this.data_seance;
      if('undefined'==typeof data || data == null) return ERROR.Rapport.no_data_for_day;
      $('div#rapport_day_by_ex_content').html(
        Rapport.ByEx.build_divs_of_seance(this.data_seance));
      $('div#rapport_day_by_type_content').html(
        Rapport.ByType.build_divs_of_seance(this.data_seance));
      $('div#rapport_day_by_tone_content').html(
        Rapport.ByTone.build_divs_of_seance(this.data_seance));
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
      
      // The new calc method
      Rapport.CALC();
      
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
      
      $('div#rapport_cal_by_ex_content').html(Rapport.ByEx.build_divs_of_month());
      $('div#rapport_cal_by_type_content').html(Rapport.ByType.build_divs_of_month());
      $('div#rapport_cal_by_tone_content').html(Rapport.ByTone.build_divs_of_month());
      $('span#rapport_cal_total_working_time').html(Time.seconds_to_horloge(Rapport.total_working_time,true));
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
      var i, temps = 0;
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
    }
  }
}