import os
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import requests
from fontTools.ttLib import TTFont
import fontTools.varLib.mutator
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image, ImageDraw, ImageFont

# 1. Download and Instantiate Font
url = 'https://raw.githubusercontent.com/google/fonts/main/ofl/spacegrotesk/SpaceGrotesk%5Bwght%5D.ttf'
os.makedirs('temp_font/static', exist_ok=True)
var_font_path = 'temp_font/static/SpaceGrotesk-Var.ttf'
bold_font_path = 'temp_font/static/SpaceGrotesk-Bold.ttf'

if not os.path.exists(bold_font_path):
    response = requests.get(url)
    with open(var_font_path, 'wb') as f:
        f.write(response.content)
    var_font = TTFont(var_font_path)
    static_bold = fontTools.varLib.mutator.instantiateVariableFont(var_font, {"wght": 700})
    static_bold.save(bold_font_path)

font_tt = TTFont(bold_font_path)
upm = font_tt['head'].unitsPerEm
cmap = font_tt.getBestCmap()
glyph_name = cmap[ord('G')]
glyph_set = font_tt.getGlyphSet()
g = font_tt['glyf'][glyph_name]

# Bounding box del glifo G en UPM
xMin, yMin, xMax, yMax = g.xMin, g.yMin, g.xMax, g.yMax

def create_svg():
    # Extraer path
    pen = SVGPathPen(glyph_set)
    glyph_set[glyph_name].draw(pen)
    path_data = pen.getCommands()
    
    # SVG ViewBox
    size = 1000
    # Queremos que la fuente (em-box) sea el 60% del tamaño total.
    # font_size = size * 0.6 => 600
    # UPM = 1000. Scale = 600 / 1000 = 0.6
    scale = 0.6
    
    # Centrado óptico exacto del bounding box de la tinta:
    ink_center_x = (xMin + xMax) / 2
    ink_center_y = (yMin + yMax) / 2
    
    # Transformaciones SVG:
    # y es invertido en SVG respecto a TTF. scale_y = -scale
    # t_x + ink_center_x * scale = size / 2
    t_x = (size / 2) - (ink_center_x * scale)
    # t_y + ink_center_y * (-scale) = size / 2
    t_y = (size / 2) + (ink_center_y * scale)
    
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" shape-rendering="crispEdges">
  <rect width="{size}" height="{size}" fill="#22c55e"/>
  <g transform="translate({t_x}, {t_y}) scale({scale}, {-scale})">
    <path d="{path_data}" fill="#0f172a"/>
  </g>
</svg>"""
    with open('assets/img/favicon.svg', 'w') as f:
        f.write(svg)
    print("SVG generado: assets/img/favicon.svg")

def create_png(size, output_path):
    img = Image.new('RGB', (size, size), color='#22c55e')
    draw = ImageDraw.Draw(img)
    
    font_size = size * 0.6
    font = ImageFont.truetype(bold_font_path, int(font_size))
    
    # Centrado óptico de la tinta usando Pillow
    # getbbox con anchor 'ls' (Left, Baseline)
    bbox = font.getbbox('G', anchor='ls')
    left, top, right, bottom = bbox
    
    ink_center_x = (left + right) / 2
    ink_center_y = (top + bottom) / 2
    
    tx = (size / 2) - ink_center_x
    ty = (size / 2) - ink_center_y
    
    draw.text((tx, ty), 'G', font=font, fill='#0f172a', anchor='ls')
    img.save(output_path)
    print(f"PNG generado: {output_path}")

os.makedirs('assets/img', exist_ok=True)
create_svg()
create_png(512, 'assets/img/favicon-512.png')
create_png(180, 'assets/img/apple-touch-icon.png')
create_png(32, 'assets/img/favicon-32.png')
create_png(16, 'assets/img/favicon-16.png')

img_16 = Image.open('assets/img/favicon-16.png')
img_32 = Image.open('assets/img/favicon-32.png')
img_16.save('assets/img/favicon.ico', format='ICO', sizes=[(16,16), (32,32)], append_images=[img_32])
print("ICO generado: assets/img/favicon.ico")

print("Todos los favicons han sido generados con centrado óptico perfecto.")
