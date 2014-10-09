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

