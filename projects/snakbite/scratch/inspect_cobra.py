import os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
im = Image.open(os.path.join(folder, 'media_1792690901176.png'))
arr = np.array(im)
alpha = arr[:, :, 3]
mask = alpha > 10

labeled, num_features = ndi.label(mask)
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

print("Cobra poses:")
for idx, c in enumerate(ordered, 1):
    xs, ys = c['xs'], c['ys']
    # The coil is at the bottom 40% of the snake
    bottom_y = ys.max()
    top_y = ys.min()
    coil_ys = ys[ys > bottom_y - 80]
    coil_xs = xs[ys > bottom_y - 80]
    print(f"Pose {idx:02d}: x:[{xs.min()},{xs.max()}] (w={xs.max()-xs.min()}), y:[{ys.min()},{ys.max()}] (h={ys.max()-ys.min()}), coil_bottom={bottom_y}, coil_cx={np.mean(coil_xs):.1f}, coil_w={coil_xs.max()-coil_xs.min()}")
