/*
    Initialisation des tests
    
*/
// L'application testée
window.APP = this.opener

// Initialiser la variable contenant les messages utilisateurs personnalisés.
UMessages = {}

// Initialiser UTest au cas où il ne serait pas défini
UTest = {}


$(document).ready(function(){
	Test.UI.localize
})

// window.onerror = function (err, file, line) {
//   ERROR_OCCURED = 'The following error occured:\n' + err + '\n' +
//   'In file: ' + file + '\n' +
//   'At line: ' + line ;
//   return true
// }