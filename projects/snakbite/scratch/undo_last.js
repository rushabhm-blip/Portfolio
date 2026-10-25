const fs = require('fs');

// 1. Remove from index.html
let html = fs.readFileSync('index.html', 'utf8');
const edgeDiv = `            <!-- Illustrated Forest Edges with scroll-controlled snakes -->\n            <div class="spectrum-forest-edges" id="spectrumForestEdges" aria-hidden="true">\n                <canvas id="spectrumEdgesCanvas"></canvas>\n            </div>\n`;
const edgeDivCRLF = `            <!-- Illustrated Forest Edges with scroll-controlled snakes -->\r\n            <div class="spectrum-forest-edges" id="spectrumForestEdges" aria-hidden="true">\r\n                <canvas id="spectrumEdgesCanvas"></canvas>\r\n            </div>\r\n`;

if (html.includes(edgeDiv)) {
  html = html.replace(edgeDiv, '');
  console.log('Removed edgeDiv (LF) from index.html');
} else if (html.includes(edgeDivCRLF)) {
  html = html.replace(edgeDivCRLF, '');
  console.log('Removed edgeDiv (CRLF) from index.html');
} else {
  // Try regex
  html = html.replace(/\s*<!-- Illustrated Forest Edges with scroll-controlled snakes -->\s*<div class="spectrum-forest-edges" id="spectrumForestEdges" aria-hidden="true">\s*<canvas id="spectrumEdgesCanvas"><\/canvas>\s*<\/div>/g, '');
  console.log('Removed edgeDiv via regex from index.html');
}

// Reset cache busters
html = html.replace(/script\.js\?v=[\w_]+/g, 'script.js?v=lookcloser_v2');
html = html.replace(/style\.css\?v=[\w_]+/g, 'style.css?v=lookcloser_v2');

fs.writeFileSync('index.html', html, 'utf8');

// 2. Remove from style.css
let css = fs.readFileSync('style.css', 'utf8');
const cssMarker = '/* ==========================================================================\r\n   SECTION 8: ILLUSTRATED FOREST EDGES WITH SCROLL-CONTROLLED SNAKES';
const cssMarkerLF = '/* ==========================================================================\n   SECTION 8: ILLUSTRATED FOREST EDGES WITH SCROLL-CONTROLLED SNAKES';

let pos = css.indexOf(cssMarker);
if (pos === -1) pos = css.indexOf(cssMarkerLF);
if (pos !== -1) {
  css = css.slice(0, pos).trimEnd() + '\n';
  fs.writeFileSync('style.css', css, 'utf8');
  console.log('Removed Section 8 forest edge styles from style.css');
} else {
  console.error('Could not find cssMarker in style.css');
}

// 3. Remove from script.js
let js = fs.readFileSync('script.js', 'utf8');

// Remove initSpectrumForestEdges(); call
js = js.replace(/\r?\n\s*initSpectrumForestEdges\(\);/g, '');

// Remove initSpectrumForestEdges function definition
const jsMarker = '/**\r\n * SECTION 8: Illustrated Forest Edges with Scroll-Controlled Snakes';
const jsMarkerLF = '/**\n * SECTION 8: Illustrated Forest Edges with Scroll-Controlled Snakes';

let jsPos = js.indexOf(jsMarker);
if (jsPos === -1) jsPos = js.indexOf(jsMarkerLF);
if (jsPos !== -1) {
  js = js.slice(0, jsPos).trimEnd() + '\n';
  console.log('Removed initSpectrumForestEdges function from script.js');
} else {
  console.error('Could not find jsMarker in script.js');
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('script.js updated successfully.');
