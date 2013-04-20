when /je charge la procédure #{STRING}/ then
  # Chargement (require) d'un procédure.
  # 
  # @note: Si le path relatif de la procédure est placé dans @procedure, alors
  # on peut y faire appel ensuite, dans les spec sentences, par "cette procédure"
  # Dans le cas contraire il faut utiliser « la procedure "path/to/proc" »
  # pour y faire référence.
  # --
  @procedure = $1
  require_procedure @procedure

when /j'appelle (cette|la) procédure(?: #{STRING})?( en ajax)?(?: avec #{STRING})?/ then
  # Appel de la procédure spécifié
  # 
  # SI le path relative de la procédure a été placée dans une variable
  # @procedure avant, alors on peut utiliser la formule raccourcie :
  #   `j'appelle cette procédure'
  # Dans le cas contraire, il faut utiliser la formule complète :
  #   `j'appelle la procédure "path/to/proc"`
  # 
  # SI la sentence contient "par ajax", alors c'est la procédure ajax_<proc>
  # qui est appelée, après avoir mis les arguments dans Params.
  # Le résultat doit alors être testé dans RETOUR_AJAX, pas dans @resultat
  # 
  # Si la procédure doit recevoir des paramètres, il faut les mettre dans un
  # string qui sera évalué. Si ces paramètres sont des variables définies
  # précédemment, on utilise la formule :
  #   `j'appelle cette procédure avec "@mail, @password"`.
  # C'est la virgule qui est importante ici, qui indique la séparation entre
  # les différents arguments. Ils seront ensuite "inspectés".
  # 
  # Le résultat est placé dans @resultat pour analyse ultérieur. Si la commande
  # est appelée avec -db=1 (au moins), alors les arguments évalués ainsi que
  # le résultat sont retournés en console.
  # 
  # --
  @procedure = $2 if $2 != nil
  par_ajax   = $3 != nil
  arguments  = $4
  arguments = eval(arguments) unless arguments.nil?
  puts "* Arguments proposés à la procédure `#{@procedure}` : #{arguments.inspect}" if Sorry::Core::Config.debugif(1)
  method_name = @procedure.gsub(/\//, '_')
  unless par_ajax
    @resultat = send(method_name, arguments)
    puts "* @resultat de la procédure `#{@procedure}` = #{@resultat.inspect}" if Sorry::Core::Config.debugif(1)
  else # PAR AJAX
    method_name = "ajax_#{method_name}"
    Params.set_params arguments
    send(method_name)
    puts "* RETOUR_AJAX après `#{method_name}` de #{@procedure}: #{RETOUR_AJAX.inspect}" if Sorry::Core::Config::debugif(1)
  end


end