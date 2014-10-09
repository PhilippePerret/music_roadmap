# ---------------------------------------------------------------------
#   Méthodes de test
# ---------------------------------------------------------------------
def folder_should_exist path
  expect(folder_exists? path).to eq(true)
end
def folder_should_not_exist path
  expect(folder_exists? path).to eq(false)
end
def file_should_exist path
  expect(file_exists? path).to eq(true)
end
def file_should_not_exist path
  expect(file_exists? path).to eq(false)
end

# ---------------------------------------------------------------------
#  Méthodes utilitaires
# ---------------------------------------------------------------------
def data_of path, type = nil
  type = type.to_s unless type.nil?
  res = make_operation_test :op => 'data_of', :arg1 => path, :arg2 => (type || "nil")
  res[:result]
end
