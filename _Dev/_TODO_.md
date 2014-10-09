TESTS À IMPLÉMENTER
  

-# Penser qu'un problème qui peut survenir avec la nouvelle utilisation de
Marshal pour l'enregistrement des données, c'est que les clés sont des
symboles, contrairement à JSON.
-# Il faut aussi se méfier des enregistrements directs de Hash venus d'ajax,
   il faudrait toujours faire `param(:hash).to_sym` pour être certain d'avoir
   des clés symboliques partout.
