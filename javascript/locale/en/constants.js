/*
    Constantes localisées, par objet
*/
if('undefined' == typeof window.Exercices) window.Exercices = {};
$.extend(window.Exercices,{
  TYPES_EXERCICE:{
    'WT':"Total Working Time",
    
    'GA':"Scales",
    'AR':"Arpeggios",
    'AC':"Chords",
    'LH':"Left hand",
    'RH':"Right hand",
    'RY':"Rythm",
    'TI':"Thirds",
    'SX':"Sixths",
    'PC':"Thumb",
    'LG':"Legato",
    'OC':"Octaves",
    'TR':"Trills",
    'TM':"Tremolo",
    'SY':"Synchronicity",
    'CH':"Chromatisme",
    'PG':"Wrist",
    'PO':"Polyphony",
    'DL':"Unbinder",
    'EX':"Extention",
    'NR':"Repeated notes",
    'NT':"Sustained notes",
    'CX':"Cross",
    'JP':"Jump"
  },
  TYPES_SUITE_HARMONIQUE:{
    'NO'  :"Défined by the exercice",
    'HA'  :"Harmonic",
    'WK'  :"White keys",
    'TO'  :"Tonal",
    '00'  :"None",
    'NO_description':"The exercice defines the harmonic suite",
    'HA_description':"From Major relative to minor relative or vice versa",
    'WK_description':"On white keys, “Hanon-like”; this can be played in all tones",
    'TO_description':"Pass through several or all tones",
    '00_description':"No harmonic suite"
  }
});