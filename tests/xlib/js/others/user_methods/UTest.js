if(undefined == window.UTest) window.UTest = {}
$.extend(window.UTest, {
  
  

	/* -------------------------------------------------------------------
	 *	Gestion des synopsis définis dans le dossier `./tests/user_lib/synopsis/'
	 *
	 *	Pour appeler un de ces synopsis :
	 *
	 *		UTest.Synopsis.run(<path relatif>, <fonction pour suivre>)
	 *
	 *		Ou utiliser le raccourci `<Fonction Principale>.run_synopsis(<path relatif>)
	 *		dans la fonction appelant le synopsis.
	 */
  Synopsis:{
		synopsis_path	: null,				// Le synopisis courant (path relatif dans :
				 												// 		tests/user_lib/javascript/synopsis/)
																// Ce path relatif permet également d'obtenir le nom de la méthode
		poursuivre		: null,				// méthode pour suivre
		tscript				: null,				// Instance TScript portant le synopsis en jeu
	
	
		// Joue le synopsis demandé
		// ------------------------
		// @param		synopsis_path		Le path relatif dans tests/user_lib/javascript/synopsis
		// @param		poursuivre			La méthode pour suivre
		// @param		arg							Un argument optionnel à envoyer au synopsis. 
		// 													@note: Utiliser obligatoirement des Hash pour passer plusieurs
		// 													arguments.
		// 
		run:function(synopsis_path, poursuivre, arg){
      if(synopsis_path.substr(-4) != '.js') synopsis_path += '.js'
			this.synopsis_path	= synopsis_path
			this.poursuivre 		= poursuivre
			this.tscript = new TScript({
				relative_path			: synopsis_path,
				folders						: 'user_lib/javascript/synopsis',
				function_after		: poursuivre,
				arg								: arg
			})
			this.tscript.first_run
		}	
	
	}
  
})