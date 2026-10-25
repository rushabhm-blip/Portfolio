const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<style>
body { background: #03120B; color: #fff; font-family: sans-serif; padding: 20px; }
.card { display: inline-block; margin: 10px; border: 1px solid #444; padding: 10px; vertical-align: top; background: #0b1a13; }
.crop-villager { width: 350px; height: 420px; overflow: hidden; position: relative; border: 1px solid #555; }
.crop-villager img { position: absolute; left: -660px; top: -100px; }
.crop-snake { width: 350px; height: 120px; overflow: hidden; position: relative; border: 1px solid #555; margin-top: 5px; }
.crop-snake img { position: absolute; top: -430px; }
</style>
</head>
<body>
<h1>Examine Villager & Snake (0 to 8)</h1>
${[0,1,2,3,4,5,6,7,8].map(i => `
  <div class="card">
    <h3>img_${i}.png</h3>
    <div class="crop-villager"><img src="assets/frames/img_${i}.png"></div>
    <div class="crop-snake"><img src="assets/frames/img_${i}.png" style="left: ${i===0?'-150px':i===1?'0px':i===2?'-380px':i===3?'-300px':'-450px'}"></div>
  </div>
`).join('')}
</body>
</html>`;

fs.writeFileSync('compare_detail.html', html);
console.log('compare_detail.html written');
