import os
import numpy as np
from PIL import Image

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
sheets = {
    'green': 'media_1792690890716.png',
    'cobra': 'media_1792690901176.png',
    'brown': 'media_1792690908366.png',
    'banded': 'media_1792690916085.png',
}

for name, fname in sheets.items():
    im = Image.open(os.path.join(folder, fname))
    w, h = im.size
    print(f"{name}: {fname}")
