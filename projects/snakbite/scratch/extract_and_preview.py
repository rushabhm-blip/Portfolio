import os
import numpy as np
from PIL import Image
import scipy.ndimage as ndi

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
out_dir = r'e:\Portfolio\Snakebite Dataviz\snakbite\assets\diversity'
os.makedirs(out_dir, exist_ok=True)

sheets = {
    'green': ('media_1792690890716.png', (420, 240)),
    'cobra': ('media_1792690901176.png', (350, 350)),
    'brown': ('media_1792690908366.png', (420, 260)),
    'banded': ('media_1792690916085.png', (460, 220)),
}

for name, (fname, canvas_size) in sheets.items():
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
    
    cw, ch = canvas_size
    print(f"\nProcessing {name.upper()} into {cw}x{ch}...")
    
    for idx, c in enumerate(ordered, 1):
        xs, ys = c['xs'], c['ys']
        xmin, xmax = xs.min(), xs.max()
        ymin, ymax = ys.min(), ys.max()
        
        # Crop the sprite using its exact component mask
        sprite = arr[ymin:ymax+1, xmin:xmax+1].copy()
        sprite_mask = (labeled[ymin:ymax+1, xmin:xmax+1] == c['id'])
        sprite[~sprite_mask, 3] = 0
        
        sw, sh = sprite.shape[1], sprite.shape[0]
        
        # Target canvas
        canvas = np.zeros((ch, cw, 4), dtype=np.uint8)
        
        if name == 'cobra':
            # Coil bottom and center alignment
            # Find coil bottom in this sprite:
            bottom_in_sprite = sh - 1
            # coil is bottom 80px
            coil_ys, coil_xs = np.where((sprite[:, :, 3] > 20) & (np.arange(sh)[:, None] > sh - 80))
            coil_cx_in_sprite = np.mean(coil_xs) if len(coil_xs) > 0 else sw / 2
            
            target_cx = cw // 2
            target_bottom = ch - 15
            
            paste_x = int(target_cx - coil_cx_in_sprite)
            paste_y = int(target_bottom - bottom_in_sprite)
        elif name == 'green':
            # Bottom baseline and horizontal centering/tail alignment
            target_bottom = ch - 20
            paste_y = target_bottom - (sh - 1)
            # Center horizontally with comfortable padding
            paste_x = (cw - sw) // 2
        elif name == 'brown':
            target_bottom = ch - 20
            paste_y = target_bottom - (sh - 1)
            paste_x = (cw - sw) // 2
        elif name == 'banded':
            target_bottom = ch - 20
            paste_y = target_bottom - (sh - 1)
            paste_x = (cw - sw) // 2
            
        # Ensure within canvas bounds
        x1_dst = max(0, paste_x)
        y1_dst = max(0, paste_y)
        x2_dst = min(cw, paste_x + sw)
        y2_dst = min(ch, paste_y + sh)
        
        x1_src = x1_dst - paste_x
        y1_src = y1_dst - paste_y
        x2_src = x1_src + (x2_dst - x1_dst)
        y2_src = y1_src + (y2_dst - y1_dst)
        
        canvas[y1_dst:y2_dst, x1_dst:x2_dst] = sprite[y1_src:y2_src, x1_src:x2_src]
        
        out_file = os.path.join(out_dir, f"{name}-{idx:02d}.png")
        Image.fromarray(canvas, mode='RGBA').save(out_file)
        print(f"  Saved {out_file} (sprite size {sw}x{sh} at ({paste_x},{paste_y}))")

# Also copy background image
bg_src = os.path.join(folder, 'media_1792690883981.jpg')
bg_dst = os.path.join(out_dir, 'diversity_bg.jpg')
Image.open(bg_src).save(bg_dst)
print(f"\nSaved background to {bg_dst}")
