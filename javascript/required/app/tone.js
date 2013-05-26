/*
    Objet Tone
    ----------
    Pour certaines opérations sur les tonalités
*/
window.Tone = {
  
  // Retourne le nom entier human de la tonalité donnée en argument
  // @param   Tone    Indice de la tonalité (0-23)
  human:function(tone){
    return IDSCALE_TO_HSCALE[tone].entier;
  },
  // Retourne le ton principal suivant en fonction de la config générale (maj_to_rel)
  // @param   tone      Indice 0-23 de la tonalité
  // @param   options   Hash des options
  //                    human:    Si true, retourne le nom humain localisé
  // @return  L'indice (0-23) de la tonalité. Noter que si la tonalité fournie est
  // mineure, c'est une tonalité mineure qui sera retournée
  next_by_config_of:function(tone,options){
    if('undefined'==typeof options) options = {};
    var increment = Roadmap.Data.maj_to_rel ? 5 : 7;
    var tone_checked = 0 + (this.is_minor(tone) ? this.relative_of(tone) : tone) ;
    var next = tone_checked + increment ;
    if(this.is_minor(tone)) next = this.relative_of(next);
    if(options.human) next = this.human(next);
    return next;
  },
  // Retourne le relatif du ton donné en argument, quelque soit son 
  // type (majeur ou mineur)
  // @param   tone      L'indice (0-23) de la tonalité
  // @param   options   Hash des options. Peut contenir:
  //                    human:    Si true, retourne le nom humain localisé
  relative_of:function(tone, options){
    var rel;
    if('undefined'==typeof options) options = {};
    if(this.is_major(tone)) rel = this.minor_relative_of(tone);
    else rel = this.major_relative_of(tone);
    if(options.human) rel = IDSCALE_TO_HSCALE[rel].entier;
    return rel;
  },
  // Retourne le relatif majeur de la tonalité mineur
  // donnée en argument
  major_relative_of:function(minor_tone){
    var rel = minor_tone + 3 - 12;
    if (rel > 11) rel -= 12;
    return rel;
  },
  // Retourne le relatif mineur de la tonalité majeure
  // donnée en argument
  minor_relative_of:function(major_tone){
    var rel = major_tone - 3 + 12;
    if (rel < 12) rel += 12;
    return rel;
  },
  is_major:function(tone){return tone < 12},
  is_minor:function(tone){return tone > 11}
}