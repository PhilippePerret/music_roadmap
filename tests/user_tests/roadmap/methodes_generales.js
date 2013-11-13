/*
 *  Script de test `roadmap/methodes_generales.js'
 *
 *  To run it, copy and past in Pure-JS-Test : roadmap/methodes_generales
 *
 *  @contact: phil@atelier-icare.net
 *  @manual:  http://www.atelier-icare.net/pjs-tests
 *
 */
function roadmap_methodes_generales(){

  my = roadmap_methodes_generales
  
  my.specs = "Test les méthodes générales de Roadmap."
    
  my.step_list = [
    "Rechargement de l'application",
    "Test de next_id_exercice",
    "Test de on_focus_nom",
    "Test de get_nom"
    ]

  
  switch(my.step){

  case "Rechargement de l'application":
    Reload_app()
    break
    
  case "Test de next_id_exercice":
    Roadmap_Next_id_exercice___test()
    break
    
  case "Test de on_focus_nom":
    Roadmap_On_focus_nom___test()
    break
    
  case "Test de get_nom":
    Roadmap_Get_nom___test()
    break
    
  default:
    pending("Test '"+my.step+"' is pending.")
  } // /switch

}

function Reload_app() {
  switch(my.stop_point)
  {
  case 1:
    APP.document.location.reload()
    my.wait.for(1, 2)
    break
  case 2:
    my.wait.until(function(){return jq('section#aide').exists })
    break
  }
}

function Roadmap_Next_id_exercice___test() {
  'Roadmap'.should.respond_to('next_id_exercice')
  'Roadmap.last_id_exercice'.should.be.null
  APP.Roadmap.last_id_exercice = 0
  'Roadmap.next_id_exercice'.should.return(1)
  'Roadmap.last_id_exercice'.should = 1
  APP.Roadmap.last_id_exercice = 12
  'Roadmap.next_id_exercice'.should.return(13)
  'Roadmap.last_id_exercice'.should = 13
  my.wait.for(0)
}

function Roadmap_On_focus_nom___test() {
  'Roadmap'.should.respond_to('on_focus_nom')
  APP.Roadmap.on_focus_nom()
  pending("à implémenter (peut-être ailleurs, puisqu'il faut être identifié)")
  // Flash.should.contain(APP.MESSAGE.Roadmap.how_to_make_a_good_nom)
}

function Roadmap_Get_nom___test() {
  'Roadmap'.should.respond_to('get_nom')
  w("doit retourner null si le nom n'est pas défini")
  'Roadmap.get_nom'.should.return(null)
  pending("Il faut d'abord travailler l'identification puisqu'on doit être identifié pour que le champ existe")
  w("doit retourner le nom défini dans le champ input#roadmap_nom")
  var nom = "un nom "+NOW
  jq('input#roadmap_nom').val(nom)
  'Roadmap.get_nom'.should.return(nom)
}