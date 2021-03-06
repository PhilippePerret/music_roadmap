# To deal with exercices reports
# 

require 'date'
require_model 'seance' unless defined?(Seance)

class Rapport
  
  # -------------------------------------------------------------------
  # == Class
  # 
    
  # -------------------------------------------------------------------
  # == Instance
  # 

  # Roadmap of the rapport (Roadmap instance)
  # 
  attr_reader :roadmap
  
  # Options/parameters for the rapport to build
  # 
  # Hash containing :
  #   :from   =>  First day ("YYMMDD") of the rapport to build
  #   :to     =>  Last day ("YYMMDD") of the rapport to build
  #   :month  =>  A month (Fixnum from 1 to 12). If provided, defines :from and :to to fit
  #               this month. If defined without :year, :year is current year.
  #   :year   =>  A year (Fixnum). If provided with :month, the rapport for the month :month
  #               of the year :year.
  # 
  attr_accessor :options
  
  # Data seances of the rapport (Array of data of the seances — Hash-s)
  # 
  attr_reader :data_seances

  # Initialize Rapport instance
  # 
  # * PARAMS
  #   :rm::       Instance Roadmap of the roadmap
  #   :options::  Options/parameters to build the report
  #               @see definition of :options (attr_reader) above
  # 
  def initialize rm, options = nil
    @roadmap = rm
    options ||= {}
    @options = options.to_sym
  end

  # Return to JS data required for building report
  # 
  # * RETURN
  #   
  #   An Hash containing data to display the report. It's the hash returned 
  #   by the Seance::get_from_to method plus some values added here :
  #     :year             =>  Year of the report
  #     :month            =>  index of the month (0-11)
  #     :first_month_day  =>  first week day index of month (0-6)
  #     :last_month_day   =>  last week day index of month (0-6)
  # 
  def data_for_js_building
    dbg "-> Rapport::data_for_js_building"
    defaultize_options
    @data_seances = Seance.get_from_to roadmap, options[:from], options[:to]
    # Pour faciliter le travail de javascript, on lui fournit quelques valeurs
    # supplémentaires
    datefrom  = Date.strptime(options[:from], '%y%m%d')
    dateto    = Date.strptime(options[:to], '%y%m%d')
    @data_seances = @data_seances.merge(
      :year             => options[:year],
      :month            => options[:month] - 1,
      :number_of_days   => number_of_days(datefrom, dateto),
      :days_until_today => days_until_today(datefrom, dateto),
      :first_month_day  => week_day(Date.new(options[:year], options[:month], 1)),
      :last_month_day   => week_day(Date.new(options[:year], options[:month], -1))
    )
    dbg "<- Rapport::data_for_js_building(@data_seances:\n#{@data_seances.inspect})"
    return @data_seances
  end
  
  # Return number of days for the report.
  # 
  # * CASES
  #   - today is "out" the period => to - from
  #   - today is the last day of the period => today - from
  #   - today is within the period => today - from
  # 
  def number_of_days datefrom, dateto
    (dateto - datefrom).numerator.to_i
  end
  
  # Return number of days from +datefrom+ to today. Return NIL if
  # today is outsite the period datefrom-dateto
  # 
  def days_until_today datefrom, dateto
    today = Date.today
    return nil if today > dateto || today < datefrom
    (today - datefrom).numerator.to_i
  end
  
  def week_day date
    wd = date.wday - 1
    wd = 6 if wd < 0 # car 0 = sunday
    wd
  end
  
  # Set the default values of options/parameters of the rapport if they are not
  # defined
  # 
  def defaultize_options
    if options[:year] == nil # LAISSER COMME ÇA, NE PAS METTRE SUR UNE LIGNE, ÇA PLANTE
      options[:year] = Date.today.year 
    else
      options[:year] = options[:year].to_i
    end
    # IDEM QUE CI-DESSUS : LA TOURNURE…
    #       options[:month] = Date.today.month  if options[:month].nil?
    # PRODUIT UNE EXCEPTION
    if options[:month].nil?
      options[:month] = Date.today.month
    else
      options[:month] = options[:month].to_i
    end
    options[:from]  = Date.new(options[:year], options[:month], 1).as_yymmdd  if options[:from].nil?
    options[:to]    = Date.new(options[:year], options[:month], -1).as_yymmdd if options[:to].nil?
  end
end