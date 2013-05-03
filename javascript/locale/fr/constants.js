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
    
    'G0':"Gammes",
    'AR':"Arpèges",
    'C0':"Accords",
    
    'LH':"Main gauche",
    'RH':"Main droite",
    'RY':"Rythme",
    
    'T1':"Tierces",
    'S0':"Sixtes",
    'O0':"Octaves",

    'G1':"Pouce",
    'L0':"Legato",
    'T0':"Trilles",
    'TR':"Trémolo",
    'NR':"Notes répétées",
    'NT':"Notes tenues",
    
    'PO':"Polyphonie",
    'SY':"Synchronisation",
    'C1':"Chromatismes",
    'P0':"Poignet",
    'DL':"Déliateur",
    'E0':"Extensions"
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