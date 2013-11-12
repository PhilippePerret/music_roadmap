/*
 *	Test de la méthode `Wait.until`.
 *
 *	Note	Ce sont les mêmes tests que `Wait.while` mais en utilisant `until`.
 */
function Wait_until(poursuivre){
	
	me = this.Wait_until;
	
	if(undefined == me.step_list){
		// Premier appel de la fonction test
		me.poursuivre = poursuivre;
		me.set_step_list([
			"Essai normal",
			"Contrôle du temps de l'étape normale",
			"Essai avec un temps raccourci",
			"Contrôle du temps d'un wait raccourci",
			"Essai avec une méthode appelée en cas d'échec",
			"Contrôle de la méthode appelée en cas d'échec",
			"Essai d'une méthode appelée en cas de succès",
			"Controle de la méthode appelée en cas de succès",
			"Essai en modifiant le laps de temps entre les essais",
			"Controle de la modification du laps de temps",
			"Fin de Wait_until"
		])
	}
	
	me.next_step();
	
	if(me.indice == 1){
		db("PAS DE PANIQUE… On doit aller jusqu'au bout de la boucle Wait.until, ce qui va prendre 20 secondes.");
		me.start = Time.now();
		return Wait.until(function(){
			return false; // pour atteindre la fin
		}, $.proxy(me,this),
		{failure:function(bool){db("Atteinte du bout de Wait.until")}/* pour ne pas générer d'erreur*/}
		)
		
	}
	
	if(me.step == "Contrôle du temps de l'étape normale"){
		duree = Time.now() - me.start;
		duree = (parseInt(duree/100,10)/10);
		db("La durée du wait a été d'à peu près "+duree+" secs (arrondi).");
		if( duree > 19 && duree < 21 ) success("Le temps est bon");
		else failure("La durée du wait est incorrecte (devrait être entre 19 et 21)")
		return $.proxy(this.Wait_until, this)();
	}
	
	if(me.step_is("Essai avec un temps raccourci")){
		me.start = Time.now();
		return Wait.until(
			function(){
				return false; // pour atteindre la fin
			}, 
			$.proxy(this.Wait_until,this),
			{max_time:3*1000, failure:function(bool){db("Atteinte du bout de Wait.until")}/* pour ne pas générer d'erreur*/}
		)
	}

	if(me.step_is("Contrôle du temps d'un wait raccourci")){
		duree = Time.now() - me.start;
		duree = (parseInt(duree/100,10)/10);
		db("La durée du wait a été d'à peu près "+duree+" secs (arrondi).");
		if( duree > 2 && duree < 4 ) success("Le temps est bon");
		else failure("La durée du wait est incorrecte (devrait être entre 2 et 4 secondes)")
		return $.proxy(this.Wait_until, this)();
	}
	
	if(me.step_is("Essai avec une méthode appelée en cas d'échec")){
		return Wait.until(
			function(){
				return false; // pour atteindre la fin
			}, 
			$.proxy(this.Wait_until,this),
			{max_time:2*1000, failure:function(bool){success("<div id=\"failure_called\"> La méthode failure a bien été appelée</div>")}}
		)
	}
	
	if(me.step_is("Contrôle de la méthode appelée en cas d'échec")){
		if($('div#rapport').length == 0) failure("Bizarrement, je ne trouve pas le div#rapport…");
		if($('div#rapport div#failure_called').length == 0) failure("La méthode d'échec n'a pas été appelée…");
		else success("OK");
		return $.proxy(this.Wait_until, this)();
	}
	
	if(me.step_is("Essai d'une méthode appelée en cas de succès")){
		jusqua = Time.now() + 2000;
		return Wait.until(
			function(){
				return Time.now() > jusqua; // Vrai au bout de deux secondes
			}, 
			$.proxy(this.Wait_until,this),
			{max_time:5*1000, success:function(bool){success("<div id=\"success_called\"> La méthode success a bien été appelée !</div>")}}
		)
	}
	
	if(me.step_is("Controle de la méthode appelée en cas de succès")){
		if($('div#rapport div#success_called').length == 0) failure("La méthode success n'a pas été appelée…");
		else success("OK");
		return $.proxy(this.Wait_until, this)();
	}
	
	if(me.step_is("Essai en modifiant le laps de temps entre les essais")){
		calls = [];
		return Wait.until(
			function(){
				calls.push(Time.now());
				return false; // pour attendre la fin
			}, 
			$.proxy(this.Wait_until,this),
			{max_time:10*1000, laps:2*1000, failure:function(bool){db("Fin normale de la boucle Wait.until")}}
		)
	}
	
	if(me.step_is("Controle de la modification du laps de temps")){
		if(undefined==calls) failure("`calls` devrait être défini pour tester les valeurs");
		else{
			// Il doit y avoir en gros deux seconds entre chaque appel
			erreur = false;
			for(var i=0, len=calls.length; i<len; ++i){
				if(i == 0) continue ; // passer la première
				var avant = calls[i-1];
				var apres = calls[i];
				var inter = parseInt((apres-avant)/1000,10);
				if(inter != 2){
					if(false == erreur) erreur = [];
					erreur.push(inter+" msecs entre l'appel "+(i-1)+" et l'appel "+i);
				}
			}
			if(false == erreur) success("La modification du laps de temps est opérationnelle.");
			else{
				failure("Il n'y a pas 2 secondes entre chaque appel test de la méthode Wait.until :\n"+
								erreur.join("\n"));
			}
		}
		return $.proxy(this.Wait_until, this)();
	}
	
	if('function'==typeof me.poursuivre) me.poursuivre();
	else Test.end();
	
	
}