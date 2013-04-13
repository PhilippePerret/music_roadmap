when /le menu des roadmaps doit contenir (.+)$/ then
  # Vérifie que le menu select#roadmaps contienne bien les options
  # avec les paramètres fournis en fin de sentence, qui est une liste
  # des nom-mdp des roadmaps qu'on compte trouver
  # ---
  rms = eval($1)
  puts "*** rms:#{rms.inspect}"
  rms.each do |nomdp|
    nom, mdp = nomdp.split('-')
    puts "*** on doit trouver un option value=#{nomdp} text=#{nom}"
    Browser should contain option(:value => nomdp, :text => nom)
  end
  
# Pour le dernier block (if any)
end