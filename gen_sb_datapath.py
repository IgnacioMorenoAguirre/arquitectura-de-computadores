import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch
import matplotlib.patheffects as pe

fig, ax = plt.subplots(figsize=(13.65, 10.24))
ax.set_xlim(0, 1365); ax.set_ylim(0, 1024)
ax.set_aspect('equal'); ax.axis('off')
fig.patch.set_facecolor('white')

# ── colores ──────────────────────────────────────────────────
ACTIVE  = '#1565C0'   # azul oscuro (activo)
ACTIVE2 = '#B71C1C'   # rojo oscuro (activo secundario / write)
INACTIVE= '#BDBDBD'   # gris (inactivo)
CTRL    = '#F57F17'   # naranja (señales de control)
COMP_A  = '#E3F2FD'   # relleno caja activa
COMP_I  = '#F5F5F5'   # relleno caja inactiva
COMP_EA = '#1565C0'   # borde caja activa
COMP_EI = '#9E9E9E'   # borde caja inactiva

def box(x,y,w,h, active=True, label="", fontsize=9, label2=""):
    fc = COMP_A if active else COMP_I
    ec = COMP_EA if active else COMP_EI
    ax.add_patch(FancyBboxPatch((x,y),w,h,
        boxstyle="round,pad=2,rounding_size=4",
        fc=fc, ec=ec, lw=2.2 if active else 1.2, zorder=3))
    mid_y = y+h/2
    if label2:
        ax.text(x+w/2, mid_y+7, label, ha='center', va='center',
                fontsize=fontsize, fontweight='bold',
                color=COMP_EA if active else COMP_EI, zorder=4)
        ax.text(x+w/2, mid_y-7, label2, ha='center', va='center',
                fontsize=fontsize-1, color=COMP_EA if active else COMP_EI, zorder=4)
    else:
        ax.text(x+w/2, mid_y, label, ha='center', va='center',
                fontsize=fontsize, fontweight='bold',
                color=COMP_EA if active else COMP_EI, zorder=4)

def mux(x,y,h, active=True, label="M\nU\nX"):
    col_e = COMP_EA if active else COMP_EI
    col_f = COMP_A  if active else COMP_I
    pts = [[x,y],[x+22,y+10],[x+22,y+h-10],[x,y+h]]
    poly = plt.Polygon(pts, fc=col_f, ec=col_e, lw=2 if active else 1.2, zorder=3)
    ax.add_patch(poly)
    ax.text(x+11, y+h/2, label, ha='center', va='center',
            fontsize=7, fontweight='bold', color=col_e, zorder=4)

def arr(x1,y1,x2,y2, active=True, lw=2.2, color=None, zorder=2):
    col = color if color else (ACTIVE if active else INACTIVE)
    ax.annotate("", xy=(x2,y2), xytext=(x1,y1),
        arrowprops=dict(arrowstyle="-|>", color=col,
                        lw=lw if active else 1.2,
                        linestyle='-' if active else (0,(5,4))),
        zorder=zorder)

def line(x1,y1,x2,y2, active=True, lw=2.2, color=None):
    col = color if color else (ACTIVE if active else INACTIVE)
    ls  = '-' if active else (0,(5,4))
    ax.plot([x1,x2],[y1,y2], color=col, lw=lw if active else 1.2,
            linestyle=ls, zorder=2)

def sig(x,y, label, active=True):
    col = CTRL if active else INACTIVE
    ax.text(x, y, label, ha='center', va='center', fontsize=7.5,
            color=col, fontweight='bold' if active else 'normal', zorder=5)

def label(x,y,t, color='#333333', fs=8, ha='center', va='center', bold=False):
    ax.text(x,y,t, ha=ha, va=va, fontsize=fs, color=color,
            fontweight='bold' if bold else 'normal', zorder=5)

# ══════════════════════════════════════════════════════════════
#  TÍTULO
# ══════════════════════════════════════════════════════════════
ax.add_patch(plt.Rectangle((0,940),1365,84, fc='#0D47A1', zorder=1))
# acento color (esquina superior izquierda — estilo compañeros)
ax.add_patch(plt.Rectangle((0,940),60,42, fc='#B71C1C', zorder=2))
ax.add_patch(plt.Rectangle((0,982),60,42, fc='#1E88E5', zorder=2))
ax.text(683, 982, "Datapath instruccion sb", ha='center', va='center',
        fontsize=26, fontweight='bold', color='white', zorder=3)

# ══════════════════════════════════════════════════════════════
#  COMPONENTES
#  Coordenadas: origen (0,0) abajo-izquierda, y aumenta hacia arriba
#  (matplotlib natural)
# ══════════════════════════════════════════════════════════════

# ── PC ───────────────────────────────────────────────────────
box(42, 640, 72, 110, True,  "PC", 10)

# ── Instruction Memory ───────────────────────────────────────
box(160, 580, 130, 230, True, "Instruction", 9, "Memory")

# ── ADD PC+4 (siempre activo en fetch) ───────────────────────
box(160, 820, 80, 50, True, "Add", 8)
label(200, 845, "+4", '#1565C0', 7)

# ── CONTROL ──────────────────────────────────────────────────
box(345, 770, 140, 130, True, "Control", 10)
# señales que salen del control
# RegDst (X), ALUSrc=1(activo), MemtoReg(X), RegWrite=0, MemRead=0, MemWrite=1, Branch=0, ALUOp=00
sig(390, 910, "ALUSrc=1", True)
sig(390, 895, "MemWrite=1", True)
sig(550, 910, "RegWrite=0", False)
sig(550, 895, "MemRead=0", False)
sig(470, 910, "Branch=0", False)

# ── REGISTERS ────────────────────────────────────────────────
box(345, 560, 155, 200, True, "Registers", 10)
label(423, 740, "Read reg 1  ($t0)", '#1565C0', 7.5)
label(423, 727, "Read reg 2  ($t1)", '#1565C0', 7.5)
label(423, 700, "Write reg   (X)", INACTIVE, 7.5)
label(423, 687, "Write data  (X)", INACTIVE, 7.5)

# ── SIGN-EXTEND ──────────────────────────────────────────────
box(345, 480, 155, 60, True, "Sign-extend", 9)
label(423, 465, "offset  0000...0 → 0x00000000", '#1565C0', 7)

# ── MUX ALUSrc ───────────────────────────────────────────────
mux(548, 580, 80, True)   # ALUSrc=1  → elige sign-extend
label(571, 565, "ALUSrc=1", CTRL, 7, bold=True)

# ── ALU ──────────────────────────────────────────────────────
box(600, 580, 120, 150, True, "ALU", 12)
label(660, 620, "ADD", '#1565C0', 9, bold=True)
label(660, 605, "$t0 + 0 →", '#1565C0', 8)
label(660, 591, "address", '#1565C0', 8)
# zero flag (inactivo para sb)
box(740, 690, 50, 28, False, "Zero", 7)

# ── ALU CONTROL ──────────────────────────────────────────────
box(600, 480, 120, 60, True, "ALU", 8, "Control")
label(660, 465, "ALUOp=00 → ADD", '#1565C0', 7)

# ── DATA MEMORY ──────────────────────────────────────────────
box(800, 555, 150, 200, True, "Data", 10, "Memory")
label(875, 538, "MemWrite=1  ✓", ACTIVE2, 8, bold=True)
label(875, 524, "MemRead=0   ✗", INACTIVE, 8)

# ── MUX MemtoReg (INACTIVO — no hay write-back) ──────────────
mux(990, 610, 80, False)
label(1013, 596, "MemtoReg\n(inact.)", INACTIVE, 7)

# ── Banco de registros (write-back — INACTIVO) ───────────────
box(1060, 620, 110, 80, False, "Write-back", 9, "(RegWrite=0)")

# ══════════════════════════════════════════════════════════════
#  CONEXIONES
# ══════════════════════════════════════════════════════════════

# PC → Instr Memory
arr(114, 695, 160, 695, True)
# PC → Add PC+4
line(78, 750, 78, 845, True)
arr(78, 845, 160, 845, True)
# Add PC+4 → (PC update, simplificado)
arr(240, 845, 320, 845, True)

# Instr Memory → Control (opcode)
arr(290, 780, 345, 820, True, lw=2.5)
label(315, 808, "opcode\n31:26", '#1565C0', 7)

# Instr Memory → Registers rs (25:21)
arr(290, 710, 345, 720, True)
label(315, 718, "rs 25:21", '#1565C0', 7)

# Instr Memory → Registers rt (20:16)
arr(290, 680, 345, 690, True)
label(315, 682, "rt 20:16", '#1565C0', 7)

# Instr Memory → Sign-extend (15:0)
arr(290, 620, 345, 510, True)
label(310, 580, "offset 15:0", '#1565C0', 7)

# Registers Read data 1 ($t0) → ALU
arr(500, 715, 600, 680, True, lw=2.5)
label(545, 704, "Read data 1\n$t0", '#1565C0', 7)

# Registers Read data 2 ($t1) → MUX ALUSrc (upper, no elegida)
line(500, 685, 540, 685, True, lw=2.5)
line(540, 685, 540, 598, True, lw=2.5)
arr(540, 598, 548, 598, True, lw=2.5)
label(518, 672, "Read data 2 $t1", '#1565C0', 7)

# Registers Read data 2 ($t1) → Data Memory (write data)
line(500, 685, 530, 685, True, lw=2.5, color=ACTIVE2)
line(530, 685, 530, 555, True, lw=2.5, color=ACTIVE2)
arr(530, 555, 800, 588, True, lw=2.5, color=ACTIVE2)
label(610, 546, "Write data ($t1 → mem)", ACTIVE2, 7.5, bold=True)

# Sign-extend → MUX ALUSrc (lower input, ELEGIDA)
arr(500, 510, 548, 626, True, lw=2.5)
label(516, 562, "sign-ext\n(offset=0)", '#1565C0', 7)

# Control → ALUSrc signal
line(415, 770, 415, 730, True, lw=1.8, color=CTRL)
arr(415, 730, 548, 650, True, lw=1.8, color=CTRL)

# Control → MemWrite signal
line(460, 770, 460, 750, True, lw=1.8, color=CTRL)
arr(460, 750, 800, 720, True, lw=1.8, color=CTRL)
label(640, 740, "MemWrite=1", CTRL, 8, bold=True)

# Control → RegWrite (inactivo)
arr(480, 770, 1060, 670, False, lw=1.2)
label(790, 728, "RegWrite=0", INACTIVE, 7)

# MUX ALUSrc → ALU (second operand)
arr(570, 630, 600, 640, True, lw=2.5)

# ALU → Data Memory (address)
arr(720, 650, 800, 650, True, lw=3, color=ACTIVE)
label(760, 665, "address\n($t0+0)", ACTIVE, 8, bold=True)

# ALU Control → ALU
arr(660, 540, 660, 580, True, lw=1.8, color=CTRL)

# Instr Memory → ALU Control (funct/opcode)
line(290, 630, 330, 630, True, lw=1.6, color=CTRL)
line(330, 630, 330, 510, True, lw=1.6, color=CTRL)
arr(330, 510, 600, 510, True, lw=1.6, color=CTRL)

# Data Memory → MUX MemtoReg (INACTIVO)
arr(950, 650, 990, 650, False, lw=1.2)

# MUX MemtoReg → write-back (INACTIVO)
arr(1012, 650, 1060, 660, False, lw=1.2)

# ══════════════════════════════════════════════════════════════
#  LEYENDA
# ══════════════════════════════════════════════════════════════
ax.add_patch(plt.Rectangle((42, 420), 400, 50, fc='#FAFAFA', ec='#BDBDBD', lw=1, zorder=2))
ax.plot([55,95],[445,445], color=ACTIVE, lw=2.5, zorder=3)
label(130, 445, "Camino activo", ACTIVE, 8, ha='left')
ax.plot([55,95],[435,435], color=INACTIVE, lw=1.5, ls=(0,(5,4)), zorder=3)
label(130, 435, "Camino inactivo", INACTIVE, 8, ha='left')
ax.plot([250,290],[445,445], color=ACTIVE2, lw=2.5, zorder=3)
label(325, 445, "Dato escrito", ACTIVE2, 8, ha='left')
ax.plot([250,290],[435,435], color=CTRL, lw=1.8, zorder=3)
label(325, 435, "Señal de control", CTRL, 8, ha='left')

# ══════════════════════════════════════════════════════════════
#  INSTRUCCIÓN Y TABLA (parte inferior)
# ══════════════════════════════════════════════════════════════
ax.add_patch(plt.Rectangle((42,270),1280,135, fc='#E8EAF6', ec='#3949AB', lw=1.5, zorder=2))

# instrucción
label(683, 385, "sb  $t1, 0($t0)", '#0D47A1', 16, bold=True)

# tabla de campos
cols  = [42, 290, 565, 790, 1040, 1322]
heads = ["Campo",   "opcode (31:26)", "rs (25:21)", "rt (20:16)", "offset (15:0)"]
vals  = ["Valor",   "101000",         "$t0",         "$t1",        "0000000000000000"]
bits  = ["Bits",    "6",              "5",            "5",          "16"]

row_y = [350, 325, 298]
for i, row in enumerate([heads, vals, bits]):
    y = row_y[i]
    bg = '#3949AB' if i == 0 else ('#F3F4FF' if i%2==0 else 'white')
    fc_txt = 'white' if i==0 else '#0D47A1'
    for j, (x0, x1) in enumerate(zip(cols[:-1], cols[1:])):
        ax.add_patch(plt.Rectangle((x0,y-16), x1-x0-2, 26,
            fc=bg, ec='#3949AB', lw=0.8, zorder=3))
        ax.text((x0+x1-2)/2, y-3, row[j], ha='center', va='center',
                fontsize=8.5 if i==0 else 9,
                fontweight='bold' if i<2 else 'normal',
                color=fc_txt, zorder=4)

# nota señales de control
label(683, 275, "Señales activas: ALUSrc=1 · MemWrite=1     |     Señales inactivas: RegWrite=0 · MemRead=0 · Branch=0",
      '#555555', 8.5)

plt.tight_layout(pad=0)
plt.savefig("C:/Users/erenj/OneDrive/Escritorio/arqui/figuras/slide_sb_datapath.png",
            dpi=120, bbox_inches='tight', facecolor='white')
print("OK")
