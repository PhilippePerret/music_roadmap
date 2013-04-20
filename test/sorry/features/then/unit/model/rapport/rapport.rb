when /le rapport du #{STRING} doit s'afficher/ then
  # Contrôle l'affichage du rapport de la date fourni en argument.
  # 
  # STRING: "AAAA-MM-JJ"
  # --
  date = $1
  hdate = data_date(date)
  res = Rapport.show(date)
  res should contain "RAPPORT DU #{hdate[:humaine]}"
  res should contain "#{hdate[:from_today]} jours se sont écoulés depuis cette date."
