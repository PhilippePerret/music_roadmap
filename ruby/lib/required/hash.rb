# Extension de la class Hash

class Hash
  
  # Remplace les "true", "false", "null" par true, false, nil
  def values_str_to_real
    self.each do |k,v|
      v = case v.class.to_s
      when 'Hash', 'Array' then v.values_str_to_real
      when 'String' then
        case v
        when "true" then true
        when "false" then false
        when "nil", "null" then nil
        else v
        end
      else v
      end
      self[k] = v
    end
  end
  
  # Permet de remplacer les clés 'string' par :string
  # Utile par exemple pour des données JSON récupérées
  def to_sym
    hash_ruby = {}
    self.each do |k, v|
      k = k.to_s[0..-3] if k.to_s.end_with? '[]'
      v_ruby =  case v.class.to_s
                  when 'Hash'   then v.to_sym
                  when 'Array'  then
                    v.collect do |e| 
                      case e.class.to_s
                        when 'Hash', 'Array' then e.to_sym
                        else e
                      end 
                    end
                  else v 
                end
      hash_ruby = hash_ruby.merge( k.to_sym => v_ruby )
    end
    hash_ruby
  end
  
  # Transforme les valeurs qui sont des Arrays en leur premier élément
  # -------------------------------------------------------------------
  # Cette méthode est utilisée pour CGI, et JSON qui met toujours les 
  # valeurs qu'il parse dans des arrays.
  # Avec cette méthode, chaque :cle => ["valeur"], sera remplacée par
  # :cle => "valeur" MAIS SEULEMENT SI l'array ne comporte qu'une seule
  # valeur ET QUE params[:is_array] ne contient pas la clé
  # -------------------------------------------------------------------
  # @param  params    
  #         Valeurs optionnelles :
  #         :is_array     Clé ou liste de clés des éléments qu'il faut
  #                       conserver comme array, même s'ils ne possèdent
  #                       qu'une seule valeur.
  #                       Note : uniquement des clés symboliques.
  #                       Si la valeur est :all, aucun traitement de ce
  #                       type (ce qui signifie que la méthode n'est 
  #                       appelée que pour les clés symbolique).
  #         :to_sym       Si FALSE, les clés ne seront pas symbolisées
  #                       TRUE par défaut.
  # -------------------------------------------------------------------
  def unarrays params = nil
    params = params_unarrays params # initialise les paramètres
    return self if params[:to_sym] == false && params[:is_array] == :all
    h = {}
    self.each do |k, v|
      v = unarrays_to_uniq_value( k, v, params ) unless params[:is_array] == :all
      if params[:to_sym]
        k = k.to_sym
        v = unarrays_to_sym( v )
      end
      h = h.merge( k => v )
    end
    h
  end
  # Transforme les clé en clé symboliques pour les Arrays et
  # les Hash
  # @return   Le array ou le hash transformé, ou la valeur telle quelle
  def unarrays_to_sym val
    return val unless [Hash, Array].include? val.class
    val.to_sym
  end
  def unarrays_to_uniq_value cle, val, params
    return val unless val.class == Array
    return val if val.count > 1
    return val if params[:is_array].include? cle.to_sym
    # Aucune condition remplie => on renvoie le premier élément
    val.first
  end
  # Prépare les paramètres pour la méthode `unarrays'
  def params_unarrays params
    params ||= {}
    params[:to_sym]   = true if params[:to_sym].nil?
    params[:is_array] = case params[:is_array].class.to_s
                          when 'NilClass' then []
                          when 'Array'    then params[:is_array]
                          when 'String'   then
                            if params[:is_array] == 'all' then :all
                            else [params[:is_array].to_sym] end
                          when 'Symbol'
                            if params[:is_array] == :all then :all
                            else [params[:is_array]] end
                          else []
                        end
    params
  end
end