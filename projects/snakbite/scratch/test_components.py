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
    # mask of visible pixels
    mask = alpha > 10
    
    # Let's dilate slightly (e.g. 3x3) to connect forked tongues or detached markings
    struct = np.ones((5, 5), dtype=bool)
    dilated = ndi.binary_dilation(mask, structure=struct)
    
    labeled, num_features = ndi.label(dilated)
    print(f"\n--- {name.upper()}: found {num_features} components ---")
    
    # Sort components by pixel count
    sizes = ndi.sum(mask, labeled, range(1, num_features + 1))
    comp_info = []
    for i, size in enumerate(sizes, 1):
        if size > 500: # snake sprite component
            ys, xs = np.where(labeled == i)
            cy, cx = np.mean(ys), np.mean(xs)
            comp_info.append({
                'id': i,
                'size': int(size),
                'bbox': (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())),
                'center': (float(cx), float(cy))
            })
    
    print(f"Large components (snakes): {len(comp_info)}")
    # Sort by row (cy < mid_y vs cy > mid_y), then col (cx)
    mid_y = np.mean([c['center'][1] for c in comp_info]) if comp_info else 341
    row0 = sorted([c for c in comp_info if c['center'][1] < mid_y], key=lambda c: c['center'][0])
    row1 = sorted([c for c in comp_info if c['center'][1] >= mid_y], key=lambda c: c['center'][0])
    
    ordered = row0 + row1
    for idx, c in enumerate(ordered, 1):
        print(f"  Pose {idx:02d}: center=({c['center'][0]:.1f}, {c['center'][1]:.1f}), bbox={c['bbox']}, span=({c['bbox'][2]-c['bbox'][0]}, {c['bbox'][3]-c['bbox'][1]}), size={c['size']}")
