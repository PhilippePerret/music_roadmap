

// Supprime un élément d'un hash par sa clé en renvoyant un hash
// contenant {key:value}
// Retourne NULL si la clé est inconnue
// @param   key             La clé qu'il faut supprimer
// @param   only_value      If FALSE returns an object {key:value} (default: true)
// @param   default_value   If key doesn't existe, the value returned (default:null)
Object.defineProperty(Object.prototype, "kdelete",{
  value:function(key, only_value, default_value){
    if(undefined == only_value)     only_value = true
    if(undefined == default_value)  default_value = null
    var h = {}
    if(false == this.hasOwnProperty(key))
    {
      h[key] = default_value
    }
    else
    {
      h[key] = this[key]
      delete this[key]      
    }
    if(only_value)  return h[key]
    else            return h
  },
  configurable:true, 
  enumerable:false // to be explicit
})