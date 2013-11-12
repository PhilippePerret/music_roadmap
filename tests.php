<?php
if($_POST['ajax']){
	include "./tests/xlib/php/lib/ajax.php";
}else{
?>
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta http-equiv="Content-type" content="text/html; charset=utf-8">
    <title>Pure-JS-Tests</title>
    <?php
      // Inclusion des librairies
      include './tests/xlib/php/lib/fonctions.php';
      include './tests/xlib/php/js/librairies.php';
      include './tests/xlib/php/css/librairies.php';
    ?>
    <style type="text/css" media="screen">
      
    </style>
  </head>
  <body>
		<!-- PJT Form -->
    <h1>
			<select id="lang" onchange="Test.UI.on_change_lang(this.value)" style="float:right;">
				<option value="en">English</option>
				<option value="fr">Français</option>
			</select>
      <a id="help_link" href="http://www.atelier-icare.net/pjst" target="_new" class="fright">Help</a>
			<span id="app_title">Pure Javascript Tests (PJsT)</span>
		</h1>
    <div id="buttons_generaux" style="font-size:1.2em;">
      <label id="label_test_file">Fichier test</label> : 
      <input  type="text" 
              id="test_filename" 
              style="text-align:right;"
              value="essai"
							onfocus="this.select()"
							 />.js
      <input  type="button" 
              id="btn_run_stop" 
              value="LANCER LE TEST" 
              style="width:190px;font-size:0.8em;"
              onclick="Test.run()" />
      <input type="checkbox" id="cb_verbose" checked="CHECKED" />
      <label id="label_cb_verbose" for="cb_verbose">Affichage complet</label>
      <input type="checkbox" id="cb_sandbox" />
      <label id="label_cb_sandbox" for="cb_sandbox">Bac à sable</label>
    </div>
		<!-- SECTION CONSOLE -->
		<div id="section_console">
			<div id="lien_console">
				<a href="#" onclick="$('div#div_console').toggle();return false;">Console</a>
			</div>
			<div id="div_console" style="display:none;">
				<textarea id="console" onfocus="this.select()"></textarea>
				<div class="buttons">
					<div class="fleft">
						<input type="checkbox" id="console_cb_keep" />
						<label id="label_keep_messsages" for="console_cb_keep">Garder les messages du rapport</label>
					</div>
					<input type="button" value="JOUE" id="btn_run_console" onclick="Test.run_console()" />				
				</div>
			</div>
		</div>
		<!-- SECTION RAPPORT -->
    <div id="rapport">
      
    </div>
		<div id="buttons_bottom">
			<input id="btn_go_to_top" style="visibility:hidden;" type="button" value="Remonter" onclick="window.scrollTo(0,0);" />
		</div>
  </body>
</html>
<?php
}// fin de si ça n'est pas ajax qui est demandé
?>