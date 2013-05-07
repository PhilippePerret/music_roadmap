require 'date'
require_model 'roadmap'


def ajax_exercice_save_duree_travail
  rm = Roadmap.new param(:roadmap_nom), param(:user_mail)
  dataex = {:id => param(:ex_id), :duree => param(:ex_w_duree).to_i, :tempo => param(:ex_tempo).to_i}
  RETOUR_AJAX[:error] = exercice_save_duree_travail rm, dataex, {:mail => param(:user_mail), :md5 => param(:user_md5)}
  RETOUR_AJAX[:duree] = param(:ex_w_duree).to_i # pour l'affichage
end

def exercice_save_duree_travail rm, dataex, datauser
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Exercices.Edit.data_required" if dataex.nil?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? datauser
    raise "Exercices.Edit.id_required" unless dataex.has_key?(:id) && dataex[:id] != nil
  rescue Exception => e
    return "ERROR.#{e.message}"
  end
  
  # -- Tout est OK, on peut sauver la durée de travail sur l'exercice --
  # 
  # @note: sera aussi ajouté la gamme (:tone) ou la suite harmonique (:hseq)
  # si elles sont définies dans les paramètres.
  # 
  begin
    require_model 'seance'
    require_model 'exercice'
    iex     = Exercice.new(dataex[:id], {:roadmap => rm})
    seance  = Seance.new rm
    options = {}
    [:tone, :config].each do |key|
      unless param(key).nil?
        val = case key
          when :tone then 
            param(key).to_i
          else param(key)
          end
        options = options.merge key => val
      end
    end
    working_data = {:time => dataex[:duree].to_i, :tempo => dataex[:tempo], :tone => param(:tone).to_i}
    seance.add_working_time iex, working_data, options
    return nil
  rescue Exception => e
    mess = e.message
    mess += '<br>' + e.backtrace.join('<br>') if Params::offline?
    return mess
  end
  
end