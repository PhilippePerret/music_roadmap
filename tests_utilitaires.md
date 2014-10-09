# Le script `tests_utilitaires.rb`

* [Liste des méthodes](#method_list)


Il permet de gérer les tests RSpec fait en online, en "préparant le terrain".

Il suffit d'appeler ce script (qui ne fonctionne qu'en mode développement) avec les paramètres précisant l'opération à exécuter et les paramètres.

Par exemple&nbsp;:

    http://www.music-roadmap.net/development/tests_utilitaires.rb?op=dis_quelque_chose

… va jouer l'opération `:dis_quelque_chose`.

Dans RSpec, qui définit le `app_host`, il suffit de faire&nbsp;:

    visit('/tests_utilitaires.rb?op=dis_quelque_chose')

Mais il vaut mieux utiliser `Net::HTTP.get(uri)` pour ne faire que recevoir le résultat. Par exemple :

    uri = URI('http://www.music-roadmap.net/development/tests_utilitaires.rb?op=erase_all)
    res = Net::HTTP.get(uri)
    res = JSON::parse(res)
    # =>  Hash contenant les résultats de l'opération, et notamment la clé :result qui
    #     contient le résultat attendu.

##Codes ruby

Tous les codes ruby utiles (à commencer par la classe `Tests`) se trouvent dans :

    ./ruby/lib/module/test/
    
##Définition de la méthode

Le paramètre `op` de la requête doit correspondre à une méthode de la class Test.

On peut ajouter des arguments (à concurrence de **5**) à l'aide de la propriété `arg<X>`. Ces arguments sont transmis à la méthode.
  
Par exemple&nbsp;:

    visit('/tests_utilitaires.rb?op=mon_op&arg1=Premier%argument&arg2=deuxième')

<a name='method_list'></a>
##Liste des méthodes

*Note&nbsp;: Toutes ces méthodes sont définies dans `./ruby/lib/module/test/operations.rb`.*

*Note&nbsp;: Chacune de ces méthodes possède son équivalent dans spec_helper, donc on peut l'appeler directement depuis les tests, avec ce nom. Cf. le fichier `./spec/support/test_methods/tests_utilitaires.rb`.*

    erase_all
    
        Supprime tous les utilisateurs et toutes les roadmaps.
    
    gel <nom du gel>
    
        Crée un "gel" de l'état courant, enregistré sous le nom <nom du gel>
        Utiliser degel <nom du gel> pour revenir à cet état.
        @note : <nom du gel> doit être utilisé en `arg1`
        
        ? op = gel & arg1 = nom_du_gel
    
    degel <nom du gel>
    
        Procède au dégel de <nom du gel>, c'est-à-dire revient à cet état.
    
    folder_exists? <path>
    
        Return true si le dossier de path <path> existe.
    
    file_exists? <path>
    
        Return true si le fichier de path <path> existe.
        