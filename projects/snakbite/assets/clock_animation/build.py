from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import math, zipfile, json
P=Path('/workspace/scratch/402d6f2adcc8/clock-animation'); (P/'frames').mkdir(exist_ok=True)
S=768; C=384; red=(217,74,69); ivory=(238,236,227)
font=ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/P052-Roman.otf',340)
base=Image.new('RGBA',(S,S)); d=ImageDraw.Draw(base)
def xy(r,a):
 a=math.radians(a-90); return (C+r*math.cos(a), C+r*math.sin(a))
def circle(r,color,w=1): d.ellipse((C-r,C-r,C+r,C+r),outline=color,width=w)
circle(314,(*ivory,35)); circle(287,(*ivory,65)); circle(250,(*ivory,20))
for i in range(60):
 a=i*6; major=i%5==0
 d.line([xy(268 if major else 277,a),xy(286,a)],fill=(*ivory,190 if major else 75),width=3 if major else 1)
for i in range(6):
 x,y=xy(314,i*60); z=4
 d.polygon([(x,y-z),(x+z,y),(x,y+z),(x-z,y)],fill=(*red,225))
b=font.getbbox('6'); x=C-(b[2]-b[0])/2-b[0]; y=C-(b[3]-b[1])/2-b[1]
d.text((x,y),'6',font=font,fill=(*red,255))
# Fixed numeral pixels reused in every single frame.
base.save(P/'static-dial.png')
previews=[]
for i in range(120):
 im=base.copy(); dr=ImageDraw.Draw(im); angle=i*3
 # 110-degree comet trail, discretized finely; no frame-specific geometry variation.
 for j in range(220):
  t=j/219; a=angle-110+110*t
  dr.line([xy(299,a),xy(299,a+.6)],fill=(*red,int(12+243*t*t)),width=4)
 x,y=xy(299,angle)
 dr.ellipse((x-11,y-11,x+11,y+11),outline=(*red,95),width=2)
 dr.ellipse((x-5,y-5,x+5,y+5),fill=(*red,255))
 dr.ellipse((x-2,y-2,x+2,y+2),fill=(*ivory,255))
 im.save(P/'frames'/f'clock-{i:03}.png')
 bg=Image.new('RGBA',(S,S),(12,32,28,255)); bg.alpha_composite(im)
 previews.append(bg.convert('RGB').resize((512,512),Image.Resampling.LANCZOS))
previews[0].save(P/'clock-preview.gif',save_all=True,append_images=previews[1:],duration=[30,30,40]*40,loop=0,optimize=False)
# Check numeral's entire bounding region remains byte-identical.
region=(260,240,508,528); ref=base.crop(region).tobytes()
assert all(Image.open(f).crop(region).tobytes()==ref for f in (P/'frames').glob('*.png'))
(P/'ANTIGRAVITY-PROMPT.txt').write_text('''Replace ONLY the existing clock illustration with the supplied transparent animation. Preserve the background, all wording, layout, section height, alignment, and every other animation (including the 58,000 counter).

Use frames/clock-000.png through clock-119.png in numerical order. All 120 frames are 768x768 transparent PNGs from one fixed master design. The red 6 is already included, identical in every frame: do not overlay another 6. The numeral uses P052 Roman, embedded in the PNGs; do not substitute or re-render it. Its red is #D94A45. Keep existing MORE THAN and LIVES LOST labels as separate live text in their existing positions, adjusting ONLY within the clock container if needed to prevent overlap. Preserve their font and color.

Preload and decode all frames before playback. Render with canvas or a fixed-size image box, object-fit: contain; preserve identical bounds, scale, and center for all frames. Transparent pixels must remain transparent. Never auto-crop frames or fade between them.

Play at 30fps (4 seconds per rotation), loop seamlessly. Use elapsed time from requestAnimationFrame: frameIndex = floor(elapsedMilliseconds * 30 / 1000) % 120. Do not use frame-by-frame setTimeout delays. Pause when the section is offscreen; resume without a jump. The last frame intentionally precedes the first by one normal movement step. Do not add a duplicate end frame or a pause.

The only moving element is the red marker and its fading trailing arc. Keep the number, dial rings, tick marks, and six small red accents completely still. No number morphing, scaling, pulsing, or hue changes. No extra glow, hands, drop shadows, or colored background.

Respect prefers-reduced-motion by displaying clock-000.png statically. Include accessible text describing the existing statistic; treat the clock motion as decorative. The 4-second loop is illustrative, not a real-time death counter. Do not change the statistic or suggest one death occurs each revolution.

clock-preview.gif has a dark green background solely for review. Do NOT use the GIF as the production asset; use the transparent PNG frames.
''')
with zipfile.ZipFile(P/'clock-animation-pack.zip','w',zipfile.ZIP_DEFLATED) as z:
 for f in sorted((P/'frames').glob('*.png')): z.write(f,'frames/'+f.name)
 for name in ['static-dial.png','clock-preview.gif','ANTIGRAVITY-PROMPT.txt','build.py']: z.write(P/name,name)
print('120 frames generated. Fixed numeral verified identical across all frames. ZIP:',(P/'clock-animation-pack.zip').stat().st_size)
