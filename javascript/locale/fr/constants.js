/*
    Constantes localisées, par objet
    
    FR
*/
// Tones data
window.IDSCALE_TO_HSCALE = {
  0:{double:"Do",uniq:"Do",entier:"Do majeur"},
  1:{double:"Do#/Réb",uniq:"Do#",entier:"Do# majeur"},
  bis1:{uniq:"Réb", entier:"Réb majeur"},
  2:{double:"Ré",uniq:"Ré",entier:"Ré majeur"},
  3:{double:"Mib/Ré#",uniq:"Mib",entier:"Mib majeur"},
  bis3:{uniq:"Ré#", entier:"Ré# majeur"},
  4:{double:"Mi",uniq:"Mi",entier:"Mi majeur"},
  5:{double:"Fa",uniq:"Fa",entier:"Fa majeur"},
  6:{double:"Fa#/Solb",uniq:"Fa#",entier:"Fa# majeur"},
  bis6:{uniq:"Solb", entier:"Solb majeur"},
  7:{double:"Sol",uniq:"Sol",entier:"Sol majeur"},
  8:{double:"Lab/Sol#",uniq:"Lab",entier:"Lab majeur"},
  bis8:{uniq:"Sol#", entier:"Sol# majeur"},
  9:{double:"La",uniq:"La",entier:"La majeur"},
  10:{double:"Sib/La#",uniq:"Sib",entier:"Sib majeur"},
  bis10:{uniq:"La#", entier:"La# majeur"},
  11:{double:"Si",uniq:"Si",entier:"Si majeur"},
  12:{double:"Dom",uniq:"Dom",entier:"Do mineur"},
  13:{double:"Dom#/Rébm",uniq:"Do#m",entier:"Do# mineur"},
  bis13:{uniq:"Rébm", entier:"Réb mineur"},
  14:{double:"Rém",uniq:"Rém",entier:"Ré mineur"},
  15:{double:"Mibm/Ré#m",uniq:"Mibm",entier:"Mib mineur"},
  bis15:{uniq:"Ré#m", entier:"Ré# mineur"},
  16:{double:"Mim",uniq:"Mim",entier:"Mi mineur"},
  17:{double:"Fam",uniq:"Fam",entier:"Fa mineur"},
  18:{double:"Fa#m/Solbm",uniq:"Fa#m",entier:"Fa# mineur"},
  bis18:{uniq:"Solbm", entier:"Solb mineur"},
  19:{double:"Solm",uniq:"Solm",entier:"Sol mineur"},
  20:{double:"Sol#m/Labm",uniq:"Sol#m",entier:"Sol#m mineur"},
  bis20:{uniq:"Labm", entier:"Labm mineur"},
  21:{double:"Lam",uniq:"Lam",entier:"La mineur"},
  22:{double:"Sibm/La#m",uniq:"Sibm",entier:"Sib mineur"},
  bis22:{uniq:"La#m", entier:"La# mineur"},
  23:{double:"Sim",uniq:"Sim",entier:"Si mineur"}
}
if('undefined' == typeof window.Exercices){ window.Exercices = {};}
$.extend(window.Exercices,{
  TYPES_EXERCICE:{
    /*
        QUAND UN TYPE EST AJOUTÉ, PENSER À AJOUTER SA COULEUR À
        Exercices.COLORS_FOR_TYPE
    */
    'WT':"Temps total de travail", // pour simplifier codes JS
    
    'GA':"Gammes",
    'AR':"Arpèges",
    'AC':"Accords",
    
    'LH':"Main gauche",
    'RH':"Main droite",
    'RY':"Rythme",
    
    'TI':"Tierces",
    'SX':"Sixtes",
    'OC':"Octaves",

    'PC':"Pouce",
    'LG':"Legato",
    'TR':"Trilles",
    'OR':"Ornements",
    'TM':"Trémolo",
    'NR':"Notes répétées",
    'NT':"Notes tenues",
    
    'PO':"Polyphonie",
    'SY':"Synchronisation",
    'CH':"Chromatismes",
    'PG':"Poignet",
    'DL':"Déliateur",
    'EX':"Extensions",
    
    'CX':"Croisements",
    'JP':"Sauts"
  },
  TYPES_SUITE_HARMONIQUE:{
    'NO'  :"Définie par l'exercice",
    'HA'  :"Harmonique",
    'WK'  :"Touches blanches",
    'TO'  :"Tonale",
    '00'  :"Aucune",
    'NO_description':"C'est l'exercice qui définit la suite harmonique",
    'HA_description':"Du relatif Majeur au relatif mineur ou inversement",
    'WK_description':"Sur les touches blanches, “à la Hanon”, en pouvant travailler dans les différentes tonalités",
    'TO_description':"Passe en revue différentes ou toutes les tonalités",
    '00_description':"Aucune suite harmonique"
  }
});