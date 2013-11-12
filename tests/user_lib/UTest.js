window.UTest = {
  
  // Initialisation des tests (à chaque lancement de test)
  initialize:function(){
    // Pour mettre des valeurs à passer
    APP.TestValues = {}
    
  },
  
  // Relance l'application, attend qu'elle soit chargée avant de poursuivre
  reload:function(etape){
		if('function'==typeof etape){
			this.poursuivre = etape;
			etape = "Reload demandé";
		}
		if(etape == "Reload demandé"){
		  APP.location.reload();
			this.reload("Attendre que App soit ready");
		}
		else if(etape == "Attendre que App soit ready"){
		  return Wait.until(
		    function(){
		      if(undefined == APP.App)return false;
		      return APP.App.ready;
		      },
		    $.proxy(this.reload, this, 'Attente fin chargement page')
			);
		}
		else if(etape == 'Attente fin chargement page'){
			
		}
  	else {
  		this.poursuivre();
  	}
  },
  
  Synopsis:{/* Les synopsis définis dans le dossier `./tests/lib/synopsis/' */}
  
}