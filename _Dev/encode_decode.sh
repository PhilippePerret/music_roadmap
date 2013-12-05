# Tant que je n'ai pas résolu le problème de la lecture par cgi des
# fichiers qui contienne des caractères spéciaux, je dois encoder les
# fichiers textes en HTML.
# J'utilise mes programmes `html/encode.rb' et `html/decode.rb'


echo "Dossier courant: "`pwd`

# ---------------------------------------------------------------------
#   ENCODAGES
# ---------------------------------------------------------------------

# Encoder en html tous les fichiers du dossier data/aide
# 
# @note '-k' pour ne pas produire de fichier <name>-original
# 
# ~/Programmation/Programmes/html/encode.rb ./data/aide -k -v

# Mails
# 
~/Programmation/Programmes/html/encode.rb ./data/mail -k -v


# ---------------------------------------------------------------------
#   DÉCODAGES
#   Pour revenir à une version "humaine" des textes (pour modification)
# ---------------------------------------------------------------------
# Décoder depuis html (pour pouvoir retravailler les textes plus confortablement)
# 
# ~/Programmation/Programmes/html/decode.rb ./data/aide -k -v
