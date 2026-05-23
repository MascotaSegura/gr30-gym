import os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from PIL import Image, ImageDraw, ImageFont
import uharfbuzz as hb

bold_font_path = 'temp_font/static/SpaceGrotesk-Bold.ttf'
font_tt = TTFont(bold_font_path)
upm = font_tt['head'].unitsPerEm
cmap = font_tt.getBestCmap()

BRAND_GREEN = '#22c55e'
BRAND_BLACK = '#0f172a'
BRAND_WHITE = '#ffffff'

SCALE_UI = 20
box_size = 40 * SCALE_UI
gap = 12 * SCALE_UI
text_font_size = 30 * SCALE_UI
isotype_font_size = 24 * SCALE_UI
letter_spacing = -0.05 * text_font_size

text_line_height = 36 * SCALE_UI
hhea = font_tt['hhea']
ascent = hhea.ascent
descent = abs(hhea.descent)
text_scale = text_font_size / upm

half_leading = (text_line_height - (ascent + descent) * text_scale) / 2
baseline_from_line_box_top = ascent * text_scale + half_leading
line_box_top = (box_size - text_line_height) / 2
text_baseline_y = line_box_top + baseline_from_line_box_top

def get_glyph_path(glyph_name):
    glyph_set = font_tt.getGlyphSet()
    pen = SVGPathPen(glyph_set)
    glyph_set[glyph_name].draw(pen)
    return pen.getCommands()

def shape_text(text):
    blob = hb.Blob.from_file_path(bold_font_path)
    face = hb.Face(blob)
    font = hb.Font(face)
    font.scale = (upm, upm)
    
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf)
    
    return buf.glyph_infos, buf.glyph_positions

def generate_logo(bg_type, filename, output_height=800):
    text_gr30_color = BRAND_WHITE if bg_type in ['dark', 'transparent_light'] else BRAND_BLACK
    bg_color = BRAND_BLACK if bg_type == 'dark' else (BRAND_WHITE if bg_type == 'light' else 'none')
    
    iso_g_glyph_name = cmap[ord('G')]
    iso_g_glyf = font_tt['glyf'][iso_g_glyph_name]
    xMin, yMin, xMax, yMax = iso_g_glyf.xMin, iso_g_glyf.yMin, iso_g_glyf.xMax, iso_g_glyf.yMax
    
    iso_scale = isotype_font_size / upm
    ink_center_x = (xMin + xMax) / 2
    ink_center_y = (yMin + yMax) / 2
    iso_tx = (box_size / 2) - (ink_center_x * iso_scale)
    iso_ty = (box_size / 2) + (ink_center_y * iso_scale)
    
    iso_g_path = get_glyph_path(iso_g_glyph_name)
    
    text_str = "GR30."
    infos, positions = shape_text(text_str)
    
    x_cursor = box_size + gap
    char_svgs = []
    draw_calls = []
    
    for info, pos, char in zip(infos, positions, text_str):
        glyph_name = font_tt.getGlyphName(info.codepoint)
        x_advance = pos.x_advance * text_scale
        x_offset = pos.x_offset * text_scale
        y_offset = pos.y_offset * text_scale
        
        color = BRAND_GREEN if char == '.' else text_gr30_color
        path = get_glyph_path(glyph_name)
        
        tx = x_cursor + x_offset
        ty = text_baseline_y - y_offset
        
        transform = f"translate({tx}, {ty}) scale({text_scale}, {-text_scale})"
        char_svgs.append(f'<g transform="{transform}"><path d="{path}" fill="{color}"/></g>')
        draw_calls.append((char, tx, ty, color))
        
        x_cursor += x_advance + letter_spacing

    total_width = x_cursor - letter_spacing
    padding = int(box_size * 0.5) if bg_color != 'none' else 0
    
    svg_width = total_width + (padding * 2)
    svg_height = box_size + (padding * 2)
    
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg_width} {svg_height}" width="100%" height="100%" shape-rendering="crispEdges">\n'
    if bg_color != 'none':
        svg += f'  <rect width="{svg_width}" height="{svg_height}" fill="{bg_color}"/>\n'
    
    svg += f'  <g transform="translate({padding}, {padding})">\n'
    svg += f'    <rect width="{box_size}" height="{box_size}" fill="{BRAND_GREEN}"/>\n'
    svg += f'    <g transform="translate({iso_tx}, {iso_ty}) scale({iso_scale}, {-iso_scale})">\n'
    svg += f'      <path d="{iso_g_path}" fill="{BRAND_BLACK}"/>\n'
    svg += f'    </g>\n'
    for c in char_svgs:
        svg += f'    {c}\n'
    svg += '  </g>\n</svg>'
    
    with open(filename, 'w') as f:
        f.write(svg)
        
    png_filename = filename.replace('.svg', '.png')
    png_scale = output_height / svg_height
    png_w = int(svg_width * png_scale)
    png_h = int(output_height)
    
    png_bg = bg_color if bg_color != 'none' else (0,0,0,0)
    img = Image.new('RGBA', (png_w, png_h), color=png_bg)
    draw = ImageDraw.Draw(img)
    
    def sc(val): return val * png_scale
    
    iso_left = padding * png_scale
    iso_top = padding * png_scale
    draw.rectangle([iso_left, iso_top, iso_left + sc(box_size), iso_top + sc(box_size)], fill=BRAND_GREEN)
    
    font_iso = ImageFont.truetype(bold_font_path, int(sc(isotype_font_size)))
    font_text = ImageFont.truetype(bold_font_path, int(sc(text_font_size)))
    
    bbox = font_iso.getbbox('G', anchor='ls')
    ink_center_x_px = (bbox[0] + bbox[2]) / 2
    ink_center_y_px = (bbox[1] + bbox[3]) / 2
    
    iso_tx_png = iso_left + sc(box_size / 2) - ink_center_x_px
    iso_ty_png = iso_top + sc(box_size / 2) - ink_center_y_px
    draw.text((iso_tx_png, iso_ty_png), 'G', font=font_iso, fill=BRAND_BLACK, anchor='ls')
    
    for char, tx, ty, color in draw_calls:
        draw.text((iso_left + sc(tx), iso_top + sc(ty)), char, font=font_text, fill=color, anchor='ls')
        
    img.save(png_filename)
    
    if bg_type in ['transparent', 'transparent_light']:
        ico_filename = filename.replace('.svg', '.ico')
        ratio = 256.0 / max(png_w, png_h)
        new_w = int(png_w * ratio)
        new_h = int(png_h * ratio)
        img_ico = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        ico_square = Image.new('RGBA', (256, 256), (0,0,0,0))
        ico_square.paste(img_ico, ((256 - new_w) // 2, (256 - new_h) // 2))
        ico_square.save(ico_filename, format='ICO', sizes=[(256,256)])

os.makedirs('assets/img/logos', exist_ok=True)
generate_logo('light', 'assets/img/logos/gr30_logo_light.svg')
generate_logo('dark', 'assets/img/logos/gr30_logo_dark.svg')
generate_logo('transparent', 'assets/img/logos/gr30_logo_transparent.svg')
generate_logo('transparent_light', 'assets/img/logos/gr30_logo_transparent_light.svg')
print("¡Logos generados con HarfBuzz kerning y alineación baseline exacta!")
