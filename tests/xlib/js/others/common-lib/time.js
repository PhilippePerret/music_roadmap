
// Pour obtenir le nombre de MILLISECONDES par une écriture : (2).minutes / (4).weeks
// -----------------------------------------------------------------------------
// Il faut obligatoirement entourer les chiffres par des parenthèses :
//    2.days => produit une erreur
//    (2).days => OK
Object.defineProperties(Number.prototype,{
  "minute"  :{get:function(){return this.minutes}},
  "minutes" :{get:function(){return this * 60 * 1000}},
  "hour"    :{get:function(){return this.hours}},
  "hours"   :{get:function(){return this.minutes * 60}},
  "day"     :{get:function(){return this.days}},
  "days"    :{get:function(){return this.hours * 24}},
  "week"    :{get:function(){return this.weeks}},
  "weeks"   :{get:function(){return this.days * 7}},
})

// // Pour utiliser jusqu'à vingt des tournures comme "one.day", "two.hours"
// window._NumberObject = {}
// Object.defineProperties(_NumberObject,{
//   "minute":{get:function(){return this.minutes}},
//   "minutes":{get:function(){return this.multi * 60}},
//   "hour":{get:function(){return this.hours}},
//   "hours":{get:function(){this.minutes * 69}},
//   "day":{get:function(){return this.days}},
//   "days":{get:function(){return this.hours * 24}}
// })
// L({one:1,two:2,tree:3,four:4,five:5,six:6,seven:7,height:8,nine:9,ten:10,
//   eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,
//   heighteen:18, nineteen:19,twenty:20}).
//   each(function(k,v){window[k] = $.extend({multi:v, _NumberObject})})
// 

Object.defineProperty(window, "NOW", {
  get:function(){ return Time.now() }
})

/*
 *  Time Object
 *  -----------
 *  Utilitaire pour le temps
 *
 */
const WITH_MILLIEME   = 1;
const HOUR_TWO_DIGITS = 2;
window.Time = {
  
  // Format de l'horloge
  // @valeurs possibles :
  //    null                => H:MM:SS
  //    'with_milliemes'    => H:MM:SS,MMM
  
  FORMAT_HORLOGE_DEFAULT: WITH_MILLIEME,
  
  // Retourne un objet Date défini avec un {Array} contenant : 
  // [annee, mois, jour, heure, minute, secondes]
  dateFromArray:function(arr){
    return new Date(Date.UTC.apply(null, arr))
  },
  
  // Retourne le temps courant
  // Pour le moment, le nombre de microsecondes ou le format local
  // si format est défini
  now:function(format){
    if(undefined == format) return (new Date()).valueOf();
    else return new Date().toLocaleString();
  },
  // Retourne le nombre de secondes (float) en fonction de l'horloge
  // fournie.
  // @note: Si l'horloge contient un point, c'est un time code
  horlogeToSeconds:function(val){
    var hrl, frames = 0;
    if(val.indexOf(',')>-1){
      var p = val.split(',')
      hrl = p[0];
      frames = parseInt(p[1],10);
    } else { hrl = val }
    hrl = hrl.split(':').reverse();
    var seconds = parseInt(hrl[0],10) + (hrl[1]||0)*60 + (hrl[2]||0)*3600;
    return parseFloat(seconds) + frames/1000;
  },
  h2s:function(val){return this.horlogeToSeconds(val)},
  /*
      Reçoit un nombre de secondes et retourne une horloge
      -------------------------------------------------------------------
      @param    val       Nombre de secondes (float / integer)
      @param    options   Liste optionnelle d'options :
                          hour_2_digits     Si true, met l'heure en format de 2 chiffres
                                            False par défaut.
  */
  secondsToHorloge:function(val,options){
    if('undefined'==typeof options)options = {}
    var fms="000";
    if(undefined == val || val === null) return "x:xx:xx";
    if(val.toString().indexOf(".")>-1){
      val = val.toString().split('.');
      fms = parseInt(val[1],10).toString().substring(0,3);
      while(fms.toString().length < 3) fms += "0";
      val = parseInt(val[0],10);
    }
    var hrs = Math.floor(val / 3600);
    if((options.hour_2_digits || (this.FORMAT_HORLOGE_DEFAULT & HOUR_TWO_DIGITS)) && hrs < 10) hrs = "0"+hrs;
    var reste = val % 3600;
    var mns = Math.floor(reste / 60);
    if(mns < 10) mns = "0"+mns;
    var scs = (reste % 60) * 1000;
    scs = Math.floor(scs/1000);
    if(scs<10) scs = "0"+scs;
    var h = hrs+":"+mns+":"+scs; 
    if(this.FORMAT_HORLOGE_DEFAULT & WITH_MILLIEME) h += ","+fms;
    return h;
  },
  s2h:function(val,options){return this.secondsToHorloge(val,options)}
}

Object.defineProperties(Time, {
  "lag":{
    get:function(){
      if(undefined == this._lag)
      {
        var d   = new Date()
        var utc = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds())
        this._lag = utc - d.getTime()
      }
      return this._lag
    }
  }
  
})