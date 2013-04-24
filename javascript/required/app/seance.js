/*  Object Seance
    ---------------
    Gestion des séances de travail
*/
window.Seance = {
  ready     :false, // Set to true when form is ready
  
  // Open form to define working seance
  show_form:function(){
    this.prepare();
    // On fait disparaitre les exercices pour afficher le div
    UI.animout($('ul#exercices'));
    UI.animin($('section#seance_travail'));
    return false;//pour le a-lien
  },
  hide_form:function(){
    UI.animout($('section#seance_travail'));
    UI.animin($('ul#exercices'));
  },
  show_start:function(){
    
  },
  show_end:function(){
    
  },
  // Build the working seance
  building:false,
  build:function(){
    this.building = true;
    var params_seance = this.get_values();
    if( params_seance == null ) return this.building = false;
    console.dir(params_seance);
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
      F.show(this.data_seance.message);
      this.hide_form();
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
    return {
      working_time  :working_time,
      difficulties  :difficulties.join(','),
      obligatory    :$('input#seance_option_obligatory').is(':checked'),
      new_game      :$('input#seance_option_newgamme').is(':checked'),
      same_exercices:$('input#seance_option_sameex').is(':checked')
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