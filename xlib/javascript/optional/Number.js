
Number.prototype.to_s       = function(){ return toString(this)     }
Number.prototype.to_i       = function(){ return parseInt(this, 10) }
Number.prototype.is_string  = function(){return false}
Number.prototype.is_hash    = function(){return false}
Number.prototype.is_array   = function(){return false}
Number.prototype.is_number  = function(){return true}

// Renvoie le nombre avec le nombre de décimales spécifiées
// 
// @note:   Ne vérifie pas que le paramètre soit bon (TODO:)
// @note:   N'arrondit pas. 5.29.decimal(1) => 5.2
Number.prototype.decimal = function(nb) {
    if( this.toString().indexOf('.') === false ) return this ;
    m = Math.pow(10, nb) ;
    return parseInt(this * m, 10) / m ;
}