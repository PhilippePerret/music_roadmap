=begin
  
  Matchers propres à l'application
  
=end
require 'rspec/expectations'

module AppJavascriptMatchers

  RSpec::Matchers.define :be_an_exercice do
    match do |actual|
      actual = actual.strip
      raise "Blank subject in be_an_exercice" if actual == ""
      @typeof = "typeof #{actual}".js
      # raise "#{actual} should be a JSObject (got a #{@typeof})" if @typeof != "object"
      actual.should be_a_js_object
      "#{actual}.class == 'Exercice'".js
    end
    description do
      "JS: #{@target} is an instance of Exercice"
    end
    failure_message_for_should do
      "JS: expected #{@target}:#{@typeof} to be a instance of Exercice"
    end
    failure_message_for_should_not do
      "JS: expected #{@target} NOT to be a instance of Exercice"
    end
  end
end
