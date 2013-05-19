=begin

  Procédure de chargement des exercices requis
  param(:ids) doit contenir une liste String des identifiants séparés par
  des virgules.
  
=end
require_model 'roadmap' unless defined?(Roadmap)

def ajax_exercice_load
  ids   = param(:ids).split(',').uniq
  rm    = Roadmap.new param(:rm_nom), param(:rm_mail)
  duser = {:mail => param(:rm_mail), :md5 => param(:md5)}
  res = exercice_load rm, ids, duser
  if res.class == String
    RETOUR_AJAX[:error] = res
  else
    RETOUR_AJAX[:exercices]   = res[:exercices]
    RETOUR_AJAX[:load_errors] = res[:errors]
  end
end

# * PARAMS
#   :rm::       Instance Roadmap of the roadmap of exercices to load
#   :ids::      Array of exercices Ids
#   :owner::    Hash of :mail, :md5 of the owner of the roadmap (or admin)
# 
# * RETURNS
#   An hash containing:
#     :exercices::  Array of all exercices loaded
#     :errors::     Array of non fatal errors (e.g. exercices unfound)
# 
def exercice_load rm, ids, owner
  # Security
  begin
    raise "Roadmap.required"  if rm.nil? || !rm.exists?
    raise "Roadmap.bad_owner" unless rm.owner_or_admin? owner
  rescue Exception => e
    return "ERROR.#{e.message}"
  end
  
  # Collect exercices
  hres = {
    :exercices  => [],
    :errors     => []
  }
  ids.each do |id|
    path = File.join(rm.folder_exercices,"#{id}.js")
    if File.exists? path
      begin
        hres[:exercices] << JSON.parse(File.read(path))
      rescue Exception => e
        hres[:errors] << "# ERROR with ex ##{id}: #{e.message}"
      end
    else
      hres[:errors] << "Unfound exercice: #{path}"
    end
  end
  
  return hres
end