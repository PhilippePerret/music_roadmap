# UPDATER
#
# 	!!! ATTENTION !!!
#
#		Sens : Une application -vers-> Pure-JS-Tests
#
# Cela signifie qu'on va prendre en source le dossier PureJSTests d'une application (définie
# ci-dessous) et en destination le vrai dossier PureJsTests. Cela n'est réaliste que dans le cas 
# où on modifie PureJsTests dans l'application et qu'on veut appliquer les changements à
# PureJsTests elle-même.
#
# @note		Après cette actualisation, on peut lancer `update.sh' pour qu'elle s'applique à toutes
# 				les applications courantes qui utilisent Pure-JS-Tests.
#
# CMD+R pour procéder
#
# @note		Ne traite pas les fichiers ou les dossiers commençant par 'user_*'
#
#
function update_from {
	echo "UPDATE P-Js-T de $1 -> Pure-Js-Tests"
  # Pour updater les fichiers qui testent l'application Pure-JS-Tests à mettre ensuite dans
  # le dossier principal
	rsync -ruvt ~/Sites/cgi-bin/$1/tests/user_tests/pure_js_tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/user_tests
	rsync -ruvt ~/Sites/cgi-bin/$1/tests.php ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site
	rsync -ruvt -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" --delete ~/Sites/cgi-bin/$1/tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests
	# Mode sans delete
	# rsync -ruvt -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" ~/Sites/cgi-bin/$1/tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests
}

# Mettre en argument l'application (dans Sites/cgi-bin/) qui sert de référence.
# C'est dans cette application que Pure-Js-Tests a été modifié, et qu'on veut actualiser ces
# changement dans le vrai dossier Pure-Js-Tests.
update_from 'film'

