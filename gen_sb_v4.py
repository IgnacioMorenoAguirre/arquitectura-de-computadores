from PIL import Image, ImageDraw, ImageFont
import math

BASE = "datapath_base_PH.png"
OUT = "figuras/slide_sb_PH.png"

base = Image.open(BASE).convert("RGBA")
W, H = base.size  # 844 x 541

GREEN = (0, 140, 0, 255)
RED   = (210, 0, 0, 255)
ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(ov)
LW = 4


def seg(pts, color=GREEN, w=LW):
    for i in range(len(pts) - 1):
        d.line([pts[i], pts[i + 1]], fill=color, width=w)


def tip(p1, p2, color=GREEN, w=LW):
    d.line([p1, p2], fill=color, width=w)
    a = math.atan2(p2[1] - p1[1], p2[0] - p1[0])
    s = 7
    d.polygon([p2,
               (p2[0] - s * math.cos(a - 0.45), p2[1] - s * math.sin(a - 0.45)),
               (p2[0] - s * math.cos(a + 0.45), p2[1] - s * math.sin(a + 0.45))],
              fill=color)


# ════════ CAMINO ACTIVO (verde) — coordenadas verificadas por deteccion de pixeles ════════

# 1. PC -> Instruction memory (fetch)
seg([(64, 286), (88, 286)]); tip((80, 286), (88, 286))

# 2. PC -> Add (PC+4)
seg([(70, 290), (70, 41), (129, 41)]); tip((122, 41), (129, 41))

# 3. PC+4 (siempre activo): Add -> (rodea por arriba el Add de branch) -> Mux(PCSrc, input 0) -> vuelta a PC
seg([(175, 70), (454, 70), (454, 44), (665, 44)]); tip((657, 44), (665, 44))
seg([(696, 70), (704, 70), (704, 2), (22, 2), (22, 287), (37, 287)]); tip((30, 287), (37, 287))

# 4. Bus de instruccion (tronco vertical)
seg([(183, 111), (183, 508)])

# opcode [31-26] -> Control
seg([(183, 191), (300, 191)]); tip((292, 191), (300, 191))
# rs [25-21] -> Read register 1
seg([(183, 280), (334, 280)]); tip((326, 280), (334, 280))
# rt [20-16] -> Read register 2
seg([(183, 314), (338, 314)]); tip((330, 314), (338, 314))
# offset [15-0] -> Sign-extend
seg([(183, 446), (336, 446)]); tip((328, 446), (336, 446))
# funct [5-0] -> ALU control (rodea por debajo del Sign-extend y sube al costado izquierdo del circulo)
seg([(337, 446), (337, 508), (485, 508), (485, 450)]); tip((485, 458), (485, 450))

# 5. Read data 1 ($t0) -> ALU (primer operando)
seg([(465, 296), (533, 296)]); tip((525, 296), (533, 296))

# 6. Read data 2 ($t1) -> MUX ALUSrc input 0 (no seleccionada)
seg([(465, 344), (492, 344)], color=(120, 170, 120, 255), w=3)

# 7. Read data 2 ($t1) -> Data memory Write data  (CAMINO DE STORE, clave)
seg([(465, 344), (465, 440), (640, 440)]); tip((632, 440), (640, 440))

# 8. Sign-extend (offset=0) -> MUX ALUSrc input 1 (SELECCIONADA, ALUSrc=1)
seg([(429, 446), (476, 446), (476, 380), (493, 380)]); tip((485, 380), (493, 380))

# 9. MUX ALUSrc -> ALU segundo operando
seg([(517, 361), (533, 361)]); tip((525, 361), (533, 361))

# 11. ALU result -> Data memory Address
seg([(612, 338), (640, 338)]); tip((633, 338), (640, 338))

# ════════ INACTIVO: no se pinta (write-back, RegDst mux, Data memory read, branch, shift) ════════

# ════════ VALORES EN ROJO ════════
FONT_PATH = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
fr = ImageFont.truetype(FONT_PATH, 16)
frs = ImageFont.truetype(FONT_PATH, 13)
fsig = ImageFont.truetype(FONT_PATH, 11)


def rt_text(xy, txt, font=fr, anchor="lm"):
    d.text(xy, txt, fill=RED, font=font, anchor=anchor)


rt_text((195, 208), "101000", frs)          # opcode sb (binario)
rt_text((198, 255), "$t0 01000", fsig)      # rs = $t0
rt_text((198, 291), "$t1 01001", fsig)      # rt = $t1 (dato a guardar)
rt_text((198, 465), "0000...0", frs)        # inmediato (offset)
rt_text((595, 325), "$t0+0", frs)           # direccion calculada por la ALU
rt_text((605, 428), "$t1", fr)              # dato escrito en memoria
rt_text((442, 198), "00", fsig)             # ALUOp

# señales de control (a la derecha de sus etiquetas, misma fila que el texto azul)
sig_vals = [("X", 139), ("0", 154), ("0", 168), ("X", 183),
            ("00", 198), ("1", 213), ("1", 228), ("0", 242)]
for v, y in sig_vals:
    d.text((445, y), v, fill=RED, font=fsig, anchor="lm")

result = Image.alpha_composite(base, ov).convert("RGB")

# ════════ TITULO + acento ════════
TH = 46
TABL = 96
final = Image.new("RGB", (W, H + TH + TABL), "white")
td = ImageDraw.Draw(final)
td.rectangle([(6, 8), (20, 21)], fill=(183, 28, 28))
td.rectangle([(20, 8), (34, 21)], fill=(30, 136, 229))
td.rectangle([(6, 21), (20, 34)], fill=(255, 193, 7))
td.rectangle([(20, 21), (34, 34)], fill=(67, 160, 71))

ft = ImageFont.truetype(FONT_PATH, 26)
fi = ImageFont.truetype(FONT_PATH, 18)
ftb = ImageFont.truetype(FONT_PATH, 13)
td.text((W // 2, TH // 2), "Datapath instruccion sb", fill=(31, 78, 160), font=ft, anchor="mm")

final.paste(result, (0, TH))

# ════════ TABLA inferior ════════
ty = TH + H
td.text((40, ty + 16), "sb  $t1, 0($t0)", fill=(0, 0, 0), font=fi, anchor="lm")
cols = [40, 290, 450, 600, 800]
r1 = ["opcode  101000", "rs  01000", "rt  01001", "inmediato 0...0"]
r2 = ["31:26", "25-21", "20-16", "15-0"]
top = ty + 32
for ri, row in enumerate([r1, r2]):
    ry = top + ri * 26
    for ci, (x0, x1) in enumerate(zip(cols[:-1], cols[1:])):
        td.rectangle([(x0, ry), (x1, ry + 26)], outline=(0, 0, 0), width=1)
        td.text(((x0 + x1) // 2, ry + 13), row[ci], fill=(0, 0, 0), font=ftb, anchor="mm")

final.save(OUT, "PNG")
print("OK", W, H + TH + TABL)
