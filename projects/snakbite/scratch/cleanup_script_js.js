const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

// Remove initLookCloserSection(); from DOMContentLoaded
js = js.replace(/\s*initLookCloserSection\(\);/, '');

// Remove the function and doc comment at the end
const marker = '/**\n * SECTION 10: Indian Cobra Scroll-Driven Anatomy Sequence';
let idx = js.indexOf(marker);
if (idx === -1) {
    idx = js.indexOf('/**\r\n * SECTION 10: Indian Cobra Scroll-Driven Anatomy Sequence');
}

if (idx !== -1) {
    js = js.substring(0, idx).trimEnd() + '\n';
    console.log('Removed initLookCloserSection function from script.js');
} else {
    console.warn('Could not find initLookCloserSection marker in script.js');
}

fs.writeFileSync('script.js', js);
console.log('Updated script.js successfully!');
