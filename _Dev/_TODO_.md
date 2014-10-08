TESTS À IMPLÉMENTER
  - Adresse mail conforme à l'inscription
  - Impossibilité d'avoir deux noms identiques
  
NOUVEAUX TESTS AVEC RSPEC
  > Procédure pour tout initialiser dans le dossier au début des tests, et peut-être des états figés qui permettront de revenir vite dans un état précis.
  - C'est un module dans un dossier ruby/tests/
  - Il n'est jouable que si l'on est en mode développement (Params::development?)
  - Il doit répondre à des actions, grâce aux paramètres transmis

-# Penser qu'un problème qui peut survenir avec la nouvelle utilisation de
Marshal pour l'enregistrement des données, c'est que les clés sont des
symboles, contrairement à JSON.
-# Il faut aussi se méfier des enregistrements directs de Hash venus d'ajax,
   il faudrait toujours faire `param(:hash).to_sym` pour être certain d'avoir
   des clés symboliques partout.
  
-# La roadmap se sauve et se recharge correctement.
   Il faut poursuivre les essais :
     - voir si une séance de travail s'enregistre bien
     - voir si la séance de travail fait un bon rapport
     - voir si les préparations de séances peuvent se servir des données
     (note: Il faudra remettre en place les scripts qui me permettent de lire
      les data des séances enregistrées — bien voir que maintenant elles seront
      en marshal)