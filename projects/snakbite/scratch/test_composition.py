import os
import numpy as np
from PIL import Image

out_dir = r'e:\Portfolio\Snakebite Dataviz\snakbite\assets\diversity'
bg = Image.open(os.path.join(out_dir, 'diversity_bg.jpg')).convert('RGBA')
bw, bh = bg.size # 1024, 575

green = Image.open(os.path.join(out_dir, 'green-01.png'))
cobra = Image.open(os.path.join(out_dir, 'cobra-01.png'))
brown = Image.open(os.path.join(out_dir, 'brown-01.png'))
banded = Image.open(os.path.join(out_dir, 'banded-01.png'))

# Let's scale each snake to match the mockup scale:
# Green: in mockup, displayed width ~ 300px
# Our canvas is 420x240, so scale factor is ~ 300 / 332 = 0.90 -> size (378, 216)
gw, gh = int(420 * 0.88), int(240 * 0.88)
green_scaled = green.resize((gw, gh), Image.Resampling.LANCZOS)
# Position green on branch:
# Branch top at left is around x = 10, y = 105
green_pos = (-10, 50)

# Cobra: in mockup, displayed width ~ 180px
# Our canvas is 350x350, sprite is 310x311 -> scale ~ 180 / 310 = 0.58 -> size (203, 203)
cw, ch = int(350 * 0.58), int(350 * 0.58)
cobra_scaled = cobra.resize((cw, ch), Image.Resampling.LANCZOS)
# Cobra coil sits on rock ledge:
# Rock ledge top is at y = 285, x center = 895
# Coil anchor in scaled image is at x = cw // 2 = 101, y = ch - 9 = 194
cobra_pos = (895 - 101, 285 - 194)

# Brown: in mockup, displayed width ~ 300px
# Our canvas is 420x260, sprite is 336x90 -> scale ~ 300 / 336 = 0.89 -> size (374, 231)
brw, brh = int(420 * 0.89), int(260 * 0.89)
brown_scaled = brown.resize((brw, brh), Image.Resampling.LANCZOS)
# Brown sits on lower left path:
# baseline at y ~ 515, x ~ 30
# sprite bottom in canvas is ch - 20 = 240 * 0.89 = 214
brown_pos = (20, 510 - int(240 * 0.89))

# Banded: in mockup, displayed width ~ 320px
# Our canvas is 460x220, sprite is 366x77 -> scale ~ 320 / 366 = 0.87 -> size (400, 191)
bdw, bdh = int(460 * 0.87), int(220 * 0.87)
banded_scaled = banded.resize((bdw, bdh), Image.Resampling.LANCZOS)
# Banded sits on lower right ground:
# baseline at y ~ 565, x ~ 650
banded_pos = (630, 565 - int(200 * 0.87))

comp = bg.copy()
comp.alpha_composite(green_scaled, green_pos)
comp.alpha_composite(cobra_scaled, cobra_pos)
comp.alpha_composite(brown_scaled, brown_pos)
comp.alpha_composite(banded_scaled, banded_pos)

comp.convert('RGB').save('scratch/composition_test.jpg', quality=95)
print("Saved composition_test.jpg!")
