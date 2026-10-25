import os
import numpy as np
from PIL import Image

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
out_dir = r'e:\Portfolio\Snakebite Dataviz\snakbite\assets\diversity'

mockup = Image.open(os.path.join(folder, 'media_1792690638166.jpg'))
bg = Image.open(os.path.join(out_dir, 'diversity_bg.jpg')).convert('RGBA')

# Let's inspect where the green snake is in mockup:
arr_m = np.array(mockup)
arr_bg = np.array(bg.resize(mockup.size))

diff = np.max(np.abs(arr_m.astype(float) - arr_bg.astype(float)), axis=2)

# Green snake in mockup
mask_green = (diff > 30) & (np.arange(mockup.size[1])[:, None] < 260) & (np.arange(mockup.size[0])[None, :] < 400)
ys, xs = np.where(mask_green)
print(f"Mockup Green bounds: x=[{xs.min()},{xs.max()}], y=[{ys.min()},{ys.max()}]")

# Cobra in mockup
mask_cobra = (diff > 30) & (np.arange(mockup.size[1])[:, None] < 360) & (np.arange(mockup.size[0])[None, :] > 750)
ys_c, xs_c = np.where(mask_cobra)
print(f"Mockup Cobra bounds: x=[{xs_c.min()},{xs_c.max()}], y=[{ys_c.min()},{ys_c.max()}]")

# Brown in mockup
mask_brown = (diff > 30) & (np.arange(mockup.size[1])[:, None] > 360) & (np.arange(mockup.size[0])[None, :] < 450)
ys_b, xs_b = np.where(mask_brown)
print(f"Mockup Brown bounds: x=[{xs_b.min()},{xs_b.max()}], y=[{ys_b.min()},{ys_b.max()}]")

# Banded in mockup
mask_banded = (diff > 30) & (np.arange(mockup.size[1])[:, None] > 360) & (np.arange(mockup.size[0])[None, :] > 600)
ys_bd, xs_bd = np.where(mask_banded)
print(f"Mockup Banded bounds: x=[{xs_bd.min()},{xs_bd.max()}], y=[{ys_bd.min()},{ys_bd.max()}]")
