# VOIR SEULEMENT les différences
#
# ATTENTION !!!
#		Sens : Une application -vers-> Pure-JS-Tests
# Cela signifie qu'on va comparer PureJSTests dans une application (définie ci-dessous) avec
# le vrai dossier PureJsTests. Cela n'est réaliste que dans le cas où on modifie PureJsTests dans
# l'application et qu'on veut appliquer les changements à PureJsTests elle-même.
#
# Pour actualiser effectivement les fichiers, cf. le script `update_from.sh' de ce dossier.
#
# CMD+R pour procéder
#
# @note		Ne traite pas les fichiers des dossiers 'user_*'
#
#
function diff_from {
	echo "DIFFERENCES $1 -> Pure-Js-Tests (NO UPDATE)"
  # Pour updater (voir) les fichiers qui testent l'application Pure-JS-Tests à mettre ensuite dans
  # le dossier principal
	rsync -ruvn ~/Sites/cgi-bin/$1/tests/user_tests/pure_js_tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/user_tests
	rsync -ruvn ~/Sites/cgi-bin/$1/tests.php ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site
	rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" --delete ~/Sites/cgi-bin/$1/tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests
	# MODE SANS DELETE
	# rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" ~/Sites/cgi-bin/$1/tests/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests
}

# Mettre en argument l'application (dans Sites/cgi-bin/) qui sert de référence.
# C'est dans cette application que Pure-Js-Tests a été modifié, et qu'on veut actualiser ces
# changement dans le vrai dossier Pure-Js-Tests (utiliser `update_PJsT_from`)
diff_from 'film'

echo -e "\n\nLancer 'update_from.sh' si ces informations sont correctes pour vraiment actualiser les fichiers."
echo -e "\e[0;31mATTENTION !!! L'ACTUALISATION REMPLACERA LES FICHIERS DE PURE-JS-TESTS SOI-MÊME.\e[0m"