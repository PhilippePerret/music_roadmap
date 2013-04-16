require 'cgi'
require 'net/smtp'

# String class extension
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

# Class Mail
# 
# To send an HTML mail
# 
# * REQUIRED
#   - A file with mail data in ./data/secret/data_mail.rb
#   - Call Mail::lang('<lang>') to set the lang of the mail
#   - Folders ./data/mail/en/ gabarit/
#                             message/
#             ./data/mail/fr/ gabarit/
#                             message/
#             ... other languages
#   - Files in gabarit folders above:
#             - header.html         # HTML code for the header of the mail
#             - footer.html         # HTML code for the footer of the mail
#             - content_type.html   # HTML code for content-type
# 
# * USAGE
#         Mail::lang('en')
#         Mail.new(
#           :message => '<message>', :subject => 'subjet',
#           :from => 'from', :to => 'to', 
#           :data => {... vars for template ...}
#         ).send
# 
#     @note:  <message> can be a plain text message (even HTML) or a relative path
#             in ./data/mail/message/ (template)
#             In a template, we can use '%{var}' for variable text. `var` must be define
#             in :data, as a key, in the params sent to Mail.new.
# 
class Mail

  require File.join(APP_FOLDER, 'data', 'secret', 'data_mail.rb')

  # -------------------------------------------------------------------
  #   Classe
  # -------------------------------------------------------------------
  
  class << self
    # Lang (default: 'en')
    # 
    # Use Mail::lang('<lang>') to define it
    # 
    attr_reader :lang
  
    # Folder data (call Mail::folder_data)
    # 
    attr_reader :folder_data
  
    # Gabarit folder (call Mail::folder_gabarit)
    # 
    attr_reader :folder_gabarit
  
    # Path to message folder
    # 
    attr_reader :folder_messages
    
    # Content-type
    # 
    attr_reader :content_type
  
    # Mail header
    # 
    attr_reader :header
  
    # Subject header
    # 
    attr_reader :header_subject
    
    # Mail footer
    # 
    attr_reader :footer
    
  end # /<< self
  
  # Send the mail (don't call directly, use Mail.new(...) instead)
  # 
  # * PARAMS
  #   :mail::       Formated mail code
  #   :to::         Email address of the receiver
  #   :from::       Email address of the sender (me by default)
  # 
  def self.send mail, to, from
    Net::SMTP.start(
      MY_SMTP[:server], 
      MY_SMTP[:port], 
      'localhost',      # serveur From (sera à régler plus tard suivant
                        # online/offline)
      MY_SMTP[:user], 
      MY_SMTP[:password]
      ) do |smtp|
        smtp.send_message mail, from, to
    end
  end
  
  # Reset all class variables
  def self.reset_all
    @folder_data, @folder_gabarit = nil, nil
    @header, @footer, @content_type = nil, nil, nil
  end
  
  # Return header of subject
  # 
  def self.no_subject
    (@lang == 'en') ? "(no subject)" : "(sans sujet)"
  end
  
  # Set the lang (default: 'en')
  # 
  def self.lang lg
    reset_all
    @lang = lg
  end
 
  # Content-type
  # 
  def self.content_type
    @content_type ||= File.read(File.join(Mail::folder_gabarit, 'content_type.html'))
  end
  # Subject header (subject leading)
  # 
  def self.header_subject
    @header_subject ||= File.read(File.join(Mail::folder_gabarit, 'header_subject.html'))
  end
  # Header of the mail
  # 
  def self.header
    @header ||= File.read(File.join(Mail::folder_gabarit, 'header.html'))
  end
  # Footer of the mail
  # 
  def self.footer
    @footer ||= File.read(File.join(Mail::folder_gabarit, 'footer.html'))
  end
  
  # Return Path of data mail per lang
  # 
  def self.folder_data
    @folder_data ||= File.join(APP_FOLDER, 'data', 'mail', (@lang || 'en') )
  end
  
  # Return path to gabarit folder
  # 
  def self.folder_gabarit
    @folder_gabarit ||= File.join(folder_data, 'gabarit')
  end
  
  # Return path to messages folder
  def self.folder_messages
    @folder_messages ||= File.join(folder_data, 'message')
  end
  
  # -------------------------------------------------------------------
  #   Instance
  # -------------------------------------------------------------------

  # Message in plain text
  # 
  attr_reader :message
  
  # Subject of the mail
  # 
  attr_reader :subject

  # Sender (name<email address>)
  # 
  attr_reader :from
  
  # Receiver (name<email address)
  # 
  attr_reader :to

  # Data (for template-messages)
  # 
  attr_reader :data
  
  # Mail format (:html, :text, :both)
  #
  attr_reader :format
  
  # 
  
  # Initialize a new mail
  # 
  # * PARAMS
  #   :data::     Send data
  #               :from::       Sender
  #               :to::         Receiver
  #               :subject::    Subject of the mail
  #               :message::    Code of the message to send
  #               :format::     Si :text, le message est laissé en code brut (pas HTML)
  #               :data::       Data to use with type-messages. Every key will be turn into
  #                             its value.
  # 
  def initialize data = nil
    set data unless data.nil?
  end
  
  # Really send the message
  # 
  def send
    self.class.send message, to, from
  end
  
  # Dispatch +data+ in instance
  # 
  def set data
    data.each do |k,v| 
      v = nil if v == ""
      instance_variable_set("@#{k}", v) 
    end
  end
  
  def from;     @from     ||= MAIL_PHIL         end
  def to;       @to       ||= MAIL_PHIL         end
  def subject;  @subject  ||= Mail::no_subject  end

  # Return the real message
  # 
  # If @message doesn't contain any spaces, maybe it's a relative path for a message-type
  # In this case, we load it and evaluate it
  # 
  def real_message
    return @message unless @message.match(/ /).nil?
    path = File.join(Mail::folder_messages, @message)
    return @message unless File.exists? path
    
    case File.extname(@message)
    when '.rb' then load path # => message
    else message = File.read path
    end

    return message if data.nil?
    data.each { |k, v| message.gsub!(/\%\{#{k}\}/, v) }
    return message
  end
  
  def real_message_in_format
    code = real_message
    return real_message if @format == :text
    # Sinon on le transforme en code html
    real_message.to_html
  end
  
  def message
    <<-EOM
From: <#{from}>
To: <#{to}>
MIME-Version: 1.0
Content-type: text/html; charset=UTF-8
Subject: #{header_subject}#{subject}

#{code_html}
    EOM
  end

  def code_html
  	cgi = CGI::new('html4')
    cgi.html {
      cgi.head { content_type + cgi.title { subject } } +
      cgi.body { header + real_message_in_format + footer }
    }
  end
 
  # Content-type (UTF8)
  def content_type; Mail::content_type      end
  # Header subject
  def header_subject; Mail::header_subject  end
  # Header mail
  def header;       Mail::header            end
  # Footer mail
  def footer;       Mail::footer            end
  
end
