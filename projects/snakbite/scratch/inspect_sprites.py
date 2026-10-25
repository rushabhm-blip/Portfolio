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
    arr = np.array(im)
    alpha = arr[:, :, 3]
    
    print(f"\n==================== {name.upper()} ({w}x{h}) ====================")
    
    # We expect 3 columns and 2 rows.
    # Let's inspect where the vertical gap between row 0 and row 1 is:
    row_sum = np.sum(alpha > 10, axis=1)
    # find minimum between y = 250 and y = 450
    mid_y_range = range(280, 380)
    best_split_y = min(mid_y_range, key=lambda y: row_sum[y])
    print(f"Row separator around y={best_split_y} (pixel count={row_sum[best_split_y]})")
    
    # For each row, inspect the 3 columns:
    # Row 0
    col_sum_r0 = np.sum(alpha[:best_split_y, :] > 10, axis=0)
    # Split 1 (between col 0 and 1, around 280-380)
    split_x1_r0 = min(range(280, 380), key=lambda x: col_sum_r0[x])
    # Split 2 (between col 1 and 2, around 620-720)
    split_x2_r0 = min(range(620, 720), key=lambda x: col_sum_r0[x])
    print(f"Row 0 column splits: x1={split_x1_r0} (val={col_sum_r0[split_x1_r0]}), x2={split_x2_r0} (val={col_sum_r0[split_x2_r0]})")
    
    # Row 1
    col_sum_r1 = np.sum(alpha[best_split_y:, :] > 10, axis=0)
    split_x1_r1 = min(range(280, 380), key=lambda x: col_sum_r1[x])
    split_x2_r1 = min(range(620, 720), key=lambda x: col_sum_r1[x])
    print(f"Row 1 column splits: x1={split_x1_r1} (val={col_sum_r1[split_x1_r1]}), x2={split_x2_r1} (val={col_sum_r1[split_x2_r1]})")
