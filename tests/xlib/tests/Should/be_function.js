function Should_be_function(poursuivre){

	// Equal
	w("\nEqual", BLUE)
	w('APP._ma_variable_test = "une valeur"')
	APP._ma_variable_test = "une valeur"
	w('"_ma_variable_test".should.be.equal_to( "une valeur" )')
	"_ma_variable_test".should.be.equal_to( "une valeur" )
	w('"_ma_variable_test".should_not.be.equal_to( "Une autre valeur" )')
	"_ma_variable_test".should_not.be.equal_to( "Une autre valeur" )
	w('APP._ma_variable_test = null')
	APP._ma_variable_test = null
	w('"_ma_variable_test".should.be.equal_to( null )')
	"_ma_variable_test".should.be.equal_to( null )
	w('"_ma_variable_test".should.be.equal_to( undefined )')
	"_ma_variable_test".should.be.equal_to( undefined )
	w('"_ma_variable_test".should_not.be.equal_to( undefined, true )')
	"_ma_variable_test".should_not.be.equal_to( undefined, true )
	
	// Greater
	w("\nGreater", BLUE)
	w('APP._ma_variable_test = 12')
	APP._ma_variable_test = 12 
	w('"_ma_variable_test".should.be.greater_than(8)')
	"_ma_variable_test".should.be.greater_than(8)
	w('"_ma_variable_test".should_not.be.greater_than(14)')
	"_ma_variable_test".should_not.be.greater_than(14)
	w('"_ma_variable_test".should.be.greater_than_or_equal_to(12)')
	"_ma_variable_test".should.be.greater_than_or_equal_to(12)
	w('"_ma_variable_test".should_not.be.greater_than_or_equal_to(13)')
	"_ma_variable_test".should_not.be.greater_than_or_equal_to(13)
	
	// Less
	w("\nLess", BLUE)
	w('"_ma_variable_test".should.be.less_than(13)')
	"_ma_variable_test".should.be.less_than(13)
	w('"_ma_variable_test".should_not.be.less_than(11)')
	"_ma_variable_test".should_not.be.less_than(11)
	w('"_ma_variable_test".should.be.less_than_or_equal_to(12)')
	"_ma_variable_test".should.be.less_than_or_equal_to(12)
	w('"_ma_variable_test".should.be.less_than_or_equal_to(12)')
	"_ma_variable_test".should.be.less_than_or_equal_to(12)
	
	if('function'==typeof poursuivre) poursuivre();
	else Test.end();
}