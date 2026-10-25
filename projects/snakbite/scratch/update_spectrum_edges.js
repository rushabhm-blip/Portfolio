const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const spectrumTarget = `<section class="spectrum-chapter-section" id="spectrum-section" aria-label="Indian Snake Diversity Spectrum">\r\n            <div class="spectrum-text-scrim" aria-hidden="true"></div>`;
const spectrumTargetLF = `<section class="spectrum-chapter-section" id="spectrum-section" aria-label="Indian Snake Diversity Spectrum">\n            <div class="spectrum-text-scrim" aria-hidden="true"></div>`;

const spectrumReplacement = `<section class="spectrum-chapter-section" id="spectrum-section" aria-label="Indian Snake Diversity Spectrum">
            <!-- Illustrated Forest Edges with scroll-controlled snakes -->
            <div class="spectrum-forest-edges" id="spectrumForestEdges" aria-hidden="true">
                <canvas id="spectrumEdgesCanvas"></canvas>
            </div>
            <div class="spectrum-text-scrim" aria-hidden="true"></div>`;

if (html.includes(spectrumTarget)) {
  html = html.replace(spectrumTarget, spectrumReplacement);
  console.log('Inserted forest edges markup in index.html (CRLF)');
} else if (html.includes(spectrumTargetLF)) {
  html = html.replace(spectrumTargetLF, spectrumReplacement);
  console.log('Inserted forest edges markup in index.html (LF)');
} else {
  console.error('Could not find spectrumTarget in index.html!');
}

// Bump cache buster
html = html.replace(/script\.js\?v=[\w_]+/g, 'script.js?v=forestedges_v1');
html = html.replace(/style\.css\?v=[\w_]+/g, 'style.css?v=forestedges_v1');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully.');

// 2. Update style.css
let css = fs.readFileSync('style.css', 'utf8');

const edgeCss = `
/* ==========================================================================
   SECTION 8: ILLUSTRATED FOREST EDGES WITH SCROLL-CONTROLLED SNAKES
   ========================================================================== */
.spectrum-forest-edges {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: hidden;
    z-index: 3;
    opacity: 0;
    transition: opacity 0.4s ease;
    filter: brightness(0.92) saturate(0.94);
}

.spectrum-forest-edges.is-active {
    opacity: 1;
}

#spectrumEdgesCanvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
    pointer-events: none;
}

@media (max-width: 1024px) {
    .spectrum-forest-edges {
        display: none !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    .spectrum-forest-edges {
        transform: none !important;
        transition: none !important;
    }
}
`;

fs.appendFileSync('style.css', edgeCss, 'utf8');
console.log('style.css updated with forest edge styles.');

// 3. Update script.js
let code = fs.readFileSync('script.js', 'utf8');

// Add initSpectrumForestEdges to DOMContentLoaded
const domTarget = `    initSpectrumSection();\r\n    initBigFourSection();`;
const domTargetLF = `    initSpectrumSection();\n    initBigFourSection();`;

const domReplacement = `    initSpectrumSection();\r\n    initSpectrumForestEdges();\r\n    initBigFourSection();`;
const domReplacementLF = `    initSpectrumSection();\n    initSpectrumForestEdges();\n    initBigFourSection();`;

if (code.includes(domTarget)) {
  code = code.replace(domTarget, domReplacement);
  console.log('Added initSpectrumForestEdges to DOMContentLoaded (CRLF)');
} else if (code.includes(domTargetLF)) {
  code = code.replace(domTargetLF, domReplacementLF);
  console.log('Added initSpectrumForestEdges to DOMContentLoaded (LF)');
} else {
  console.error('Could not find domTarget in script.js!');
}

// Implementation of initSpectrumForestEdges
const edgeFunc = `
/**
 * SECTION 8: Illustrated Forest Edges with Scroll-Controlled Snakes
 * - Frames 01–05 (3840x1638 proportional coordinate system)
 * - Frame 01 as stationary vegetation layer (zero leaf/tree flicker)
 * - Tightly masked regions for 4 changing snakes with clean hold/crossfades
 * - Subtle 8-12px scroll-linked parallax
 * - Fade in on entry, fade out on exit
 * - Non-overlapping clearance (> 32px) from chart bounding box
 * - Pointer-events: none, aria-hidden="true"
 */
function initSpectrumForestEdges() {
    const section = document.getElementById('spectrum-section');
    const container = document.getElementById('spectrum-container');
    const wrapper = document.getElementById('spectrumForestEdges');
    const canvas = document.getElementById('spectrumEdgesCanvas');

    if (!section || !container || !wrapper || !canvas) return;

    const ctx = canvas.getContext('2d');
    const SRC_W = 1024;
    const SRC_H = 436;

    // Preload all 5 frames
    const frames = [];
    let loaded = 0;
    for (let i = 1; i <= 5; i++) {
        const img = new Image();
        img.src = \`assets/forest_edges/forest-edge-0\${i}.png\`;
        img.onload = () => {
            loaded++;
            if (loaded === 5) render();
        };
        frames.push(img);
    }

    // 4 tightly registered snake regions in 1024x436
    const SNAKE_REGIONS = [
        { id: 'vine', x: 55, y: 30, w: 105, h: 50 },      // Upper-left branch vine snake
        { id: 'log', x: 60, y: 305, w: 90, h: 65 },       // Lower-left log viper
        { id: 'krait', x: 865, y: 90, w: 75, h: 125 },    // Right trunk banded krait
        { id: 'green', x: 865, y: 320, w: 70, h: 55 }     // Lower-right foliage pit viper
    ];

    function smoothstep(min, max, val) {
        const x = Math.max(0, Math.min(1, (val - min) / (max - min)));
        return x * x * (3 - 2 * x);
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(section.clientWidth * dpr);
        canvas.height = Math.round(section.clientHeight * dpr);
    }

    function render() {
        if (loaded < 5) return;
        if (window.innerWidth <= 1024) {
            wrapper.classList.remove('is-active');
            return;
        }

        const secRect = section.getBoundingClientRect();
        const winH = window.innerHeight;

        // Visibility & Transition Fade calculation
        const entryProgress = (winH - secRect.top) / (winH + secRect.height);
        if (entryProgress <= 0 || entryProgress >= 1) {
            wrapper.classList.remove('is-active');
            return;
        }

        // Fade in during entry, hold 1.0, fade out during exit
        let alpha = 1.0;
        if (entryProgress < 0.16) {
            alpha = entryProgress / 0.16;
        } else if (entryProgress > 0.84) {
            alpha = (1 - entryProgress) / 0.16;
        }
        wrapper.style.opacity = alpha.toFixed(3);
        wrapper.classList.add('is-active');

        // Scroll-driven pose progress (0..1 across chart viewport scroll)
        // 0% -> Frame 1, 25% -> Frame 2, 50% -> Frame 3, 75% -> Frame 4, 100% -> Frame 5
        const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const poseProgress = isReduced ? 0 : Math.max(0, Math.min(1, (winH * 0.75 - secRect.top) / (secRect.height * 1.1)));

        // Subtle 8-12px parallax
        const parallaxY = isReduced ? 0 : (entryProgress - 0.5) * 16;

        const cw = canvas.width;
        const ch = canvas.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cssW = section.clientWidth;
        const cssH = section.clientHeight;

        ctx.clearRect(0, 0, cw, ch);

        // Proportional sizing & clearance
        // The clear center in 1024x436 spans x: 285 to 735 (450px = 43.95%)
        const chartRect = container.getBoundingClientRect();
        const requiredClearWidth = Math.max(chartRect.width + 72, 1140);
        const renderWidth = Math.max(cssW, requiredClearWidth / 0.4395);
        const renderHeight = renderWidth / (SRC_W / SRC_H);

        const drawX = (cssW - renderWidth) / 2;
        const drawY = (cssH - renderHeight) / 2 + parallaxY;

        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.translate(drawX, drawY);

        // 1. Draw Frame 01 as the stationary vegetation layer (stable foliage)
        ctx.drawImage(frames[0], 0, 0, renderWidth, renderHeight);

        // 2. Animate masked snake regions
        if (!isReduced && poseProgress > 0.01) {
            const scaled = poseProgress * 4;
            const idxA = Math.min(3, Math.floor(scaled));
            const idxB = idxA + 1;
            const frac = scaled - idxA;
            const blend = smoothstep(0.35, 0.65, frac);

            const scaleX = renderWidth / SRC_W;
            const scaleY = renderHeight / SRC_H;

            SNAKE_REGIONS.forEach(reg => {
                ctx.save();

                // Elliptical clip path centered around the snake
                const cx = (reg.x + reg.w / 2) * scaleX;
                const cy = (reg.y + reg.h / 2) * scaleY;
                const rx = (reg.w / 2) * scaleX;
                const ry = (reg.h / 2) * scaleY;

                ctx.beginPath();
                ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
                ctx.clip();

                // Draw Pose A if idxA > 0
                if (idxA > 0) {
                    ctx.globalAlpha = 1.0 - blend;
                    ctx.drawImage(frames[idxA], 0, 0, renderWidth, renderHeight);
                }

                // Draw Pose B
                if (blend > 0) {
                    ctx.globalAlpha = blend;
                    ctx.drawImage(frames[idxB], 0, 0, renderWidth, renderHeight);
                }

                ctx.restore();
            });
        }

        ctx.restore();
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                render();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        resizeCanvas();
        render();
    });

    resizeCanvas();
    render();
}
`;

code += edgeFunc;
fs.writeFileSync('script.js', code, 'utf8');
console.log('script.js updated with initSpectrumForestEdges.');
