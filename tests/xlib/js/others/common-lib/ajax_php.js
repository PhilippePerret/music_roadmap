window.Ajax = {
	// URL pour appeler le script Ajax
	// @noter que contrairement à mes autres applications, qui appellent un fichier
	// propre, PureJSTests utilise toujours `tests.php` que ce soit pour charger
	// l'application de test ou pour traiter les requêtes ajax.
	url:window.location.href,
  options:null,
  
  stack:[],         // Mise en tampon des requêtes consécutives
  ajaxing:false,    // Mis à TRUE quand une requête est en cours
  
  // Envoie une requête Ajax
  // @param   data      Les données à envoyer
  //                    @note: peut contenir 'pour_suivre' qui sera mis dans les options.
  // @param   options   Les options, à commencer par la méthode pour suivre :
  //                    pour_suivre
  //                    OU la méthode pour suivre
  // 
  // La méthode gère les attaques multiples en les stockant dans son stack
  send:function(data, options, run_on_stack){
    // if(this.ajaxing == true)
    // {
    //   // On doit mettre la requête de côté
    //   // console.log("Mise en tampon de la requête " + JSON.stringify(data))
    //   this.stack.push([data, options, run_on_stack])
    //   return
    // }
    // else
    // {
    //   this.ajaxing = true
    //   if('function' == typeof run_on_stack) run_on_stack()
    //   // console.log("Je joue la requête :")
    //   // console.dir(data)
    //   // console.dir(options)
    // }
    if('undefined'==typeof options)options = {};
    else if ('function' == typeof options) options = {pour_suivre: options}
    if('undefined' != typeof data.pour_suivre){
      options.pour_suivre = data.pour_suivre;
      delete data.pour_suivre;
    }
    this.options = options;
    $.ajax({
      url     : this.url,
      type    : 'POST', 
      data    : {data:data, ajax:1},
      success : $.proxy(this.on_success, this),
      error   : $.proxy(this.on_error, this)
      });
  },
  on_success:function(data, textStatus, jqXHR){
    // console.dir({
    //   jqXHR:jqXHR, textStatus:textStatus, data:data
    // })
    if(this.options.pour_suivre) this.options.pour_suivre(data);
    this.next_stack()
    return true;
  },
  on_error:function(jqXHR, errStatus, error){
    if(console)console.dir(jqXHR);
    this.next_stack()
  },
  
  next_stack:function(){
    this.ajaxing = false
    if( this.stack.length > 0)
    {
      // On appelle la requête suivante (mémorisée en tampon)
      this.send.apply( null, this.stack.shift() )
    }
  }
}