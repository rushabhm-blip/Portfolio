const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const indexPath = path.join(baseDir, 'index.html');
const cssPath = path.join(baseDir, 'style.css');
const jsPath = path.join(baseDir, 'script.js');

// 1. UPDATE index.html
let html = fs.readFileSync(indexPath, 'utf8');

// Top nav button
const startNavHtml = `
    <!-- Top Navigation: Go Back to Projects -->
    <header class="story-top-nav" id="storyTopNav">
        <a href="/#projects" class="story-back-btn" id="storyStartBackBtn" aria-label="Go back to projects">
            <svg class="story-back-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Go back to projects</span>
        </a>
    </header>
`;

if (!html.includes('story-top-nav')) {
    html = html.replace(
        /(<main\s+class="story-container"\s+id="story-root">)/i,
        `${startNavHtml}\n    $1`
    );
}

// End button in closing-section
const oldClosingWrapPattern = /<div class="closing-return-wrap">[\s\S]*?<a href="#hero-screen" class="closing-return-link" id="closingReturnBtn"[\s\S]*?<\/div>/i;

const newClosingActionsHtml = `<div class="closing-actions-wrap">
                    <a href="/#projects" class="closing-projects-btn" id="closingProjectsBtn" aria-label="Go back to projects">
                        <svg class="closing-btn-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        <span>Go back to projects</span>
                    </a>

                    <a href="#hero-screen" class="closing-return-link" id="closingReturnBtn" aria-label="Return to the beginning of the story">
                        <svg class="closing-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                        <span>Back to the story</span>
                    </a>
                </div>`;

if (oldClosingWrapPattern.test(html)) {
    html = html.replace(oldClosingWrapPattern, newClosingActionsHtml);
} else if (!html.includes('closingProjectsBtn')) {
    console.warn('Pattern did not match closing-return-wrap, inspecting...');
}

// Cache bust CSS and JS
html = html.replace(/style\.css\?v=[^"']+/g, 'style.css?v=nav_v1');
html = html.replace(/script\.js\?v=[^"']+/g, 'script.js?v=nav_v1');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html updated successfully!');

// 2. UPDATE style.css
let css = fs.readFileSync(cssPath, 'utf8');

const navStyles = `
/* ==========================================================================
   BACK TO PROJECTS NAVIGATION (START & END BUTTONS)
   ========================================================================== */

/* Start Screen Floating Top Navigation */
.story-top-nav {
    position: fixed;
    top: clamp(18px, 2.8vh, 32px);
    left: clamp(18px, 3.2vw, 38px);
    z-index: 9999;
    pointer-events: auto;
}

.story-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 20px 10px 14px;
    border-radius: 9999px;
    background: rgba(7, 31, 24, 0.76);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(168, 185, 163, 0.28);
    color: #EEECE3;
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.02em;
    text-decoration: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.story-back-btn:hover {
    background: rgba(14, 46, 36, 0.92);
    border-color: rgba(168, 185, 163, 0.55);
    color: #FFFFFF;
    transform: translateY(-2px);
    box-shadow: 0 8px 26px rgba(0, 0, 0, 0.55), 0 0 16px rgba(168, 185, 163, 0.22);
}

.story-back-btn:focus-visible {
    outline: 2px solid #EEECE3;
    outline-offset: 4px;
}

.story-back-arrow {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.story-back-btn:hover .story-back-arrow {
    transform: translateX(-4px);
}

/* Closing Screen: Actions Wrap & Back to Projects Button */
.closing-actions-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.42s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.42s;
}

.closing-projects-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 13px 30px 13px 22px;
    border-radius: 9999px;
    background: rgba(238, 236, 227, 0.95);
    color: #071F18;
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.02em;
    text-decoration: none;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), 0 0 16px rgba(238, 236, 227, 0.15);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.closing-projects-btn:hover {
    background: #FFFFFF;
    color: #05140F;
    transform: translateY(-2px);
    box-shadow: 0 10px 32px rgba(0, 0, 0, 0.55), 0 0 24px rgba(238, 236, 227, 0.3);
}

.closing-projects-btn:focus-visible {
    outline: 2px solid #EEECE3;
    outline-offset: 4px;
}

.closing-btn-arrow {
    transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.closing-projects-btn:hover .closing-btn-arrow {
    transform: translateX(-4px);
}

.closing-screen.is-revealed .closing-actions-wrap {
    opacity: 1;
    transform: translateY(0);
}

@media (max-width: 768px) {
    .story-top-nav {
        top: 14px;
        left: 14px;
    }
    .story-back-btn {
        padding: 8px 14px 8px 10px;
        font-size: 13px;
        gap: 8px;
    }
    .closing-projects-btn {
        padding: 12px 24px 12px 18px;
        font-size: 14px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .closing-actions-wrap {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
    }
    .story-back-btn:hover,
    .closing-projects-btn:hover {
        transform: none !important;
    }
}
`;

if (!css.includes('.story-top-nav')) {
    css += `\n${navStyles}\n`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('style.css updated successfully!');
} else {
    console.log('style.css already has nav styles.');
}

// 3. UPDATE script.js
let js = fs.readFileSync(jsPath, 'utf8');

const navJs = `
    // Enhanced navigation for Go back to projects buttons (start & end)
    const backToProjectsBtns = [
        document.getElementById('storyStartBackBtn'),
        document.getElementById('closingProjectsBtn')
    ];

    backToProjectsBtns.forEach((btn) => {
        if (!btn) return;
        btn.addEventListener('click', (e) => {
            // Support local file testing protocol seamlessly
            if (window.location.protocol === 'file:') {
                e.preventDefault();
                window.location.href = '../../index.html#projects';
            }
        });
    });
`;

if (!js.includes('backToProjectsBtns')) {
    // Append inside DOMContentLoaded or at end of file
    js += `\n(function initBackToProjectsNav() {\n${navJs}\n})();\n`;
    fs.writeFileSync(jsPath, js, 'utf8');
    console.log('script.js updated successfully!');
}
