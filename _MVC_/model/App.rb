=begin

Class App
---------
Pour l'application comme application

=end
class App
  class << self
    
    def folder_tmp
      @folder_tmp ||= begin
        d = File.join(".", "tmp")
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    def folder_log
      @folder_log ||= begin
        d = File.join(folder_tmp, 'log')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
    def folder_debug
      @folder_debug ||= begin
        d = File.join(folder_log, 'debug')
        Dir.mkdir(d, 0755) unless File.exists? d
        d
      end
    end
  end
end