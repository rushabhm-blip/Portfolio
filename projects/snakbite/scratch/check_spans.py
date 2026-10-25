import os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
sheets = {
    'green': 'media_1792690890716.png',
    'cobra': 'media_1792690901176.png',
    'brown': 'media_1792690908366.png',
    'banded': 'media_1792690916085.png',
}

for name, fname in sheets.items():
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
    
    widths = [c['xs'].max() - c['xs'].min() + 1 for c in ordered]
    heights = [c['ys'].max() - c['ys'].min() + 1 for c in ordered]
    
    print(f"\n{name.upper()}:")
    print(f"  Widths: {widths}, max={max(widths)}")
    print(f"  Heights: {heights}, max={max(heights)}")
    
    # Check baseline (bottom-most point) and head/tail positions
    for idx, c in enumerate(ordered, 1):
        xs, ys = c['xs'], c['ys']
        print(f"  Pose {idx:02d}: x span=[{xs.min()},{xs.max()}] ({xs.max()-xs.min()+1}px), y span=[{ys.min()},{ys.max()}] ({ys.max()-ys.min()+1}px), bottom={ys.max()}")
