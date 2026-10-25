const fs = require('fs');
const path = require('path');

const uploadDir = 'C:/Users/Tuff/.gemini/antigravity-ide/brain/04b730ef-ed2a-41a5-9cb5-b5e26e7d8c0d/.user_uploaded';
const targetDir = 'e:/Portfolio/Snakebite Dataviz/snakbite/assets/forest_edges';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// In chronological order:
const files = [
  'media_1792781499754.png', // 1
  'media_1792781499801.png', // 2
  'media_1792781500059.png', // 3
  'media_1792781500221.png', // 4
  'media_1792781500286.png'  // 5
];

files.forEach((file, idx) => {
  const src = path.join(uploadDir, file);
  const num = String(idx + 1).padStart(2, '0');
  const dest = path.join(targetDir, `forest-edge-${num}.png`);
  fs.copyFileSync(src, dest);
  console.log(`Copied ${file} -> forest-edge-${num}.png`);
});
