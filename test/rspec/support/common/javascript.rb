=begin

  La class JS permettant de gérer le javascript dans les tests
  + raccourcis
  
=end

# --- Raccourcis ---
def js_method_should_exist method
  existe = JS.exists?( :function => method )
  if existe
    existe.should be_true # pour documentation
  else
    raise "La méthode JS `#{method}` devrait exister"
  end
end
def js_object_should_exist objet
  existe = JS.exists?( :object => objet )
  if existe 
    existe.should be_true
  else
    raise "L'objet JS `#{objet}` devrait être défini."
  end
end
def js_array_should_exist ary
  JS.exists?( :array => ary ).should be_true
end

# ---
# Extensions de la classe String permettant de faire des raccourcis avec
# la classe JS.
# ---
class String
  # Retourne le string évalué comme un code JS
  # 
  # @usage:   <String code JS>.js => retourne le résultat
	def js
		JS.val_of( self )
	end
end


class JS
  @@nav = nil
  
  # --- SELF ---
  class << self
    
    # Initialise en définissant le navigateur courant
    # @param  browser   Class Watir::browser du navigateur
    def init browser
      @@nav = browser
    end
    
    # Retourne la valeur ce +code+ évalué comme code javascript
    # 
    # @note: si aucun browser n'est ouvert, on s'efforce de rejoinder 
    # l'accueil (pour ça, la méthode goto_home doit avoir été implémentée
    # dans le spec_helper)
    def val_of code
      try_to_open_browser if @@nav.nil?
      @@nav.execute_script("return #{code};")
    end
    alias :return :val_of

    # Cette méthode ne retourne rien.
    # Utile car lorsqu'on ajoute un "return" à un objet jQuery, ça peut
    # poser probème. Par exemple...
    #     "return firstul = $('ul#first_chapitre');"
    # ... fait tourner Watir sans fin (ou Selenium, I don't know)
    def run code
      try_to_open_browser if @@nav.nil?
      @@nav.execute_script(code)
    end
    alias :exe :run
    
    def try_to_open_browser
      goto_home
    end
    
    # Pour pouvoir employer "code".js ou `js code`
    def [] code
      JS.val_of code
    end
    
    # --- Existence des éléments ---
    
    # Retourne true si le type de l'élément recherché dans JS est celui
    # fourni en clé.
    # Par exemple :         JS::exists? :function => "ma_fonction"
    # 
    # @note: Pour pouvoir fonction, a besoin de la librairie générale 
    # `utils.js' qui définit les méthodes 'is_array', 'is_function' etc.
    # 
    def exists hash
      type = hash.keys.first
      type = :function if type == :method
      nom  = hash.values.first
      case type
      when :string then "'string' == typeof(#{nom})"
      else
        val_of "is_#{type}(#{nom})"
      end
    end
    alias :exists? :exists
    
    # Retourne true si la méthode existe
    def method_exists? method;  exists :function => method  end
    # Retourne true si l'objet existe
    def object_exists? obj;     exists :object => method    end
    # Retourne true si la liste existe
    def array_exists? ary;      exists :array => ary        end
    
  end  
  # --- / SELF ---
end

class JS::DOM
  class << self
    # Retourne true si l'élément DOM d'identifiant jQuery +jid+ est 
    # sélectionné (quand c'est la class CSS 'selected' qui le détermine)
    def selected? jid
      JS.val_of "$('#{jid}').hasClass('selected')"
    end
    # Retourne true si l'élément DOM d'identifiant jQuery +jid+ est
    # coché
    def checked? jid
      JS.val_of "$('#{jid}').is(':checked')"
    end
  end
end