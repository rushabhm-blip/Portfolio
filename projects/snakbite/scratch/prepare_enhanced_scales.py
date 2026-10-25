from PIL import Image
import numpy as np

# Load the original asset
im = Image.open('C:/Users/Tuff/.gemini/antigravity-ide/brain/326e9f21-a059-44c4-b5f0-8694a0a32cb8/.user_uploaded/media_1792834536945.png')
arr = np.array(im, dtype=np.float32)

# Left side (x < 840) is kept 100% untouched
# Right side (x >= 842) has its line contrast enhanced cleanly
# Let's inspect right side alpha
r_alpha = arr[:, 842:, 3] / 255.0

# We want linework to have strong alpha (up to ~240) so when rendered at right-side opacity ~0.45-0.50,
# it is clearly readable while preserving the anti-aliased edge quality.
# Power curve + scale factor:
# For r_alpha > 0.02:
mask = r_alpha > 0.01
boosted_alpha = np.zeros_like(r_alpha)
# Non-linear boost that lifts faint linework and solidifies strokes
boosted_alpha[mask] = np.clip(np.power(r_alpha[mask], 0.65) * 1.55, 0.0, 1.0)

arr[:, 842:, 3] = boosted_alpha * 255.0

# Also check stroke RGB: preserve sage tone exactly, slightly clarify the midtone strokes
# Muted sage color is roughly (70, 85, 58)
r_rgb = arr[:, 842:, :3]
# Ensure RGB values stay within muted sage range, slightly cleaner
arr[:, 842:, :3] = np.clip(r_rgb * 1.08, 0, 255)

out = Image.fromarray(arr.astype(np.uint8))
out.save('assets/bigfour_scales_overlay.png')
print('Successfully saved enhanced assets/bigfour_scales_overlay.png')
print('Left side bbox:', out.crop((0, 0, 300, out.height)).getbbox())
print('Right side bbox:', out.crop((842, 0, out.width, out.height)).getbbox())
