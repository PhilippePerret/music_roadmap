/*	Class TScript
 *	------------
 *	Gestion des scripts de test
 *
 */
window.TSCRIPTS = {} // tous les scripts actifs


// Instanciation
// @param		data			Doit contenir au minimum :
// 											::relative_path				Le path qui produira le nom de la fonction principale
// 											::folders							Les dossiers À PARTIR DE `<app>/tests/`
// 
window.TScript = function(data){
	this.relative_path		= null				// Path relatif qui permet de DÉFINIR LE NOM DE LA FONCTION
	this.folders					= null				// Les dossiers dans lesquels se trouvent le fichier, jusqu'à
																			// `relative_path`. En d'autres termes, folders+relative_path
																			// doivent donner le path depuis le dossier `tests` de
																			// l'application
	this.path 						= null 				// Le path DEPUIS LA RACINE de l'application testée
	this.uid							= Time.now()	// Identifiant unique du script
	this.script_id	      = "script-"+this.uid // ID pour la balise
	this.function_name		= null				// Le nom de la fonction (à partir du path ou fourni)
	this.fonction					= null				// Référence exacte à la fonction

	// TScript, Fonction et/ou arg pour suivre ce script
  // Utile lors d'une suite de tests ou lorsqu'un test appelle un autre test
	this.function_after		= undefined		// La fonction pour suivre, si fournie
	this.script_after			= undefined		// Le TScript pour suivre, si fourni
	this.arg							= undefined		// Les arguments optionnels à envoyer à la fonction
                                      // @todo: le mettre au singulier, on ne passe qu'un seul
                                      // argument

	// Utiles
	this.proxy						= null				// {Function} Une référence à la fonction principale du script
                                      // Doit devenir OBSOLÈTE
	// Pour les étapes
	this._step_list				  = undefined		// La liste des étapes du script {Array of TScript}
	this.number_of_steps	  = undefined		// {Number} Nombre d'étapes
	this.curstep_indice			= undefined		// {Number} Indice de l'étape courante
	
  this._message_running_ok = false    // Pour l'affichage de 'Running <nom du script>'
	this._first_run_ok		= false				// Sera mis à TRUE lorsque la préparation du script sera 
																			// faite. C'est-à-dire lorsque le script sera implanté et
                                      // que la Main Test Function sera complètement chargée.
	
  this.step_list_must_have_been_defined_or_not = false
  
  // Protection anti-répétition
  this.nombre_appels          = 0
  this.NOMBRE_MAX_APPELS      = 200   // Sera rectifié quand on connaitra le nombre d'étapes

  // Disptach des données envoyées
	for(var prop in data){
		if(false == data.hasOwnProperty(prop)) continue
		this[prop] = data[prop]
	}
	
	// Calcule le nom de la fonction (s'il n'a pas été fourni)
	this.path_and_fonction_name
	
	TSCRIPTS[this.uid] = this
	
}

	
Object.defineProperties(TScript.prototype, {
	"first_run":{
		get:function(){
      if(false == this._message_running_ok){
        var p = this.relative_path
        if(p.substr(-3)!='.js') p += '.js'
  	    db(LOCALES.messages['running'] + "`" + p + "'", SYSTEM);
        this._message_running_ok = true
      }
			if(!this._implanted) this.implant
			if( false == this.wait_for_loading ) return
			this._first_run_ok = true
			this.run
		}
	},
	// Joue le script préparé
	// ----------------------
	"run":{
		get:function(){
			if(false == this._first_run_ok) return this.first_run
			
			// === FONCTION PRINCIPALE DE TEST JOUÉE ===
			
      // -- Protection anti-répétion --
      ++ this.nombre_appels
      if(this.nombre_appels > this.NOMBRE_MAX_APPELS){
        throw "TROP GRAND NOMBRE D'APPELS DU SCRIPT. JE BREAKE"
        Test.end()
        return false
      }
      
			try{        
        
        /* if(!this.fonction.waiting) */ this.fonction.run
        /*
         *  Normalement, ici, la liste des étapes devrait avoir été définie.
         *  Mais ça n'est pas toujours le cas lorsque le script ne contient qu'une seule
         *  étape. Dans ce cas, lorsque le script ne possède pas de boucle d'attente, ça
         *  ne pose pas de problème (vrai avec un synopsis ?) mais dans le cas contraire,
         *  le début du script est appelé en boucle. Donc cette propriété permet, dans next_step
         *  de savoir s'il y aura vraiment une étape suivante.
         *
         *  Noter que cette propriété est aussi définie dans le throw, et c'est surtout
         *  là qu'elle est utile, puisque c'est par le throw qu'on passe lorsqu'il y a
         *  une formule d'attente.
         */
        this.step_list_must_have_been_defined_or_not = true
        
			} catch( erreur ){
        
        var is_object = 'object' == typeof erreur
        if( is_object )
        {
          switch(erreur.type)
          {
          case 'regular_error':
            this.step_list_must_have_been_defined_or_not = true
            this.run
            break
          default:
            force_db("### [TScript.run] Type d'erreur ingérée : " + inspect(erreur) +
            "\n"+erreur)
          }
        }
				else return Test.fatal_error(erreur)
			}
		}
	},
	// Implémente le script dans la page
	"implant":{
		get:function(){
			if($('head script#'+this.script_id).length > 0) return
			$('head').append('<script id="'+this.script_id+'" src="'+this.path+'" type="text/javascript" charset="utf-8"></script>');
			this._implanted = true
		}
	},
	// Attend
	"wait_for_loading":{
		get:function(){
			if(undefined == this.nombre_try_loading) this.nombre_try_loading = 0
			else {
				if(this.nombre_try_loading > 100){
					return force_db("### IMPOSSIBLE DE TROUVER LA FONCTION "+this.function_name+". Je dois renoncer", WARNING)
				}
				++ this.nombre_try_loading
			}
			try{
				this.fonction = eval(this.function_name)
			}catch(erreur){
				if( this.timer_load ) clearTimeout(this.timer_load)
				this.timer_load = setTimeout("TSCRIPTS['"+this.uid+"'].first_run", 300)
				return false
			}
			if( this.timer_load ) clearTimeout(this.timer_load)
			this.define_proxy
			this.prepare_fonction
		}
	},
	// Définit le proxy pouor la fonction fonction
	"define_proxy":{
		get:function(){
			this.proxy 		= $.proxy(this.fonction , this)
		}
	},
	// Colle les méthodes à la fonction courante
	"prepare_fonction":{
		get:function(){
			this.fonction.script = this
			Object.defineProperties(this.fonction, _PropertiesMainTestFunction)
		}
	},
	// Dé-implémente le script de la page
	"unimplant":{
		get:function(){
			$('head script#'+this.uid).remove()
			delete this.fonction
			this._implanted = false
		}
	},
	// Abort le script
	"abort":{
		get:function(){
			this.unimplant
		}
	},
	// Calcule le path du script et le nom de la fonction, sauf si ce nom
	// a été fourni
	"path_and_fonction_name":{
		get:function(){
			this.path = './tests/'+ this.folders + '/' + this.relative_path
			if(this.path.substr(-3) != '.js' ) this.path += '.js'
			// if(this.function_name) return // on ne fait rien si le nom a été transmis
			this.function_name	= this.relative_path.replace(/\//g, '_');
			if(this.function_name.substr(-3) == '.js') this.function_name = this.function_name.substr(0, this.function_name.length-3);
		}
	}
})



