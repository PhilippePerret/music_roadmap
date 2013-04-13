require 'rspec/expectations'

module JavascriptMatchers

  RSpec::Matchers.define :be_like do |expected|
    match do |actual|
      actual.should be_defined
      expected.should be_defined
      actual.js == expected.js
    end
    description do 
      "JS: #{actual} is equal to #{expected}"
    end
    failure_message_for_should do
      "expected #{actual} and #{expected} to be equal [JS]"
    end
    failure_message_for_should_not do
      "expected #{actual} and #{expected} not to be equal [JS]"
    end
  end
  RSpec::Matchers.define :be_defined do
    match do |actual|
      "'undefined' != typeof #{actual}".js
    end
    description do
      "JS #{actual} defined"
    end
    failure_message_for_should do
      "JS: #{actual} should be defined"
    end
  end
  RSpec::Matchers.define :be_a_js_object do
    match do |actual|
      actual.should be_defined
      "'object' == typeof #{actual}".js
    end
    description do
      "JS:#{actual} is an object"
    end
    failure_message_for_should do
      "expected JS:#{actual} to be defined"
    end
    failure_message_for_should_not do
      "expected JS:#{actual} NOT to be defined"
    end
  end
  RSpec::Matchers.define :be_a_method_of do |expected|
    match do |actual|
      expected.strip.should_not == ""
      expected.should be_a_js_object
      actual.strip.should_not == ""
      "'function' == typeof #{expected}.#{actual}".js
    end
    description do
      "#{actual} is a method of #{expected}"
    end
    failure_message_for_should do
      "expected #{actual} to be a method of #{expected}"
    end
    failure_message_for_should_not do
      "expected #{actual} not to be a method of #{expected}"
    end
  end
end