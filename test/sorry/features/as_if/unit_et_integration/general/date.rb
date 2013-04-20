when /la date #{STRING}/ then
  # Mets la date donnée dans @date
  # 
  # @param    STRING doit être au format "AAAA-MM-JJ"
  # 
  # @products   Le Hash @date contenant : 
  #   :jour => "JJ", :mois => "MM", :annee => "AAAA", :date => "AAAA-MM-JJ",
  #   :date_str => "JJ MM AAAA"
  # 
  # @note: Fait appel à la méthode `data_date` définie dans config_sorry.rb
  # --
  @date = data_date $1