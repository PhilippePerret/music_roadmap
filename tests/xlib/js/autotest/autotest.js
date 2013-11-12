/*
 * 	Ce script est chargé seulement en mode `autotest` (test de l'application)
 *
 *	@note: le mode autotest s'obtient en ajoutant `?autotest=1` à l'url ou en
 * 					lançant `autotest.html' dans le dossier PureJavascriptTests/->Site/tests/xlib/tests/
 *
 */
function run_autotest(){
	window.open('./tests.php', 'fen_autotest')
}
window.onload = run_autotest