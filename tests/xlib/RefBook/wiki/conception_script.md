
## Faire passer des valeurs d'une étape à une autre

Puisque la méthode est rappelée d'ailleurs d'une étape à l'autre, les variables définies par :

    var ma_variable = "Donnée";

… sont perdues. Pour contourner le problème, il suffit de faire :

    this.ma_variable = "Données";
    
… et d'utiliser ensuite `this.ma_variable` dans la suite.

Noter que `this`, dans une fonction (contrairement à une méthode), est la `window` elle-même.