/*
	CONSTANTES POUR LES TOUCHES PRESSÉES

	On teste les touches pressées grâce à :

		window.onkeydown (peut-être aussi window.onkeyup)
		window.onkeypress
		ATTENTION : les codes ne sont pas les mêmes avec les deux fonctions !

		window.onkeydown = function ( e ) ;
	
	On récupère ensuite la valeur de la touche pressée avec :

	var valKey = e.keyCode ;
	ou charCode

	valKey peut alors avoir les valeurs ci-dessous :
*/



/* e.charCode donne : */
const Key_0	= 48 ;
const Key_1	= 49 ;
const Key_2	= 50 ;
const Key_3	= 51 ;
const Key_4	= 52 ;
const Key_5	= 53 ;
const Key_6	= 54 ;
const Key_7	= 55 ;
const Key_8	= 56 ;
const Key_9	= 57 ;

/* e.charCode donne (si onkeypress, pas si onkeydown) : */
const Key_tiret		= 45 ;
const Key_a			= 97 ;
const Key_Alt_a		= 230 ; 	// ALT + a
const Key_A			= 65 ;
const Key_Alt_A		= 198 ;		// ATL + MAJ + a
const Key_b			= 98 ;
const Key_Alt_b 	= 223 ;
const Key_B			= 66 ;
const Key_Alt_B 	= 8747 ;
const Key_c			= 99 ;
const Key_Alt_c 	= 169 ;
const Key_C			= 67 ;
const Key_Alt_C 	= 162 ;
const Key_d			= 100 ;
const Key_Alt_d		= 8706 ;
const Key_D			= 68 ;
const Key_Alt_D		= 8710 ;
const Key_D_CtrlMeta = 16 ;
const Key_e			= 101 ;
const Key_Alt_e		= 234 ;
const Key_E			= 69 ;
const Key_Alt_E		= 202 ;
const Key_f			= 102 ;
const Key_Alt_f		= 402 ;
const Key_F			= 70 ;
const Key_Alt_F		= 183 ;
const Key_g			= 103 ;
const Key_Alt_g		= 64257 ;
const Key_G			= 71 ;
const Key_Alt_G		= 64258 ;
const Key_h			= 104 ;
const Key_Alt_h		= 204 ;
const Key_H			= 72 ;
const Key_Alt_H		= 206 ;
const Key_i			= 105 ;
const Key_Alt_i		= 238 ;
const Key_I			= 73 ;
const Key_Alt_I		= 239 ;
const Key_j			= 106 ;
const Key_Alt_j		= 207 ;
const Key_J			= 74 ;
const Key_Alt_J		= 205 ;
const Key_k			= 107 ;
const Key_Alt_k		= 200 ;
const Key_K			= 75 ;
const Key_Alt_K		= 203 ;
const Key_l			= 108 ;
const Key_Alt_l		= 172 ;
const Key_L			= 76 ;
const Key_Alt_L		= 124 ;
const Key_m			= 109 ;
const Key_Alt_m		= 181 ;
const Key_M			= 77 ;
const Key_Alt_M		= 211 ;
const Key_n			= 110 ;
/*const Key_Alt_n	= 110 ; NE FONCTIONNE PAS (sert normalement au tilde)*/
const Key_N			= 78 ;
const Key_Alt_N		= 305 ;
const Key_o			= 111 ;
const Key_Alt_o		= 339 ;
const Key_O			= 79 ;
const Key_Alt_O		= 338 ;
const Key_p			= 112 ;
const Key_Alt_p		= 960 ;
const Key_P			= 80 ;
const Key_Alt_P		= 8719 ;
const Key_q			= 113 ;
const Key_Alt_q		= 8225 ;
const Key_Q			= 81 ;
const Key_Alt_Q		= 937 ;
const Key_r			= 114 ;
const Key_Alt_r		= 174 ;
const Key_R			= 82 ;
const Key_Alt_R		= 8218 ;
const Key_s			= 115 ;
const Key_Alt_s		= 210 ;
const Key_S			= 83 ;
const Key_Alt_S		= 8721 ;
const Key_t			= 116 ;
const Key_Alt_t		= 8224 ;
const Key_T			= 84 ;
const Key_Alt_T		= 8482 ;
const Key_u			= 117 ;
const Key_Alt_u		= 186 ;
const Key_U			= 85 ;
const Key_Alt_U		= 170 ;
const Key_v			= 118 ;
const Key_Alt_v		= 9674 ;
const Key_V			= 86 ;
const Key_Alt_V		= 8730 ;
const Key_w			= 119 ;
const Key_Alt_w		= 8249 ;
const Key_W			= 87 ;
const Key_Alt_W		= 8250 ;
const Key_x			= 120 ;
const Key_Alt_x		= 8776 ;
const Key_X			= 88 ;
const Key_Alt_X		= 8260 ;
const Key_y			= 121 ;
const Key_Alt_y		= 218 ;
const Key_Y			= 89 ;
const Key_Alt_Y		= 376 ;
const Key_z			= 122 ;
const Key_Alt_z		= 194 ;
const Key_Z			= 90 ;
const Key_Alt_Z		= 197 ;

/* charcode pour */
const Key_VIRG	= 44 ;
const Key_PTINT	= 63 ; // note : ne s'obtient pas avec virgule+maj


/* FLÈCHES : C'EST e.keyCode QUI RENVOIE CE NOMBRE */
const Key_FLECHEG			= 37 ;
const Key_ARROWL			= 37 ;
const Key_FLECHEH			= 38 ;
const Key_ARROWU			= 38 ;
const Key_FLECHED			= 39 ; 
const Key_ARROWR			= 39 ;
const Key_FLECHEB			= 40 ;
const Key_ARROWD			= 40 ;

const Key_ESCAPE			= 27 ;
const Key_RETURN			= 13 ;
const Key_ENTREE			= 13 ;
/*const KeyC_RETURN	= 13 ;	// Return (PN et clavier) */
/* Retour (les deux) */
const KRETOUR		= 13 ; const KRETURN	= 13 ;

const Key_PNPLUS			= 107 ;	// + du PN
const Key_PNMOINS			= 109 ;	// - du PN

/* === Flèches sur le bloc de aide === */
const KPAGEUP				= 33 ; // flèche "crantée", pour remonter de page en page
const Key_PAGEUP			= 33 ;
const KPAGEDOWN				= 34 ; // flèche "crantée", pour descendre de page en page
const Key_PAGEDOWN			= 34 ;
const KDOCDOWN				= 35 ; // flèche "de travers", pour descendre tout en bas
const Key_DOWNSCREEN		= 35 ;
const KDOCUP				= 36; // flèche "de travers", pour remonter tout en haut
const Key_UPSCREEN			= 36 ;

/* Barre d'espacement (charCode) */
const KESPACE				= 32 ;
const Key_SPACE				= 32 ;
/* Tabulation (keyCode) */
const KTAB					= 9 ;
const Key_TAB				= 9 ;
/* Effacement */
const KERASE				= 8 ;
const Key_ERASE				= 8 ;
const KERASERIGHT			= 46 ;
const Key_ERASERIGHT		= 46 ;
const Key_ERASE_R			= 46 ;
/* Aide */
const KAIDE				= 6 ;
/* Escape */
const KESCAPE			= 27 ;
/* Verrouillage numérique */
const KVERNUM		= 12 ;

/* Touche de contrôle */
const KMAJ		= 16 ;
const KCTRL		= 17 ;
const KOPT			= 18 ; const KALT		= 18 ;
const KMETA		= 224 ;


/* Pavé numérique */
const KFOIS		= 106 ;
const KPLUS		= 107 ;
const KMOINS		= 109 ;
const KVIRGULE		= 110 ;
const KDIV		= 111 ;


/* === TOUCHES DE FONCTION === */
// La valeur de keyCode est…
// Note : dans plusieurs applications, on utilise la touche alt
// pour pouvoir déclencher les fonctions
const Key_F1	= 112 ;
const Key_F2	= 113 ;
const Key_F3	= 114 ;
const Key_F4	= 115 ;
const Key_F5	= 116 ;
const Key_F6	= 117 ;
const Key_F7	= 118 ;
const Key_F8	= 119 ;
const Key_F9	= 120 ;
const Key_F10	= 121 ;
const Key_F11	= 122 ;
const Key_F12	= 123 ;

const Key_F13	= 44 ;
const Key_F14	= 145 ; // mais avec Ctrl
const Key_F15	= 19 ;	// idem


