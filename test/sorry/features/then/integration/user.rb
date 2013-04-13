when /(je dois|l'utilisateur doit) être identifié/ then
  # Vérifie que l'utilisateur soit bien identifié
  # Cette vérification se fait en appelant la méthode is_identified() de
  # User ou une méthode personnalisée définie dans 'config_sorry.rb'.
  # Le méthode attend que l'utilisateur ait été checké
  # --
  User should be identified

when /(je ne dois|l'utilisateur ne doit) pas être identifié/ then
  # Vérifie que l'utilisateur ne soit pas identifié
  # Cette vérification se fait en appelant la méthode is_identified() de
  # l'objet JS User ou une méthode propre définie dans config_sorry.rb.
  # --
  User should not be identified
