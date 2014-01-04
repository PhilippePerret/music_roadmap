/**
  * @module UI_chrono
  */

/**
  * @class Chrono
  * @constructor
  * @param  {jQuerySelector} jid  Le sélecteur de l'élément dans lequel il faut
  *                               placer le sélecteur.
  */
window.Chrono = function(jid)
{
  /**
    * Selector de l'objet DOM qui contient le chronomètre
    * @property {String} jid
    */
  this.jid    = jid
  /**
    * Timer du set interval
    * @property {Number} timer
    */
  this.timer  = null
  /**
    * Temps de démarrage du chronomètre
    * Notes
    *   * C'est la méthode run qui le définit, quand cette propriété
    *     est === null
    * @property {Number} start_time
    * @default null
    */
  this.start_time = null
  /**
    * Temps écoulé avant la dernière pause
    * @property {Number} elapsed_time_before_pause
    * @default 0
    */
  this.elapsed_time_before_pause = 0

  /**
    * Temps total écoulé (en tenant compte de toutes les pauses)
    * @property {Number} elapsed_time
    * @default 0
    */
  this.elapsed_time = 0
  
  /**
    * Dernier temps de départ du chronomètre
    * Utile pour tenir compte des pauses
    * Notes
    *   * C'est la méthode `run` qui le (re)définit chaque fois.
    * @property {Number} last_start_time
    * @default 0
    */
  this.last_start_time = 0
  
}
$.extend(Chrono.prototype,{
  /**
    * Retourne l'objet jQuery contenant le chronomètre
    * @method obj
    */
  obj:function()
  {
    return $(this.jid)
  },
  /**
    * Lance le chronomètre
    * Utilise la méthode setInterval pour appeler toutes les demi-secondes
    * la méthode `change` qui va afficher le temps courant.
    * @method run
    */
  run:function(){
    var justnow = (new Date()).getTime()
    if(this.start_time === null) this.start_time = justnow
    this.last_start_time = justnow
    this.timer = setInterval($.proxy(this.change, this), 500);
  },
  /**
    * Arrête et détruit le chronomètre
    * @method stop
    */
  stop:function()
  {
    this.unrun()
    delete UI.Chrono.CHRONOS[this.jid]
  },
  /**
    * Met le chrono en pause
    * La méthode se charge aussi de mettre de côté le temps déjà écoulé
    * pour pouvoir tenir compte des pauses.
    *
    * @method pause
    */
  pause:function()
  {
    this.unrun()
    this.calcule_elapsed_time()
    this.elapsed_time_before_pause = parseInt(this.elapsed_time,10)
    this.last_start_time = null // inutile, mais bon
  },

  /**
    * Sort le chrono de la pause (le remet en route)
    * @method unpause
    */
  unpause:function()
  {
    this.run()
  },
  
  /**
    * Change l'affichage du chronomètre
    * @method change
    * @protected
    */
  change:function(){
    this.calcule_elapsed_time()
    this.obj().html(Time.s2h(this.elapsed_time, true));
  },
  
  /**
    * Calcule la durée chronométrée.
    * La méthode tient compte des arrêts. Elle se sert principalement de :
    *   * this.time             Pour connaitre le temps écoulé lors d'une
    *                           précédente pause (if any)
    *   * this.last_start_time  Le nombre de millisecondes lors de la mise en
    *                           route du chronomètre au départ ou à la fin de
    *                           la dernière pause.
    * @method calcule_elapsed_time
    */
  calcule_elapsed_time:function()
  {
    var laps  = (new Date()).getTime() - this.last_start_time 
        // => Nombre de millisecondes écoulées
    laps = parseInt(laps / 1000, 10)
    this.elapsed_time = this.elapsed_time_before_pause + laps
  },
  
  /**
    * Arrête (définitivement) le chronomètre
    * Ie détruit le setInterval
    * @method unrun
    */
  unrun:function(){
    clearInterval(this.timer);
  }
})

/**
  * Object qui gère tous les chronomètres (instances {Chrono})
  *
  * @class UI.Chrono
  * @static
  *
  */
if(undefined == window.UI) UI = {}
UI.Chrono = {
  /**
    * Table contenant tous les chronos courants
    * Notes
    *   * En général, il y a un seul chronomètre à la fois, ou
    *     maximum deux quand un exercice est en route.
    *
    * @property {Object} CHRONOS
    * @static
    * @final
    */
  CHRONOS:{},
  
  /**
    * Instancie un nouveau chronomètre dans l'élément +jid+
    * @method start
    * @param {jQuerySelector} jid
    * @return {Chrono} L'instance chronomètre initiée
    */
  start:function(jid){
    // this.CHRONOS[jid] = {timer: null, time: 0};
    // this.run(jid);
    this.CHRONOS[jid] = new Chrono(jid)
    this.CHRONOS[jid].run()
    return this.CHRONOS[jid]
  }
}
