/*
    Pour les tests sur les fichiers
    -------------------------------
    
    Méthodes:
    ---------
    
		@NOTE		Attention, toutes ces méthodes sont asynchrones, donc il faut les
						utiliser en toute connaissance de cause.

    TFile.exists(<path>)  // => return TRUE si <path> exists

    TFile.not_exists(<path>)  // => return TRUE si <path> n'existe pas

		TFile.should_exist(<path>, <poursuivre>)
			Vérifie qu'un fichier existe.
			Si ce n'est pas le cas, une erreur de fin de boucle wait sera générée.
			@TODO: 	Il faudrait pouvoir décider ce que doit faire Wait lorsqu'on attend
							un certain temps.
							Il faut pouvoir décider ce temps aussi. Par exemple, pour l'existence
							d'un fichier, on peut le savoir tout de suite, si le fichier ne doit pas
							être créé.

		TFile.should_not_exist(<path>, <poursuivre>)
			Vérifie la non existence d'un fichier.
			Méthode asynchrone donc la mettre en fin d'étape et mettre dans <poursuivre>
			l'appel de la fonction principale de test (ou autre).

    TFile.wait_for_creating_of(<path>, <poursuivre>)
      Attend sur la création de <path>

    TFile.wait_for_destroying_of(<path>, <poursuivre>)
      Attend la destruction de <path>
    
    TFile.get(<path>, <options>, <poursuivre>)
      * Remonte le contenu du fichier <path>
			* Ce contenu doit être récupéré par la méthode `TFile.get_file_content()` dans
				la fonction qui poursuit le chargement (<poursuivre>)
				@note 	Ce contenu n'est pas envoyé en premier argument de cette méthode, pour une
								plus grande souplesse.
      * Les options permettent notamment de définir le format de retour en définissant
			la propriété `as`
        as:'json'    La donnée est parsée par le script ruby
        as:'brut'    (défaut) La donnée est remontée telle quelle.
      
    Notes:
    ------
    
    Note: la plupart de ces méthodes ne sont à utiliser que dans des boucles
          Wait, car elles sont asynchrones.
          Exceptionnellement, on peut :
            - Appeler une méthode
            - Appeler une méthode Wait vérifier l'existence d'une valeur TFile
            - Poursuivre
    
    Noter que la méthode `TFile.exists' et `TFile.not_exists' n'ont pas du tout
    la même vocation. Il faut se souvenir qu'elles renvoient toutes les deux
    TRUE lorsque la réponse est positive et UNDEFINED ou FALSE dans le cas
    contraire.
    Donc il faut toujours les utiliser avec Wait.until et la condition attendue,
    `exists` si l'on attend la création d'un élément et `not_exists' si on
    attend sa destruction.
    
    

    
*/
window.TFile = {
	resultat: null,				// Le résultat de l'opération est mis dans cette propriété, qui peut
												// être checké par les scripts de test
  existing: null,       // Liste des fichiers existants (déjà testés)
                        // Mais c'est surtout grâce à cette donnée qu'on peut
                        // interrompre une boucle Wait.
  
  ajaxing:false,        // Mis à TRUE quand TFile travaille (entendu qu'une boucle
                        // Wait va envoyer les requêtes à répétition.)
  
  check_for_existance: null,
  
  file_content:null,    	// Le contenu du fichier remonté (cf. `get')
  path_for_content:null,  // Le path du fichier dont il faut remonter le contenu
                          // (pour les messages)
  // Initialisation
  // NE PAS OUBLIER D'APPELER CETTE MÉTHODE AVANT UNE BOUCLE WAIT
  init:function(){
    this.existing = null;
    this.ajaxing  = false;
  },
  
  get:function(path, options, poursuivre){
    this.file_content = null;
    this.path_for_content = path;
    Ajax.send({script:'file/get', path:path, options:options},
      $.proxy(this.suite_get,this));
    Wait.while(
      function(){
        return TFile.file_content == null;
      }, $.proxy(this.end_get, this, poursuivre)
    );
  },
  suite_get:function(rajax){
    if(rajax.ok){
      this.file_content = rajax.file_content;
      success("Contenu de `"+this.path_for_content+"` remonté avec succès.")
    } else{ 
      failure("Impossible de remonter le contenu de `"+this.path_for_content+"`…");
      this.file_content = "CONTENU IMPOSSIBLE À RÉCUPÉRER";
    }
  },
  end_get:function(poursuivre){
    poursuivre();
  },
	should_exists:function(path, poursuivre){
    Wait.until(function(){
      res = TFile.exists(path);
      if(res) success("`"+path+"` existe.");
      return res;
    }, poursuivre);
	},
	should_not_exists:function(path,poursuivre){
    Wait.until(function(){
      res = TFile.not_exists(path);
      if(res) success("`"+path+"` n'existe pas.");
      return res;
    }, poursuivre);
	},
  wait_for_creating_of:function(path, poursuivre){
    Wait.until(function(){
      res = TFile.exists(path);
      if(res) success("Création OK de `"+path+"`.");
      return res;
    }, poursuivre);
  },
  wait_for_destroying_of:function(path, poursuivre){
    Wait.until(function(){
      res = TFile.not_exists(path);
      if(res) success("Destruction OK de `"+path+"`.");
      return res;
    }, poursuivre);
  },
  
  // Vérifie la non existence d'un fichier
  not_exists:function(path){
    if(this.ajaxing) return false;
    this.check_for_existance = false;
    return this.check_file(path);    
  },
  // Vérifie l'existence d'un fichier
  exists:function(path){
    if(this.ajaxing) return false;
    this.check_for_existance = true;
    return this.check_file(path);
  },
  check_file:function(path){
    this.ajaxing = true;
    // Si le fichier a déjà été testé, et qu'il est présent, on renvoie la
    // valeur de son existence et on détruit sa donnée (pour ne pas interférer
    // avec d'autres tests)
    if(this.existing && undefined != this.existing[path]){
      delete this.existing[path];
      this.ajaxing = false;
      return true;
    }
    // Sinon, on envoie la requête qui va tester sa présence
    Ajax.send({script:'file/exists', path:path},$.proxy(this.exists_suite, this))    
  },
  exists_suite:function(rajax){
    if(rajax.ok){
      if(this.existing == null) this.existing = {};
      if(this.check_for_existance == rajax.file_exists){
        this.existing[rajax.file_path] = true;
				this.resultat = this.check_for_existance
      }
        
    } else F.error(rajax.message);
    this.ajaxing = false;
  },
	
	// Retourne le contenu du fichier remonté par get.
	// @note	Il vaut mieux passer par cette méthode qui initialisera la propriété `file_content'.
	get_file_content:function(){
		var code = this.file_content;
		this.file_content = null;
		return code;
	}
}