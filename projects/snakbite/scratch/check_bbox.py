from PIL import Image

im = Image.open('assets/bigfour_scales_overlay.png')
print('Size:', im.size)
print('Mode:', im.mode)

# Find bounding box for alpha > 10 on the right side
w, h = im.size
pixels = im.load()

right_min_x = w
right_max_x = 0
right_min_y = h
right_max_y = 0

for x in range(w // 2, w):
    for y in range(h):
        r, g, b, a = pixels[x, y]
        if a > 10:
            if x < right_min_x: right_min_x = x
            if x > right_max_x: right_max_x = x
            if y < right_min_y: right_min_y = y
            if y > right_max_y: right_max_y = y

print(f'Right side features: x from {right_min_x} to {right_max_x}, y from {right_min_y} to {right_max_y}')
