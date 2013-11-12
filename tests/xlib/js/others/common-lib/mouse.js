/*
 * 	Objet Mouse
 *	-----------
 *  Gestion de la souris pour simulations
 */

// Class FakedMouseEvent
//				Pour un évènement souris simulé
window.FakedMouseEvent = function(data){
	this.class 	= 'FakedMouseEvent'
	this.data 	= data
}
Object.defineProperties(FakedMouseEvent.prototype, {
	// Active l'évènement souris
	"fire":{
		get:function(){this.init.dispatch},
    enumerable:true
	},
	"init":{
		get:function(){
      // -- debug --
      // var data_init = [          
      //     this.type,
      //           this.bubble, this.cancelable,
      //           window, this.detail,
      //           this.xScreen, this.yScreen, this.xClient, this.yClient, /* coordinates */
      //           this.ctrl, this.alt, this.shift, this.meta, /* modifier keys */
      //           this.button, this.related /* related target (when mouseout, mouseover, etc.) */
      //     ]
      // -- /debug --
		  this.event.initMouseEvent(
		      this.type,
		      this.bubble, this.cancelable,
		      window, this.detail,
		      this.xScreen, this.yScreen, this.xClient, this.yClient, /* coordinates */
		      this.ctrl, this.alt, this.shift, this.meta, /* modifier keys */
		      this.button, this.related /* related target (when mouseout, mouseover, etc.) */
		  )
			return this
		}
	},
	"dispatch":{
		get:function(){
			this.domObj.dispatchEvent(this._event)
			return this
		}
	},
	"type":{
		get:function(){return this.data.type}
	},
	"event":{
		get:function(){
			if(undefined == this._event) this._event = Mouse.create_event()
			return this._event
		}
	},
	"domObj":{
		get:function(){
			if( undefined == this._domObj ){
				if(this.data.domObj){
					if(undefined == this.data.domObj.jquery) this._domObj = this.data.domObj
					else this._domObj = this.data.domObj[0] // Obj jQuery
				}
				else {
					this._domObj = document.elementFromPoint(this.x,this.y)
				}
			}
			return this._domObj
		}
	},
	"xClient":{get:function(){return this._xClient || this.calc_xClient}},
	"yClient":{get:function(){return this._yClient || this.calc_yClient}},
	"xScreen":{get:function(){return this._xScreen || this.calc_xScreen}},
	"yScreen":{get:function(){return this._yScreen || this.calc_yScreen}},
	
	"calc_xClient":{
		get:function(){
			if(this.data.domObj) 	this._xClient = this.x + this.domObj.offsetLeft
			else 									this._xClient = 0
			return this._xClient
		}
	},
	"calc_yClient":{
		get:function(){
			if(this.data.domObj)	this._yClient = this.y + this.domObj.offsetTop	
			else 									this._yClient = 0
			return this._yClient
		}
	},
	"calc_xScreen":{
		get:function(){
			if(this.data.domObj) 	this._xScreen = this.xClient
			else 									this._xScreen = this.x
			return this._xScreen
		}
	},
	"calc_yScreen":{
		get:function(){
			if(this.data.domObj) 	this._yScreen = this.yClient
			else 									this._yScreen = this.y
			return this._yScreen
		}
	},
	"x":{
		get:function(){
			if(undefined == this._x) this._x = parseInt(this.data.x || 0, 10)
			return this._x
		}
	},
	"y":{
		get:function(){
			if(undefined == this._y) this._y = parseInt(this.data.y || 0, 10)
			return this._y
		}
	},
  "ctrl":{get:function(){return this.data.ctrl || false}},
  "alt":{get:function(){return this.data.alt || false}},
  "shift":{get:function(){return this.data.shift || false}},
  "meta":{get:function(){return this.data.meta || false}},
  "button":{get:function(){return this.data.button || Mouse.LEFT_BUTTON}},
  "related":{get:function(){return this.data.related || null}},
  "cancelable":{get:function(){return this.data.cancelable || false}},
  "detail":{get:function(){return this.data.detail || 1}},
  "bubble":{get:function(){
    if(undefined == this.data.bubble) return true
    else return this.data.bubble
  }}
  
})

window.Mouse = {
	LEFT_BUTTON 	: 0,
	MIDDLE_BUTTON : 1,
	RIGHT_BUTTON	: 2,
	
	event:null,			// L'évènement mouse courant
	
	/*	Simule un évènement quelconque
	 *
	 *	@param		data_add		{object} Les données qui seront ajoutées aux data par défaut
	 *												type 			: Le type d'évènement 		Default: 'click'
	 *												domObj		: L'objet DOM de référence. S'il est fourni, c'est sur lui
	 *																		que se fera le click. Sinon, les +x+ et +y+ permettront de
	 *																		définir sur quel élément le click se fera.
	 *																		Default: NULL
	 *												x					: Position X du click si +domObj+ n'est pas fourni
	 *																		Sinon, sera le décalage horizontal dans +domObj+
	 *																		Default: 0
	 *												y					: Position Y du click si +domObj+ n'est pas fourni
	 *																		Sinon, sera le décalage vertical dans +domObj+
	 *																		Default: 0
	 *
	 *												button		: Le bouton de la souris pressé							Default: left
	 *												ctrl			: Si TRUE, simule la touche CTRL pressée 		Default: false
	 *												alt				: Si TRUE, simule la touche ALT pressée 		Default: false
	 *												shift			: Si TRUE, simule la touche SHIFT pressée 	Default: false
	 *												meta			: Si TRUE, simule la touche META pressée 		Default: false
	
	 */
	fireFakedEvent:function(data_add){
		this.fakedEvent(data_add).fire
	},
	
  fakedEvent:function(data_add){
		var data = {
									type:'click', domObj:null, x:0, y:0,
									ctrl:false, alt:false, shift:false, meta:false, button:this.LEFT_BUTTON
								}
		if(undefined != data_add) $.extend(data, data_add)
		return new FakedMouseEvent(data)
  },
	
  // Création de l'évènement document
  create_event:function(){
	  var ev = document.createEvent("MouseEvents");
		if(document.createEvent) 	return document.createEvent('MouseEvents')
		else 											return document.createEventObject()
	},
  
  // Retourne un Hash contenant, left/x, top/y, width/w et height/h de l'objet +obj+
  // + center_x (son centre horizontal) center_y (son centre vertical)
  dim_and_pos_of:function(obj){
    if(undefined != obj.jquery) obj = obj[0];
    var data = {
      left    :obj.offsetLeft, 
      top     :obj.offsetTop,  
      width   :obj.offsetWidth,
      height  :obj.offsetHeight
    }
    data.x = data.left; data.y = data.top; data.w = data.width; data.h = data.height
    data.center_x = data.x + (data.w / 2)
    data.center_y = data.y + (data.h / 2)
    return data
  },
  
  // Simule un click dans drag sur l'objet +obj+ avec les données +data+
  // 
  // @param   obj     L'objet DOM (natif ou jQuery)
  // @param   data    Les données du déplacement (cf. la méthode `move_on' ci-dessous)
  // 
  // @produit Le déplacement de l'objet (s'il est draggable)
  // 
  press_and_drag:function(obj, data){
    this.down_on(obj)
    this.move_on(obj, data)
    this.up_on(obj)
  },
  // Génère un mousedown sur l'objet +obj+ avec les options éventuelles
  // @param   obj   Un objet DOM (natif ou jQuery)
  down_on:function(obj, options){
    this.fireFakedEvent({domObj: obj, type:'mousedown'})
  },
  // Génère un mousemove sur l'objet +obj+ avec les options fournies
  // 
  // @param   obj       Un objet DOM (natif ou jQuery)
  // @param   opts      {Object} qui doit définir les données du déplacement
  //                    --- définition d'un objet de référence ---
  //                    to_obj  : Permet de se mettre au centre de l'obj DOM fourni
  //                    offx_obj  : Le décalage X par rapport au centre X de l'objet 
  //                    offy_obj  : Le décalage Y par rapport au centre Y de l'objet
  //                    --- Et/ou coordonnées précises à atteindre ---
  //                    to_x    : Permet de se rendre à cette donnée horizontale
  //                    to_y    : Permet de se rendre à cette donnée verticale
  //                    --- Et/ou déplacement à effectuer
  //                    for_x   : Permet de déplacer horizontalement de +for_x+ pixels
  //                    for_y   : Permet de déplacer verticalement de +for_y+ pixels
  //                    --- Note ---
  //                    @note : Toutes ces données peuvent être combinées, les données manquantes
  //                            sont laissées à 0. Elles sont analysées dans l'ordre ci-dessus.
  //                            C'est-à-dire que si un objet est fourni et que la valeur +for_x+
  //                            est données également, ce +for_x+ remplacera la valeur x de l'objet
  // 
  move_on:function(obj, opts){
    var data = {domObj: obj, type:'mousemove', x:null, y:null}
    var dap_obj = this.dim_and_pos_of( obj )
    if(undefined == opts){ data.x = 0; data.y = 0 }
    else {
      if(undefined != opts.to_obj){
        var dap = this.dim_and_pos_of( opts.to_obj )
        data.x  = (dap.left + (dap.width  / 2)) - dap_obj.left
        data.y  = (dap.top  + (dap.height / 2)) - dap_obj.top
        if(undefined != opts.offx_obj) data.x += opts.offx_obj
        if(undefined != opts.offy_obj) data.y += opts.offy_obj
      }
      if(undefined != opts.to_x)  data.x = opts.to_x - dap_obj.left
      if(undefined != opts.to_y)  data.y = opts.to_y - dap_obj.top
      if(undefined != opts.for_x) data.x = opts.for_x
      if(undefined != opts.for_y) data.y = opts.for_y
    }
    this.fireFakedEvent(data)
  },
  // Génère un mouseup sur l'objet +obj+ avec les options fournies
  // @param   obj       Un objet DOM (natif ou jQuery)
  // @param   option    {object}
  up_on:function(obj, options){
    this.fireFakedEvent({domObj: obj, type:'mouseup'})
  },
  

  x_init:null,      // Le clientX au démarrage (défini par this.mouse_init)
  y_init:null,
  x_last:null,      // Le dernier clientX enregistré
  y_last:null,
  x_curr:null,      // Le clientX courant
  y_curr:null,
  
  // Appeler cette méthode pour mettre en route le déplacement
  // Ensuite, appeler la méthode `Mouse.mouse_offset' dans le mousemove pour
  // connaitre l'ampleur du déplacement.
  mouse_init:function(evt){
    this.obj    = evt.currentTarget
    this.x_obj  = this.obj.offsetLeft
    this.y_obj  = this.obj.offsetTop
    this.x_init = evt.clientX; this.y_init = evt.clientY
    this.x_last = evt.clientX; this.y_last = evt.clientY
    this.x_curr = 0; this.y_curr = 0
  },
  mouse_offset:function(evt){
    this.x_curr += (evt.clientX - this.x_last ) * (evt.altKey ? 0.1 : 1);
    this.y_curr += (evt.clientY - this.y_last ) * (evt.altKey ? 0.1 : 1);
    this.x_last = evt.clientX;
    this.y_last = evt.clientY;
    return {
      offset_x:this.x_curr,   // le décalage horizontal par rapport au dernier appel
      offset_y:this.y_curr,   // le décalage vertical par rapport au dernier appel
      new_x   :this.x_obj + this.x_curr,   // La nouvelle position horizontale
      new_y   :this.y_obj + this.y_curr    // La nouvelle position vertical
      // new_x   :this.x_init + this.x_curr,   // La nouvelle position horizontale
      // new_y   :this.y_init + this.y_curr    // La nouvelle position vertical
    };
  },
  // Méthodes pour ne prendre en compte que le
  // déplacement horizontal
  mouse_x_init:function(evt){
    this.x_last = evt.clientX;
    this.x_init = evt.clientX;
    this.x_curr = 0;
  },
  // Retourne le déplacement de la souris par rapport au 
  // dernier déplacement en tenant compte des touches pressées
  mouse_x_offset:function(evt){
    this.x_curr += (evt.clientX - this.x_last ) * (evt.altKey ? 0.1 : 1);
    this.x_last = evt.clientX;
    return this.x_curr;
  },
  // Méthodes pour ne prendre en compte que le
  // déplacement vertical
  mouse_y_init:function(evt){
    this.y_last = evt.clientY;
    this.y_init = evt.clientY;
    this.y_curr = 0;
  },
  // Retourne le déplacement de la souris par rapport au 
  // dernier déplacement en tenant compte des touches pressées
  mouse_y_offset:function(evt){
    this.y_curr += (evt.clientY - this.y_last ) * (evt.altKey ? 0.1 : 1);
    this.y_last = evt.clientY;
    return this.y_curr;
  },
  
  mouse_stop:function(){
    this.x_init = null; this.y_init = null;
    this.x_last = null; this.y_last = null;
    this.x_curr = null; this.y_curr = null;
  }
  
}

