const fs = require('fs');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// Replace forest-shared-edges with shared-scale-overlay
const oldEdgesCanvas = `<div class="forest-shared-edges" id="forestSharedEdges" aria-hidden="true">
                <canvas id="forestEdgesCanvas"></canvas>
            </div>`;

const newSharedOverlay = `<div class="shared-scale-overlay" id="sharedScaleOverlay" aria-hidden="true">
                <div class="shared-scale-side shared-scale-left" id="sharedScaleLeft">
                    <div class="shared-scale-img shared-scale-img-left" id="sharedScaleImgLeft"></div>
                </div>
                <div class="shared-scale-side shared-scale-right" id="sharedScaleRight">
                    <div class="shared-scale-img shared-scale-img-right" id="sharedScaleImgRight"></div>
                </div>
            </div>`;

// Remove local bigfour-scale-overlay inside Section 9
const localOverlayPattern = /<!-- Decorative Snake-Scale Parallax Overlay -->\s*<div class="bigfour-scale-overlay" id="bigfourScaleOverlay"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

// Ensure forestEnvironmentGroup wraps both sections
// Remove closing </div> between section 8 and section 9 if present
html = html.replace('        </section>\n        </div>\n\n        <section class="bigfour-chapter-section"', '        </section>\n\n        <!-- SECTION 9: THE BIG FOUR - DEADLIEST DRAW CARD INTERACTION -->\n        <section class="bigfour-chapter-section"');
html = html.replace('        </section>\r\n        </div>\r\n\r\n        <section class="bigfour-chapter-section"', '        </section>\r\n\r\n        <!-- SECTION 9: THE BIG FOUR - DEADLIEST DRAW CARD INTERACTION -->\r\n        <section class="bigfour-chapter-section"');

// Close forestEnvironmentGroup after Section 9
const sec10Start = '<!-- SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE -->';
if (!html.includes('</div>\n\n<!-- SECTION 10') && !html.includes('</div>\r\n\r\n<!-- SECTION 10')) {
    html = html.replace(sec10Start, '</div>\n\n' + sec10Start);
}

// Replace edges
if (html.includes(oldEdgesCanvas)) {
    html = html.replace(oldEdgesCanvas, newSharedOverlay);
    console.log('Replaced forestEdgesCanvas with shared-scale-overlay');
} else {
    // Try flexible replace
    const edgesRegex = /<div class="forest-shared-edges"[\s\S]*?<\/div>/;
    if (edgesRegex.test(html)) {
        html = html.replace(edgesRegex, newSharedOverlay);
        console.log('Replaced forest-shared-edges regex');
    }
}

// Remove local overlay in Section 9
if (localOverlayPattern.test(html)) {
    html = html.replace(localOverlayPattern, '');
    console.log('Removed local bigfour-scale-overlay from section 9');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html');
