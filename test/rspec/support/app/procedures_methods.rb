def procedure_should_exist pathrel
  pathrel += ".rb" unless pathrel.end_with? '.rb'
  path = File.join(APP_FOLDER, 'ruby', 'procedure', pathrel )
  existe = File.exists? path
  if existe
    existe.should be_true # juste pour la documentation
  else
    raise "La procédure #{pathrel} est introuvable…"
  end
end