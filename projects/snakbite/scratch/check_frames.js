const fs = require('fs');
const path = require('path');

const uploadDir = 'C:/Users/Tuff/.gemini/antigravity-ide/brain/04b730ef-ed2a-41a5-9cb5-b5e26e7d8c0d/.user_uploaded';
const files = [
  'media_1792775386455.png', // 1
  'media_1792775394915.png', // 2
  'media_1792775407886.png', // 3
  'media_1792775417149.png', // 4
  'media_1792775424041.png', // 5
  'media_1792775465131.png', // 6
  'media_1792775472079.png', // 7
  'media_1792775480384.png', // 8
  'media_1792775488978.png', // 9
  'media_1792775499105.png', // 10
  'media_1792775525206.png', // 11
  'media_1792775538540.png'  // 12
];

files.forEach((file, idx) => {
  const p = path.join(uploadDir, file);
  if (!fs.existsSync(p)) {
    console.log(file, 'DOES NOT EXIST');
    return;
  }
  const buf = fs.readFileSync(p);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const name = 'frame-' + String(idx + 1).padStart(2, '0') + '.png';
  console.log(name + ': ' + width + 'x' + height + ' (' + buf.length + ' bytes)');
});
