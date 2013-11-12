// Retourne le « type exact » de la valeur +valeur+
// array, integer, float (marge d'erreur si aucune décimale), 'nan', 'infinity', 'null', etc. 
function _exact_type_of(valeur){
	switch(typeof valeur){
		case 'function'	:
			// if(this.toString().indexOf('.') > -1) return 'method'
			return 'function'
		case 'object'		:
			if(valeur === null)                   return 'null'
      if(valeur instanceof RegExp)          return 'regexp'
			if('function' == typeof valeur.slice) return 'array'
			else return 'object'
		case 'number'		:
			var tos = valeur.toString()
			if(tos == "NaN") 				return "nan"
			if(tos == "Infinity") 	return "infinity"
			if(tos.indexOf('.')>-1) return 'float'
			else 										return 'integer'
		default: return typeof valeur // 'string', 'boolean'
	}
}

// Pour l'affichage de la valeur +valeur+
function inspect(valeur){
	switch(_exact_type_of(valeur)){
		case 'function':
			return valeur.toString()
		case 'object':
		case 'array':
			try{return JSON.stringify(valeur)}
			catch(erreur){return valeur.toString()+" ("+LOCALES.messages['cant be stringify']+": "+erreur+")"}
		case 'string':
			return "\""+valeur+"\""
		case 'null' 		: return "NULL"
		case 'boolean' 	: return valeur.toString().capitalize()
    case 'regexp'   : return valeur.toString()
		default : return valeur
	}
}

// Pour l'égalité réelle entre deux éléments +ques+ et +comp+, quel que
// soit leur type
// @param   ques      L'élément de référence
// @param   comp      L'élément à comparer
// @param   strict    Optionnel: Si TRUE, la comparaison doit être strict, donc les
//                    deux membres doivent être exactement de même type.
// 
// @retun   TRUE si les deux élément sont semblables, false dans le cas contraire
function complexEquality(ques, comp, strict)
{
  var evaluation = null
  var exact_type_ques = _exact_type_of(ques)
  var exact_type_comp = _exact_type_of(comp)
  if( strict && (exact_type_ques != exact_type_comp) )
  {
    // Comparaison stricte et exacttypes différents
    return false
  }
  else if( 'object' == typeof ques && exact_type_ques != exact_type_comp)
  {
    // Question de type object et exacttypes différents
    return false
  }
  else if( exact_type_ques == 'object' )
  {
    return _complexEqualityHash(ques, comp)
  }
  else if( exact_type_ques == 'array')
  {
    return _complexEqualityArray(ques, comp)
  }
  else if( exact_type_ques == 'function')
  {
    return ques == comp // suffisant ?
  }
  return ques == comp
  
}
// Pour l'égalité entre deux arrays
// @note: On a dû tester les éléments avec _exact_type_of
// 
// @noter qu'ici il peut y avoir un problème de boucle infinie si un des 
// éléments appelle un des éléments qui fait référence à l'élément, comme 
// ça arrive souvent avec les Dom Element par exemple.
function _complexEqualityArray(ques, comp) {
  var i = 0, len = ques.length, ques_el, comp_el;
  for(i = 0; i < len; ++i){
    if( false == complexEquality( ques[i], comp[i]) ) return false
  }
  return true
}


// Méthode récursive pour évaluer l'égalité entre deux hash Hash
// Entendu que la simple comparaison avec == est déficiente
// Retourne TRUE si ques et comp sont identifiques, FALSE dans le cas contraire
// @TODO: Traiter la récursivité interne (comment ?)
function _complexEqualityHash(quest, comp){
  if (quest == comp ) return true // évaluation simple, mais…
  // Ça ne renvoie pas toujours vrai même quand ça l'est, peut-être à cause
  // d'apostrophes ou autre, donc on essaie de stringifier par JSON
  try{
    to_quest = JSON.stringify(quest)
    to_comp = JSON.stringify(comp)
    if( to_quest == to_comp ) return true
  }
  catch(erreur){/* JSON ne sait pas tout stringifier (recursivité) */}
  // On procède à un meilleur check, car deux hash peuvent être stringifiés différents
  // et être les mêmes
  for(var prop in quest){
    if(false == quest.hasOwnProperty(prop)) continue
    if('undefined' == typeof comp[prop])        return false // propriété absente
    if(typeof quest[prop] != typeof comp[prop]) return false // différence de type
    if(quest[prop] /* éviter NULL */ && typeof quest[prop] == 'object'){
      if( false == _complexEqualityHash( quest[prop], comp[prop]) ) return false
    } else {
      if(quest[prop] != comp[prop]) return false // différence de valeur
    }
  }
  return true
}
