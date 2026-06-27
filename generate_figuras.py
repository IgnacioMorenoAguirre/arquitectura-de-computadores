import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
import os

os.makedirs("figuras", exist_ok=True)

BOXES = {
    "pc":  (0.30, 1.55, 0.90, 0.90),
    "im":  (1.60, 1.45, 1.80, 1.10),
    "reg": (3.80, 1.45, 1.80, 1.10),
    "alu": (6.00, 1.55, 1.10, 0.90),
    "dm":  (7.50, 1.45, 1.60, 1.10),
}
LABELS = {
    "pc": "PC", "im": "Memoria de\ninstrucciones", "reg": "Banco de\nregistros",
    "alu": "ALU", "dm": "Memoria de\ndatos",
}
ACT_FILL, ACT_EDGE, ACT_TXT = "#e3f1e8", "#4f9d69", "#1c3d2a"
INA_FILL, INA_EDGE, INA_TXT = "#f1f1f1", "#c6c6c6", "#a3a3a3"
CTRL_FILL, CTRL_EDGE, CTRL_TXT = "#fbe7c6", "#c0844a", "#6b4a1f"
ARR_ACT, ARR_INA = "#3f8d5a", "#c8c8c8"

def right(b):  x,y,w,h = BOXES[b]; return (x+w, y+h/2)
def left(b):   x,y,w,h = BOXES[b]; return (x, y+h/2)
def bottom(b): x,y,w,h = BOXES[b]; return (x+w/2, y)

def draw(filename, active, arrows, caption, control_active=True):
    fig, ax = plt.subplots(figsize=(10, 3.5))
    ax.set_xlim(0, 9.3); ax.set_ylim(-0.1, 4.0); ax.axis("off")
    cf, ce, ct = (CTRL_FILL, CTRL_EDGE, CTRL_TXT) if control_active else (INA_FILL, INA_EDGE, INA_TXT)
    ax.add_patch(FancyBboxPatch((1.60, 3.05), 6.50, 0.55,
                 boxstyle="round,pad=0.02,rounding_size=0.08", fc=cf, ec=ce, lw=1.5))
    ax.text(4.85, 3.32, "Unidad de control", ha="center", va="center",
            color=ct, fontsize=11, weight="bold")
    for b,(x,y,w,h) in BOXES.items():
        fc,ec,tc = (ACT_FILL,ACT_EDGE,ACT_TXT) if b in active else (INA_FILL,INA_EDGE,INA_TXT)
        ax.add_patch(FancyBboxPatch((x,y),w,h,
                     boxstyle="round,pad=0.02,rounding_size=0.08", fc=fc, ec=ec, lw=1.8))
        ax.text(x+w/2, y+h/2, LABELS[b], ha="center", va="center",
                color=tc, fontsize=10.5, weight="bold")
    def arrow(p1, p2, act, rad=0.0):
        col = ARR_ACT if act else ARR_INA
        ax.annotate("", xy=p2, xytext=p1, arrowprops=dict(
            arrowstyle="-|>", color=col, lw=2.4 if act else 1.5,
            connectionstyle=f"arc3,rad={rad}",
            linestyle="-" if act else (0,(4,3)), shrinkA=2, shrinkB=2))
    for name, act in arrows:
        if   name=="pc_im":   arrow(right("pc"),   left("im"),  act)
        elif name=="im_reg":  arrow(right("im"),   left("reg"), act)
        elif name=="reg_alu": arrow(right("reg"),  left("alu"), act)
        elif name=="alu_dm":  arrow(right("alu"),  left("dm"),  act)
        elif name=="wb_dm":   arrow(bottom("dm"),  bottom("reg"), act, rad=-0.12)
        elif name=="wb_alu":  arrow(bottom("alu"), bottom("reg"), act, rad=-0.16)
        elif name=="branch":  arrow(bottom("alu"), bottom("pc"),  act, rad=-0.10)
        elif name=="jump":    arrow(bottom("im"),  bottom("pc"),  act, rad=-0.12)
    ax.text(4.65, 0.05, caption, ha="center", va="center", fontsize=9.5, color="#444444")
    plt.savefig(f"figuras/{filename}", dpi=150, bbox_inches="tight")
    plt.close(fig)

ALL = {"pc","im","reg","alu","dm"}
draw("datapath_base.png", ALL,
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",1),("wb_dm",1)],
     "Datapath de ciclo unico: las instrucciones recorren las 5 etapas de izquierda a derecha.")
draw("inst_lbu.png", ALL,
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",1),("wb_dm",1)],
     "lbu (load): ALUSrc=1, MemRead=1, MemtoReg=1, RegWrite=1  -> lee memoria y escribe registro.")
draw("inst_sb.png", ALL,
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",1),("wb_dm",0)],
     "sb (store): ALUSrc=1, MemWrite=1, RegWrite=0  -> escribe memoria, sin write-back.")
draw("inst_addi.png", {"pc","im","reg","alu"},
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",0),("wb_alu",1)],
     "addi / slti (ALU-inmediato): ALUSrc=1, RegWrite=1  -> la ALU opera con un numero fijo, sin memoria.")
draw("inst_beq.png", {"pc","im","reg","alu"},
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",0),("branch",1)],
     "beq / bne (branch): Branch=1, la ALU resta para comparar  -> si Zero=1, el PC salta.")
draw("inst_jump.png", {"pc","im"},
     [("pc_im",1),("im_reg",0),("reg_alu",0),("alu_dm",0),("jump",1)],
     "j / jal (jump): Jump=1  -> el destino sale de la instruccion; jal guarda el retorno en $ra.")
draw("inst_rtype.png", {"pc","im","reg","alu"},
     [("pc_im",1),("im_reg",1),("reg_alu",1),("alu_dm",0),("wb_alu",1)],
     "move / jr (R-type): RegDst=1, ALUSrc=0, RegWrite=1  -> opera entre dos registros, sin inmediato.")
print("OK figuras generadas")
