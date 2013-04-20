/*
    Métronome
    ---------
*/

window.Metronome = {
  class                 : "Metronome",
  playing               :false,   // Mis à true quand le métronome joue
  clics_interval        : null,   // L'interval exact entre les clics suivant
                                  // le tempo.
  next_clic             : null,   // Le time exact du prochain click
  checker               : null,   // Timer setInterval
  tempo                 : null,   // Le tempo courant
  son                   : null,   // Le son du métronome (objet audio HTML5)
  odd_son               : false,  // Pour alterner d'un son à l'autre
  
  // Appelée quand on lance le métronome (bouton Play)
  start: function(tempo){
    BT.add("-> Metronome.start (this = "+this.class+")") ;
    if ( this.playing && parseInt(tempo,10) == this.tempo ) return ; // rien à faire
    // Le son doit-il être chargé ?
    if ($('#son_metronome').length == 0) this.Clic.load_sounds() ;
    // On calcule le prochain click (@note: la première fois, on va le
    // chercher assez loin pour avoir le temps)
    this.tempo = parseInt(tempo,10) ;
    // Régler le sound en fonction du tempo
    this.Clic.set_sound_by_tempo() ;
    // Calculer l'intervale et le prochain clic
    this.calc_next_clic_and_intervals() ;
    // On met en route l'animation
    UI.start_metronome() ;
    // On lance le checker s'il n'est pas encore lancé
    if ( this.checker == null ) this.run_checker() ;
    this.playing  = true ;
  },
  // Actualise (convenient name but = start)
  update: function( new_tempo ){
    this.start(new_tempo) ;
  },
  stop: function(){
    if ( this.checker != null ){ 
      clearInterval(this.checker) ;
      this.checker  = null ;
    }
    this.tempo    = null ;
    this.playing  = false ;
    UI.stop_metronome() ;
  },
  // Lancer le checker à la milliseconde qui va attendre le prochain clic
  // Note: c'est ce checker qui "tourne" même lorsqu'on change d'exercice
  // ou de tempo
  run_checker: function(){
    if(DEBUG) console.log("-> Lancement du checker") ;
    this.checker = setInterval("Metronome.check()", 1) ;
  },
  // Appelée toutes les millisecondes pour voir s'il faut jouer le son
  // du métronome. Et calcule la nouvelle position
  check: function(){
    if ( (now = new Date().valueOf() ) >= this.next_clic ){
      // --- débug ---
      var offset = now - this.next_clic ;
      // --- / débug -- 
      this.Clic.clic() ;
      this.next_clic += this.clics_interval ;
      // --- Débug ---
      if(DEBUG) console.log(
        offset + " = décalage (devrait être ~ 0)\n" +
        now + " = NOW\n" + 
        this.next_clic + " = prochain clic\n" +
        (this.next_clic - now) + " = Interval") ;
      // --- /Débug ---
    }
  },
  // Méthode qui calcule, suivant le tempo (this.tempo), l'intervalle en
  // millisecondes entre chaque clic et le time du prochain click
  calc_next_clic_and_intervals: function(){
    this.clics_interval = parseInt(1000 / this.tempo * 60, 10) ;
    if(DEBUG) console.log("Interval entre les clics : " + this.clics_interval ) ;
    // On cherche le premier clic dans x secondes (1 pour voir)
    var first_interval = 0 ;
    while ( first_interval < 1000 ) first_interval += this.clics_interval ;
    var now = (new Date()).valueOf() ;
    this.next_clic = now + first_interval ;
    if(DEBUG) console.log(now + " = Temps départ (maintenant)\n" + this.next_clic + " = Premier clic") ;
  },
  
  // Sous-objet Metronome.Clic
  Clic: {
    sound_name  : null,   // Nom du son courant
    son         : null,   // Référence à Metronome.son
    son2        : null,   // Référence à Metronome.son2
    odd_son     : false,  // Pour alterner
    // Joue le son
    clic : function(){
      this.son.pause();
      this.son.currentTime = 0 ;
      this.son.play();
    },
    // Change le volume (de 0 à 1 — 0.1, 0.2 etc.)
    change_volume: function( amount ){
      this.son.volume += parseFloat(amount) ;
    },
    up_volume     : function(){this.change_volume(0.1)},
    down_volume   : function(){this.change_volume(-0.1)},
    
    /*
        Pour changer le son
        -------------------
        C'est nécessaire car pour le moment, un même son ne fonctionne pas
        pour tous les tempos
    */
    set_sound_by_tempo: function(){
      if(DEBUG) console.log("-> set_sound_by_tempo") ;
      var tempo = Metronome.tempo ;
      var name ;
      if      ( tempo > 110)  name = "normal.wav" ; // petits problème de 110 à 116 (compris)
      else if ( tempo > 116)  name = "court.wav"
      else if ( tempo > 85 )  name = "metro.wav" ;
      else if ( tempo > 78 )  name = "metro79-85.wav" ;  // 79 à 85 PAS BON
      else                    name = "court.wav" ;
      if ( name != this.sound_name ){
        this.son.src  = this.path( name ) ;
        this.son.load() ;
        this.son2.src = this.path( name ) ;
        this.son2.load() ;
        if(DEBUG) console.log("Le son utilisé pour le tempo " + tempo + " est mis `"+name+"'") ;
        this.sound_name = name.toString();
      }
    },
    // Pose les balise audio dans le document
    load_sounds: function(){
      // OGG -- mais pourra être changé par set_sound
      $(document.body).append('<audio id="son_metronome" src="./utils/son/metronome/court.ogg" preload="auto" />');
      $(document.body).append('<audio id="son2_metronome" src="./utils/son/metronome/court.ogg" preload="auto" />');
      this.son  = Metronome.son  = document.getElementById('son_metronome') ;
      this.son2 = Metronome.son2 = document.getElementById('son2_metronome') ;
    },
    // => Retourne le path du son de nom +name+
    // @param   name    Le nom du fichier, avec l'extention
    path: function( name ){return "utils/son/metronome/" + name },
  },
}
