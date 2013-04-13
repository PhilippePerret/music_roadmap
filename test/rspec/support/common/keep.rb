=begin

  Pour pouvoir utiliser des variables défini dans un cas de test, dans un
  autre cas de test.
  
  Pour conserver la variable :
  
    keep :variable => valeur
  
  Pour récupérer la variable
  
    kept(:variable)
  
  
=end
class Keep
	@@values_kept = {}
  def self.set hok
		@@values_kept = @@values_kept.merge hok
	end
	def self.get key
		@@values_kept[key]
	end
end
def keep hok
	if hok.class == Hash
		Keep::set hok
	else
		Keep::get hok
	end
end
alias :kept :keep
