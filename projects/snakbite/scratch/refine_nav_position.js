const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const indexPath = path.join(baseDir, 'index.html');
const cssPath = path.join(baseDir, 'style.css');

// 1. UPDATE index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Remove any existing story-top-nav from outside hero-screen
html = html.replace(/<!-- Top Navigation: Go Back to Projects -->[\s\S]*?<\/header>/gi, '');

// Place start navigation cleanly inside #hero-screen
const startNavHtml = `            <!-- Start Navigation: Go Back to Projects -->
            <header class="story-top-nav" id="storyTopNav">
                <a href="/#projects" class="story-back-btn" id="storyStartBackBtn" aria-label="Go back to projects">
                    <svg class="story-back-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    <span>Go back to projects</span>
                </a>
            </header>`;

html = html.replace(
    /(<section\s+class="hero-screen"\s+id="hero-screen"[^>]*>)/i,
    `$1\n${startNavHtml}`
);

// Cache buster
html = html.replace(/style\.css\?v=[^"']+/g, 'style.css?v=nav_v2');
html = html.replace(/script\.js\?v=[^"']+/g, 'script.js?v=nav_v2');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html updated with absolute start button in hero!');

// 2. UPDATE style.css
let css = fs.readFileSync(cssPath, 'utf8');

// Update .story-top-nav position to absolute
css = css.replace(
    /\.story-top-nav\s*\{[^}]*\}/g,
    `.story-top-nav {
    position: absolute;
    top: clamp(20px, 3vh, 36px);
    left: clamp(20px, 3.5vw, 44px);
    z-index: 50;
    pointer-events: auto;
}`
);

fs.writeFileSync(cssPath, css, 'utf8');
console.log('style.css updated successfully with absolute positioning for start button!');
