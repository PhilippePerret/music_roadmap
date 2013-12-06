=begin

  Procédure de construction d'un rapport de travail
  
  En fait, ça ne fait que remonter les données utiles pour le rapport
  
  Pour voir le contenu du hash retourné, cf. 
    
    Seance::get_from_to
    Rapport.data_for_js_building
    
=end
require_model 'roadmap' unless defined?(Roadmap)
require_model 'seance'  unless defined?(Seance)
require_model 'rapport'

def ajax_rapport_load
  rm    = Roadmap.new param(:rm_nom), param(:mail)
  duser = {:mail => param(:mail), :md5 => param(:md5)}
  res   = rapport_load rm, duser, (param(:options) || {})
  unless res.class == String
    dbg "RETOUR_AJAX[:data_rapport] mis à : #{res.inspect}"
    RETOUR_AJAX[:data_rapport] = res
  else
    RETOUR_AJAX[:error] = res
  end
  # RETOUR_AJAX[:error] = "ICI"
end

def rapport_load rm, duser, options
  # Security
  begin
    raise "ERROR.Roadmap.unknown"    unless rm.exists?
    raise "ERROR.Roadmap.bad_owner"  unless rm.owner_or_admin?( duser )
    raise "ERROR.Rapport.no_data"    if options.nil?
  rescue Exception => e
    return e.message
  end
  # OK, seek data report according to options
  Rapport.new(rm, options).data_for_js_building
end