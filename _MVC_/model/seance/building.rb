=begin
  Class Seance::Building
  
  Create a working session
  
=end
class Seance
  class Building
  
    # Seance mother
    # 
    attr_reader :seance
    
    # Init params provided by user
    # 
    attr_reader :params
    
    # Working time for the session (defined by user)
    # 
    attr_reader :time
    
    # Options for the session built (defined by user)
    # 
    attr_reader :options
    
    # Difficulty types (defined by user)
    # 
    attr_reader :types
    
    # Initialize the building seance with +params+ set by the musician
    # for the current +seance+ (instance Seance)
    # 
    def initialize seance, params
      @seance = seance
      @params = params
      analyze_params
    end
    
    # Data returned for the seance returned
    # 
    def data
      message = <<-EOM
  Temps de travail : #{time}
  Types : #{types.inspect}
  Options : #{options.inspect}
      EOM
  #     # * RETURN
  #     # Doit retourner le message de départ dans :message
  #     {
  #       :message => message.to_html
  #     }
      {
        :message => message.to_html
      }
    end
    # Analyze params provided by musician
    # 
    def analyze_params
      @params = @params.to_sym

      # # * WORKING TIME
      # #   params[:working_time]     In seconds
      @time  = params[:working_time]

      # # * DIFFICULTIES (= exercice types)
      # #   params[:difficulties]
      @types = params[:difficulties].split(',')

      # # * OPTIONS
      # #   params[:options]:
      # #     :same_ex::        Enable to repeat a same ex (if difficulties)
      # #     :next_config::    Set next general config
      # #     :new_scale::      New scale (take last or 0 for "C")
      # #     :obligatory::     Include obligatory exercices
      @options = {}
      params[:options].each do |key,val|
        val = case val
        when "true"   then true
        when "false"  then false
        when "null"   then nil
        end
        @options = @options.merge key.to_sym => val
      end
    end
    
  end # /end Building subclass
end