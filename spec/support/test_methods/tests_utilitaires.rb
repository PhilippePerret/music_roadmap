def data_of path, type = nil
  res = make_operation_test :op => 'data_of', :arg1 => path, :arg2 => (type || "nil")
  res[:result]
end
def erase_all
  make_operation_test :op => 'erase_all'
end

def folder_exists? path
  res = make_operation_test :op => 'folder_exists?', :arg1 => path
  return res[:result] === true
end
def file_exists? path
  res = make_operation_test :op => 'file_exists?', :arg1 => path
  return res[:result] === true
end

# Procède à un gel de l'état courant
def gel nom_gel
  res = make_operation_test :op => 'gel', :arg1 => nom_gel
  expect(res[:result]).to eq(true)
end

# Procède au dégel de +nom_gel+
def degel nom_gel
  res = make_operation_test :op => 'degel', :arg1 => nom_gel
  expect(res[:result]).to eq(true)
end

def make_operation_test hdata
  querystr = hdata.collect do |k,v|
    "#{k}=#{CGI.escape v}"
  end.join('&')
  # puts "<div>#{querystr}</div>"
  uri = URI("#{URL_MUSIC_ROADMAP}/development/tests_utilitaires.rb?#{querystr}")
  res = Net::HTTP.get(uri)
  res = JSON::parse(res).to_sym
  # puts "<div>#{res.inspect}:#{res.class}</div>"
  return res
end
