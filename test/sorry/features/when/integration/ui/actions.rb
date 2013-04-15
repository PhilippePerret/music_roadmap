when /je clique (?:sur )?le bouton (.+)$/ then
  # Clic sur un bouton (un a-button).
  # Peut-être spécifié par son nom (p.e. "S'identifier") ou son JID (par 
  # exemple "a#btn_signin")
  # --
  btn = $1
  btn.gsub!(/^("|')(.*)\1$/){$2}
  Browser click btn

when /je choisis (?:l'item )?#{STRING} dans le menu #{STRING}/ then
  # Permet de sélectionner un item de menu
  # 
  # @param    Le 1er string définit la valeur ou le text de l'item
  # @param    Le 2nd string définit l'identifiant du select (qui doit exister)
  # 
  # --
  item = $1
  idselect = $2
  
  Browser should contain :tag => 'select', :id => idselect
  wel = Browser get :tag => 'select', :id => idselect
  opt = wel.option(:text => item)
  opt = wel.option(:value => item) unless opt.exists?
  opt.select
  
  
# FIN
end