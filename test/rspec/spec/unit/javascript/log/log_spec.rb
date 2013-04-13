=begin
	Tests unitaires de l'objet JS Log
=end
require 'spec_helper'

describe "Objet JS Log" do
	include_examples "javascript", "Log"
  it "doit exister" do
    object_should_exist
  end
	it "à tester entièrement" do
	  pending "Tout l'objet Log est à tester"
	end
end