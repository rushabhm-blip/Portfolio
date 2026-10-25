const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Find end of section 8 and start of section 9
const section8End = '</section>';
const section9Start = '<section class="bigfour-chapter-section" id="bigfour-section" aria-label="The Big Four - Deadliest Draw">';

const idx9 = html.indexOf(section9Start);
if (idx9 === -1) {
    console.error('Section 9 not found');
    process.exit(1);
}

// Find the last </section> before section 9
const idx8End = html.lastIndexOf(section8End, idx9);
if (idx8End === -1) {
    console.error('Section 8 end not found');
    process.exit(1);
}

const beforeSec8End = html.substring(0, idx8End + section8End.length);
const between = html.substring(idx8End + section8End.length, idx9);
const fromSec9 = html.substring(idx9);

// We want to insert </div> right after </section> of Section 8:
const newBetween = '\n        </div>\n\n        ';

// Inside section 9, right after <div class="bigfour-text-scrim" aria-hidden="true"></div>
const scrimTag = '<div class="bigfour-text-scrim" aria-hidden="true"></div>';
const idxScrim = fromSec9.indexOf(scrimTag);

const overlaySnippet = `<!-- Decorative Snake-Scale Parallax Overlay -->
            <div class="bigfour-scale-overlay" id="bigfourScaleOverlay" aria-hidden="true">
                <div class="bigfour-scale-side bigfour-scale-left">
                    <div class="bigfour-scale-img bigfour-scale-img-left" id="bigfourScaleImgLeft"></div>
                </div>
                <div class="bigfour-scale-side bigfour-scale-right">
                    <div class="bigfour-scale-img bigfour-scale-img-right" id="bigfourScaleImgRight"></div>
                </div>
            </div>\n\n            `;

let updatedSec9 = fromSec9;
if (!fromSec9.includes('bigfour-scale-overlay')) {
    updatedSec9 = fromSec9.substring(0, idxScrim) + overlaySnippet + fromSec9.substring(idxScrim);
}

const finalHtml = beforeSec8End + newBetween + updatedSec9;
fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Successfully updated index.html');
