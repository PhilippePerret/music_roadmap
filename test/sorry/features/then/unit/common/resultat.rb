when /le résultat doit être de classe #{VARIABLE}/ then
  # Vérifie la classe du résultat.
  # 
  # @requis: Le résultat doit avoir été placé préalablement dans une
  # variable `@resultat'.
  # 
  if Sorry::Core::Config.debugif(1)
    puts "* Classe de @resultat : #{@resultat.class}"
    puts "  @resultat: #{@resultat.inspect}"
  end
  @resultat.class.to_s should be $1

when /le #{VARIABLE} élément (?:du|de ce) résultat doit être (.*)$/ then
  # Check un élément du résultat quand @resultat est un Array
  # 
  # @requis: Le résultat doit avoir été précédemment défini dans @resultat
  # @params:
  #   - La première variable contient l'indice 1-start. `1er' ou `2e' etc.
  #   - La seconde variable contient un text qui doit trouver ci-dessous
  #     sa définition précise.
  # 
  index   = $1
  expect  = $2
  index   = index.gsub(/[^0-9]/,'').to_i - 1
  what    = @resultat[index]
  if Sorry::Core::Config.debugif(1)
    puts "* Index dans le résultat : #{index}"
    puts "* Valeur de l'élément: #{@resultat[index].inspect}:#{@resultat[index].class}"
    puts "* Expected : #{expect.inspect}:#{expect.class}"
  end
  
  # Si la spec sentence se termine par "de l'utilisateur", alors il faut
  # faire une instance User de cet utilisateur, dont on aura besoin pour 
  # évaluer l'expectation.
  if expect.end_with? "de l'utilisateur"
    raise "@mail doit être défini… Je ne pas évaluer cette clause" if @mail.nil?
    user = User.new @mail
  end
  # On expecte
  case expect
  when 'true' then 
    unless @resultat[index]
      puts "*** @resultat[#{index}] devrait être true. @resultat:#{@resultat.inspect}"
    end
    @resultat[index] should be true
  when "les données mini de l'utilisateur"
    what should be user.data_mini
  when "la liste des roadmaps de l'utilisateur"
    what should be user.roadmaps
  else
    raise "Il faut définir le case `#{$2.inspect}` dans ce then"
  end

# Au cas où la dernière clause s'achèverait par end
end