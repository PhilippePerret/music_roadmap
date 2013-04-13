# Retourne l'élément Watir correspondant à hdata
# 
# @param  hdata   :balise => '<id>'
# 
def watir_e hdata
  onav.send( hdata.keys.first, :id => hdata.values.first )
end

def clean_flash
  unless onav.nil?
    JS.run 'Flash.clean()'
    Watir::Wait.while{ onav.div(:id => 'inner_flash').exists? }
  end
end
alias :flash_clean :clean_flash

# =>  Lève une erreur si le message flash ne contient pas le message
#     +message+. Si +type+ est défini, c'est soit :warning soit :notice pour
#     spécifier le type du message
def flash_should_contain message, type = nil
  type_mess = "le message"
  type_mess += " d'erreur" if type == :warning

  flash = onav.div(:id => 'flash').div(:id => 'inner_flash')
  unless flash.exists?
    raise "Le flash devrait contenir #{type_mess} “#{message}”. Mais la fenêtre flash est inexistante."
  end
  begin
    dsearch   = { :text => /#{Regexp.escape(message)}/ }
    dsearch   = dsearch.merge(:class => type.to_s) unless type.nil?
    searched  = flash.span(dsearch) # C'est ici qu'on cherche
    if searched.exists?
      true.should be_true # juste pour provoquer le cas
    else
      # Erreur détaillée
      err = "Le flash devrait contenir #{type_mess} : « #{message} »" +
            "\nIl contient : « #{flash.html} »"
      raise err
    end
  rescue Exception => e
    raise "#[flash_should_contain] Check impossible : #{e.message}"
  end
end
def flash_should_not_contain message, type = nil
  flash = onav.div(:id => 'flash').div(:id => 'inner_flash')
  if  flash.span(:text => /#{Regexp.escape(message)}/).exists? ||
      flash.div(:text => /#{Regexp.escape(message)}/).exists?
    raise "Le flash ne devrait pas contenir le message “#{message}”…"
  end
end

# Lève une erreur si l'élément n'existe pas
# @param  hdata     :balise => "<id élément>"
#                   Pe : :section => 'id_de_la_section'
#                   @NB: On peut en envoyer plusieurs.
# @usage
#   it "le div d'id 'mon_div' doit exiser" do
#     should_exist :div => 'mon_div'
#   end
def should_exist hdata
  hdata.each do |k, id|
    onav.send( k, :id => id).should exist
  end
end
# Lève une erreur si l'élément existe dans la page
# 
# @usage
#   it "le div d'id 'mon_div' ne doit pas exiser" do
#     should_not_exist :div => 'mon_div'
#   end
def should_not_exist hdata
	hdata.each do |k, id|
	  onav.send( k, :id => id).should_not exist
	end
end
def should_be_visible hdata
	hdata.each do |k, id|
	  e = onav.send( k, :id => id)
	  e.should exist
	  e.should be_visible
	end
end
def should_not_be_visible hdata
	hdata.each do |k, id|
	  e = onav.send( k, :id => id)
	  e.should exist
	  e.should_not be_visible
	end
end

def should_focused hdata
	hdata.each do |k, id|
	  onav.send( k, :id => id).should be_focused
	end
end
alias :should_be_focused :should_focused

def should_not_focused hdata
	hdata.each do |k, id|
	  onav.send( k, :id => id).should_not be_focused
	end
end
alias :should_not_be_focused :should_not_focused


# Fait un screenshot
# @usage      screenshot(<nom du screenshot>)
# @produit un screenshot dans le dossier test/screenshot
def screenshot name
  return if onav.nil?
  onav.screenshot.save screenshot_path( "#{Time.now.to_i}-#{name}" )
end
def screenshot_path name
  File.join(folder_screenshot, "#{name}.png")
end
def folder_screenshot
  File.join(APP_FOLDER, 'test', 'screenshot')
end