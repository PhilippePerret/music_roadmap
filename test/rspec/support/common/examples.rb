shared_examples "javascript" do |objet_js|
  let(:objet_js){ objet_js }
  
  # Joue la méthode +method+ de l'objet :objet_js avec les paramètres +params+
  # optionnel.
  # @param  method      La méthode seule.
  #                     Si contient des parenthèses, c'est que les paramètres
  #                     ont été fournis avec.
  # @param  params      Les paramètres à transmettre, en String, même si c'est
  #                     Si pas en string, transformés à l'aide de to_json
  #                     @Note: la valeur par défaut est 'no_defined' pour faire
  #                     la différence avec `nil' qui serait envoyé comme
  #                     paramètre à transmettre à la méthode.
  def run method, params = 'no_defined'
    method, params = method_and_params_for_run method, params
    # puts "params dans run : #{params.inspect}"
		if params.nil?
			JS.return "$.proxy(#{objet_js}.#{method}, #{objet_js})()"
		else
			JS.return "$.proxy(#{objet_js}.#{method}, #{objet_js}, #{params})()"
		end
	end
	
	# Idem que pour `run' ci-dessus, mais joué sur l'instance +instance+
  # transmise.
  # @raccourci: irun
	def instance_run instance, method, params = 'no_defined'
    method, params = method_and_params_for_run( method, params )
		if params.nil?
			JS.return "$.proxy(#{instance}.#{method}, #{instance})()"
		else
			JS.return "$.proxy(#{instance}.#{method}, #{instance}, #{params})()"
		end
	end
	alias :irun :instance_run
  
  # Lève une erreur si l'objet :objet_js n'existe pas
  def object_should_exist
    js_object_should_exist "#{objet_js}"
  end
	
  # Lève une erreur si la méthode +method+ est inconnu de l'objet_js
	def should_respond_to method
		js_method_should_exist "#{objet_js}.#{method}"
	end
	alias :method_exists :should_respond_to
	alias :method_should_exist :should_respond_to
	
  # Lève une erreur si la constante +constant est inconnue de l'objet_js
  def should_have_constant constant
    if "'undefined' != typeof #{objet_js}.#{constant}".js
      "La constante #{objet_js}.#{constant} est définie"
    else
      raise "La constante #{objet_js}.#{constant} n'est pas définie"
    end
  end
	
  # Lève une erreur si la méthode +method+ est inconnue de l'instance +inst+
  # @note: L'instance +inst+ doit avoir été créée dans le corps du test
  # @param  inst    Nom String de l'instance créée
  # @param  method  String ou Symbol de la méthode testée
  def imethod_exists inst, method
 		js_method_should_exist "#{inst}.#{method}"
  end
  alias :ishould_respond_to :imethod_exists
  
	def property_should_exist prop
		"'undefined' != typeof #{objet_js}.#{prop}".js.should === true
	end
	alias :property_exists :property_should_exist
	alias :prop_exists :property_should_exist
	
  # Retourne true si la propriété +prop+ de l'instance +instance+ existe
  # @param  instance    Nom String de l'instance qui doit avoir été créée
  #                     dans le corps du test
  # @param  prop        String ou Symbol de la propriété à tester
	def iprop_exists instance, prop
	  "'undefined' != typeof #{instance}.#{prop}".js.should == true
	end
	alias :iproperty_exists :iprop_exists
	alias :iproperty_should_exist :iprop_exists
	
  # => Retourne la valeur d'une propriété (d'un objet)
	def get_property prop
	  "#{objet_js}.#{prop}".js
	end
	
  # Définit la valeur d'une propriété (d'un objet)
  # @param  prop    La propriété
  #                 OU un hash de :prop => value
  # @param  val     La valeur à lui donner (sera “jsonnée”)
  #                 OU nil/indéfini si prop est un Hash
  #                 
  def set_property prop, val = nil
    prop = { prop => val } unless prop.class == Hash
    prop.each do |p, v|
      # code = "#{objet_js}.#{p} = #{v.to_json}"
      # puts "CODE JS : #{code}"
      # code.js
      "#{objet_js}.#{p} = #{v.to_json}".js
    end
  end
  
  # => Retourne la valeur de la propriété +prop+ de l'instance +instance+
  # @note: L'instance JS doit avoir été définie dans le corps du programme
  # @param  instance      Le nom String donné à la variable instance.
  # @param  prop          String ou Symbol de la propriété à retourner
  def iget_property instance, prop
    "#{instance}.#{prop}".js
  end
  
  # Définit la valeur de la propriété +prop+ de l'instance +instance+ à
  # +val+ (qui sera “jsonnée”)
  # @param  instance    String du nom de l'instance à affecter
  # @param  prop        String de la propriété OU Hash de :prop => values
  # @param  val         La valeur OU nil/indéfini si prop est un Hash
  def iset_property instance, prop, val = nil
    prop = { prop => val } unless prop.class == Hash
    prop.each do |p, v|
      "#{instance}.#{p} = #{v.to_json};".js
    end
  end
  
  # --- Protected ---
  # @rappel : params est mis à 'no_defined' s'il n'a pas été fourni, pour
  # faire la différence avec la valeur nil qui serait envoyée
  def method_and_params_for_run method, params
    # puts "method_and_params_for_run: #{method} / #{params}"
    method, maybeparams = real_method_for_run method
    params = 
      if    maybeparams != 'no_defined' then maybeparams # tel quel
      elsif params == 'no_defined' then nil
      elsif params.class == String
        # Si l'argument String contient des doubles slashes, c'est qu'il est
        # déjà au bon format
        if params.index('\\') != nil then params
        # Si l'argument String commence ou finit par « " » c'est qu'il est
        # au bon format. C'est-à-dire que '"texte", true' ne sera pas touché
        # pas plus que 'null, "texte"
        elsif params.start_with?('"') || params.end_with?('"') then params
        # Idem que ci-dessus si l'argument String commence ou finit par une
        # apostrophe.
        elsif params.start_with?("'") || params.end_with?("'") then params
        # Dans tous les autres cas, on jsonnise le string
        else  
          params.to_json
        end
      else
        params.to_json
      end
      # puts "method_and_params_for_run FIN : #{method} / #{params}"
	  [method, params]
	end
	
	def real_method_for_run method
	  method = method.to_s
	  return [method, 'no_defined'] if method.index('(') === nil
	  offin  = method.index('(')
	  offout = method.rindex(')')
	  params = method[offin+1..-2]
	  params = 'no_defined' if params == ""
	  return [method[0..offin-1], params]
	end
	
end