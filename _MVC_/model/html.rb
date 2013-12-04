# coding: UTF-8

=begin

  Class Html
  
  Permet de gérer tout le code HTML de la page

=end
# DEBUG_ON = true

require 'cgi'

class Html

  # Path des librairies générales (JS, Css, Img, etc.)
  PATH_LIB_GENE     = File.join(APP_FOLDER, "xlib")
  PATH_LIB_JS_GENE  = File.join(PATH_LIB_GENE, "javascript")

  # -------------------------------------------------------------------
  #   PROPRE À L'APPLICATION
  # -------------------------------------------------------------------
  URL         = 'www.music-roadmap.net'
  URL_OFFLINE = "localhost/~philippeperret/ruby/music_roadmap"
  # JQuery's files
  JQUERIES = [
    File.join(PATH_LIB_JS_GENE, 'required', 'jquery.js'),
    File.join(PATH_LIB_JS_GENE, 'required', 'jquery-ui.js')
    ]
  # Liste des librairies Javascript utiles à l'application courante
  JS_LIBRARIES = [
    "#{PATH_LIB_JS_GENE}/optional/backtrace.js",
    "#{PATH_LIB_JS_GENE}/optional/ajax.js",
    "#{PATH_LIB_JS_GENE}/optional/flash.js",
    "#{PATH_LIB_JS_GENE}/optional/utils.js",
    "#{PATH_LIB_JS_GENE}/optional/ui.js",
    "#{PATH_LIB_JS_GENE}/optional/String-extensions.js",
    "#{PATH_LIB_JS_GENE}/optional/Time.js",
    "#{PATH_LIB_JS_GENE}/optional/cookie.js",
    "#{PATH_LIB_JS_GENE}/optional/DArray.js"
    ]
  
  
  # Liste des fichiers javascript à insérer dans la page
  # Utiliser la méthode add_javascript en lui envoyant en paramètre le chemin
  # relatif du script *à partir de la base* (donc pas à partir du dossier
  # javascript car le script peut se trouver ailleurs)
  @@javascripts = []
  @@css = []
  
  FOLDER_VIEWS        = File.join(APP_FOLDER,   '_MVC_', 'view')
  FOLDER_CSS          = File.join(FOLDER_VIEWS, 'css')
  FOLDER_JAVASCRIPTS  = File.join(APP_FOLDER,   'javascript')
  
  class << self
    def out
      cgi = CGI::new 'html4'
      cgi.out( 'cookie' => cgi.cookies ) {
        cgi.html {
          cgi.head {
            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=UTF-8\"/>" +
            cgi.title { "Feuille de Route Musicale" } +
            flavicon            +    
            tags_css            +
            tags_javascript
          } +
          cgi.body { body }
        }
      }
    end

    # =>  Retourne l'identifiant de la langue (deux lettres)
    # 
    # @note: pour le moment, on définit la langue dans l'url grâce à 
    # `lang=<xx>' sinon on est en français
    # @note: cette langue définit notamment les fichiers locales JS
    def lang
      param(:lang) || 'fr'
    end
    
 		# =>	Return le lien pour le flavicon ou définit l'image à utiliser
		def flavicon
			url_icon = File.join("#{Html::URL}/_MVC_/view/img/metronome/flav.ico")
			'<link rel="shortcut icon" type="image/ico" href="http://'+ url_icon +'" />'
		end
   
    # BODY
    # ----
    # Méthode principale retournant le body a insérer dans la page
    # @FIXME: Pour le moment, on construit la page ici, mais on dispatchera
    # ensuite sa construction complète.
    def body
      launch_watchers         +
      header                  +
      top_margin              +
      left_margin             +
      section_donation        +
      section_config_generale +
      section_roadmap         +
      div_flash               +
      footer
      # '<div><a href="aide.html">AIDE (non opérationnel)</a></div>' # +
      #       "<p>ma page HTML</p>" +
      #       "<a href=''>Un lien car les tests testent la présence d'un lien</a>" +
      #       "<button id=\"bouton_test_ajax\" onclick=\"test_ajax()\">Test ajax</button>" +
      #       "<button id=\"bouton_pourvoir\" onclick=\"Pourvoir()\">Pour voir</button>" +
      #       "<button id=\"bouton_create\" onclick=\"Creer_div()\">Créer un div dans la page</button>"
    end
    
    # Return header of the HTML page
    def header
      '<!-- Pour gérer une image de fond --><div id="background"></div>'
    end
    # Return footer of the HTML page
    def footer
      ""
    end
    # => Retourne l'adresse du gabarit
    def folder_gabarit
      @folder_gabarit ||= File.join(FOLDER_VIEWS, 'gabarit')
    end
    
    def path_image relpath
      "./_MVC_/view/img/#{relpath}"
    end
    
    # Transforme un path réel (donc provenant d'une hiérarchie physique) en
    # path interprétable dans le code HTML, principalement pour :
    #   - les feuilles de script JS
    #   - les feuilles de styles CSS
    #   - les images
    def real_path_to_html path
      # 'http://' + path.sub(/#{Regexp.escape(real_path_racine)}/, html_path_racine)
      html_path = 'http://' + path.sub(/#{Regexp.escape(real_path_racine)}/, html_path_racine)
      dbg("html_path de #{path} : #{html_path}")
      html_path
    end
    def real_path_racine
      @real_path_racine ||= begin
        realpath = []
        File.expand_path( "." ).split('/').each do |dossier|
          realpath << dossier
          # @FIXME: Il faudra être beaucoup plus spécifique ci-dessous pour
          # définir que 'wwww' est recherché online et 'cgi-bin' recherché
          # offline
          # break if dossier == 'www' || dossier == 'cgi-bin'
          break if dossier == 'music_roadmap'
        end
        dbg("real_path_racine: #{realpath.join('/')}")
        realpath.join('/')
      end
    end
    def html_path_racine
      @html_path_racine ||= begin
        Params.online? ? Html::URL : Html::URL_OFFLINE
      end
    end
    
    # =>  Retourne le code, pour le haut du body de la page, indiquant l'état
    #     du chargement de l'application.
    #     @note: C'est dans xinit.js que les variables sont modifiées, en fin
    #     de chargement
    def launch_watchers
      '<script type="text/javascript">' +
        "LANG = '#{lang}';"       +
        "OFFLINE = #{Params.offline?};"  +
        "ONLINE  = #{Params.online?};"   +
      '</script>'
    end
    
    
    # JAVASCRIPTS
    # ------------
    # Retourne le code pour tous les scripts javascript à utiliser
    # Les scripts utilisés sont ceux du dossier js/required et ceux ajoutés
    # à la liste @@javascripts grâce à la méthode Html.add_javascript
    def tags_javascript
      # Les scripts de la librairie générale required
      # libcgi = File.expand_path "../lib/javascript/required"
      libcgi = "#{PATH_LIB_JS_GENE}/required"
      liste = JQUERIES + JS_LIBRARIES
      if Params::offline?
        liste += Dir["#{FOLDER_JAVASCRIPTS}/admin/**/*.js"]
      end
      tags = liste.collect do |js|
        # STDOUT.write "- js: #{js}\n  path: #{real_path_to_html(js)}\n"
        js = File.expand_path js
        "<script type=\"text/javascript\" src=\"#{real_path_to_html(js)}\"></script>"
      end.to_s
      # Les locales (il faut leur mettre un id)
      locales = Dir["#{FOLDER_JAVASCRIPTS}/locale/#{lang}/**/*.js"].collect do |js|
        affixe = File.basename(js, File.extname(js) )
        "<script id=\"locale-#{affixe}\" class=\"locale\" type=\"text/javascript\" src=\"#{real_path_to_html(js)}\"></script>"
      end.to_s
      # Les javascripts propres à cette application
      liste = 
        Dir["#{FOLDER_JAVASCRIPTS}/required/**/*.js"] +
        @@javascripts
      jss = tags + locales + liste.collect do |js|
        js = js.sub(/#{APP_FOLDER}\//,'')
        "<script type=\"text/javascript\" src=\"#{js}\"></script>"
      end.to_s
      jss
    end
    
    # CSS
    # ---
    # Retourne le code pour toutes les feuilles de styles à utiliser
    def tags_css
      liste = Dir["#{FOLDER_CSS}/required/**/*.css"] + @@css
      liste += Dir["#{FOLDER_CSS}/admin/**/*.css"] if Params::offline?
      liste.collect do |css|
        css = css.sub(/#{APP_FOLDER}\//,'')
        "<link rel=\"stylesheet\" type=\"text/css\" href=\"#{css}\" />"
      end.to_s
    end
    
    # => Retourne le code HTML de la vue
    # 
    # @param  relpath   Chemin relatif depuis le dossier mvc view
    #                   Avec ou non l'extension. En fonction de l'extension
    #                   le code sera traité.
    # 
    # @note : la vue peut être de type HTML ou ruby.
    # 
    # @return   Le code de la vue ou produit par la vue.
    def load_view relpath
      path = File.join( FOLDER_VIEWS, relpath )
      if relpath.end_with?( '.html' ) || relpath.end_with?( '.htm' )
        File.read( path )
      elsif relpath.end_with? '.rb'
        eval File.read path
      else
        if File.exists?( "#{path}.rb" )
          load_view "#{relpath}.rb"
        elsif File.exists?( "#{path}.html") || File.exists?("#{path}.htm")
          load_view "#{relpath}.html"
        end
      end
    end
    
    # FLASH
    # -----
    # Retourne le code HTML pour gérer les messages flash du programme à
    # l'utilisateur.
    def div_flash
      '<div id="flash"></div>'
    end
    
    # -------------------------------------------------------------------
    #   PROPRE À L'APPLICATION COURANTE
    # -------------------------------------------------------------------
    
    # BANDE LOGO
    # ----------
    # Retourne le code HTML de la bande de logo du site
    def top_margin
      load_view("gabarit/logo")
    end
    
    # Retourne le code HTML pour les éléments de la marge gauche
    def left_margin
      load_view('gabarit/left_margin')
    end
    
    def section_donation
      File.read(File.join(folder_gabarit,'section_donation.html'))      
    end
    def section_config_generale
      File.read(File.join(folder_gabarit,'config_generale_exercice.html'))
    end
    def section_roadmap
      '<section id="roadmap" onmousedown="UI.set_premier_plan(this)" style="">' +
      section_specs + 
      section_exercices +
      '</section>'
    end
    def section_specs
      '<div id="roadmap_specs" onmousedown="UI.set_premier_plan(this)" style="">' +
      load_view( 'gabarit/roadmap_specs' ) + 
      '</div>'
    end
    
    # SECTION EXERCICES
    # ------------------------
    def section_exercices
      load_view('gabarit/section_exercices.rb')
    end
    
  end # class << self
end