function method_exists( m ){  return typeof m == 'function'   }
function isset(foo){          return "undefined"!=typeof foo  }
function defined(foo){        return "undefined"!=typeof foo  }
function not_defined(foo){    return "undefined"==typeof foo  }
function is_nil(foo){         return not_defined(foo) || foo == null }
function is_function(foo){    return 'function' == typeof foo }
function is_string(foo){      return 'string'   == typeof foo }
function is_array(foo){
  if (typeof foo != 'object') return false ;
  return ( 'function' == typeof foo.shift );
}
// Pour pouvoir utiliser cette méthode, il faut soit que l'objet soit un
// vrai objet (c'est-à-dire sans .length défini, soit, si .length est défini
// qu'il contienne aussi la propriété `class' mise à 'object')
function is_object( foo ){
  if (typeof foo != 'object') return false ;
  return false == defined( foo.length ) || foo.class == 'object' ;
}
