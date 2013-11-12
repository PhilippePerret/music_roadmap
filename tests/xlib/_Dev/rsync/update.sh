# ACTUALISE tous les dossiers './tests' des applications mentionnées ci-dessous
#
#	De Pure-JS-Tests -vers-> Les applications définies
# 
# Ajouter toutes les applications utilisant Pure-Javascript-Tests ci-dessous
# @todo: Le mieux serait de faire une simple liste.
#
# Note : actualise aussi les fichiers xlib de l'auto test de l'application.
#

function update_in {
	echo -e "UPDATE Pure-Js-Test -> $1"
	rsync -ruvt ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests.php ~/Sites/cgi-bin/$1
	rsync -ruvt -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" --delete ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
	# MODE SANS DELETE
	# rsync -ruvt -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- xlib/tests/*' --exclude="user_[tests|lib]*" ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/ ~/Sites/cgi-bin/$1/tests
}
function update_auto_test {
	echo -e "UPDATE Auto-test"
	rsync -ruvt ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests.php ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/tests
	rsync -ruvt -f'- \.git*' -f'- */\.*' -f'- \.*' -f'- _Dev*' -f'- RefBook*' --exclude="tests/tests/xlib/tests*" --delete ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/ ~/Sites/cgi-bin/lib/javascript/optional/PureJavascriptTests/-\>Site/tests/xlib/tests/tests/xlib
}

# in : film
#
echo -e "\n\n"
echo "In film"
echo "-------"
update_in 'film'

# in:	music_roadmap
#
echo -e "\n\n"
echo "In music_roadmap"
echo "----------------"
update_in 'music_roadmap'

echo -e "\n\n"
echo "Fichiers de l'auto-test"
echo "-----------------------"
update_auto_test