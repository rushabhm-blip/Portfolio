const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

// 1. Add initBigFourScaleParallax call inside DOMContentLoaded
const domLoadedTarget = '    initBigFourSection();';
const domLoadedReplacement = '    initBigFourSection();\n    initBigFourScaleParallax();';

if (js.includes(domLoadedTarget) && !js.includes('initBigFourScaleParallax();')) {
    js = js.replace(domLoadedTarget, domLoadedReplacement);
    console.log('Added initBigFourScaleParallax to DOMContentLoaded');
} else {
    console.log('DOMContentLoaded target check:', js.includes(domLoadedTarget));
}

// 2. Add the initBigFourScaleParallax function before initBigFourSection
const funcDef = `
/**
 * SECTION 9: Decorative Snake-Scale Parallax Overlay
 * - Left illustration: translateY from +12px to -12px across section scroll
 * - Right illustration: translateY from -8px to +8px across section scroll
 * - Opacity fades in/out with Section 9 visibility
 */
function initBigFourScaleParallax() {
    const section = document.getElementById('bigfour-section');
    const overlay = document.getElementById('bigfourScaleOverlay');
    const leftImg = document.getElementById('bigfourScaleImgLeft');
    const rightImg = document.getElementById('bigfourScaleImgRight');

    if (!section || !overlay || !leftImg || !rightImg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseOpacity = 0.16;
    let isTicking = false;

    function updateParallax() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        // Check if section is within or near viewport
        if (rect.bottom <= 0 || rect.top >= vh) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            return;
        }

        overlay.style.visibility = 'visible';

        // 1. Calculate section entry/exit fade visibility
        let fade = 1.0;
        if (rect.top > 0) {
            // Entering from Section 8
            fade = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.45)));
        } else if (rect.bottom < vh) {
            // Exiting toward Section 10
            fade = Math.max(0, Math.min(1, rect.bottom / (vh * 0.45)));
        }
        overlay.style.opacity = (baseOpacity * fade).toFixed(3);

        // 2. Calculate normalized scroll progress p from 0 to 1 across Section 9's scroll interval
        const totalDistance = rect.height + vh;
        const currentProgress = vh - rect.top;
        const p = Math.max(0, Math.min(1, currentProgress / totalDistance));

        // 3. Restrained parallax movement
        if (prefersReducedMotion) {
            leftImg.style.transform = 'translate3d(0, 0, 0)';
            rightImg.style.transform = 'translate3d(0, 0, 0)';
        } else {
            // Left illustration: translateY from +12px to -12px
            const leftY = 12 - (24 * p);
            // Right illustration: translateY from -8px to +8px
            const rightY = -8 + (16 * p);

            leftImg.style.transform = \`translate3d(0, \${leftY.toFixed(2)}px, 0)\`;
            rightImg.style.transform = \`translate3d(0, \${rightY.toFixed(2)}px, 0)\`;
        }
    }

    function onScroll() {
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(() => {
                updateParallax();
                isTicking = false;
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    updateParallax();
}
`;

const bigFourFuncHeader = 'function initBigFourSection() {';
if (js.includes(bigFourFuncHeader) && !js.includes('function initBigFourScaleParallax()')) {
    js = js.replace(bigFourFuncHeader, funcDef + '\n' + bigFourFuncHeader);
    console.log('Added initBigFourScaleParallax function definition');
} else {
    console.log('initBigFourSection check:', js.includes(bigFourFuncHeader));
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully updated script.js');
