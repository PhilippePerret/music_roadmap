=begin

  Construit :
    - le panneau général pour les rapports
    - le gabarit pour l'affichage du mois
    - le gabarit pour l'affichage "normal" (non encore défini)

=end
# Construction des boutons calendrier
# @note: contient aussi le temps de travail total du mois
def calendar_buttons
  # Boutons pour changer de mois
  btns = <<-EOC
<div id="calendar_month_buttons" class="buttons">
  <div id="rapport_cal_div_total_wk" class="fleft">
    <span id="rapport_cal_total_wk_libelle"></span>
    <span id="rapport_cal_total_working_time"></span>
  </div>
  <a  href="#"
      class="btn"
      id="calendar_btn_previous_month"
      onclick="return $.proxy(Rapport.Cal.previous, Rapport.Cal)()"
      >&lt;&lt;&lt;</a>
  <span id="calendar_current_month"></span><span id="calendar_current_year"></span>
  <a  href="#"
      class="btn"
      id="calendar_btn_next_month"
      onclick="return $.proxy(Rapport.Cal.next, Rapport.Cal)()"
      >&gt;&gt;&gt;</a>
</div>
  EOC
  # Boutons pour passer à un autre type de rapport
  # @TODO
  btns
end
# Construction de la table calendrier
def build_calendar
  tbl = '<table id="table_calendar" cellpadding="0" cellspacing="0">'
  tbl += '<tr id="calendar_day_names">'
  # Ligne lundi, mardi, ...
  7.times do |ijour|
    tbl += "<td id=\"calendar_day_name-#{ijour}\" class=\"\"></td>"
  end
  tbl += '</tr>'
  5.times do |isemaine|
    tbl += "<tr id=\"calendar_week-#{isemaine}\" class=\"calendar_week\">"
    7.times do |ijour|
      # Cellule du jour
      tbl += <<-COD
<td id="calendar_day-#{isemaine}-#{ijour}" class="calendar_day"
    onclick="$.proxy(Rapport.Cal.onclick_cell, Rapport.Cal, '#{isemaine}-#{ijour}')()">
  <div>
    <div class="calendar_day_number"></div>
    <div class="calendar_day_content"></div>
  </div>
</td>
      COD
    end
    tbl += '</tr>'
  end
  tbl += '</table>'
end
def bouton_close margin_top = 0, margin_bottom = 0
  <<-EOB
<div style="float:right;clear:both;margin-top:#{margin_top}px;margin-bottom:#{margin_bottom}px;">
  <a  href="#"
      class="btns_rapport_close btn nav"
      onclick="return $.proxy(Rapport.hide_section, Rapport)()"
      ></a>
</div>
  EOB
end

sr = '<section id="rapport" style="display:none;opacity:0;">'
sr += bouton_close
sr += '<div id="rapport_titre" class="titre_section"></div>'
# Division de l'affichage par mois
sr += <<-EOC
<section id="section_calendar">
  <div id="rapport_btns_calendar">#{calendar_buttons}</div>
  <div id="rapport_calendar">#{build_calendar}</div>
  <div id="rapport_cal_buttons_open" class="buttons">
    <a  href="#"
        id="btn_cal_open_legend"
        class=""
        onclick="return $.proxy(Rapport.Cal.open, Rapport.Cal, 'legend')()"
        ></a>
    <a  href="#"
        id="btn_cal_open_by_ex"
        class=""
        onclick="return $.proxy(Rapport.Cal.open, Rapport.Cal, 'by_ex')()"
        ></a>
    <a  href="#"
        id="btn_cal_open_by_type"
        class=""
        onclick="return $.proxy(Rapport.Cal.open, Rapport.Cal, 'by_type')()"
        ></a>
  </div>
  <div id="rapport_cal_legend" style="display:none;">
    <div id="rapport_cal_legends_titre" class="italic"></div>
    <div id="rapport_cal_legends"></div>
  </div>
  <div id="rapport_cal_by_ex" style="display:none;">
    <div class="soustitre">
      <span id="rapport_cal_by_ex_titre"></span>
      &nbsp;(<span class="per_month"></span>)
    </div>
    <div id="rapport_cal_by_ex_content"></div>
  </div>
  <div id="rapport_cal_by_type" style="display:none;">
    <div class="soustitre">
      <span id="rapport_cal_by_type_titre"></span>
      &nbsp;(<span class="per_month"></span>)
    </div>
    <div id="rapport_cal_by_type_content"></div>
  </div>
</section>
EOC
sr += bouton_close(12,12)
# Division de l'affichage par jour (jour courant ou sélectionné dans le calendrier)
sr += <<-EOC
<section id="section_rapport_byday">
  <div class="titre_section">
    <span id="section_rapport_byday_titre"></span>
    <span class="per_day"></span>
  </div>
  <div class="content">
    <div class="soustitre">
      <span id="rapport_day_by_ex_titre"></span>
      &nbsp;(<span class="per_day"></span>)
    </div>
    <div id="rapport_day_by_ex_content"></div>
    <div class="soustitre">
      <span id="rapport_day_by_type_titre"></span>
      &nbsp;(<span class="per_day"></span>)
    </div>
    <div id="rapport_day_by_type_content"></div>
  </div>
</section>
EOC
sr += bouton_close(12,12)

sr += '<div style="clear:both;"></div>'
sr += '</section>'

sr