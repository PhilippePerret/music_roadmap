Object.defineProperties(String.prototype,{
	"contains":{
		value:function(value, strict){
			if(undefined == strict) strict = false
      var val = this.toString()
      var exact_type_value = _exact_type_of(value)
      if( strict && (this.exact_type != exact_type_value) ) return false
      // console.log("Exact type:"+this.exact_type)
      if(exact_type_value == 'regexp')
      {
        return val.match(value) !== null
      }
      else
      {
				if(strict) 	return val == value
				else 				return val.indexOf(value) > -1
      }
      
      //       // Je ne comprends pas pourquoi j'avais écris ce code ci-dessous. Pourquoi
      //       // tester le type de l'élément si cette méthode s'applique aux strings ???.......
      // switch(this.exact_type)
      //       {
      // case 'string':
      //         if(exact_type_value == 'regexp')
      //         {
      //           return val.match(value) !== null
      //         }
      //         else
      //         {
      //           if(strict)   return val == value
      //           else         return val.indexOf(value) > -1
      //         }
      // case 'array':
      //   return val.indexOf(value) > -1
      // case 'object':
      //   if(typeof value == 'string'){
      //     
      //   }
      //   else if (typeof value == 'object'){
      //     
      //   }
      //   else throw LOCALES.messages['unabled to evaluate']+inspect(value)+LOCALES.messages['for a hash']
      // default:
      //   throw LOCALES.messages['contains method cant be applied to']+"`"+this.to_s+"`"
      // }
		}
	},
	"not_contains":{value:function(value, strict){return ! this.contains(value,strict)}}
	
})