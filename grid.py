from PIL import Image, ImageDraw, ImageFont
base = Image.open("C:/Users/erenj/OneDrive/Escritorio/arqui/datapath_base_PH.png").convert("RGB")
W,H = base.size
d = ImageDraw.Draw(base)
try:
    f = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 11)
except:
    f = ImageFont.load_default()
for x in range(0,W,50):
    d.line([(x,0),(x,H)], fill=(255,0,255), width=1)
    d.text((x+1,1), str(x), fill=(200,0,200), font=f)
    d.text((x+1,H-13), str(x), fill=(200,0,200), font=f)
for y in range(0,H,50):
    d.line([(0,y),(W,y)], fill=(0,200,255), width=1)
    d.text((1,y+1), str(y), fill=(0,120,180), font=f)
    d.text((W-25,y+1), str(y), fill=(0,120,180), font=f)
base.save("C:/Users/erenj/AppData/Local/Temp/claude/C--Users-erenj-OneDrive-Escritorio/98d9a9ad-d4cd-431c-aa6d-3bc0e73eaed2/scratchpad/base_grid.png")
print("OK", W, H)
