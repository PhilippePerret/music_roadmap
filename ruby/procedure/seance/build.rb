=begin

  Construction d'une séance de travail
  
=end
require_model 'roadmap' unless defined?(Roadmap)

def ajax_seance_build
  
  res = seance_build(
    Roadmap.new( param(:rm_nom), param(:user_mail) ), 
    {:mail => param(:user_mail), :md5 => param(:user_md5) },
    param(:params_seance)
  )
  if res.class == String
    RETOUR_AJAX[:error] = res # error
  else
    RETOUR_AJAX[:data_seance] = res
  end
end


def seance_build rm, duser, params
  # Security
  begin
    raise "ERROR.Roadmap.unknown"    unless rm.exists?
    raise "ERROR.Roadmap.bad_owner"  unless rm.owner_or_admin?( duser )
  rescue Exception => e
    return e.message
  end
  # OK, build working seance
  require_model 'seance'
  seance = Seance.new rm
  seance.build_with_params params
end