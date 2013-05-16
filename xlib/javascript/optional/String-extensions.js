
String.prototype.to_i     =function(){return parseInt(this, 10) }
String.prototype.strip    =function(){return this.replace(/^(\s+|\s+)/g,'');}
String.prototype.upcase   =function(){return this.toUpperCase();}
String.prototype.downcase =function(){return this.toLowerCase();}
String.prototype.empty    =function(){return this=="";}
String.prototype.is_int   =function(){return this.replace(/[0-9]/g,'') == ''}
String.prototype.is_float =function(){return this.replace(/[0-9\.]/g,'') == ''}
String.prototype.is_string=function(){return true}
String.prototype.is_hash  =function(){return false}
String.prototype.is_array =function(){return false}
String.prototype.is_number=function(){return false}

String.prototype.urlParams2hash=function(){
  var s, h, _i, _len, dbl;
  s=this.getUrlParams();
  if(s==""){return {};}
  h={};
  s=s.split('&');
  for(_i=0, _len=s.length;_i<_len;++_i){dbl=s[_i];
    dbl=dbl.split('=');
    h[dbl[0]]=decodeURIComponent(dbl[1]);
  }
  return h;
}
String.prototype.urlParams2uri=function(){
  var s=this.getUrlParams();
  if(s==""){return ""}
  else{return encodeURIComponent(s)}
}
String.prototype.getUrlParams=function(){
  var s, d ;
  s=this.toString();
  d=s.indexOf('?')+1;
  if(d<0){ return s;}
  else{    return s.substring(d);}
}
String.prototype.escape_html=function(){
  return this.replace(/</g, '&lt;');
}
String.prototype.capitalize =function(){return this.ucfirst();}
String.prototype.titleize   =function(){
  var t, a=[], _i, _len, m;
  t=this.split(' ');
  for(_i=0, _len=t.length;_i<_len;++_i){
    m=t[_i]; a.push(m.ucfirst());
  }
  return a.join(' ');
}
// Return true if String starts with +str+
String.prototype.start_with = function(str){
  return this.substring(0,str.length) == str;
}
// Return true if String ends with +str+
String.prototype.end_with = function(str){
  return this.substring(str.length) == str;
}
