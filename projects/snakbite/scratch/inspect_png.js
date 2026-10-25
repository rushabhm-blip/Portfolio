const fs = require('fs');
const path = require('path');

// Let's inspect the PNG chunks of frame-01.png
const buf = fs.readFileSync('assets/look_closer/frame-01.png');
// PNG header is 8 bytes: 89 50 4E 47 0D 0A 1A 0A
// IHDR chunk is next: length (4), 'IHDR' (4), width (4), height (4), bit depth (1), color type (1), compression (1), filter (1), interlace (1)
const colorType = buf[25];
console.log('Color type:', colorType);
// 0: Grayscale, 2: Truecolor (RGB), 3: Indexed, 4: Grayscale+Alpha, 6: Truecolor+Alpha (RGBA)
if (colorType === 6) {
  console.log('PNG has RGBA alpha channel!');
} else if (colorType === 2) {
  console.log('PNG is RGB (no alpha channel) - white background!');
} else {
  console.log('PNG color type:', colorType);
}
