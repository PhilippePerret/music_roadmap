/*
    Constantes localisées, par objet
*/
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
    'C0':"Accords",
    
    'LH':"Main gauche",
    'RH':"Main droite",
    'RY':"Rythme",
    
    'TI':"Tierces",
    'SX':"Sixtes",
    'OC':"Octaves",

    'G1':"Pouce",
    'LG':"Legato",
    'TR':"Trilles",
    'TM':"Trémolo",
    'NR':"Notes répétées",
    'NT':"Notes tenues",
    
    'PO':"Polyphonie",
    'SY':"Synchronisation",
    'CH':"Chromatismes",
    'PG':"Poignet",
    'DL':"Déliateur",
    'EX':"Extensions"
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