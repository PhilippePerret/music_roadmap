window.Test.UI = {
	LANG : 'en',
	
	// Appelé quand on change de langue
	on_change_lang:function(lang){
		this.LANG = lang
		delete window.LOCALES
		this.localize
	},
	// Après le chargement des locales, on règle l'interface et les constantes textuelles
	set_ui:function(){
		if('undefined' == typeof LOCALES )return this.wait_for_locales
		$('label#label_test_file').html(LOCALES.ui['test file'])
		$('input#btn_run_stop').val(LOCALES.ui['run test'])
		$('label#label_cb_verbose').html(LOCALES.ui['verbose'])
		$('label#label_cb_sandbox').html(LOCALES.ui['sandbox'])
		$('label#label_cb_sandbox').attr('title', LOCALES.ui['title_sandbox'])
		$('label#label_keep_messsages').html(LOCALES.ui['keep in report'])
		$('input#btn_go_to_top').val(LOCALES.ui['back to top'])
		$('input#btn_run_console').val(LOCALES.ui['run'])
		$('select#lang').val(this.LANG)
    $('a#help_link').html(LOCALES.ui['help'])
		
		_HumanSpeakingDefineLocales()
		
	}
}
Object.defineProperties(Test.UI,{
	// Prépare l'interface en fonction de la langue
	// Met dans le head le fichier locales correspondant à la langue et prépare l'affichage
	"localize":{
		get:function(){
			if((scriptlocales = $('head script#locales')).length) scriptlocales.remove()
			var path = './tests/xlib/js/locales/'+this.LANG+'/common.js'
			$('head').append(
				'<script id="locales" charset="utf-8" type="text/javascript" src="'+path+'"></script>'
			)
			this.wait_for_locales
		}
	},
	"wait_for_locales":{
		get:function(){
			if(undefined != this.timer_load) clearTimeout(this.timer_load)
			this.timer_load = setTimeout("Test.UI.set_ui()", 100)
		}
	}
})