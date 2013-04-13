# -------------------------------------------------------------------
#   Convenient Ruby methods
# -------------------------------------------------------------------

# Permet d'écrire un message en rouge dans la console
def puts_error error
  print "\n\e[0;31m#{error}\e[0m"
end
def puts_notice notice
  print "\n\e[0;34m#{notice}\e[0m"
end

def iv_get( instance, prop )
  instance.instance_variable_get("@#{prop}")
end
def iv_set( instance, hash )
  hash.each { |k,v| instance.instance_variable_set("@#{k}", v) }
end
def cv_get( classe, prop )
  classe.send('class_variable_get', "@@#{prop}")
end
def cv_set( classe, prop, valeur = nil)
  propriete = { propriete => valeur } unless propriete.class == Hash
  propriete.each do |prop, val|
    classe.send('class_variable_set', "@@#{prop}", val)
  end
end

