=begin

  Procédures ajax et normale de l'enregistrement d'une ligne d'historique
  
=end

# Procédure Ajax d'enregistrement d'une ligne de log
# 
# @requis   roadmap_nom   Nom de la feuille de route dans les paramètres
# @requis   roadmap_mdp   Mdp de la feuille de route dans les paramètres
# @requis   data      Les données du log dans les paramètres
# 
# @return void, mais met la ligne de code produite dans 'logline' en retour
# d'ajax
def ajax_log_add
  begin
    fdr = Roadmap.new param(:roadmap_nom), param(:roadmap_mdp)
    fdr.build_folder # peut être nécessaire pour les tests
    RETOUR_AJAX[:logline] = log_add param(:data), fdr
  rescue Exception => e
    RETOUR_AJAX[:error] = "# Impossible d'enregistrer la log-line: #{e.message}"
  end
end

# Procédure normale
# 
# @param  data    La donnée de la ligne d'historique à enregistrer (Array)
# @param  fdr     Instance Roadmap de la feuille de route
# 
# @return void pour le moment
def log_add data, fdr
  begin
    fdr.build_folder # peut être nécessaire pour les tests
    now = Time.now.to_i.to_s
    logline =
      if data.class == Array
        # S'assurer qu'il n'y a pas de tabulations quand c'est une liste
        data.collect! do |val| val.gsub(/\t/,'  ') end
        data.unshift(now).join("\t")
      elsif data.class == String
        data = "#{now}\t#{data}"
      end + "\n"
    File.open(fdr.path_log, 'a'){ |f| f.write logline }
    logline
  rescue Exception => e
    raise e.message + '<br />' + e.backtrace.join('<br />')
  end
end