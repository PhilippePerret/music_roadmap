/*
    Constantes localisées, par objet
*/
if('undefined' == typeof window.Exercices) window.Exercices = {};
$.extend(window.Exercices,{
  TYPES_EXERCICE:{
    'WT':"Total Working Time",
    
    'G0':"Scales",
    'AR':"Arpeggios",
    'C0':"Chords",
    'LH':"Left hand",
    'RH':"Right hand",
    'RY':"Rythm",
    'T1':"Thirds",
    'S0':"Sixths",
    'G1':"Thumb",
    'L0':"Legato",
    'O0':"Octaves",
    'T0':"Trills",
    'TR':"Tremolo",
    'SY':"Synchronicity",
    'C1':"Chromatisme",
    'P0':"Wrist",
    'PO':"Polyphony",
    'DL':"Unbinder",
    'E0':"Extention",
    'NR':"Repeated notes",
    'NT':"Sustained notes",
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