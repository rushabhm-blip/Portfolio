const fs = require('fs');
const path = require('path');

const uploadDir = 'C:\\Users\\Tuff\\.gemini\\antigravity-ide\\brain\\796584d2-3f64-44ca-9d97-657e35d69f37\\.user_uploaded';

const files = [
  'media_1792515661746.png',
  'media_1792515661782.png',
  'media_1792515661864.png',
  'media_1792515661898.png',
  'media_1792515661918.png',
  'media_1792515691932.png',
  'media_1792515691973.png',
  'media_1792515692046.png',
  'media_1792515692064.png',
  'media_1792515720042.png'
];

files.forEach((f, idx) => {
  const p = path.join(uploadDir, f);
  const stat = fs.statSync(p);
  console.log(`[${idx}] ${f}: size = ${stat.size}`);
});
