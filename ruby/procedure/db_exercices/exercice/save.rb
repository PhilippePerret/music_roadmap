=begin
  Sauvegarde d'une fiche YAML d'un exercice
=end

def ajax_db_exercices_exercice_save
  begin
    raise "Pas bien, ça, de faire une instrusion…" unless Params::offline?

    data    = param(:data)
    affixe  = data.delete('affixe').to_s
    raise "Il faut fournir l'affixe" if affixe == ""
    update  = data.delete('update').to_s == "true"
    folder  = data.delete('folder').to_s
    raise "Il faut fournir le dossier ! ('#{param(:folder)}')" if folder == ""
    path    = File.join(APP_FOLDER, folder, "#{affixe}.yml")
    raise "Ce fichier existe déjà…" if File.exists?(path) && !update
    check_data_dbe data
    File.open(path, 'wb'){|f| f.write( fiche_yaml_dbexercice(data) )}
    File.chmod(0777, path)
  rescue Exception => e
    RETOUR_AJAX[:error] = e.message
  end
end

def fiche_yaml_dbexercice data
  fiche = File.read(File.join(APP_FOLDER, 'data', 'db_exercices', '_fiche_type.yml'))
  data.each do |key, val|
    val = "null" if val == ""
    val = case key
    when "types" 
      '["' + val.split(',').join('", "') + '"]'
    when "suite"
      val == "00" ? "null" : "\"#{val}\""
    when "titre_fr", "titre_en", "metrique"
      "\"#{val}\""
    else val
    end
    fiche.sub!(/#{key.upcase}/,val)
  end
  fiche
end

def check_data_dbe data
  raise "Il faut un titre français" if data['titre_fr'].to_s == ""
  raise "Il faut un titre anglais" if data['titre_en'].to_s == ""
  raise "Les tempi sont invalides" if data['tempo_max'].to_i <= data['tempo_min'].to_i
end