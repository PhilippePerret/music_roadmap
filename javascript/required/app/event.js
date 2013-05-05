/*
    Objet RMEvent
    
*/
window.ALL_EVENTS = 'ALL';
window.KEY_EVENTS = 'key';

const KESPACE = 32;
const Key_s   = 115;
const Key_S   = 83;
const Key_p   = 112;
const Key_P   = 80;
const Key_m   = 109;
const Key_M   = 77;

window.RMEvent = {
  current_fx_onkeypress: null,
  
  /*
   *  Set observers on text fields (input-text and textarea) to desactivate
   *  handlers on focus until blur
   */
  TEXTFIELDS: ['input[type="text"]', 'input[type="password"]', 'textarea'],
  observers_on_textfields:function(container){
    if('undefined'==typeof container) container = $('body');
    for(var i in this.TEXTFIELDS){
      $(container).find(this.TEXTFIELDS[i]).bind('focus', $.proxy(this.onfocus_text_field,this));
      $(container).find(this.TEXTFIELDS[i]).bind('blur', $.proxy(this.onblur_text_field,this));
    }
  },
  
  onfocus_text_field:function(evt){
    this.disable(ALL_EVENTS);
  },
  onblur_text_field:function(evt){
    this.enable(ALL_EVENTS);
  },
  disable:function(type){
    if('undefined'==typeof type)type == ALL_EVENTS
    if(type == ALL_EVENTS || type == KEY_EVENTS) window.onkeypress = null;
  },
  /*
   *  Activate event gestionnary
   */
  enable:function(type,fx){
    if(type == KEY_EVENTS || type == ALL_EVENTS){ 
      if('undefined' != typeof fx) this.fx_onkeypress = fx;
      window.onkeypress = this.fx_onkeypress;
    }
  }
}