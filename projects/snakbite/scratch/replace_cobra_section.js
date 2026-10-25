const fs = require('fs');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

const oldSec10Regex = /<!-- SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE -->[\s\S]*?<\/section>/;

const newSec10Html = `<!-- SECTION 10: LOOK CLOSER - SCROLL-DRIVEN COBRA ANATOMY SEQUENCE -->
        <section class="lookcloser-section" id="lookcloser-section" aria-label="Indian cobra anatomy sequence">
            <div class="lookcloser-sticky-viewport" id="lookcloserStickyViewport">
                <div class="lookcloser-stage-wrapper" id="lookcloserStageWrapper">
                    <canvas id="lookcloserCanvas" role="img" aria-label="Scroll-driven anatomical study of the Indian cobra (Naja naja)"></canvas>
                </div>
            </div>
        </section>`;

if (oldSec10Regex.test(html)) {
    html = html.replace(oldSec10Regex, newSec10Html);
    console.log('Successfully updated Section 10 in index.html');
} else {
    console.error('Could not find Section 10 in index.html');
}
fs.writeFileSync('index.html', html, 'utf8');

// 2. UPDATE style.css
let css = fs.readFileSync('style.css', 'utf8');
css = css.replace(/\r\n/g, '\n');

const cssSec10Header = '/* ==========================================================================\n   SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE\n   ========================================================================== */';

const newSec10Css = `/* ==========================================================================
   SECTION 10: LOOK CLOSER - SCROLL-DRIVEN COBRA ANATOMY SEQUENCE
   ========================================================================== */

.lookcloser-section {
    position: relative;
    width: 100%;
    height: 600vh; /* 600vh scroll interval for comfortable annotation reading */
    background: transparent;
    z-index: 10;
}

.lookcloser-sticky-viewport {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 11;
    opacity: 0;
    transition: opacity 0.3s ease-out;
}

.lookcloser-stage-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

canvas#lookcloserCanvas {
    display: block;
    max-width: 100vw;
    max-height: 100vh;
    aspect-ratio: 16 / 9;
    object-fit: contain;
    filter: drop-shadow(0 12px 32px rgba(0, 0, 0, 0.55));
}

@media (max-width: 768px) {
    .lookcloser-section {
        height: 550vh;
    }
}

@media (prefers-reduced-motion: reduce) {
    .lookcloser-section {
        height: 100vh;
    }
    .lookcloser-sticky-viewport {
        opacity: 1 !important;
        position: relative;
    }
}
`;

const idxCss10 = css.indexOf(cssSec10Header);
if (idxCss10 !== -1) {
    css = css.substring(0, idxCss10) + newSec10Css;
    console.log('Successfully updated Section 10 in style.css');
} else {
    console.error('Could not find Section 10 in style.css');
}
fs.writeFileSync('style.css', css, 'utf8');

// 3. UPDATE script.js
let js = fs.readFileSync('script.js', 'utf8');
js = js.replace(/\r\n/g, '\n');

const jsSec10Header = '/**\n * SECTION 10: Look Closer - Scroll-Driven Illustration Sequence';

const newLookCloserFunc = `/**
 * SECTION 10: Indian Cobra Scroll-Driven Anatomy Sequence
 * - 180 transparent PNGs (cobra-000.png to cobra-179.png)
 * - 1280x720 16:9 contain-fit canvas rendering over dark-green forest background
 * - Direct scroll-driven playback: frameIndex = Math.round(progress * 179)
 * - Scroll down advances, scroll up reverses, stopping freezes displayed frame
 * - Predictive preloading around playhead with bounded cache
 * - Retains last rendered frame while preloading to prevent blank flashes
 * - Smooth entry/exit stage opacity transitions
 * - Supports prefers-reduced-motion with static representative frame
 */
function initLookCloserSection() {
    const section = document.getElementById('lookcloser-section');
    const viewport = document.getElementById('lookcloserStickyViewport');
    const canvas = document.getElementById('lookcloserCanvas');

    if (!section || !viewport || !canvas) return;

    const ctx = canvas.getContext('2d');
    const TOTAL_FRAMES = 180;
    const MAX_INDEX = TOTAL_FRAMES - 1; // 179
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Cache management: store loaded HTMLImageElement objects
    const isMobile = window.innerWidth <= 768;
    const MAX_CACHE_SIZE = isMobile ? 40 : 80;
    const frameCache = new Map(); // index -> Image
    let lastRenderedIndex = -1;
    let currentTargetIndex = 0;
    let isTicking = false;

    function getFramePath(idx) {
        const pad = String(idx).padStart(3, '0');
        return \`assets/cobra_sequence/cobra-\${pad}.png\`;
    }

    function loadFrame(idx, callback) {
        if (frameCache.has(idx)) {
            const img = frameCache.get(idx);
            frameCache.delete(idx);
            frameCache.set(idx, img);
            if (img.complete && img.naturalWidth > 0) {
                if (callback) callback(img);
                return img;
            }
        }

        const img = new Image();
        img.src = getFramePath(idx);
        img.onload = () => {
            if (callback) callback(img);
        };

        // Bounded eviction: evict frame farthest from current playhead
        if (frameCache.size >= MAX_CACHE_SIZE) {
            let farthestIdx = -1;
            let maxDist = -1;
            for (const key of frameCache.keys()) {
                const dist = Math.abs(key - currentTargetIndex);
                if (dist > maxDist) {
                    maxDist = dist;
                    farthestIdx = key;
                }
            }
            if (farthestIdx !== -1 && maxDist > 12) {
                frameCache.delete(farthestIdx);
            }
        }

        frameCache.set(idx, img);
        return img;
    }

    function preloadNearby(centerIdx) {
        const ahead = isMobile ? 8 : 16;
        const behind = isMobile ? 4 : 8;

        for (let i = 1; i <= ahead; i++) {
            const idx = centerIdx + i;
            if (idx <= MAX_INDEX && !frameCache.has(idx)) {
                loadFrame(idx);
            }
        }
        for (let i = 1; i <= behind; i++) {
            const idx = centerIdx - i;
            if (idx >= 0 && !frameCache.has(idx)) {
                loadFrame(idx);
            }
        }
    }

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Fit 16:9 (1280 x 720) inside viewport
        let displayW = vw;
        let displayH = vw * (720 / 1280);
        if (displayH > vh) {
            displayH = vh;
            displayW = vh * (1280 / 720);
        }

        canvas.style.width = Math.round(displayW) + 'px';
        canvas.style.height = Math.round(displayH) + 'px';

        canvas.width = Math.round(displayW * dpr);
        canvas.height = Math.round(displayH * dpr);

        if (lastRenderedIndex >= 0 && frameCache.has(lastRenderedIndex)) {
            drawFrameImage(frameCache.get(lastRenderedIndex));
        }
    }

    function drawFrameImage(img) {
        if (!img || !img.complete || img.naturalWidth === 0) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }

    function render(targetIdx) {
        currentTargetIndex = targetIdx;
        preloadNearby(targetIdx);

        if (frameCache.has(targetIdx)) {
            const img = frameCache.get(targetIdx);
            if (img.complete && img.naturalWidth > 0) {
                drawFrameImage(img);
                lastRenderedIndex = targetIdx;
                return;
            }
        }

        // Keep last frame visible while target decodes to eliminate blank flashes
        loadFrame(targetIdx, (img) => {
            if (currentTargetIndex === targetIdx) {
                drawFrameImage(img);
                lastRenderedIndex = targetIdx;
            }
        });
    }

    function onScroll() {
        const rect = section.getBoundingClientRect();
        const vh = window.innerHeight;

        // Stage Visibility
        if (rect.bottom <= 0 || rect.top >= vh) {
            viewport.style.opacity = '0';
            viewport.style.visibility = 'hidden';
            return;
        }

        viewport.style.visibility = 'visible';

        // Stage Entry & Exit Opacity Transitions
        let fade = 1.0;
        if (rect.top > 0) {
            fade = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.35)));
        } else if (rect.bottom < vh) {
            fade = Math.max(0, Math.min(1, rect.bottom / (vh * 0.35)));
        }
        viewport.style.opacity = fade.toFixed(3);

        // Progress across section interval
        const totalScrollable = rect.height - vh;
        let progress = 0;
        if (totalScrollable > 0) {
            progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
        }

        if (prefersReducedMotion) {
            render(0);
        } else {
            const targetIndex = Math.round(progress * MAX_INDEX);
            if (targetIndex !== lastRenderedIndex) {
                render(targetIndex);
            }
        }
    }

    function scheduleUpdate() {
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(() => {
                onScroll();
                isTicking = false;
            });
        }
    }

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', () => {
        resizeCanvas();
        scheduleUpdate();
    }, { passive: true });

    // Initial setup: load first frame before revealing stage
    resizeCanvas();
    loadFrame(0, (img) => {
        drawFrameImage(img);
        lastRenderedIndex = 0;
        preloadNearby(0);
        onScroll();
    });
}
`;

const idxJs10 = js.indexOf(jsSec10Header);
if (idxJs10 !== -1) {
    js = js.substring(0, idxJs10) + newLookCloserFunc;
    console.log('Successfully updated Section 10 in script.js');
} else {
    console.error('Could not find Section 10 in script.js');
}
fs.writeFileSync('script.js', js, 'utf8');
console.log('All files updated successfully.');
