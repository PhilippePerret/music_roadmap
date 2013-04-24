=begin

  Construction d'une séance de travail
  
=end
require_model 'seance'

def ajax_seance_build

end


def seance_build params
  seance = Seance.new
  seance.build_with_params params
end