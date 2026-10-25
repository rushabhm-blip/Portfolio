import os
import numpy as np
from PIL import Image

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
mockup = Image.open(os.path.join(folder, 'media_1792690638166.jpg')) # 1024x576
bg = Image.open(os.path.join(folder, 'media_1792690883981.jpg'))     # 1024x575

# Resize bg to 1024x576 if needed
if bg.size != mockup.size:
    bg = bg.resize(mockup.size, Image.Resampling.LANCZOS)

arr_mockup = np.array(mockup).astype(float)
arr_bg = np.array(bg).astype(float)

# Difference image
diff = np.max(np.abs(arr_mockup - arr_bg), axis=2)
# Difference > 25 indicates text or snakes!
mask_diff = diff > 25

print(f"Difference pixels: {np.sum(mask_diff)}")

# Let's inspect 4 quadrants:
# 1. Top-Left: Green snake
# 2. Top-Right: Cobra
# 3. Bottom-Left: Brown snake
# 4. Bottom-Right: Banded snake
# 5. Center: Text

w, h = mockup.size
print("\nQuadrant analysis for snakes in mockup:")
# Green: y in [50, 250], x in [0, 400]
m_green = mask_diff[50:250, :400]
ys_g, xs_g = np.where(m_green)
if len(xs_g):
    print(f"Green snake in mockup: x=[{xs_g.min()},{xs_g.max()}], y=[{ys_g.min()+50},{ys_g.max()+50}], center=({np.mean(xs_g):.1f},{np.mean(ys_g)+50:.1f})")

# Cobra: y in [50, 350], x in [700, 1024]
m_cobra = mask_diff[50:350, 700:]
ys_c, xs_c = np.where(m_cobra)
if len(xs_c):
    print(f"Cobra snake in mockup: x=[{xs_c.min()+700},{xs_c.max()+700}], y=[{ys_c.min()+50},{ys_c.max()+50}], center=({np.mean(xs_c)+700:.1f},{np.mean(ys_c)+50:.1f})")

# Brown: y in [350, 560], x in [0, 400]
m_brown = mask_diff[350:560, :400]
ys_b, xs_b = np.where(m_brown)
if len(xs_b):
    print(f"Brown snake in mockup: x=[{xs_b.min()},{xs_b.max()}], y=[{ys_b.min()+350},{ys_b.max()+350}], center=({np.mean(xs_b):.1f},{np.mean(ys_b)+350:.1f})")

# Banded: y in [350, 560], x in [600, 1024]
m_banded = mask_diff[350:560, 600:]
ys_bd, xs_bd = np.where(m_banded)
if len(xs_bd):
    print(f"Banded snake in mockup: x=[{xs_bd.min()+600},{xs_bd.max()+600}], y=[{ys_bd.min()+350},{ys_bd.max()+350}], center=({np.mean(xs_bd)+600:.1f},{np.mean(ys_bd)+350:.1f})")

# Center text: y in [150, 480], x in [350, 680]
m_text = mask_diff[150:480, 350:680]
ys_t, xs_t = np.where(m_text)
if len(xs_t):
    print(f"Text in mockup: x=[{xs_t.min()+350},{xs_t.max()+350}], y=[{ys_t.min()+150},{ys_t.max()+150}]")
