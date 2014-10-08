class Tests
  
  class << self
    
    def log str, options = nil
      options ||= {}
      STDOUT.write "<div class='#{options[:class]}'>#{str}</div>"
    end
    
    # = Main =
    #
    # Méthode principale appelée par le script tests_utilitaires.rb
    #
    def run_operation
      method = param(:op).to_sym
      unless self.respond_to? method
        raise "La méthode #{method.inspect} est inconnue au bataillon"
      end
      self.send(method, *args)
      log "OPÉRATION EXÉCUTÉE AVEC SUCCÈS"
    end
    
    def args
      @args ||= begin
        [:arg1, :arg2, :arg3, :arg4, :arg5].collect{|arg|
          param(arg)
        }.reject{|e| e.nil?}
      end
    end
    def dis_quelque_chose
      log "Je dis que je dois jouer #{param(:op)}"
      if param(:args)
        log "args est de class : #{param.args.class}"
      end
    end
    
    def deuxargs arg1, arg2
      log "Je suis dans `deuxargs' avec #{arg1} et #{arg2}"
    end
    
  end
  
end