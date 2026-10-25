const fs = require('fs');

for (let i = 1; i <= 5; i++) {
  const p = `assets/forest_edges/forest-edge-0${i}.png`;
  const buf = fs.readFileSync(p);
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  console.log(`forest-edge-0${i}.png: ${width}x${height}, colorType=${colorType}, size=${buf.length}`);
}
