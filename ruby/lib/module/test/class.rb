class Tests
  
  class << self
    
    # => Retourne les logs sous forme de Array (format = :array) ou de 
    # String (format = :string)
    def logs format = :array
      case format
      when :array
        @logs
      when :string
        (@logs||[]).collect{|lg| "<div>#{lg}</div>"}.join('')
      end
    end
    
    def log str, options = nil
      options ||= {}
      @logs ||= []
      @logs << "<div class='#{options[:class]}'>#{str}</div>"
    end
    
    # = Main =
    #
    # Méthode principale appelée par le script tests_utilitaires.rb
    #
    def run_operation
      res = nil; method = nil
      begin
        method = param(:op).to_sym
        raise "La méthode #{method.inspect} est inconnue au bataillon" unless self.respond_to? method
        res = self.send(method, *args)
        log "OPÉRATION EXÉCUTÉE AVEC SUCCÈS" if param(:type) == 'html'
        return {:result => res, :code => (Tests::logs :string)}
      rescue Exception => e
        return {
          :error  => "ERREUR AU COURS DE L'OPÉRATION `#{method}' : \n#{e.message}\n\n" + (e.backtrace.join("\n")),
          :code   => (Tests::logs :string),
          :result => res
        }
      end
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