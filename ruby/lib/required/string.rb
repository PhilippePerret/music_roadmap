class String
  # Translate self in HTML code
  # 
  def to_html
    t = self.split("\n").collect do |para|
          "<div style=\"margin-bottom:4px;\">#{para}</div>"
        end.join("")
    '<div style="font-family:Verdana;font-size:1em;">'+t+'</div>'
  end
end