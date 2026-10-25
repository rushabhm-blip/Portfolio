const fs = require('fs');
const path = require('path');

const places = [
  'c:/Users/Tuff/Downloads',
  'c:/Users/Tuff/Desktop',
  'c:/Users/Tuff/Documents',
  'e:/Portfolio/Snakebite Dataviz/snakbite'
];

for (const p of places) {
  try {
    const files = fs.readdirSync(p);
    for (const f of files) {
      if (f.endsWith('.json') || f.includes('animation') || f.includes('plan')) {
        console.log(p + '/' + f);
      }
    }
  } catch(e) {}
}
