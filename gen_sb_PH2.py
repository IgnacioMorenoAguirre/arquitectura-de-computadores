from PIL import Image, ImageDraw, ImageFont
import math, sys
sys.stdout.reconfigure(encoding='utf-8')

base = Image.open("C:/Users/erenj/OneDrive/Escritorio/arqui/datapath_base_PH.png").convert("RGBA")
W, H = base.size  # 844 x 541

BLUE   = (21, 101, 192, 200)
RED    = (183, 28,  28, 210)
ORANGE = (230, 100,  0, 230)
GRAY   = (160, 160, 160, 160)

def seg(d, pts, color, w):
    for i in range(len(pts)-1):
        d.line([pts[i], pts[i+1]], fill=color, width=w)

def tip(d, x1,y1, x2,y2, color, w=5):
    d.line([(x1,y1),(x2,y2)], fill=color, width=w)
    a = math.atan2(y2-y1, x2-x1)
    s = 9
    d.polygon([(x2,y2),
               (int(x2-s*math.cos(a-0.4)),int(y2-s*math.sin(a-0.4))),
               (int(x2-s*math.cos(a+0.4)),int(y2-s*math.sin(a+0.4)))],
              fill=color)

ov = Image.new("RGBA", (W,H), (0,0,0,0))
d  = ImageDraw.Draw(ov)
LW = 5

# 1. PC to Instruction Memory
seg(d, [(23,351),(71,351)], BLUE, LW)
tip(d, 60,351, 71,351, BLUE)

# 2. Instruction Memory to Control [31:26]
seg(d, [(186,279),(186,192),(232,192)], BLUE, LW)
tip(d, 220,192, 232,192, BLUE)

# 3. Instruction [25:21] to Registers Read register 1
seg(d, [(186,296),(232,296),(232,325),(344,325)], BLUE, LW)
tip(d, 334,325, 344,325, BLUE)

# 4. Instruction [20:16] to Registers Read register 2
seg(d, [(186,315),(228,315),(228,352),(344,352)], BLUE, LW)
tip(d, 334,352, 344,352, BLUE)

# 5. Instruction [15:0] to Sign-extend
seg(d, [(186,389),(186,440),(232,440)], BLUE, LW)
tip(d, 222,440, 232,440, BLUE)

# 6. Sign-extend to MUX ALUSrc bottom input (ALUSrc=1 selects this)
seg(d, [(344,440),(484,440),(484,405)], BLUE, LW)
tip(d, 484,415, 484,405, BLUE)

# 7. Registers Read data 1 ($t0) to ALU top input
seg(d, [(451,325),(501,325),(501,345)], BLUE, LW)
tip(d, 501,335, 501,345, BLUE)

# 8. MUX ALUSrc output to ALU second input
seg(d, [(501,390),(546,390)], BLUE, LW)
tip(d, 536,390, 546,390, BLUE)

# 9. ALU result to Data Memory Address
seg(d, [(621,355),(748,355),(748,330)], BLUE, LW+1)
tip(d, 748,340, 748,330, BLUE)

# 10. Registers Read data 2 ($t1) to Data Memory Write data (RED)
seg(d, [(451,352),(460,352),(460,508),(748,508),(748,405)], RED, LW)
tip(d, 748,415, 748,405, RED)

# 11. Control to MemWrite signal (ORANGE)
seg(d, [(344,224),(795,224),(795,310)], ORANGE, 3)
tip(d, 795,300, 795,310, ORANGE)

# 12. Control to ALUSrc=1 (ORANGE)
seg(d, [(344,232),(474,232),(474,370),(484,370)], ORANGE, 3)
tip(d, 477,370, 484,370, ORANGE)

# Inactive: write-back path (gray dashed)
seg(d, [(795,345),(795,296),(412,296),(412,355)], GRAY, 3)

try:
    fb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13)
    fn = ImageFont.truetype("C:/Windows/Fonts/arial.ttf",   12)
except:
    fb = fn = ImageFont.load_default()

d.text((248,148), "ALUSrc=1", fill=(210,90,0,255), font=fb)
d.text((248,163), "MemWrite=1", fill=(210,90,0,255), font=fb)
d.text((248,178), "RegWrite=0  Branch=0  MemRead=0", fill=(130,130,130,220), font=fn)
d.text((530,515), "$t1 -> Write data (MemWrite=1)", fill=RED[:3]+(240,), font=fb)

out = Image.alpha_composite(base, ov).convert("RGB")

TH, TABL = 58, 108
final = Image.new("RGB", (W, H+TH+TABL), "white")
td = ImageDraw.Draw(final)

td.rectangle([(0,0),(W,TH)], fill=(13,71,161))
td.rectangle([(0,0),(36,29)],  fill=(183,28,28))
td.rectangle([(0,29),(36,TH)], fill=(30,136,229))

try:
    ft  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 27)
    fi  = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 19)
    ftb = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 13)
    ftn = ImageFont.truetype("C:/Windows/Fonts/arial.ttf",   13)
except:
    ft = fi = ftb = ftn = ImageFont.load_default()

td.text((W//2, TH//2), "Datapath instruccion sb",
        fill="white", font=ft, anchor="mm")

final.paste(out, (0, TH))

ty = TH+H
td.rectangle([(0,ty),(W,ty+TABL)], fill=(232,234,246))
td.text((W//2, ty+14), "sb  $t1,  0($t0)", fill=(13,71,161), font=fi, anchor="mm")

cols  = [0, 168, 337, 506, 672, 844]
heads = ["Campo",  "opcode (31:26)", "rs (25:21)", "rt (20:16)", "offset (15:0)"]
vals  = ["Valor",  "101000",          "$t0",         "$t1",        "0000000000000000"]
bits  = ["Bits",   "6",               "5",            "5",          "16"]

for ri,(row,fnt,bg) in enumerate([
    (heads,ftb,(57,73,171)),
    (vals, ftb,(243,244,255)),
    (bits, ftn,(255,255,255)),
]):
    ry = ty+30+ri*22
    fc = (255,255,255) if ri==0 else (13,71,161)
    for ci,(x0,x1) in enumerate(zip(cols[:-1],cols[1:])):
        td.rectangle([(x0,ry),(x1-1,ry+20)], fill=bg, outline=(57,73,171))
        td.text(((x0+x1)//2, ry+10), row[ci], fill=fc, font=fnt, anchor="mm")

td.text((W//2, ty+TABL-9),
        "Activas: ALUSrc=1  MemWrite=1     |     Inactivas: RegWrite=0  MemRead=0  Branch=0",
        fill=(80,80,80), font=ftn, anchor="mm")

path = "C:/Users/erenj/OneDrive/Escritorio/arqui/figuras/slide_sb_PH.png"
final.save(path, "PNG")
print(f"OK {W}x{H+TH+TABL}")
