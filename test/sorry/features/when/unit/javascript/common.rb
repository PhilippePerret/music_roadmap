when /j'appelle la méthode JS #{VARIABLE} (?:de #{VARIABLE} )?(?:avec (.+))?$/ then
  # Appelle la méthode javascript d'un objet quelconque avec les paramètres
  # fournis en fin de sentence.
  # 
  # @param  Première VARIABLE: Nom de la méthode
  # @param  Deuxième VARIABLE: L'objet JS, if any
  # @param  Troisième regexp:   Les arguments, exprimés tels quels
  # 
  # @usages:
  #   j'appelle la méthode JS <methode>
  #   j'appelle la méthode JS <methode> de <objet>
  #   j'appelle la méthode JS <methode> avec [1,2,3]
  #   j'appelle la méthode JS <methode> de <objet> avec 12
  # --
  method  = $1
  objet   = $2
  args    = $3 || ""
  puts "*** args: #{args.inspect}"
  caller = if objet.nil?
    "#{method}"
  else
    "$.proxy(#{objet}.#{method}, #{objet})"
  end
  "#{caller}(#{args})".js
  
# End final, en cas de block avant
end