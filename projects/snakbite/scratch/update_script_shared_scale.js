const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

// 1. Update DOMContentLoaded
js = js.replace('    initSharedForestEdges();\n', '');
js = js.replace('    initSharedForestEdges();\r\n', '');
js = js.replace('    initBigFourScaleParallax();', '    initSharedScaleEnvironment();');

// 2. Define initSharedScaleEnvironment
const sharedScaleFunc = `/**
 * SECTIONS 8 & 9: Continuous Shared Snake-Scale Environment
 * - One continuous sticky decorative layer spanning both Section 8 and Section 9
 * - Fade in on entry to Section 8, stay 100% visible across the boundary, fade out at exit of Section 9
 * - Restrained scroll-linked parallax:
 *   Left illustration: translateY from +12px to -12px across combined scroll
 *   Right illustration: translateY from -8px to +8px across combined scroll
 * - Movement directly tracks scrolling (scroll down advances, scroll up reverses, pause freezes)
 * - Reduced-motion preference disables parallax transforms
 */
function initSharedScaleEnvironment() {
    const group = document.getElementById('forestEnvironmentGroup');
    const overlay = document.getElementById('sharedScaleOverlay');
    const leftImg = document.getElementById('sharedScaleImgLeft');
    const rightImg = document.getElementById('sharedScaleImgRight');

    if (!group || !overlay || !leftImg || !rightImg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isTicking = false;

    function update() {
        const rect = group.getBoundingClientRect();
        const vh = window.innerHeight;

        // Check if group is within or near viewport
        if (rect.bottom <= 0 || rect.top >= vh) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            return;
        }

        overlay.style.visibility = 'visible';

        // 1. Smooth fade at entrance of Section 8 and exit of Section 9
        let fadeProgress = 1.0;
        if (rect.top > 0) {
            // Entering Section 8 from Section 7
            fadeProgress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.45)));
        } else if (rect.bottom < vh) {
            // Exiting Section 9 toward Section 10
            fadeProgress = Math.max(0, Math.min(1, rect.bottom / (vh * 0.45)));
        }
        overlay.style.opacity = fadeProgress.toFixed(3);

        // 2. Normalized progress p from 0 to 1 across the combined height of both sections
        const totalScrollable = rect.height - vh;
        let p = 0;
        if (totalScrollable > 0) {
            const currentScroll = -rect.top;
            p = Math.max(0, Math.min(1, currentScroll / totalScrollable));
        }

        // 3. Gentle scroll-linked movement across the combined area
        if (prefersReducedMotion) {
            leftImg.style.transform = 'translate3d(0, 0, 0)';
            rightImg.style.transform = 'translate3d(0, 0, 0)';
        } else {
            // Left: approximately +12px to -12px vertically
            const leftY = 12 - (24 * p);
            // Right: approximately -8px to +8px vertically
            const rightY = -8 + (16 * p);

            leftImg.style.transform = \`translate3d(0, \${leftY.toFixed(2)}px, 0)\`;
            rightImg.style.transform = \`translate3d(0, \${rightY.toFixed(2)}px, 0)\`;
        }
    }

    function onScroll() {
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(() => {
                update();
                isTicking = false;
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    update();
}
`;

// 3. Replace the old initSharedForestEdges and initBigFourScaleParallax functions
// Find where initSharedForestEdges begins:
const oldFuncStart = 'function initSharedForestEdges() {';
const nextSectionHeader = `/**
 * SECTION 9: The Big Four - Deadliest Draw Card Deck`;

// Normalize crlf
js = js.replace(/\r\n/g, '\n');

const idx1 = js.indexOf(oldFuncStart);
const idx2 = js.indexOf(nextSectionHeader);

if (idx1 !== -1 && idx2 !== -1) {
    // Also remove the doc comment above initSharedForestEdges if desired
    const docStart = js.lastIndexOf('/**', idx1);
    const replaceFrom = docStart !== -1 ? docStart : idx1;
    js = js.substring(0, replaceFrom) + sharedScaleFunc + '\n' + js.substring(idx2);
    console.log('Replaced initSharedForestEdges with initSharedScaleEnvironment');
} else {
    console.error('Could not find old function start/end', idx1, idx2);
}

// Now remove initBigFourScaleParallax
const parallaxStart = '/**\n * SECTION 9: Decorative Snake-Scale Parallax Overlay';
const bigFourSectionFunc = 'function initBigFourSection() {';

const idxPStart = js.indexOf(parallaxStart);
const idxPEnd = js.indexOf(bigFourSectionFunc);

if (idxPStart !== -1 && idxPEnd !== -1) {
    js = js.substring(0, idxPStart) + js.substring(idxPEnd);
    console.log('Removed initBigFourScaleParallax');
} else {
    console.log('initBigFourScaleParallax not found or already removed');
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully updated script.js');
