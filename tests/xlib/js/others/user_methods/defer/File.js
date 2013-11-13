/*
 * Class de test _TFile
 * --------------------
 * Pour l'interaction avec les fichiers de l'application
 *
 * USAGE
 * -----
 *  Pour créer une instance _TFile, on utilise :  file(<path>, <argument>)
 *  
 * METHODES
 * --------
 *
 *    <file>.exists   Retourne TRUE si le fichier existe
 *                    Et poursuit le test
 *    <file>.write(<code>)
 *                    Écrit le texte <code> dans le fichier et poursuite le test
 *    <file>.load     Charge le fichier en texte brut
 *                    Return NULL si le fichier n'existe pas
 */

// Pour travailler avec un fichier/dossier
// @usage     file(<path>).<method>(<argument>)
window.file = function(path, argument){
  var tfile = new _TFile(path)
  tfile._script = window.file.caller.script
  return tfile
}

// La class _TFile
window._TFile = function(path){
  this._path    = path
  this._script  = null    // Défini par la fonction file(...)
}
Object.defineProperties(_TFile.prototype, {


  // -------------------------------------------------------------------
  //  Gestion des erreurs
  // -------------------------------------------------------------------

  // Force un message d'erreur dans le rapport
  // @param   err     Soit un texte explicite, soit un identifiant dans LOCALES.errors.file
  "error":{
    value:function( err )
    {
      if(undefined != LOCALES.errors.file[err]) err = LOCALES.errors.file[err]
      force_db(err, WARNING)
    }
  },
  "error_call_before":{
    value:function(fct_before, fct_after)
    {
      this.error(fct_after + LOCALES.errors['must be call before'] + fct_before)
    }
  },

  // -------------------------------------------------------------------
  //  Propriétés générales
  // -------------------------------------------------------------------
  
  // <file>.path retourne le path du fichier
  "path":{
    get:function(){ return this._path }
  },
  // <file>.script retourne le script de la fonction qui a appelé
  "script":{
    get:function(){ return this._script }
  },
  // Retourne la fonction principale de test du script courant
  "fonction":{
    get:function(){return this._script.fonction}
  },

  // -------------------------------------------------------------------
  //  Méthodes générales
  // -------------------------------------------------------------------
  
  // Fonction poursuivant les méthodes, c'est-à-dire rappelant <script>.run
  // 
  // @note: S'il y a un argument à passer, il doit être passé par la méthode
  // appelée (cf. `seek')
  "poursuit":{
    get:function()
    { 
      this._script.run
    }
  },
  
  // Function resetant le fichier
  "reset":{
    get:function()
    {
      delete this._content
      delete this._loaded
      delete this._exists
      delete this._deleted
      delete this._written
      delete this.arg
    }
  },
  
  // -------------------------------------------------------------------
  //  Méthodes de retour de requête
  // -------------------------------------------------------------------
  
  // Retourne le contenu du fichier
  // ------------------------------
  // @note: S'il a été chargé avec `load'
  // @note: _content n'est pas effacé après l'appel, car les méthodes should seraient 
  // erronnée (si on teste avec `'file.content'.should = "mon contenu"`)
  "content":{
    get:function(){
      if(undefined == this._content)
      {
        this.error_call_before('`<file>.load`', '`<file>.content`')
      }
      else
      {
        return this._content
      }
    }
  },
  // Retourne TRUE si le fichier existe, FALSE dans le cas contraire
  // undefined si le fichier n'a pas encore été cherché avec `seek'
  // @note: La marque d'existence est effacée après l'appel pour éviter les faux tests
  "exists":{
    get:function()
    {
      if(undefined == this._exists)
      {
        this.error_call_before('`<file>.seek`', '`<file>.exists`')
      }
      else
      {
        return this._exists
      }
    }
  },
  // Retourne la date de modification du fichier cherché avec `seek'
  "mtime":{
    get:function()
    {
      if(undefined == this._mtime)
      {
        this.error_call_before('`<file>.seek`', '`<file>.mtime`')
      }
      else
      {
        return this._mtime
      }
    }
  },
  // Retourne la taille du fichier cherché avec `seek'
  "size":{
    get:function()
    {
      if(undefined == this._size)
      {
        this.error_call_before('`<file>.seek`', '`<file>.size`')
      }
      else
      {
        return this._size
      }
    }
  },
  // Return TRUE si le fichier/dossier a bien été détruit par `delete`
  "deleted":{
    get:function()
    {
      if(undefined == this._deleted)
      {
        this.error_call_before('`<file>.delete`', '`<file>.deleted`')
      }
      else
      {
        return this._deleted
      } 
    }
  },
  // Return TRUE si le fichier/dossier a bien été chargé par `load`
  "loaded":{
    get:function()
    {
      if(undefined == this._loaded)
      {
        this.error_call_before('`<file>.load`', '`<file>.loaded`')
      }
      else
      {
        return this._loaded
      } 
    }
  },
  // Return TRUE si le fichier/dossier a bien été écrit par `write`
  "written":{
    get:function()
    {
      if(undefined == this._written)
      {
        this.error_call_before('`<file>.write`', '`<file>.written`')
      }
      else
      {
        return this._written
      } 
    }
  },
  
  // -------------------------------------------------------------------
  //  Méthodes de manipulation
  // -------------------------------------------------------------------
  "write":{
    value:function(code, arg)
    {
      this.fonction.waiting = true
      this._script.arg      = arg
      Test.write("Writing code in `"+this.path+"`… ")
      Ajax.send({
        script:'file/write', 
        path:this.path, 
        code:code
      }, $.proxy(this.suite_write,this), $.proxy(this.wait_function, this))
    }
  },
  "suite_write":{
    value:function(rajax)
    {
      Test.write(rajax.ok ? "OK" : "NOT OK")
      this._written = rajax.ok
      if(!rajax.ok) this.error("Unabled to write file "+this.path+": "+rajax.message)
      this.poursuit
    }
  },
  "load_and":{
    value:function(arg)
    {
      this.fonction.waiting = true
      this._script.arg      = arg
      Test.write("Loading file `"+this.path+"`… ")
      Ajax.send({script:'file/load', path:this.path}, $.proxy(this.suite_load,this));
    }
  },
  "load":{get:function(){this.load_and()}
  },
  "suite_load":{
    value:function(rajax)
    {
      Test.write(rajax.ok ? "OK" : "NOT OK")
      this._loaded = rajax.ok
      if(rajax.ok) this._content = rajax.file_content.stripSlashes()
      if('function' == typeof this.load_poursuivre) this.load_poursuivre()
      else this.poursuit
    }
  },
  "delete_and":{
    value:function(arg)
    {
      this.fonction.waiting = true
      this._script.arg      = arg
      Test.write("Deleting file `"+this.path+"`… ")
      Ajax.send({script:'file/delete', path:this.path}, $.proxy(this.suite_delete,this));
    }
  },
  "delete":{get:function(){this.delete_and()}
  },
  "suite_delete":{
    value:function(rajax)
    {
      Test.write(rajax.ok ? "OK" : "NOT OK…")
      this._deleted = rajax.ok
      this.poursuit
    }
  },
  // -------------------------------------------------------------------
  //  Méthodes d'interrogation
  // 
  //  NOTES
  //  -----
  //  Toutes les méthodes ci-dessous utilisant ajax doivent mettre la
  //  fonction principale de test en veille avec `this.fonction.waiting = true`
  // 
  // -------------------------------------------------------------------
  "wait_function":{
    value:function(){this.fonction.waiting = true}
  },
  "seek_and":{
    value:function(arg)
    {
      this.fonction.waiting = true
      this._script.arg = arg
      Test.write("Seeking `"+this.path+"` file… ")
      Ajax.send({
        script:'file/seek', 
        path:this.path
      }, $.proxy(this.suite_seek, this), $.proxy(this.wait_function, this))    
    }
  },
  "seek":{get:function(){this.seek_and()}
  },
  "suite_seek":{
    value:function(rajax)
    {
      Test.write(rajax.ok ? "OK" : "NOT OK")
      this._exists = rajax.file_exists
      if(this._exists)
      {
        this._mtime = rajax.file_mtime
        this._size  = parseInt(rajax.file_size,10)
      }
      else
      {
        // Initialiser les données remontées avec seek
        this._mtime = null
        this._size  = null
      }
      // Si la méthode est appelée en interne, elle définit la méthode seek_poursuivre
      // Cf. par exemple should.exists
      if(this.seek_poursuivre)  this.seek_poursuivre()
      else                      this.poursuit
    }
  },
  // -------------------------------------------------------------------
  //  Méthodes de test
  // -------------------------------------------------------------------
  "should":{
    get:function(){this.positif=true; return this}
  },
  "should_not":{
    get:function(){this.positif=false; return this}
  },
  // Should.contain
  "contain":{
    value:function(searched, arg, strict)
    {
      this.fonction.waiting = true
      this._script.arg      = arg
      if(undefined == strict) strict = false
      this.load_poursuivre  = $.proxy(this.suite_contain, this, searched, strict)
      this.load
    }
  },
  "suite_contain":{
    value:function(searched, strict)
    {
      this.load_poursuivre = null
      var evaluation = strict ? this._content == searched : this._content.match(searched) !== null
      _estime(
        evaluation, {
          test:'File.should.contain',
          args:[],
          positif:this.positif,
          sujet:"`'"+this.path+"'`",
          result:{
            positif:{success:LOCALES['contains'], failure:LOCALES['should contain']},
            negatif:{success:LOCALES['doesnt contains'], failure:LOCALES['should not contain']}
          },
          expected_result:searched,
      		no_expected_result:false,
          after_if_failure:null
        }
      )
      this.poursuit
    }
  },
  // Should.exist_and
  "exist_and":{
    value:function(arg)
    {
      this.fonction.waiting = true
      this._script.arg      = arg
      this.seek_poursuivre  = $.proxy(this.suite_exist, this)
      this.seek
    }
  },
  // Should.exist
  "exist":{get:function(){this.exist_and()}},
  "suite_exist":{
    value:function()
    {
      this.seek_poursuivre = null
      _estime(
        this._exists,{
          test:'File.should.exists',
          args:[],
          positif:this.positif,
          sujet:"`'"+this.path+"'`",
          result:{
            positif:{success:LOCALES['exists'], failure:LOCALES['should exist']},
            negatif:{success:LOCALES['not exists'], failure:LOCALES['should not exist']}
          },
          expected_result:null,
      		no_expected_result:true,
          after_if_failure:null
        }
      )
      this.poursuit
    }
  }
})


 