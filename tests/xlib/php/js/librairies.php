<?php
// Librairies requises avant tout
traite_dossier('./tests/xlib/js/required/', 'js');
// Autres librairies
traite_dossier('./tests/xlib/js/others/', 'js');
// Chargement des librairies propres à l'application testée(if any)
if(file_exists('./tests/user_lib/javascript')){
	traite_dossier('./tests/user_lib/javascript/', 'js');
}
// Chargement des messages personnalisés
if(file_exists('./tests/user_lib/messages')){
	traite_dossier('./tests/user_lib/messages/', 'js');
}
// En mode autotest
if($_POST['autotest'] == 1){
	traite_dossier('./tests/xlib/js/autotest/', 'js');
}
?>