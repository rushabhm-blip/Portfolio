import os
import numpy as np
from PIL import Image
import scipy.signal as signal

folder = r'C:\Users\Tuff\.gemini\antigravity-ide\brain\259c676c-575c-4bad-a90b-de08054c403d\.user_uploaded'
out_dir = r'e:\Portfolio\Snakebite Dataviz\snakbite\assets\diversity'

mockup = Image.open(os.path.join(folder, 'media_1792690638166.jpg')).convert('RGB')
arr_m = np.array(mockup, float)

for name in ['green', 'cobra', 'brown', 'banded']:
    frame1 = Image.open(os.path.join(out_dir, f"{name}-01.png"))
    # find bounding box of non-transparent in frame1
    arr_f = np.array(frame1)
    mask = arr_f[:, :, 3] > 50
    ys, xs = np.where(mask)
    sprite = arr_f[ys.min():ys.max()+1, xs.min():xs.max()+1]
    
    # Try different scales of sprite to match mockup
    best_score = -1e9
    best_pos = None
    best_scale = None
    
    # search quadrant
    if name == 'green':
        search_region = arr_m[0:280, 0:400]
        y_off, x_off = 0, 0
    elif name == 'cobra':
        search_region = arr_m[50:350, 750:1024]
        y_off, x_off = 50, 750
    elif name == 'brown':
        search_region = arr_m[360:576, 0:420]
        y_off, x_off = 360, 0
    elif name == 'banded':
        search_region = arr_m[360:576, 600:1024]
        y_off, x_off = 360, 600
        
    for scale in np.linspace(0.7, 1.1, 17):
        sw = int(sprite.shape[1] * scale)
        sh = int(sprite.shape[0] * scale)
        if sw >= search_region.shape[1] or sh >= search_region.shape[0] or sw < 10 or sh < 10:
            continue
        sp_resized = Image.fromarray(sprite).resize((sw, sh), Image.Resampling.LANCZOS)
        arr_sp = np.array(sp_resized, float)
        sp_mask = arr_sp[:, :, 3] > 80
        if np.sum(sp_mask) < 100: continue
        
        # normalized correlation on RGB
        sp_rgb = arr_sp[:, :, :3]
        
        # sample a few search positions or grid
        # We can use scipy correlate2d or simple convolution on 1 channel (luminance)
        lum_sp = 0.299 * sp_rgb[:, :, 0] + 0.587 * sp_rgb[:, :, 1] + 0.114 * sp_rgb[:, :, 2]
        lum_sp[~sp_mask] = 0
        lum_search = 0.299 * search_region[:, :, 0] + 0.587 * search_region[:, :, 1] + 0.114 * search_region[:, :, 2]
        
        corr = signal.correlate2d(lum_search, lum_sp, mode='valid')
        max_idx = np.unravel_index(np.argmax(corr), corr.shape)
        score = corr[max_idx] / (np.sum(sp_mask) * (scale**0.5))
        if score > best_score:
            best_score = score
            best_scale = scale
            best_pos = (max_idx[1] + x_off, max_idx[0] + y_off, sw, sh)
            
    print(f"{name.upper()} best match in mockup: pos={best_pos}, scale={best_scale:.3f}")
