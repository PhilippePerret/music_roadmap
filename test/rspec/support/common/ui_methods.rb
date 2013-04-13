def reset_aide
  raise "Objet JS Aide inconnu…" if "'undefined' == typeof Aide".js
  JS.run "Aide.init(true)"
  Watir::Wait.while { 'Aide.initing'.js }
  section_aide.div(:id => 'aide_content').text.should == ""
  section_aide.should_not be_visible
end

# Ferme la fenêtre d'aide (sans la ré-initialiser) à l'aide de la méthode JS
# @note: ne s'en retourne que lorsque l'aide est bien fermée
def close_aide
  return if "Aide.displayed".js == false
  JS.run "Aide.close()"
  Watir::Wait.while{ section_aide.visible? }
end

=begin
  Remplissage de formulaires ou pseudo-formulaire
  
  @param  form    Objet Watir du formulaire (form, div, table, etc.)
  @param  data    Hash des données. Si +prefix+ est nil, la clé doit être
                  l'ID exact du champ de formulaire. Sinon son nom sans le
                  préfixe
  @param  prefix  Si défini, ajouté devant les clés de data pour obtenir 
                  l'identifiant du champ de formulaire
                  
=end
def fill_form_with form, data, prefix = nil
	data.each do |id,value|
		domid = prefix.nil? ? id : "#{prefix}_#{id}"
		champ = form.element(:id => domid)
		case champ.html[1..6]
		when 'input '
			case champ.attribute_value('type')
			when 'text' 		then form.text_field(:id => domid).set value
			when 'hidden'
        # Il semble qu'il n'existe pas de méthode pour définir la valeur
        # d'un champ hidden, je passe donc par JS pour le faire
			  JS.run "document.getElementById('#{domid}').value=#{value.inspect}"
			when 'checkbox'
				cb = form.checkbox( :id => domid )
				value ? cb.set : cb.clear
			when 'radio'
				rad = form.radio( :id => domid )
				value ? rad.set : rad.clear
			else 
				raise "Impossible de trouver le type de #{champ.html}"
			end
		when 'select'	then form.select(:id=>domid).select_value value
		when 'textar' then form.text_field(:id => domid).set value
		else
			raise "Tag non traitée dans fill_form_with : #{champ.html}"
		end
	end
end
