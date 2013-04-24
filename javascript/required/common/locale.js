/*  Gestion des locales
    --------------------
    
    This object deals with localized texts when they're not defined in Javascript.
    An Ajax query get the text from server then displays it.
    
*/
window.Locale = {
  id          :null,      // Text id, so the relative path in ./data/locale, maybe with extention
  inner       :null,      // JID. Container for the localized text
  params      :null,      // Whole params sent to Locale.show
  locale_text :null,      // The localized text returned
  
  /*  Main function to show a localized text
      ---------------------------------------
      
      @usage    Locale.show({id:"path/to/text[.html/.rb]", inner:"<jid>"})
      
      @product
          Method set the +inner+ content to the text required.
          It also add some data in the inner tag, so that the text
          will able to be updated if the lang changes. These data 
          are: `data-locale="<locale-id>"`.
          When user changes lang, the method must call Locale.update()
          to update all localized text in the current page.
          
      @param  params  A Hash containing parameters of the text to show:
                      inner:    A "jid" (i.e. "<tag>#<id>") or a jQuery element.
                                Container of the localized text. All html code of this inner
                                will be replaced with the localized text (i.e. not append)
                      id:       Localized text id, i.e. a relative path in ./data/locale/ on
                                the server.
                      fx_suite:   Method called after the process is completed.
  */
  showing:false,
  show:function(params){
    this.showing  = true;
    this.params   = params;
    this.id       = params.id;
    this.inner    = params.inner;
    this.load();
  },
  
  // Really display the localized text
  // Put the text in a div (display:inherit) with a `data-locale' attribute containing
  // the locale-id
  display:function(){
    $(this.inner).html(this.div_locale_text());
    UI.humanize(this.inner);
  },
  
  // Preparation of the div containing the locale
  div_locale_text:function(){
    return '<div style="display:inline;" data-locale="'+this.id+'">' +
            this.locale_text + '</div>';
  },
  loading:false,
  load:function(rajax){
    if ('undefined' == typeof rajax){
      // Loading
      this.loading = true;
      Ajax.query({
        data:{
          proc      :'locale/get',
          locale_id :this.id,
          lang      :LANG
        },
        success:$.proxy(this.load, this)
      });
    } else {
      // Returning
      if( false == traite_rajax(rajax) ){
        this.locale_text = rajax.locale;
        this.display();
      }
      if('function'==typeof this.params.fx_suite) this.params.fx_suite();
      this.showing = false;
      this.loading = false;
    }
  },
  
  // Called when the current language changes. Replace all the localized text with there
  // new values.
  // 
  // @see Locale.show above for details
  locale_texts:null,
  update:function(){
    if ( this.locale_texts == null ){
      // => Start
      this.locale_texts = $('*[data-locale]').toArray();
      this.update();
    } else if ( this.locale_texts.length ){
      // => A other inner to update
      var o = $(this.locale_texts.pop());
      var locid = o.attr('data-locale');
      this.show({inner:o.parent(),id:locid,fx_suite:$.proxy(this.update,this)});
    } else {
      // => End
      this.locale_texts = null;
    }
  }
  
}