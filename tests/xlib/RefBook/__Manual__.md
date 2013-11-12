# Test en pur Javascript

*Tests pour tester la partie javascript du site, directement en javascript.*

## Pré-requis

* Un dossier './tests' à la racine de l'application contenant les fichiers tests.
* Un fichier './test/lib/utest.js' contenant l'objet UTest définissant notamment la
  méthode `initialize` permettant d'initialiser les tests.
* Le fichier `tests.php` à la racine de l'application (**).
* Une méthode dans l'application ouvrant ce fichier `tests.php`, contenant le
  code :

    function tests(){
      window.open('tests.php', "fenetre_test_pur_js");
    }
* Le dossier `xlib` contenant ce fichier `__Manual__` doit être placé dans le dossier
  `./tests/` de l'application et être chargé par `tests.php`
* Le dossier 'tests/xlib' contenant les procédures ajax/ruby, à placer dans le
  dossier principal des procédures ajax (pour moi, souvent : `./ruby/ajax/`).

## Librairies JS requises

* jquery
* L, Ajax

## Librairies propres à l'application testée

Les librairies propres à l'application doivent se trouver dans le dossier `./tests/user_lib`, elles seront toujours chargées au départ.

## Synopsis de test

Pour les opérations les plus courantes, on peut définir des «synopsis» dans le dossier `./tests/user_lib/synopsis/`. Tous ces synopsis sont chargés au lancement de l'application de test, donc il convient de donner des noms uniques aux méthodes.


## Lancement des tests

* Définir le nom du fichier contenant les tests et se trouvant dans `./tests/`.
  @note : ça peut être un chemin avec dossier, par exemple `mon/test.js` pour un
  fichier se trouvant dans `./tests/mon/test.js`.
* Cliquer sur le bouton «Lancer le test».

## Librairies importantes :

Note&nbsp;: Toutes ces librairies se trouvent dans `tests/xlib/lib/`.

`jQ.js`

    Tout ce qui concerne la gestion et la manipulation du DOM de l'application.
    Contient aussi bien des méthodes utilitaires (p.e. `jq(…).content()`) que
    des méthodes de test (p.e. `jq(…).should.be_visible()`).

`should.js`

    Les méthodes de test telles que `should.be_greater_than(foo, comp)`.

`Wait.js`

    Permet de gérer les attentes de l'application.

## Conception de scripts de test.

Cf. le fichier `conception_script.md` dans le dossier contenant ce manuel.

