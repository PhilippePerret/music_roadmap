when /JS #{VARIABLE} doit exister/ then
  objet   = $1
  "'undefined' != typeof #{objet}".js should be true
  
when /JS #{VARIABLE} doit répondre à #{VARIABLE}/ then
  objet   = $1
  method  = $2
  objet should respond to method
