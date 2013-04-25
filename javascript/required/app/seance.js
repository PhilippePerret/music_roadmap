/*  Object Seance
    ---------------
    Gestion des séances de travail
*/
window.Seance = {
  ready     :false, // Set to true when form is ready
  
  // Run seance
  start:function(){
    F.show("On commence la séance de travail !");
    this.hide_section();
  },
  // Open section Seance (hidding exercices)
  show_section:function(not_hidden){
    UI.set_invisible('ul#exercices');
    UI.animin($('section#seance_travail'));
    $(['seance_form', 'seance_start', 'seance_end']).map(function(i,key){
      if (key != not_hidden) UI.animout($('div#'+key));
      else UI.animin($('div#'+key));
    });
  },
  // Close section Seance (revealing exercices)
  hide_section:function(){
    UI.animout($('section#seance_travail'));
    UI.set_visible('ul#exercices');
  },
  // Open form to define working seance
  show_form:function(){
    this.prepare();
    this.show_section('seance_form');
    return false;//pour le a-lien
  },
  hide_form:function(for_good){
    if('undefined' == typeof for_good) for_good = true;
    if(for_good) this.hide_section();
    else UI.animout($('div#seance_form'));
    return false;//for a-link
  },
  show_start:function(){
    this.hide_form(false);UI.animin($('div#seance_start'))},
  hide_start:function(){
    UI.animout($('div#seance_start'))},
  show_end:function(){
    this.show_section('seance_end')},

  // Build the working seance
  building:false,
  build:function(){
    this.building = true;
    var params_seance = this.get_values();
    if( params_seance == null ) return this.building = false;
    // console.dir(params_seance);
    Ajax.query({
      data:{
        proc          :'seance/build',
        rm_nom        :Roadmap.nom,
        user_mail     :User.mail,
        user_md5      :User.md5,
        params_seance :params_seance
      }, 
      success:$.proxy(this.build_suite, this)
    });
    return false;//pour le a-lien
  },
  // Retour ajax de la précédente
  build_suite:function(rajax){
    if(false==traite_rajax(rajax)){
      this.data_seance = rajax.data_seance ; // les données pour la séance
      $('div#seance_start_description').html(this.data_seance.message);
      this.hide_form(false);
      this.show_start();
    }
    this.building = false;
  },
  // Relève les data du formulaire
  get_values:function(){
    // Working time
    var hrs = parseInt($('select#seance_duree_heures').val());
    var mns = parseInt($('select#seance_duree_minutes').val());
    var working_time = hrs * 60 + mns ;
    if (working_time == 0){
      F.error(ERROR.Seance.no_working_time);
      return null;
    }
    // Difficulties
    var difficulties = Exercices.Edition.pickup_types('sw');
    var options      = {};
    $(['obligatory', 'new_scale', 'same_ex', 'next_config']).map(function(itm,key){
        options[key] = $('input#seance_option_'+key).is(':checked');
    });
    return {
      working_time  :working_time,
      difficulties  :difficulties.join(','),
      options       :options
    }
  },
  // Prepare the form
  prepare:function(){
    if (this.ready) return false;
    this.localize_form();
    this.prepare_menu_heures();
    this.prepare_menu_minutes();
    this.prepare_types_exercices();
    this.ready = true;
  },
  // Set the localized texte in form
  localize_form:function(){
    // @TODO:
  },
  prepare_types_exercices:function(){
    var o = $('div#seance_form_types');
    Exercices.Edition.types_populate(o, 'sw');
  },
  prepare_menu_heures:function(){
    var o = $('select#seance_duree_heures');
    for(var i=0; i<10; ++i) o.append('<option value="'+i+'">'+i+'</option>');
  },
  prepare_menu_minutes:function(){
    var istr, o = $('select#seance_duree_minutes');
    for(var i=0; i<60; ++i){
      istr = i.toString();
      if(i<10) istr = "0"+istr;
      o.append('<option value="'+i+'">'+istr+'</option>');
    }
  }
}