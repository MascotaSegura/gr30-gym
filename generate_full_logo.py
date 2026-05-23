import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image, ImageDraw, ImageFont

# Rutas y fuentes
bold_font_path = 'temp_font/static/SpaceGrotesk-Bold.ttf'
font_tt = TTFont(bold_font_path)
upm = font_tt['head'].unitsPerEm
cmap = font_tt.getBestCmap()

# Colores
BRAND_GREEN = '#22c55e'
BRAND_BLACK = '#0f172a'
BRAND_WHITE = '#ffffff'

# Layout (escalado 10x para alta resolución base en SVG, Pillow se encargará de rasterizar esto o lo escalamos)
# UI: Box 40px, Gap 12px, Text 30px, G_Isotipo 24px.
# Multiplicador = 10
SCALE_UI = 10
box_size = 40 * SCALE_UI
gap = 12 * SCALE_UI
text_font_size = 30 * SCALE_UI
isotype_font_size = 24 * SCALE_UI
letter_spacing = -0.05 * text_font_size

def get_glyph_path(char):
    glyph_name = cmap[ord(char)]
    glyph_set = font_tt.getGlyphSet()
    pen = SVGPathPen(glyph_set)
    glyph_set[glyph_name].draw(pen)
    return pen.getCommands()

def get_glyph_advance(char):
    glyph_name = cmap[ord(char)]
    advance, lsb = font_tt['hmtx'][glyph_name]
    return advance

def generate_svg_logo(bg_type, filename):
    # bg_type: 'light' (fondo blanco), 'dark' (fondo oscuro), 'transparent' (fondo transparente, texto oscuro), 'transparent_light' (fondo transparente, texto blanco)
    
    text_gr30_color = BRAND_WHITE if bg_type in ['dark', 'transparent_light'] else BRAND_BLACK
    bg_color = BRAND_BLACK if bg_type == 'dark' else (BRAND_WHITE if bg_type == 'light' else 'none')
    
    # 1. Isotipo (Cuadro y G)
    # Centrado óptico de la G como antes
    g_glyph_name = cmap[ord('G')]
    g_glyf = font_tt['glyf'][g_glyph_name]
    xMin, yMin, xMax, yMax = g_glyf.xMin, g_glyf.yMin, g_glyf.xMax, g_glyf.yMax
    
    iso_scale = isotype_font_size / upm
    ink_center_x = (xMin + xMax) / 2
    ink_center_y = (yMin + yMax) / 2
    iso_tx = (box_size / 2) - (ink_center_x * iso_scale)
    iso_ty = (box_size / 2) + (ink_center_y * iso_scale)
    
    iso_g_path = get_glyph_path('G')
    
    svg_elements = []
    # Background if not transparent
    # We will determine the total width first
    
    text_scale = text_font_size / upm
    
    # Calculate text width
    text_str = "GR30."
    x_cursor = box_size + gap
    char_positions = []
    
    # Centrado vertical CSS de la caja de texto respecto al contenedor
    # En CSS, el text-3xl (30px) centrado en una caja de 40px tiene un margen top de 5px.
    text_box_top = (box_size - text_font_size) / 2
    
    # The ascender of the font relative to the em-box top determines baseline
    # En TTF, baseline is at Y=0. 
    # CSS line-height:1 em-box typically aligns its top with (baseline + sTypoAscender)
    # Let's use the TrueType OS/2 ascender to find the baseline from the top of the em-box.
    os2 = font_tt['OS/2']
    hhea = font_tt['hhea']
    # Use hhea ascent for typical web rendering
    ascent = hhea.ascent
    baseline_y_offset = ascent * text_scale
    
    # So the baseline Y coordinate in SVG space:
    text_baseline_y = text_box_top + baseline_y_offset
    
    for i, char in enumerate(text_str):
        adv = get_glyph_advance(char) * text_scale
        color = BRAND_GREEN if char == '.' else text_gr30_color
        path = get_glyph_path(char)
        
        # SVG transform for this char
        # Y is inverted. scale_y = -text_scale
        # translate_y is the baseline
        transform = f"translate({x_cursor}, {text_baseline_y}) scale({text_scale}, {-text_scale})"
        
        char_positions.append(f'<g transform="{transform}"><path d="{path}" fill="{color}"/></g>')
        
        x_cursor += adv + letter_spacing

    total_width = x_cursor - letter_spacing # remove last spacing
    padding = 20 * SCALE_UI if bg_color != 'none' else 0
    
    # SVG Wrapper
    svg_width = total_width + (padding * 2)
    svg_height = box_size + (padding * 2)
    
    # Viewbox origin adjustment for padding
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}" width="{svg_width}" height="{svg_height}" shape-rendering="crispEdges">\n'
    
    if bg_color != 'none':
        svg += f'  <rect width="{svg_width}" height="{svg_height}" fill="{bg_color}"/>\n'
    
    svg += f'  <g transform="translate({padding}, {padding})">\n'
    
    # Isotype
    svg += f'    <rect width="{box_size}" height="{box_size}" fill="{BRAND_GREEN}"/>\n'
    svg += f'    <g transform="translate({iso_tx}, {iso_ty}) scale({iso_scale}, {-iso_scale})">\n'
    svg += f'      <path d="{iso_g_path}" fill="{BRAND_BLACK}"/>\n'
    svg += f'    </g>\n'
    
    # Text
    for c in char_positions:
        svg += f'    {c}\n'
        
    svg += '  </g>\n</svg>'
    
    with open(filename, 'w') as f:
        f.write(svg)
    print(f"Generado SVG: {filename}")
    return total_width, box_size

def create_png_logo(bg_type, filename, output_height=400):
    text_gr30_color = BRAND_WHITE if bg_type in ['dark', 'transparent_light'] else BRAND_BLACK
    bg_color = BRAND_BLACK if bg_type == 'dark' else (BRAND_WHITE if bg_type == 'light' else (0,0,0,0))
    
    # Determinamos escala según la altura requerida
    # Asumimos padding solo top/bottom de (output_height * 0.2) si tiene fondo
    pad_ratio = 0.2 if bg_type in ['dark', 'light'] else 0
    content_h = output_height / (1 + 2 * pad_ratio)
    pad_px = content_h * pad_ratio
    
    # content_h es equivalente a nuestro box_size de CSS.
    scale = content_h / 40.0
    
    b_size = 40 * scale
    c_gap = 12 * scale
    t_font_size = 30 * scale
    i_font_size = 24 * scale
    l_spacing = -0.05 * t_font_size
    
    # Calcular ancho total del texto usando Pillow
    font_text = ImageFont.truetype(bold_font_path, int(t_font_size))
    
    total_text_width = 0
    text_str = "GR30."
    for char in text_str:
        adv = font_text.getlength(char)
        total_text_width += adv + l_spacing
    total_text_width -= l_spacing # remove trailing
    
    content_w = b_size + c_gap + total_text_width
    img_w = int(content_w + 2 * pad_px)
    img_h = int(output_height)
    
    img = Image.new('RGBA', (img_w, img_h), color=bg_color)
    draw = ImageDraw.Draw(img)
    
    # Dibujar Isotipo
    iso_left = pad_px
    iso_top = pad_px
    draw.rectangle([iso_left, iso_top, iso_left + b_size, iso_top + b_size], fill=BRAND_GREEN)
    
    font_iso = ImageFont.truetype(bold_font_path, int(i_font_size))
    bbox = font_iso.getbbox('G', anchor='ls')
    ink_center_x = (bbox[0] + bbox[2]) / 2
    ink_center_y = (bbox[1] + bbox[3]) / 2
    
    tx = iso_left + (b_size / 2) - ink_center_x
    ty = iso_top + (b_size / 2) - ink_center_y
    draw.text((tx, ty), 'G', font=font_iso, fill=BRAND_BLACK, anchor='ls')
    
    # Dibujar Texto Logotipo
    # Centrado vertical CSS (items-center) -> top de la caja de texto
    text_box_top = iso_top + (b_size - t_font_size) / 2
    
    x_cursor = iso_left + b_size + c_gap
    for char in text_str:
        color = BRAND_GREEN if char == '.' else text_gr30_color
        # En Pillow draw.text con anchor='lt' alinea con el "top" del ascender de la caja.
        # Esto es matemáticamente equivalente al tope de la em-box en la mayoría de fuentes sans-serif modernas,
        # lo cual coincide con la renderización line-height:1 del top del contenedor CSS.
        draw.text((x_cursor, text_box_top), char, font=font_text, fill=color, anchor='lt')
        adv = font_text.getlength(char)
        x_cursor += adv + l_spacing
        
    img.save(filename)
    print(f"Generado PNG: {filename}")
    
    # Generar ICO
    if bg_type in ['transparent', 'transparent_light']:
        ico_filename = filename.replace('.png', '.ico')
        # Resize preserving aspect ratio to fit inside 256x256
        ratio = 256.0 / max(img_w, img_h)
        new_w = int(img_w * ratio)
        new_h = int(img_h * ratio)
        img_ico = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        # Create square canvas for ICO
        ico_square = Image.new('RGBA', (256, 256), (0,0,0,0))
        ico_square.paste(img_ico, ((256 - new_w) // 2, (256 - new_h) // 2))
        ico_square.save(ico_filename, format='ICO', sizes=[(256,256)])
        print(f"Generado ICO: {ico_filename}")

os.makedirs('assets/img/logos', exist_ok=True)

# 1. Generar SVGs
generate_svg_logo('light', 'assets/img/logos/gr30_logo_light.svg')
generate_svg_logo('dark', 'assets/img/logos/gr30_logo_dark.svg')
generate_svg_logo('transparent', 'assets/img/logos/gr30_logo_transparent.svg')
generate_svg_logo('transparent_light', 'assets/img/logos/gr30_logo_transparent_light.svg')

# 2. Generar PNGs en Alta Resolución (Altura = 800px)
create_png_logo('light', 'assets/img/logos/gr30_logo_light_highres.png', 800)
create_png_logo('dark', 'assets/img/logos/gr30_logo_dark_highres.png', 800)
create_png_logo('transparent', 'assets/img/logos/gr30_logo_transparent_highres.png', 800)
create_png_logo('transparent_light', 'assets/img/logos/gr30_logo_transparent_light_highres.png', 800)

print("¡Todos los logos completos han sido generados perfectamente en todos los formatos requeridos!")
