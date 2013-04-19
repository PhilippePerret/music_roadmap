require 'date'
require_model 'roadmap'


def ajax_exercice_save_duree_travail
  rm = Roadmap.new param(:roadmap_nom), param(:roadmap_mdp)
  dataex = {:id => param(:ex_id), :duree => param(:ex_w_duree)}
  RETOUR_AJAX[:error] = exercice_save_duree_travail rm, dataex, {:mail => param(:user_mail), :md5 => param(:user_md5)}
end

def exercice_save_duree_travail rm, dataex, datauser
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Exercices.Edit.data_required" if dataex.nil?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? datauser
    raise "Exercices.Edit.id_required" unless dataex.has_key?(:id) && dataex[:id] != nil
  rescue Exception => e
    return "ERRORS.#{e.message}"
  end
  
  # -- Tout est OK, on peut sauver la durée de travail sur l'exercice --
  
  begin
    require_model 'file_duree_jeu'
    require_model 'exercice'
    iex = Exercice.new(dataex[:id], {:roadmap => rm})
    iex.add_new_jeu :date => Date.today.strftime("%y%m%d"), :duree => dataex[:duree].to_i
    return nil
  rescue Exception => e
    return e.message
  end
  
end