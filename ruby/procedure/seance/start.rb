# Démarrage de la séance de travail

require_model 'roadmap' unless defined?(Roadmap)
require_model 'seance'

def ajax_seance_start
  rm        = Roadmap.new param(:rm_nom), param(:rm_mail)
  datauser  = {:mail => param(:rm_mail), :md5 => param(:md5)}
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? datauser
  rescue Exception => e
    RETOUR_AJAX[:error] = "ERROR.#{e.message}"
  else
    rm.start_seance
  end  
end