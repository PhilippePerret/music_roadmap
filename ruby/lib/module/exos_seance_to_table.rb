=begin

  Module construisant une table avec les informations des exercices
  des dernières séances de la roadmap donnée en paramètre ou les séances
  C'est un module de débuggage
  
  @usage :
  
  require 'module/exos_seance_to_table.rb'
  code_html = build_table_exos( rm[, data][, options] )
  
  Où :
    <rm>  est une instance de la roadmap
    <data>  Sont les data des dernières séances (optionnel)
    <code_html> est la table HTML contenant les informations
      
  
=end

def build_table_exos rm, data = nil, options = nil
  data = Seance::lasts( rm ) if data.nil?
  options ||= {}
  options[:sort] = :by_fois unless options.has_key?(:sort)
  options[:height] = 250 unless options.has_key?(:height)
  
  # puts data.inspect
  sorted_days = data[:sorted_days]
  seances     = data[:seances]

  # On commence par récupérer toutes les données des exercices dans seances
  data_exercices = {}
  seances.each do |day, data|
    data[:exercices].each do |dex|
      ex_id = dex[:id]
      if data_exercices[ex_id].nil?
        data_exercices = data_exercices.merge ex_id => {
          :total_time => 0,
          :nb_fois_reel => 0,
          :nb_fois_calc => 0.0,
          :plays        => [] # la liste des hash enregistrés en séance
        }
      end
      # On mémorise cet exercices
      hex = data_exercices[ex_id]
      hex[:nb_fois_reel] += 1
      hex[:nb_fois_calc] += dex[:nbfois].to_f
      hex[:total_time] += dex[:time]
      hex[:plays] << dex
    end
  end

  # puts data_exercices.inspect

  # On classe les exercices par le nombre de fois réelles où ils ont été joués
  data_exercices = case options[:sort]
  when :by_fois
    data_exercices.sort_by{|exid,data| - data[:nb_fois_reel]}
  when :by_numero
    data_exercices.sort_by{|exid,data| exid.to_i}
  else
    data_exercices
  end
  
  
  html = <<-EOC
<style type="text/css">
  div#tblexos {
    background-color:#eeeeee;
  }
  div#tblexos div#tblexos_body {
    height:#{options[:height]}px;
    max-height:#{options[:height]}px;
    overflow-y:scroll;
  }
  div#tblexos div#tblexos_header {
    border-bottom:5px solid #555;
  }
  div#tblexos div#tblexos_header div {
    text-align:center;
    font-style:italic;
    color:#555;
    }
  div#tblexos div.exo {
    border-bottom:1px solid #ccc;
    padding: 2px 4px;
  }

  div.inlineb > div {display:inline-block;}
  div#tblexos div.exo > div {display:inline-block;text-align:center;}
  div#tblexos div.exoid {display:inline-block; width:50px;}
  div#tblexos div.exovignette {width:160px;}
  div#tblexos div.exovignette img {width:140px;}
  div#tblexos div.exorealfois {width:60px;}
  div#tblexos div.exocalcfois {width:80px;}
  div#tblexos div.exoduree {width:80px;}
  div#tblexos div.exodureemoy {width:80px;}
  div#tblexos div.exoworkingtime {width:80px;}
  div#tblexos div.exooblig {width:60px;}
  /* Seulement dans le body */
  div#tblexos_body div.exoid {font-size:20px;}
  div#tblexos_body div.exovignette {height:60px;overflow:hidden;}

</style>
<div id="tblexos">
  <div id="tblexos_header" class="exo">
    <div class="exoid">ID</div>
    <div class="exovignette">Vignette</div>
    <div>
      <div style="border-bottom:1px solid #999;">Nombre fois</div>
      <div class="inlineb">
        <div class="exorealfois">réel</div>
        <div class="exocalcfois">calc</div>
      </div>
    </div>
    <div>
      <div style="border-bottom:1px solid #999;">Durée</div>
      <div class="inlineb">
        <div class="exoduree">Absolu</div>
        <div class="exodureemoy">Moyenne</div>
        <div class="exoworkingtime">Travail</div>
      </div>
    </div>
    <div class="exooblig">Requis</div>
  </div>
  <div id="tblexos_body">
  
  EOC

  data_exercices.each do |exid, exdata|
    iex = rm.exercice(exid)
    html << <<-EOR
  <a name="exo-#{exid}"></a>
  <div class="exo">
    <div class="exoid">#{exid}</div>
    <div class="exovignette"><img src="#{APP_FOLDER}/#{iex.relpath_vignette}" /></div>
    <div class="exorealfois">#{exdata[:nb_fois_reel]}</div>
    <div class="exocalcfois">#{nb_fois_to_s exdata[:nb_fois_calc]}</div>
    <div class="exoduree">#{iex.duree_at.to_i.as_short_horloge}</div>
    <div class="exodureemoy">#{duree_moyenne(exdata)}</div>
    <div class="exoworkingtime">#{exdata[:total_time].as_horloge}</div>
    <div class="exooblig">#{iex.obligatory? ? "YES" : "no"}</div>
  </div>

    EOR
  end
  html << '</div>' # fin div#tblexos_body
  html << '</div>' # fin div#tblexos
  html
end
def duree_moyenne exdata
  (exdata[:total_time] / exdata[:nb_fois_reel]).to_i.as_short_horloge
end
def nb_fois_to_s afloat
  num,dec = afloat.to_s.split('.')
  "#{num}.#{dec[0..1]}"
end
