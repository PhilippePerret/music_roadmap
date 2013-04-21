# Procédure de chargement de la roadmap (AJAX + normale)

load_model 'roadmap'

# Procédure Ajax de chargement de la roadmap
def ajax_roadmap_load
  begin
    rm = Roadmap.new param(:roadmap_nom), param(:user_mail)
    if param(:check_if_exists).to_s == "true" && !rm.exists?
      raise "ERRORS.Roadmap.unknown" 
    end
  rescue Exception => e
    RETOUR_AJAX[:roadmap] = nil
    RETOUR_AJAX[:error]   = e.message
  else
    data_rm = roadmap_load rm
    if data_rm.class == String
      RETOUR_AJAX[:error] = data_rm
    else
      RETOUR_AJAX[:roadmap] = data_rm
      RETOUR_AJAX[:last_id_exercice] = rm.last_id_exercice
    end
  end 
end

# => Retourne toutes les données trouvées dans les fichiers
# 
# @param  only    Un hash permettant de ne charger que certaines données.
#                 Ce sont les clés utilisées par data ci-dessous, par exemple
#                 `:data_exercices'
# 
def roadmap_load rm, umail = nil, only = nil
  rm = Roadmap.new rm, umail unless rm.class == Roadmap
  return "ERRORS.Roadmap.unknown" unless rm.exists?
  
  # Les données qui seront retournées
  # Peut contenir, suivant la valeur de +only+ :
  #   :data_roadmap       Les données (secrètes) de la roadmap
  #   :config_generale    Configuration générale des exercices
  #   :data_exercices     Données GÉNÉRALES des exercices
  #   :exercices          Données PRÉCISES de CHAQUE exercice  
  data = {}

  # puts "only dans roadmap_load: #{only.inspect}"
  
  if ( only.nil? || only.has_key?(:data_roadmap))
    if rm.data?
      datajs = JSON.parse( File.read(rm.path_data) )
      # On doit retirer les données sensibles
      # @TODO: Mettre ça dans une méthode de roadmap qui avec un argument
      # qui définit qu'on veut seulement les données non sensibles.
      datajs.delete('mail')
      datajs.delete('password')
      datajs.delete('salt')
    else
      datajs = {}
    end
    data = data.merge :data_roadmap => datajs
  end
  
  
  if ( only.nil? || only.has_key?(:config_generale))
    d = if rm.config_generale?
      JSON.parse( File.read(rm.path_config_generale)) 
    else {} end 
    data = data.merge :config_generale => d
  end
  
  if ( only.nil? || only.has_key?(:data_exercices))
    d = if rm.exercices?
          JSON.parse( File.read(rm.path_exercices))
        else {'ordre' => nil} 
        end
    data = data.merge :data_exercices => d
  end
  
  if ( only.nil? || only.has_key?(:exercices))
    data = data.merge :exercices => []
    data = data.merge :data_exercices => {}
    if File.exists?( rm.folder_exercices )
      if !data[:data_exercices].has_key?('ordre') || data[:data_exercices]['ordre'].empty?
        # Chargement sans ordre (normalement, ne devrait plus arriver)
        data[:data_exercices]['ordre'] = []
        Dir["#{rm.folder_exercices}/*.js"].each do |ex|
          data[:exercices] << JSON.parse(File.read(ex))
        end
      else
        # Chargement avec ordre
        data[:data_exercices]['ordre'].each do |id|
          data[:exercices] << JSON.parse(File.read(File.join(rm.folder_exercices,"#{id}.js")))
        end
      end
      # --- On regarde s'il y a des images ---
      # @note: la vérification est donc fait à chaque chargement de la feuille
      # de style.
      data[:exercices].collect do |dex|
        id = dex['id']
        path_png = rm.path_image_png( id )
        path_jpg = rm.path_image_jpg( id )
        if File.exists? path_png      then  dex['image'] = "#{id}.png"
        elsif File.exists? path_jpg   then  dex['image'] = "#{id}.jpg"
        else                                dex['image'] = nil
        end
        dex
      end
    else
      # Quand il n'y a encore aucun exercice
      data[:data_exercices]['ordre'] = []
    end
  end

  data
end