/*
 *  Crée un élément quelconque dans le DOM de l'application
 *
 *  Noter que c'est le seul cas (normalement) où les données envoyées à l'instanciation
 *  peuvent ne contenir que le type de la balise (p.e. `jq('div')`)
 *
 *  @param    data  {Object} Les données pour construire l'élément (cf. ci-dessous)
 *
 *  NOTE IMPLÉMENTATION
 *  -------------------
 *  L'idée est la suivante : la plupart des valeurs qui sont passées seront considérées comme
 *  des propriétés de `style' (position, width, etc.). Donc on commence par retirer les propriétés
 *  qui ne sont pas des styles (id, class, etc.) et on traite ce qui reste.
 *  - Comme les dimensions peuvent être données sans unité, il faut les tester.
 *
 *  Données pour construire l'élément
 *  ---------------------------------
 *
 *  id            Identifiant de l'élément (le tag doit avoir été fourni à l'instanciation)
 *
 *  --- conteneur ---
 *  container     Élement DOM (pas jQuery). Si non fourni, le body
 *
 *  --- Contenu ---
 *  content       Le contenu de l'élément (code HTML ou simple texte)
 *  value         Le contenu si c'est un élément à valeur (input, textarea...)
 *
 *  --- Style ---
 *  style         Contenu de la balise style, mais sous forme de hash ({Object}).
 *                Par exemple : data.style = {width:"2em", position:"absolute", etc.}
 *                Noter que d'autres styles peuvent être définis ci-dessous
 *
 *  --- Dimensions et positionnement ---
 *  Elles peuvent être spécifiées soit explicitement dans `data.style' (mais AVEC L'UNITÉ), soit
 *  sous forme de nombre dans `data' (p.e. data.width)
 *  width     Largeur         (+ toutes les dérivés avec min et max )
 *  height    Hauteur         (   ""        ""          ""          )
 *  top       du haut         
 *  left      de la gauche
 *  right     de la droite
 *  bottom    Du bas
 *  margin-(left|right|bottom|top)
 *  etc.
 *
 *  position  <position>
 *
 * --- Spécial jQuery ---
 *  draggable     Si défini l'objet est rendu draggable avec sa valeur donnée en argument
 *  sortable      Idem pour un élément classable
 *  droppable     Idem pour un élément lâchable
 *
 *
 * --- Extra attributes ---
 *  Si des attributs spéciaux doivent être ajoutés, il faut les définir dans la propriété :
 *  attrs         Hash : {attr_name: attr_value, attr_name, attr_value, etc.}
 *
 */
// À mettre "à l'extérieur" quand ce sera OK
JQ_SPECIAL_PROPERTIES = ";"+[
  'draggable','sortable','droppable',
  'content', 'value'
  ].join(';')+";"
JQ_SPECIAL_PROPERTIES_WITHOUT_UNIT = 
";"+[ 'width','min-width','max-width',
      'height','min-height', 'max-height',
      'top', 'bottom','left','right',
      'margin-left','margin-right','margin-bottom', 'margin-top',
      'border-width','border-width-left','border-width-right','border-width-top','border-width-bottom'
      ].join(';') + ';'

_jq.prototype.create = function(data){
    
  try{
    if(undefined == data){data = {}}

    // Le jid à la création du div peut être soit la balise seule soit un jid normal
    // var balise, djid ;
    if(this.jid.indexOf('.') > -1 ){
      djid = this.jid.split('.')
      balise      = djid[0]
      data.class  = djid[1]
    }
    else if (this.jid.indexOf('#') > -1){
      djid = this.jid.split('#')
      balise      = djid[0]
      data.id     = djid[1]
    }
    else {
      balise    = this.jid
      this.jid  = this.jid + '#' + data.id
    }

    if(undefined == data.id && undefined == data.class)throw LOCALES.errors.jq['id_or_class_required_to_create']
    with(APP){
      if( data.id && $('#'+data.id).length > 0 ) throw LOCALES.errors.jq['id_must_be_unique']
    }
  }catch(erreur){
    w(erreur, WARNING)
    return this
  }
  
  var el = document.createElement(balise.toUpperCase())
  
  
  // Les attributs de l'élément
  // @noter qu'on les ajoute en les retirant de `data'
  var attributes = { id: data.kdelete('id'), class:data.kdelete('class') }
  
  // Les attributs supplémentaires (qu'on retire de `data')
  if(undefined != data.attrs)
  {
    $.extend(attributes, data.kdelete('attrs'))
  }
  
  // Les styles (qu'on retire aussi de `data')
  if(undefined == data.style) les_styles = ""
  else les_styles = data.kdelete('style')
  
  // Par convénience, on transforme toujours la propriété styles en string
  if('string' != typeof les_styles)
  {
    les_styles = L(les_styles).collect(function(key,val){return key+":"+val}).join(';')
  }
  
  
  // On boucle sur les propriétés restants dans `data'
  // Si elles sont "spéciales", on les traite, sinon, on les ajoute à l'attribut 'style'
  var spec_props = {} ;
  L(data).each(function(prop, value){
    // par exemple la propriété 'draggable'
    if( JQ_SPECIAL_PROPERTIES.match(';'+prop+';') )
    {
      spec_props[prop] = value
    }
    else
    {
      // C'est une propriété à ajouter à l'attribut style
      // Si c'est une propriété style qui peut être spécifiée sans unité, et que c'est un 
      // nombre, on lui ajoute "px"
      if( JQ_SPECIAL_PROPERTIES_WITHOUT_UNIT.match(';'+prop+';') && 'number' == typeof value)
      {
        value += 'px'
      }
      les_styles += prop + ":" + value + ";"
    }
  })
  
  attributes.style = les_styles
  
  // On place tous les attributs
  L(attributes).each(function(attr,value){el.setAttribute(attr, value)})
  
  with(APP){
    if(! data.container) data.container = document.getElementsByTagName('body')[0]
    data.container.appendChild(el)
  }
	this._get_obj()

  // Contenu/valeur
  if(undefined != spec_props.content) this.obj.html(spec_props.content)
  if(undefined != spec_props.value  ) this.obj.val(spec_props.value)
  
  // Spéciales jQuery
  if(undefined != spec_props.draggable) this.obj.draggable(spec_props.draggable)
  if(undefined != spec_props.droppable) this.obj.droppable(spec_props.droppable)
  if(undefined != spec_props.sortable ) this.obj.sortable (spec_props.sortable )
  
  
  return this
}
