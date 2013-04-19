
# Class gérant le fichier de données de durées de jeux des exercices de la roadmap
# 
# Cette class définit aussi la sous-class FileDureeJeu::FirstLine pour gérer la première 
# ligne du fichier qui contient l'indication des offsets de code dans le fichier.
# C'est un array "inspecté" qui contient des duos "<id exercice>:<offset code>"
# 
class FileDureeJeu
  
  # Roadmap de ce fichier de données
  # (un fichier de données de durée de jeux est toujours associé à une roadmap)
  # 
  attr_reader :roadmap
  
  @file = nil # Path au fichier de données (utiliser la méthode éponyme)
  
  # Instancie le fichier de donnée de durées de jeu (appelé par la roadmap)
  # 
  def initialize roadmap
    @roadmap = roadmap
  end
  
  # Actualise le fichier de données de durées de jeu
  # 
  def update iex
    # On actualise la donnée de première ligne avec les nouvelles données de l'exercice
    first_line.set_len_exercice iex

    ex_offset = iex.offset_in_duree_jeu
    
    # On modifie le code du fichier
    if exists?
      code_complet  = File.read file
      if ex_offset.nil?
        code_avant_ex = code_complet[first_line.len..-1]
        code_apres_ex = ""
      else
        code_avant_ex = code_complet[first_line.len..(ex_offset - 1)]
        code_apres_ex = code_complet[(ex_offset + iex.len_init_in_duree_jeu)..-1]
      end
    else
      code_avant_ex, code_apres_ex = "", ""
    end
    # Reconstitution du fichier
    File.open(file, 'w') do |f|
      f.write first_line.to_s
      f.write code_avant_ex
      f.write iex.line_code
      f.write code_apres_ex
    end
  end
  
  # Retourne le path au fichier de données
  def file
    @file ||= File.join(roadmap.folder, 'durees_jeux')
  end
  alias :path :file
  
  # Retourne TRUE si le fichier de données de jeu existe déjà
  def exists?
    File.exists? file
  end
  
  # Retourne la ligne de code de l'exercice voulu
  # 
  # @param  +iex+   Instance Exercice de l'exercice à traiter
  # 
  def line_code_exercice iex
    first_line.offset_of_exercice iex
    puts "Offset exercice in file: #{iex.offset_in_duree_jeu.inspect}"
    if iex.offset_in_duree_jeu != nil
      get_line_from iex.offset_in_duree_jeu
    else
      "#{iex.id}\t0\t0\t0\t"
    end
  end
  
  # Retourne la ligne (avec retour chariot) située à l'offset +offset+
  # 
  def get_line_from offset
    return "" unless exists?
    rf = File.open(file, 'r')
    begin
      rf.seek(offset, IO::SEEK_SET)
      line = rf.readline
    rescue Exception => e
      raise "[in FileDureeJeu.get_line_from] #{e.message}"
      line = nil
    ensure
      rf.close
    end
    line
  end
  
  
  # Retourne l'instance FirstLine du fichier courant
  # 
  def first_line
    @first_line ||= FirstLine.new self
  end
  
  # Class FileDureeJeu::FirstLine
  # 
  # Gestion de la première ligne
  class FirstLine
    
    # Instance FileDureeJeu de cette première ligne
    # 
    attr_reader :file_duree_jeu
    
    # Première ligne de code
    # 
    @line_code = nil
    
    # Longeur de la première ligne de code
    # 
    @len = nil
    
    # Première ligne de code sous forme de Array
    # 
    @as_array = nil
    
    def initialize iduree_jeu
      @file_duree_jeu = iduree_jeu
    end
    
    # Retourne les données de l'exercice +idex+ dans le fichier de données de durée de jeu
    # 
    def offset_of_exercice iex
      cur_offset  = len
      lex_found   = false
      # On récupère l'index de la donnée dans l'Array de la première ligne pour pouvoir
      # remplacer la donnée plus facilement
      index_ex    = 0
      lex_length  = 0
      as_array.each do |duo|
        id, lenex = duo.split(':')
        if id == iex.id
          lex_length  = lenex.to_i
          lex_found   = true
          break 
        end
        cur_offset += lenex.to_i
        index_ex += 1
      end
      iex.index_in_first_line   = index_ex
      iex.len_init_in_duree_jeu = lex_length
      cur_offset = nil if !lex_found
      iex.offset_in_duree_jeu   = cur_offset
    end
    
    # Modifie la longueur de la donnée de l'exercice +iex+ en la mettant à +new_len+
    # 
    # @param  +iex+       Instance Exercice de l'exercice
    # @param  +new_len+   Nouvelle longueur de la ligne
    # 
    def set_len_exercice iex
      as_array[iex.index_in_first_line] = "#{iex.id}:#{iex.len}"
    end

    # Retourne et définit la longueur de la première ligne de code
    def len
      @len = line_code.length
    end
    
    # Retourne la première ligne de code ou la relève
    def line_code
      @line_code ||= file_duree_jeu.get_line_from 0
    end
    
    # Retourne la première ligne en version string
    # 
    # @note: un retour chariot est ajouté à la fin
    # 
    def to_s
      as_array.inspect + "\n"
    end
    
    # Retourne la première ligne de code sous forme de Array
    def as_array
      @as_array ||= (line_code == "") ? [] : eval(line_code)
    end
  end
end

