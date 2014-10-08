# Le script `tests_utilitaires.rb`

* [Liste des méthodes](#method_list)


Il permet de gérer les tests RSpec fait en online, en "préparant le terrain".

Il suffit d'appeler ce script (qui ne fonctionne qu'en développement) avec les paramètres précisant l'opération à exécuter et les paramètres.

Par exemple&nbsp;:

    http://www.music-roadmap.net/development/tests_utilitaires.rb?op=dis_quelque_chose

… va jouer l'opération `:dis_quelque_chose`.

Dans RSpec, qui définit le `app_host`, il suffit de faire&nbsp;:

    visit('/tests_utilitaires.rb?op=dis_quelque_chose')

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

    erase_all
    
        Supprime tous les utilisateurs et toutes les roadmaps.
    
    gel <nom du gel>
    
        Crée un "gel" de l'état courant, enregistré sous le nom <nom du gel>
        Utiliser degel <nom du gel> pour revenir à cet état.
        @note : <nom du gel> doit être utilisé en `arg1`
        
        ? op = gel & arg1 = nom_du_gel
    
    degel <nom du gel>
    
        Procède au dégel de <nom du gel>, c'est-à-dire revient à cet état.