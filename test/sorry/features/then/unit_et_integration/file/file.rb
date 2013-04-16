when /^je dois avoir un fichier de données( valide)?$/ then
  # Test de l'existence du fichier de données de l'utilisateur.
  # 
  # @requis: @data_user, qui contient les données de l'utilisateur à vérifier, contenant
  # au minimum :mail, et les autres données si "valide" est utilisé
  # --
  raise "@data_user est requis" if !defined?(@data_user) || @data_user.nil?
  checker_valide = $1 != nil
  require_model 'user'
  path = File.join(APP_FOLDER, 'user', 'data', @data_user[:mail])
  File path should exist
  if checker_valide
    dfile = JSON.parse(File.read(path))
    [:mail, :nom, :description, :instrument].each do |key|
      dfile[key.to_s] should be @data_user[key]
    end
    dfile['salt'] should be @data_user[:instrument]
    dfile['roadmaps'] should be []

    # On utilise trois checks pour le md5:
    #   - celui du fichier (calculé par la procédure create en utilisant le model User)
    #   - celui renvoyé par User.to_md5 en lui donnant @data_user[:mail]
    #   - celui calculé complètement ici avec mail, instrument et password
    # 
    require 'digest/md5'
    md5_calc = Digest::MD5.hexdigest("#{@data_user[:mail]}-#{@data_user[:instrument]}-#{@data_user[:password]}")
    u = User.new @data_user[:mail]
    md5_expected = u.to_md5( @data_user[:password] )
    md5_question = dfile['md5'] 
    md5_expected should be md5_calc
    md5_question.length should be 32
    md5_question should be md5_expected
  end
end