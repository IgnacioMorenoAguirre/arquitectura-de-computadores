from PIL import Image, ImageDraw, ImageFont
import math, sys
sys.stdout.reconfigure(encoding='utf-8')

base = Image.open("C:/Users/erenj/OneDrive/Escritorio/arqui/datapath_base_PH.png").convert("RGBA")
W, H = base.size  # 844 x 541

GREEN = (0, 140, 0, 255)     # camino activo (como el compañero)
RED   = (210, 0, 0, 255)     # valores en rojo
ov = Image.new("RGBA",(W,H),(0,0,0,0))
d = ImageDraw.Draw(ov)
LW = 5

def seg(pts, color=GREEN, w=LW):
    for i in range(len(pts)-1):
        d.line([pts[i],pts[i+1]], fill=color, width=w)

def tip(p1, p2, color=GREEN, w=LW):
    d.line([p1,p2], fill=color, width=w)
    a=math.atan2(p2[1]-p1[1], p2[0]-p1[0]); s=8
    d.polygon([p2,(p2[0]-s*math.cos(a-0.45),p2[1]-s*math.sin(a-0.45)),
               (p2[0]-s*math.cos(a+0.45),p2[1]-s*math.sin(a+0.45))], fill=color)

# ════════ CAMINO ACTIVO (verde) ════════

# 1. PC -> Instruction memory (fetch)
seg([(48,148),(70,148)]); tip((60,148),(70,148))

# 2. Bus de instruccion (vertical en x=186) + taps
seg([(186,108),(186,250)])                         # bus vertical
# opcode [31-26] -> Control
seg([(186,108),(286,108)]); tip((276,108),(286,108))
# [25-21] -> Read register 1
seg([(186,134),(322,134),(322,166),(340,166)]); tip((330,166),(340,166))
# [20-16] -> Read register 2
seg([(186,156),(332,156),(332,188),(340,188)]); tip((330,188),(340,188))
# [15-0] -> Sign extend
seg([(186,210),(340,210),(340,242),(356,242)]); tip((348,242),(356,242))
# [5-0] -> ALU control
seg([(186,250),(540,250)]); tip((530,250),(540,250))

# 3. Read data 1 ($t0) -> ALU primer operando
seg([(452,168),(540,167)]); tip((530,167),(540,167))

# 4. Sign extend -> MUX ALUSrc (entrada inferior, ELEGIDA)
seg([(404,242),(480,242),(480,196),(497,196)]); tip((489,196),(497,196))

# 5. MUX ALUSrc -> ALU segundo operando
seg([(515,188),(540,190)]); tip((532,189),(540,190))

# 6. ALU result -> Data memory Address
seg([(625,185),(655,185),(655,168),(688,168)]); tip((680,168),(688,168))

# 7. Read data 2 ($t1) -> Data memory Write data  (CAMINO DE STORE)
seg([(452,190),(468,190),(468,300),(688,300),(688,214)]); tip((688,224),(688,214))

# 8. ALU control -> ALU (ALUOp)
seg([(560,236),(560,212)]); tip((560,220),(560,212))

# 9. PC+4 (siempre activo): lazo superior PC -> Add -> MUX PCSrc -> PC
seg([(33,130),(33,40),(98,40)]); tip((90,40),(98,40))      # PC sube a Add
seg([(162,52),(162,22),(812,22),(812,36)]); tip((812,30),(812,36))  # Add -> MUX PCSrc
seg([(828,40),(828,10),(14,10),(14,130)]); tip((14,122),(14,130))   # MUX -> PC

# ════════ INACTIVO: se deja gris tenue, no se pinta verde ════════
# (write-back, RegDst mux, Data memory read, branch, shift -> sin pintar)

# ════════ VALORES EN ROJO ════════
try:
    fr  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 17)
    frs = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 14)
except:
    fr = frs = ImageFont.load_default()

def rt(xy, txt, font=fr):
    d.text(xy, txt, fill=RED, font=font, anchor="lm")

rt((196,98), "101000", frs)    # opcode sb (binario)
rt((290,158), "$t0  01000", frs)   # rs = $t0 (binario)
rt((290,180), "$t1  01001", frs)   # rt = $t1 (binario, dato a guardar)
rt((290,236), "0000...0", frs)     # inmediato (offset) en binario
rt((596,176), "$t0+0", frs)    # ALU calcula direccion
rt((548,258), "00", frs)       # ALUOp
rt((640,305), "$t1", fr)       # dato escrito en memoria

# valores de las señales de control (a la derecha de sus etiquetas)
try:
    fsig = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 11)
except:
    fsig = frs
sig_vals = [("X",89),("0",98),("0",107),("X",116),("00",125),("1",134),("1",143),("0",151)]
for v,y in sig_vals:
    d.text((382,y), v, fill=RED, font=fsig, anchor="lm")

result = Image.alpha_composite(base, ov).convert("RGB")

# ════════ TÍTULO (texto azul sobre blanco, como el compañero) + acento ════════
TH = 46
TABL = 96
final = Image.new("RGB",(W,H+TH+TABL),"white")
td = ImageDraw.Draw(final)
# acento de colores arriba-izq
td.rectangle([(6,8),(20,21)], fill=(183,28,28))
td.rectangle([(20,8),(34,21)], fill=(30,136,229))
td.rectangle([(6,21),(20,34)], fill=(255,193,7))
td.rectangle([(20,21),(34,34)], fill=(67,160,71))
try:
    ft = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 26)
    fi = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 18)
    ftb= ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13)
except:
    ft=fi=ftb=ImageFont.load_default()
td.text((W//2, TH//2), "Datapath instruccion sb", fill=(31,78,160), font=ft, anchor="mm")

final.paste(result,(0,TH))

# ════════ TABLA inferior (formato del compañero) ════════
ty = TH+H
td.text((40, ty+16), "sb  $t1, 0($t0)", fill=(0,0,0), font=fi, anchor="lm")
# tabla 2 filas: campos / rangos
tx0, twid = 40, 760
cols = [40, 290, 450, 600, 800]
r1 = ["opcode  101000", "rs  01000", "rt  01001", "inmediato 0...0"]
r2 = ["31:26",           "25-21","20-16","15-0"]
top = ty+32
for ri,row in enumerate([r1,r2]):
    ry = top+ri*26
    for ci,(x0,x1) in enumerate(zip(cols[:-1],cols[1:])):
        td.rectangle([(x0,ry),(x1,ry+26)], outline=(0,0,0), width=1)
        td.text(((x0+x1)//2, ry+13), row[ci], fill=(0,0,0), font=ftb, anchor="mm")

path="C:/Users/erenj/OneDrive/Escritorio/arqui/figuras/slide_sb_PH.png"
final.save(path,"PNG")
print("OK", W, H+TH+TABL)
