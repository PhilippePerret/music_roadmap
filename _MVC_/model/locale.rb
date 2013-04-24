# Class Locale
# 
# Deal with localized texts.
# 
# This class deals with locales in ./data/locale and ./data/aide/ folders
# 

require 'singleton' # required

# Convenient method to get a locale
# 
# @usage    locale <aide id>, <lang>, <in folder aide>
# 
# @param  aide_id   Aide ID, i.e. relative path in folder. Unlike javascript locales, this
#                   id MUST be defined only with "/" separator
# @param  lang      Language expected, in two letters
# @param  in_aide   If TRUE (default), search the text in folder aide (./data/aide/)
#                   Otherwise search in ./data/locale
# 
def locale aide_id, lang = nil, in_aide = nil
  in_aide = true if in_aide === nil
  Locale.instance.get( aide_id, lang || :en, in_aide )
end

# Class Locale
class Locale
  
  include Singleton
  
  DEFAULT_EXTENTIONS = ['.html', '.rb', '.htm', '.txt']
  
  # Aide id (relative path)
  # 
  attr_reader :id
  
  # True if it is an help text, False if it is a locale text
  # 
  attr_reader :text_in_help
  
  # Language (2 letters)
  # 
  attr_reader :lang
  
  # Extension required (.rb, .html, ...)
  # 
  attr_reader :extension
  
  # Full path to file, or NIL if any file found
  # 
  attr_reader :path
  
  # Set to TRUE if a path has been found
  # 
  attr_reader :path_found
  
  # Array of paths searched
  # 
  attr_reader :paths_searched
  
  # Return the localized text (String)
  # 
  # @see `locale` function for details of the parameters
  def get id_init, lang, in_aide
    get_id_and_extension id_init
    @lang         = lang.to_sym
    @text_in_help = in_aide
    @path = searched_path
    return_text
  end
  
  # Return the found text, according to extension and language
  def return_text
    return text_unfound if @path.nil?
    case extension
    when '.rb'                    then eval(File.read(@path))
    when '.html', '.htm', '.txt'  then File.read(@path)
    # @TODO: Other formats should be treated here
    else "Extension undefined (#{extension}/#{@extension})"
    end
  end
  
  # Return the unfound text in the required language
  def text_unfound
    case @lang
    when :en then "Unfound localized text for `#{id}#{extension}'"
    when :fr then "Impossible de trouver le texte localisé `#{id}#{extension}'"
    end
  end
  # Decompose id and extention from id provided
  # 
  def get_id_and_extension idinit
    @extension  = File.extname(idinit) # maybe ""
    @id         = File.join(File.dirname(idinit), File.basename( idinit, @extension ))
  end
  
  # Return the path of the file, or NIL if any file found
  def searched_path
    @path_found = false
    root_folder = @text_in_help ? folder_help : folder_locale
    extensions  = extension.to_s == "" ? DEFAULT_EXTENTIONS : [extension]
    @paths_searched = []
    # Possible relatives
    ["#{id}-#{lang}", id].each do |relpath|
      extensions.each do |ext|
        path = File.join( root_folder, "#{relpath}#{ext}" )
        @paths_searched << path
        if File.exists? path
          @extension  = ext
          @path_found = true
          return path 
        end
      end
    end
    return nil # I know dude…
  end
  
  def folder_help
    @folder_help ||= File.join(APP_FOLDER, 'data', 'aide')
  end
  def folder_locale
    @folder_locale ||= File.join(APP_FOLDER, 'data', 'locale')
  end
end

