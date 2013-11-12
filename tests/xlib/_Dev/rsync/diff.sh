# VOIR SEULEMENT les différences
#
#	Sens : Pure-JS-Tests -> Applications
#
# Pour actualiser effectivement les fichiers, cf. le script `update.sh' de ce dossier.
#
# CMD+R pour procéder
#
# @note		Ne traite pas les fichiers des dossiers 'user_*'
#
function diff_with {
	echo "DIFFERENCES P-Js-T -> $1 (NO UPDATE)"
	rsync -ruvn ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests.php ~/Sites/cgi-bin/$1
	rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" --delete ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
	# MODE SANS DELETE
	# rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
}
# Tests du dossier de l'auto test
function autodiff_with {
	echo -e "UPDATE Auto-test"
	rsync -ruvn ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests.php ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/tests
	rsync -ruvn -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- _Dev*' -f'- RefBook*' --exclude="tests/tests/xlib/tests*" --delete ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/tests/tests/xlib
}
# in : film
#
echo -e "\n\n"
echo "In film"
echo "-------"
diff_with 'film'

# in:	music_roadmap
#
echo -e "\n\n"
echo "In music_roadmap"
echo "----------------"
diff_with 'music_roadmap'

echo -e "\n\n"
echo "Fichiers de l'auto-test"
echo "-----------------------"
autodiff_with

echo -e "\n\nLancer 'update.sh' si ces informations sont correctes pour vraiment actualiser les fichiers."