<?php
// Permet de charger récursivement les scripts JS et CSS des tests.
// 
// @ajout   * Si le script se trouve dans un dossier `defer', il est marqué à charger après
//          le chargement du document.
//          NOTER que pour le moment, il ne faut pas que le fichier se trouve dans un
//          sous-dossier de ce dossier 'defer'
//          * De la même manière, si le script se trouve dans un dossier 'async', il est
//          marqué asynchrone au chargement.
// 
function traite_dossier($path, $js_or_css){
  $dos = opendir($path);
  // Les dossiers seront toujours traités après les fichiers (car les objets 
  // sont d'abord définis dans les fichiers)
  $liste_dossiers = array();
  $suffixe = $js_or_css == "js" ? ".js" : ".css";
  $len_suffixe = strlen($suffixe);
  $is_defer = basename($path) == 'defer';
  $is_async = basename($path) == 'async';
  while(false != ($file = readdir($dos))){
    if($file=='.' || $file=='..'){ continue ;}
    if(is_dir($path.$file))
    { 
      if($file == '_extension_objet_plur'){continue;}
      array_push($liste_dossiers, $path.$file."/");
    }
    else if (substr($file, -$len_suffixe) == $suffixe )
    { 
      if($js_or_css == 'js'){
        echo '<script type="text/javascript" charset="utf-8" src="'.$path.$file.'"'.
          ($is_defer ? ' defer' : '').
          ($is_async ? ' async' : '').
          '></script>';
        if($file == '_extension_objet_plur.js'){
          traite_dossier($path.'_extension_objet_plur/', 'js');
        }
      } else { // css
        echo '<link rel="stylesheet" type="text/css" href="'.$path.$file.'" />';
      }
      echo "\n";
    }
  }
  closedir($dos);
  foreach($liste_dossiers as $path){traite_dossier($path, $js_or_css);}
}

?>