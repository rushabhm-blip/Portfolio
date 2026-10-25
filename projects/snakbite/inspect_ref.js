const fs = require('fs');

// Let's inspect img_9.png dimensions and element locations
// In inspect_frames.html, img_9 had width=1024, height=576
// Villager: x=666, y=0, w=357, h=440 (wait, img_9 villager is on the right)
// Let's create an html file showing img_9 overlaid or marked with coordinates
const html = `<!DOCTYPE html>
<html>
<head>
<style>
body { margin: 0; background: #000; color: #fff; font-family: sans-serif; }
.container { position: relative; width: 1024px; height: 576px; margin: 20px auto; }
img { width: 100%; height: 100%; display: block; }
.grid-line { position: absolute; background: rgba(255,255,0,0.4); }
</style>
</head>
<body>
<div class="container">
  <img src="assets/frames/img_9.png">
</div>
</body>
</html>`;

fs.writeFileSync('inspect_ref.html', html);
console.log('inspect_ref.html written');
