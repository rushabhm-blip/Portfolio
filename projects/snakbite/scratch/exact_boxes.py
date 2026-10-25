import os
import numpy as np
from PIL import Image

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
mockup = Image.open(os.path.join(folder, 'media_1792690638166.jpg')) # 1024x576
bg = Image.open(os.path.join(folder, 'media_1792690883981.jpg'))     # 1024x575
bg = bg.resize(mockup.size, Image.Resampling.LANCZOS)

diff = np.max(np.abs(np.array(mockup, float) - np.array(bg, float)), axis=2)

def get_exact_box(x1, y1, x2, y2, name):
    sub = diff[y1:y2, x1:x2]
    ys, xs = np.where(sub > 30)
    print(f"{name}: x=[{xs.min()+x1},{xs.max()+x1}] (w={xs.max()-xs.min()+1}), y=[{ys.min()+y1},{ys.max()+y1}] (h={ys.max()-ys.min()+1})")

get_exact_box(0, 80, 360, 220, "Green in mockup")
get_exact_box(800, 80, 1000, 310, "Cobra in mockup")
get_exact_box(20, 400, 380, 530, "Brown in mockup")
get_exact_box(620, 420, 990, 580, "Banded in mockup")
