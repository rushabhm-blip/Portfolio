const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const uploadDir = 'C:/Users/Tuff/.gemini/antigravity-ide/brain/04b730ef-ed2a-41a5-9cb5-b5e26e7d8c0d/.user_uploaded';
const targetDir = 'e:/Portfolio/Snakebite Dataviz/snakbite/assets/look_closer';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = [
  'media_1792775386455.png', // frame 1
  'media_1792775394915.png', // frame 2
  'media_1792775407886.png', // frame 3
  'media_1792775417149.png', // frame 4
  'media_1792775424041.png', // frame 5
  'media_1792775465131.png', // frame 6
  'media_1792775472079.png', // frame 7
  'media_1792775480384.png', // frame 8
  'media_1792775488978.png', // frame 9
  'media_1792775499105.png', // frame 10
  'media_1792775525206.png', // frame 11
  'media_1792775538540.png'  // frame 12
];

files.forEach((file, idx) => {
  const src = path.join(uploadDir, file);
  const num = String(idx + 1).padStart(2, '0');
  const dest = path.join(targetDir, `frame-${num}.png`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> frame-${num}.png`);
});
