/*
    DArray class  (« DArray » for « DOM Array »)
    ------------
    
    Permet de définir une liste d'éléments DOM par leur « jID » (tag#id) et de les
    traiter en bloc pour les afficher, les rendre invisible, etc.
    
    * USAGE
    
    darray = new DArray([... array ...]);
    P.E.:  darray = new DArray(['a#mon_bouton', 'div#mon_div']);
    
    ('hidden' CSS class must be defined with display:none !important)
    darray.show()                 Display all elements of darray (by style display)
    darray.hide()                 Hide all elements of darray (idem)
    ('invisible' CSS class must be defined with visibility:hidden)
    darray.visible()              Set the elements visible (Removing class 'invisible')
    darray.invisible()            Set the elements invisible Add class 'invisible' 
    darray.set_visible(true/false)  Set visible/invisible
*/  
window.DArray=function(obj){
  this.object = obj;
}

$.extend(DArray.prototype,{
  show:function(){this.set_display(true)},
  hide:function(){this.set_display(false)},
  set_display:function(disp){
    // this.run_method_on_object(disp?'show':'hide');
    this.run_method_on_object(disp?'removeClass':'addClass', 'hidden')},   
  visible:function(){this.set_visible(true)},
  invisible:function(){this.set_visible(false)},
  set_visible:function(visi){
    this.run_method_on_object(visi?'removeClass':'addClass', 'invisible');    
  },
  run_method_on_object:function(method, param1, param2){
    if('undefined' == typeof this.object.length){// Hash
      for(var k in this.object){$(this.object[k]+"#"+k)[method](param1, param2)}
    } else {// Real Array
      $(this.object).each(function(i,o){$(o)[method](param1, param2)});
    }
  }
})


// myarray = new DArray(["a#btn_roadmap_open", "a#btn_roadmap_create"]);
// myarray.show();