/*
    Objet Texte
    -----------
    Pour la gestion des textes et parties textuelles
*/

window.Texte = {
  
  correct_guil_et_apo: function(txt){
    txt = txt.replace(/'/g,'’');
    txt = txt.replace(/"\b/g, '“').replace(/\b"/g, '”');
    return txt;
  },
  
  // Return +txt+ with only ASCII characters
  NON_ASCII:{ "e":"éèêë", "E":"ÉÈÊË", "a": "àâä", "A":"ÀÄÂ", "i":"îîï", "c":"ç", "C":"Ç",
  "o":"ôöò", "oe":"œ", "OE":"Œ"},
  to_ascii:function(txt){
    var bad, good;
    for(good in this.NON_ASCII){
      bad = new RegExp("[" + this.NON_ASCII[good] + "]", "g");
      txt = txt.replace(bad,good);
    }
    return txt;
  }
  
}