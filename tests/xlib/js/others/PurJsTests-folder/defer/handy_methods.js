// Pour obtenir le contenu de la dernière "ligne" (div) du rapport :
Object.defineProperties(this,{
	// Retourne le contenu HTML de la dernière ligne de rapport écrite
	get_last_div_rapport:{
		get:function(){return $('div#rapport').children().last().html()},
		configurable:true
	},
  // Retourne les N dernières lignes du rapport
  // @param   nombre      Le nombre de ligne remontées (à partir de la dernière)
  // @param   all         Si true, remonte toutes les lignes, même autre que success-failure-pending
  //                      Défaut: false
  get_lasts_div_rapport:{
    value:function(nombre, all){
      if(undefined == all) all = false
      var jid = 'div#rapport > ' +(all ? 'div' : 'div.SFP')
      var lasts = []
      $(jid).slice(-nombre).each(function(){
        lasts.push($(this).html())
      })
      return lasts.reverse()
    }
  }
})

// Tester le retour de méthodes ou de propriétés complexes
// -------------------------------------------------------
// @param		code			Le code à évaluer. Par exemple "'ma_var'.is.a_number"
// @param		expected	Le résultat attendu (il sera évalué de façon stricte : ===)
// 
// @produit	Un succès si le résultat est celui escompté, un échec dans le cas contraire.
function eval_and_result(code, expected) {
	res = eval(code)
	if(res === expected) success("`"+code+"` renvoie bien "+tostring(expected))
	else failure("`"+code+"` devrait renvoyer "+tostring(expected)+", il renvoie : "+res)
}

// --- Définition des propriétés complexes ---
// 
// Donne la valeur +defaut+ à +foo+ si +foo+ est undéfini ou strictement null
function _when_undefined_or_null(foo, defaut){
  if(undefined == foo || null === foo) return defaut
  else return foo
}

