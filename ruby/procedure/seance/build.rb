=begin

  Construction d'une séance de travail
  
=end
require_model 'seance'

def ajax_seance_build
  res = seance_build(
    :rm_nom   => param(:rm_nom),
    :mail     => param(:user_mail),
    :md5      => param(:user_md5),
  )
  if res.class == String
    RETOUR_AJAX[:error] = res # error
  else
    RETOUR_AJAX[:data_seance] = res
  end
end


def seance_build params
  seance = Seance.new
  seance.build_with_params params
end