import os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'

def inspect_snake(name, fname):
    im = Image.open(os.path.join(folder, fname))
    arr = np.array(im)
    alpha = arr[:, :, 3]
    mask = alpha > 10
    
    struct = np.ones((5, 5), dtype=bool)
    dilated = ndi.binary_dilation(mask, structure=struct)
    labeled, num_features = ndi.label(dilated)
    sizes = ndi.sum(mask, labeled, range(1, num_features + 1))
    
    comp_info = []
    for i, size in enumerate(sizes, 1):
        if size > 500:
            ys, xs = np.where(labeled == i)
            comp_info.append({'id': i, 'xs': xs, 'ys': ys, 'cy': np.mean(ys), 'cx': np.mean(xs)})
            
    mid_y = np.mean([c['cy'] for c in comp_info])
    row0 = sorted([c for c in comp_info if c['cy'] < mid_y], key=lambda c: c['cx'])
    row1 = sorted([c for c in comp_info if c['cy'] >= mid_y], key=lambda c: c['cx'])
    ordered = row0 + row1
    
    print(f"\n=== {name.upper()} ===")
    for idx, c in enumerate(ordered, 1):
        xs, ys = c['xs'], c['ys']
        # Tail vs head: for green, head is on right (max x), tail on left (min x)
        # For banded, head is on left (min x), tail on right (max x)
        leftmost_y = ys[xs == xs.min()][0]
        rightmost_y = ys[xs == xs.max()][0]
        bottom_y = ys.max()
        top_y = ys.min()
        print(f"Pose {idx:02d}: x:[{xs.min()},{xs.max()}], y:[{ys.min()},{ys.max()}], left_pt=({xs.min()},{leftmost_y}), right_pt=({xs.max()},{rightmost_y}), bottom={bottom_y}")

inspect_snake('green', 'media_1792690890716.png')
inspect_snake('brown', 'media_1792690908366.png')
inspect_snake('banded', 'media_1792690916085.png')
