from PIL import Image, ImageDraw, ImageFont
import os

# ── cargar imagen base ────────────────────────────────────────
base = Image.open("C:/Users/erenj/OneDrive/Escritorio/arqui/datapath_base_PH.png").convert("RGBA")
W, H = base.size   # 844 x 541

# ── colores ───────────────────────────────────────────────────
BLUE   = (21,  101, 192, 220)   # camino activo (datos)
RED    = (183,  28,  28, 220)   # dato que se escribe en memoria
ORANGE = (230, 120,   0, 210)   # señales de control activas
GRAY   = (180, 180, 180, 140)   # camino inactivo (encima para opacar)
WHITE  = (255, 255, 255, 255)

LW = 5    # grosor líneas activas
LWI= 3    # grosor líneas inactivas

overlay = Image.new("RGBA", base.size, (0,0,0,0))
d = ImageDraw.Draw(overlay)

# ════════════════════════════════════════════════════════════
#  RUTAS ACTIVAS DE sb $t1, 0($t0)
#
#  Coordenadas mapeadas sobre la imagen 844×541:
#  (ajustadas a mano mirando el diagrama P&H)
# ════════════════════════════════════════════════════════════

def line(d, pts, color, w):
    for i in range(len(pts)-1):
        d.line([pts[i], pts[i+1]], fill=color, width=w)

def arrow(d, x1, y1, x2, y2, color, w=LW):
    d.line([(x1,y1),(x2,y2)], fill=color, width=w)
    # punta
    import math
    angle = math.atan2(y2-y1, x2-x1)
    size = 10
    d.polygon([
        (x2, y2),
        (int(x2 - size*math.cos(angle-0.4)), int(y2 - size*math.sin(angle-0.4))),
        (int(x2 - size*math.cos(angle+0.4)), int(y2 - size*math.sin(angle+0.4))),
    ], fill=color)

# ── 1. PC → Instruction Memory (fetch) ───────────────────────
line(d, [(42,300),(42,360),(100,360)], BLUE, LW)
arrow(d, 100,360,118,360, BLUE)

# ── 2. Instruction Memory → Control (opcode 31:26) ───────────
line(d, [(118,290),(148,290),(148,215),(230,215)], BLUE, LW)
arrow(d, 230,215,250,215, BLUE)

# ── 3. Instruction Memory → Read register 1 (rs 25:21) ───────
line(d, [(118,310),(200,310),(200,332),(285,332)], BLUE, LW)
arrow(d, 285,332,300,332, BLUE)

# ── 4. Instruction Memory → Read register 2 (rt 20:16) ───────
line(d, [(118,325),(195,325),(195,355),(285,355)], BLUE, LW)
arrow(d, 285,355,300,355, BLUE)

# ── 5. Instruction Memory → Sign-extend (15:0) ───────────────
line(d, [(118,390),(160,390),(160,440),(245,440)], BLUE, LW)
arrow(d, 245,440,260,440, BLUE)

# ── 6. Registers Read data 1 ($t0) → ALU ─────────────────────
line(d, [(430,332),(480,332),(480,355)], BLUE, LW)
arrow(d, 480,355,490,365, BLUE)

# ── 7. Sign-extend → MUX ALUSrc (entrada 1 = se elige) ───────
line(d, [(320,440),(490,440),(490,410)], BLUE, LW)
arrow(d, 490,410,500,400, BLUE)

# ── 8. MUX ALUSrc → ALU (segundo operando = offset extendido) ─
line(d, [(530,385),(540,385),(540,375)], BLUE, LW)
arrow(d, 540,375,550,370, BLUE)

# ── 9. ALU → Data Memory (dirección) ─────────────────────────
line(d, [(625,355),(670,355),(670,330),(690,330)], BLUE, LW+1)
arrow(d, 690,330,705,330, BLUE)

# ── 10. Registers Read data 2 ($t1) → Data Memory (write data)
#        camino en ROJO (dato que se escribe)
line(d, [(430,355),(460,355),(460,460),(690,460),(690,380)], RED, LW)
arrow(d, 690,380,705,380, RED)

# ── 11. Control → MemWrite = 1 (naranja) ──────────────────────
line(d, [(310,245),(680,245),(680,295)], ORANGE, 3)
arrow(d, 680,295,710,310, ORANGE)

# ── 12. Control → ALUSrc = 1 (naranja) ───────────────────────
line(d, [(310,250),(505,250),(505,360)], ORANGE, 3)
arrow(d, 505,360,512,370, ORANGE)

# ── INACTIVOS: write-back y branch ───────────────────────────
# Data Memory → MUX MemtoReg (opacado gris)
line(d, [(760,340),(790,340),(790,295),(820,295)], GRAY, LWI)
# MUX MemtoReg → Registers write-back
line(d, [(840,295),(840,270),(395,270),(395,375)], GRAY, LWI)
# Branch path
line(d, [(625,310),(650,310),(650,140),(430,140),(430,165)], GRAY, LWI)

# ── labels sobre el diagrama ──────────────────────────────────
try:
    font_sm  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
    font_med = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14)
except:
    font_sm  = ImageFont.load_default()
    font_med = font_sm

# señales activas
d.text((300,192), "ALUSrc=1", fill=(230,120,0,255), font=font_med)
d.text((300,207), "MemWrite=1", fill=(230,120,0,255), font=font_med)
# señales inactivas
d.text((300,225), "RegWrite=0  |  MemRead=0  |  Branch=0", fill=(150,150,150,220), font=font_sm)

# etiqueta dato escrito
d.text((520,468), "$t1 → memoria (MemWrite=1)", fill=RED[:3]+(230,), font=font_med)

# componer sobre la base
result = Image.alpha_composite(base, overlay).convert("RGB")

# ════════════════════════════════════════════════════════════
#  AÑADIR TÍTULO Y TABLA (misma estructura que slide beq)
# ════════════════════════════════════════════════════════════
TITLE_H = 60
TABLE_H = 110
out_W = W
out_H = H + TITLE_H + TABLE_H
final = Image.new("RGB", (out_W, out_H), (255,255,255))

# barra de título azul
td = ImageDraw.Draw(final)
td.rectangle([(0,0),(out_W, TITLE_H)], fill=(13,71,161))
# acento de colores (igual que los compañeros)
td.rectangle([(0,0),(38,30)], fill=(183,28,28))
td.rectangle([(0,30),(38,TITLE_H)], fill=(30,136,229))

# título
try:
    font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 28)
except:
    font_title = ImageFont.load_default()
td.text((out_W//2, TITLE_H//2), "Datapath instruccion sb",
        fill=(255,255,255), font=font_title, anchor="mm")

# pegar el diagrama
final.paste(result, (0, TITLE_H))

# ── tabla de instrucción ──────────────────────────────────────
ty = TITLE_H + H
td.rectangle([(0, ty),(out_W, ty+TABLE_H)], fill=(232,234,246))

# instrucción centrada
try:
    font_instr = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 20)
    font_tbl   = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13)
    font_tbl2  = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 13)
except:
    font_instr = font_tbl = font_tbl2 = ImageFont.load_default()

td.text((out_W//2, ty+16), "sb  $t1,  0($t0)", fill=(13,71,161),
        font=font_instr, anchor="mm")

# tabla de campos
cols = [0, 170, 340, 510, 672, 844]
heads = ["Campo", "opcode (31:26)", "rs (25:21)", "rt (20:16)", "offset (15:0)"]
vals  = ["Valor", "101000",         "$t0",         "$t1",        "000...0 (16 bits)"]
bits  = ["Bits",  "6",              "5",            "5",          "16"]

for ri, (row, font_r, bg) in enumerate([
    (heads, font_tbl,  (57,73,171)),
    (vals,  font_tbl,  (243,244,255)),
    (bits,  font_tbl2, (255,255,255)),
]):
    row_y = ty + 32 + ri*22
    fc = (255,255,255) if ri==0 else (13,71,161)
    for ci,(x0,x1) in enumerate(zip(cols[:-1],cols[1:])):
        td.rectangle([(x0,row_y),(x1-1,row_y+20)], fill=bg, outline=(57,73,171))
        td.text(((x0+x1)//2, row_y+10), row[ci], fill=fc, font=font_r, anchor="mm")

# nota señales
td.text((out_W//2, ty+TABLE_H-10),
        "Activas: ALUSrc=1 · MemWrite=1     |     Inactivas: RegWrite=0 · MemRead=0 · Branch=0",
        fill=(80,80,80), font=font_tbl2, anchor="mm")

out_path = "C:/Users/erenj/OneDrive/Escritorio/arqui/figuras/slide_sb_PH.png"
final.save(out_path, "PNG")
print(f"OK → {out_path}  ({out_W}x{out_H})")
