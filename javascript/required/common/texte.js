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
  
}