/*
    Constantes localisées, par objet
    
    EN
*/
window.IDSCALE_TO_HSCALE = {
  0:{double:"C",uniq:"C",entier:"C major"},
  1:{double:"C#/Db",uniq:"C#",entier:"C# major"},
  bis1:{uniq:"Db", entier:"Db major"},
  2:{double:"D",uniq:"D",entier:"D major"},
  3:{double:"Eb/D#",uniq:"Eb",entier:"Eb major"},
  bis3:{uniq:"D#", entier:"D# major"},
  4:{double:"E",uniq:"E",entier:"E major"},
  5:{double:"F",uniq:"F",entier:"F major"},
  6:{double:"F#/Gb",uniq:"F#",entier:"F# major"},
  bis6:{uniq:"Gb", entier:"Gb major"},
  7:{double:"G",uniq:"G",entier:"G major"},
  8:{double:"Ab/G#",uniq:"Ab",entier:"Ab major"},
  bis8:{uniq:"G#", entier:"G# major"},
  9:{double:"A",uniq:"A",entier:"A major"},
  10:{double:"Bb/A#",uniq:"Bb",entier:"Bb major"},
  bis10:{uniq:"A#", entier:"A# major"},
  11:{double:"B",uniq:"B",entier:"B major"},
  12:{double:"Cm",uniq:"Cm",entier:"C minor"},
  13:{double:"Cm#/Dbm",uniq:"C#m",entier:"C# minor"},
  bis13:{uniq:"Dbm", entier:"Db minor"},
  14:{double:"Dm",uniq:"Dm",entier:"D minor"},
  15:{double:"Ebm/D#m",uniq:"Ebm",entier:"Eb minor"},
  bis15:{uniq:"D#m", entier:"D# minor"},
  16:{double:"Em",uniq:"Em",entier:"E minor"},
  17:{double:"Fm",uniq:"Fm",entier:"F minor"},
  18:{double:"F#m/Gbm",uniq:"F#m",entier:"F# minor"},
  bis16:{uniq:"Gbm", entier:"Gb minor"},
  19:{double:"Gm",uniq:"Gm",entier:"G minor"},
  20:{double:"G#m/Abm",uniq:"G#m",entier:"G#m minor"},
  bis20:{uniq:"Abm", entier:"Abm minor"},
  21:{double:"Am",uniq:"Am",entier:"A minor"},
  22:{double:"Bbm/A#m",uniq:"Bbm",entier:"Bb minor"},
  bis22:{uniq:"A#m", entier:"A# minor"},
  23:{double:"Bm",uniq:"Bm",entier:"B minor"}
}
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