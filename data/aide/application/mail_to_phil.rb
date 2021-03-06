=begin

  Write to Phil
  
  La page contient un captcha anti-robot
  
=end
begin
  def suite_notes nombre_croches
    notes = []
    while nombre_croches > 0 do
      if nombre_croches >= 4
        notes << image_de( 'blanche' )
        nombre_croches -= 4
      elsif nombre_croches >= 2
        notes << image_de( 'noire' )
        nombre_croches -= 2
      else
        notes << image_de( 'croche' )
        nombre_croches -= 1
      end
    end
    notes.join("")
  end
  def image_de duree
    "<img data-src=\"note/#{duree}.png\" style=\"height:36px;vertical-align:middle;\" />"
  end
  def input_text
    style = "vertical-align:middle;width:40px;font-size:18px;"
    '<input type="text" id="captcha_reponse" onfocus="this.select()" value="" style="'+style+'" />'
  end
  def my_user_ip
    ['REMOTE_ADDR','HTTP_CLIENT_IP','HTTP_X_FORWARDED_FOR'].each do |key|
      ip = Params.get_env key
      return ip unless ip.nil?
    end
  end
  def check_folders upto
    cur   = APP_FOLDER
    upto  = upto.sub(/#{APP_FOLDER}\//,'')
    upto.split('/').each do |dossier|
      break if dossier.index('.') != nil # un fichier &agrave; la fin
      cur = "#{cur}/#{dossier}"
      Dir.mkdir(cur, 0777) unless File.exists? cur
    end
  end

  now = Time.now.to_i.to_s
  nombre_croches = rand( 12 - 4 ) + 4   # Nombre entre 4 et 12

  # Enregistrement du fichier qui doit contenir :
  #   - L'adresse IP du visiteur
  #   - Le timestamp
  #   - Le nombre de tentatives de l'utilisateur (maximum = 3)
  data = {
    :ip                 => my_user_ip,
    :now                => now,
    :nombre_tentatives  => 0,
    :reponse            => nombre_croches
  }
  # path = File.join(APP_FOLDER, 'tmp', 'captcha', "#{now}.js")
  path = File.join(APP_FOLDER, 'tmp', 'captcha', "#{now}.msh")
  check_folders path    # lourd de le faire ici, mais bon&hellip; j'ai pas de classe 
                        # generale pour le moment
  # File.open(path, 'wb'){|f| f.write data.to_json}
  App::save_data path, data
  captcha = <<-EOT
  <div>
    <div id="captcha">
      <span id="mailto_captcha_titre" class="libelle" style="width:170px;"></span>
      <div class="center">
        #{suite_notes(nombre_croches)} = #{input_text} <span id="mailto_croches"></span>
        <div id="captcha_message" style="margin-left:2em;margin-top:1em;">&nbsp;</div>
      </div>
      <input type="hidden" id="captcha_time" value="#{now}" />
    </div>
  </div>
  EOT
  # Formulaire renvoye
  form = File.read(File.join(APP_FOLDER,'data','aide','application',"mail_form.html"))
  form.sub!(/CAPTCHA/,captcha)
rescue Exception => e
  RETOUR_AJAX[:error] = e.message
  "Probl&egrave;me"
end