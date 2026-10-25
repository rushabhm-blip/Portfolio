import os
from PIL import Image

out_dir = r'e:\Portfolio\Snakebite Dataviz\snakbite\assets\diversity'
bg = Image.open(os.path.join(out_dir, 'diversity_bg.jpg')).convert('RGBA')

# In our extraction:
# green-01 has canvas 420x240, sprite was at (44, 114) with size (332, 107)
# At scale 0.70: sprite is 232x75
# To place sprite at (82, 132), canvas top-left should be:
# canvas_x = 82 - int(44 * 0.70) = 82 - 31 = 51
# canvas_y = 132 - int(114 * 0.70) = 132 - 80 = 52
scale = 0.70

def place_snake(name, target_sprite_x, target_sprite_y, sprite_in_canvas_x, sprite_in_canvas_y, cw, ch):
    f = Image.open(os.path.join(out_dir, f"{name}-01.png"))
    scaled = f.resize((int(cw * scale), int(ch * scale)), Image.Resampling.LANCZOS)
    cx = target_sprite_x - int(sprite_in_canvas_x * scale)
    cy = target_sprite_y - int(sprite_in_canvas_y * scale)
    bg.alpha_composite(scaled, (cx, cy))
    print(f"{name}: canvas pos=({cx}, {cy}), canvas size=({scaled.width}, {scaled.height})")

place_snake('green', 82, 132, 44, 114, 420, 240)
place_snake('cobra', 792, 72, 19, 25, 350, 350)
place_snake('brown', 72, 466, 42, 151, 420, 260)
place_snake('banded', 705, 462, 47, 124, 460, 220)

bg.convert('RGB').save('scratch/exact_alignment_test.jpg', quality=95)
print("Saved exact_alignment_test.jpg!")
