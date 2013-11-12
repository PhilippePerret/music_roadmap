/*
 * Lancement de tous les tests
 *
 *	Note 	Pour le moment, il faut écrire tous les fichiers tests qui existent ici, mais
 * 				plus tard on pourra imaginer utiliser une méthode Ajax pour remonter la liste de
 *				tous les tests et les jouer l'un après l'autre ici.
 *
 *				D'un autre côté, il est pratique d'avoir la liste en dur ici, pour pouvoir zapper
 *				des tests. Il faudrait les deux possibilités.
 *
 */
function run_tests(){
	me = this.run_tests;
	
	if(undefined == me.step_list){
		me.set_step_list([
			"TEST DE WAIT.UNTIL",
			"TEST DE WAIT.WHILE",
			"TEST DE SHOULD.BE",
			"TEST DE <string>.IS",
			"FIN DE JEU DE TOUS LES TESTS"
		]);
	}
	
	me.next_step();
	
	if(me.step_is("TEST DE WAIT.UNTIL")){
		Test.load_and_run('Wait/until', $.proxy(me, this));
		return // @note: c'est la méthode ci-dessus qui rappellera cette méthode
	}

	if(me.step_is("TEST DE WAIT.WHILE")){
		Test.load_and_run('Wait/while', $.proxy(me, this));
		return // idem
	}

	if(me.step_is("TEST DE SHOULD.BE")){
		Test.load_and_run('Should/be', $.proxy(me, this));
		return // idem
	}
	
	if(me.step_is("TEST DE <string>.IS")){
		Test.load_and_run('Interrogations/is', me.proxy)
	}

	if(me.step_is("Fin")) Test.end();
}