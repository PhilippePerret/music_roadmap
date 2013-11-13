/*
    Définition des raccourcis clavier
    
    @usage
    ------
    
    Dans l'application, il suffit d'utiliser :
    
    UI.Shortcuts.build(
      <jid du conteneur de la table>, // p.e. 'div#seance_start_shortcuts'
      { 
        shortcuts: <clé dans SHORTCUTS>, // p.e. 'Seance' 
        options:{
          current:true,     // Si TRUE, ces raccourcis sont pris en raccourcis courants
          open:true         // TRUE pour que la table soit ouverte
          }}
      );
*/
window.SHORTCUTS = {
  Seance:[
    {key:'P',       effect:"Pause / Reprendre"},
    {key:'Alt FlecheG', effect:"Revenir au précédent"},
    {key:'S',       effect:"Finir la séance"},
    {key:'Espace',  effect:"Commencer / Reprendre (après pause) / Exercice suivant"}
  ]
}