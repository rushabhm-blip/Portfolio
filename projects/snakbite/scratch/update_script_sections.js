const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

// 1. Add initSharedForestEdges() to DOMContentLoaded
const domTarget = `    initThreatChapter();\r\n    initSpectrumSection();\r\n    initBigFourSection();`;
const domTargetLF = `    initThreatChapter();\n    initSpectrumSection();\n    initBigFourSection();`;

const domReplacement = `    initThreatChapter();\r\n    initSpectrumSection();\r\n    initSharedForestEdges();\r\n    initBigFourSection();`;
const domReplacementLF = `    initThreatChapter();\n    initSpectrumSection();\n    initSharedForestEdges();\n    initBigFourSection();`;

if (js.includes(domTarget)) {
  js = js.replace(domTarget, domReplacement);
  console.log('Added initSharedForestEdges to DOMContentLoaded (CRLF)');
} else if (js.includes(domTargetLF)) {
  js = js.replace(domTargetLF, domReplacementLF);
  console.log('Added initSharedForestEdges to DOMContentLoaded (LF)');
} else {
  console.error('Could not find domTarget in script.js');
  process.exit(1);
}

// 2. Replace initBigFourSection and add initSharedForestEdges
const b4Start = js.indexOf('/**\r\n * SECTION 9: The Big Four - Deadliest Draw Card Deck');
const b4StartLF = js.indexOf('/**\n * SECTION 9: The Big Four - Deadliest Draw Card Deck');
const targetStart = b4Start !== -1 ? b4Start : b4StartLF;

if (targetStart === -1) {
  console.error('Could not find SECTION 9 in script.js');
  process.exit(1);
}

const s10Start = js.indexOf('/**\r\n * SECTION 10: Look Closer - Scroll-Driven Illustration Sequence');
const s10StartLF = js.indexOf('/**\n * SECTION 10: Look Closer - Scroll-Driven Illustration Sequence');
const targetEnd = s10Start !== -1 ? s10Start : s10StartLF;

if (targetEnd === -1) {
  console.error('Could not find SECTION 10 in script.js');
  process.exit(1);
}

const newFunctions = `/**
 * SHARED FOREST ENVIRONMENT (SECTIONS 8 & 9)
 * Decorative forest edges spanning both Section 8 and Section 9
 * - Uses 5 frames: assets/forest_edges/forest-edge-01.png to 05.png
 * - Frame 01 as stationary base foliage (zero leaf/tree flicker)
 * - 4 tightly registered snake regions:
 *     vine:  x: 55,  y: 30,  w: 105, h: 50  (upper-left branch vine snake)
 *     log:   x: 60,  y: 305, w: 90,  h: 65  (lower-left log viper)
 *     krait: x: 865, y: 90,  w: 75,  h: 125 (right trunk banded krait)
 *     green: x: 865, y: 320, w: 70,  h: 55  (lower-right foliage pit viper)
 * - Single continuous scroll progress across forestEnvironmentGroup
 * - Continuous scroll-driven movement: scroll down advances, scroll up reverses, stopping freezes
 * - Subtle 8-16px vertical parallax on decorative vegetation
 * - Smooth fade in at top of Section 8, remains 100% visible through boundary, fades out at end of Section 9
 * - Reduced-motion preference support (static Frame 01, zero motion)
 */
function initSharedForestEdges() {
    const group = document.getElementById('forestEnvironmentGroup');
    const wrapper = document.getElementById('forestSharedEdges');
    const canvas = document.getElementById('forestEdgesCanvas');

    if (!group || !wrapper || !canvas) return;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Preload all 5 frames
    const imgs = [];
    let loadedCount = 0;
    const totalFrames = 5;

    for (let i = 1; i <= totalFrames; i++) {
        const img = new Image();
        img.src = \`assets/forest_edges/forest-edge-0\${i}.png\`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === totalFrames) {
                render();
            }
        };
        imgs.push(img);
    }

    // Offscreen 1024x436 buffer for flicker-free snake pose crossfades
    const bufferCv = document.createElement('canvas');
    bufferCv.width = 1024;
    bufferCv.height = 436;
    const bufferCtx = bufferCv.getContext('2d');

    // 4 registered snake regions in 1024x436
    const SNAKE_REGIONS = [
        { id: 'vine',  x: 55,  y: 30,  w: 105, h: 50 },
        { id: 'log',   x: 60,  y: 305, w: 90,  h: 65 },
        { id: 'krait', x: 865, y: 90,  w: 75,  h: 125 },
        { id: 'green', x: 865, y: 320, w: 70,  h: 55 }
    ];

    function smoothstep(min, max, val) {
        const x = Math.max(0, Math.min(1, (val - min) / (max - min)));
        return x * x * (3 - 2 * x);
    }

    let currentP = 0;
    let targetP = 0;
    let isTicking = false;

    function resizeCanvas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
    }

    function render() {
        if (loadedCount < totalFrames) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const W = canvas.width / dpr;
        const H = canvas.height / dpr;

        // 1. Draw stable stationary base (Frame 01) onto buffer
        bufferCtx.clearRect(0, 0, 1024, 436);
        bufferCtx.drawImage(imgs[0], 0, 0, 1024, 436);

        // 2. Blend snake poses if motion allowed
        if (!prefersReducedMotion && currentP > 0.005) {
            const scaled = currentP * 4;
            const idxA = Math.min(3, Math.floor(scaled));
            const idxB = idxA + 1;
            const frac = scaled - idxA;
            const blend = smoothstep(0.25, 0.75, frac);

            SNAKE_REGIONS.forEach(reg => {
                bufferCtx.save();
                bufferCtx.beginPath();
                bufferCtx.ellipse(reg.x + reg.w / 2, reg.y + reg.h / 2, reg.w / 2, reg.h / 2, 0, 0, Math.PI * 2);
                bufferCtx.clip();

                if (idxA > 0) {
                    bufferCtx.globalAlpha = 1.0 - blend;
                    bufferCtx.drawImage(imgs[idxA], 0, 0, 1024, 436);
                }

                if (blend > 0 && idxB < totalFrames) {
                    bufferCtx.globalAlpha = blend;
                    bufferCtx.drawImage(imgs[idxB], 0, 0, 1024, 436);
                }

                bufferCtx.restore();
            });
        }

        // 3. Render buffer onto main canvas with subtle parallax
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, W, H);

        const parallaxY = prefersReducedMotion ? 0 : (currentP - 0.5) * 16; // 16px parallax travel
        const destH = H + 32;
        const destW = destH * (1024 / 436);
        const halfW = destW / 2;
        const dy = -16 + parallaxY;

        // Left half (source x: 0..512) pinned to left screen edge
        ctx.drawImage(bufferCv, 0, 0, 512, 436, 0, dy, halfW, destH);

        // Right half (source x: 512..1024) pinned to right screen edge
        ctx.drawImage(bufferCv, 512, 0, 512, 436, W - halfW, dy, halfW, destH);

        ctx.restore();
    }

    function onScroll() {
        const rect = group.getBoundingClientRect();
        const vh = window.innerHeight;

        // Opacity management: fade in on entry to Section 8, stay 1.0 throughout, fade out at exit of Section 9
        if (rect.top > 0) {
            // Entering
            const fadeProgress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.35)));
            wrapper.style.opacity = fadeProgress.toFixed(3);
        } else if (rect.bottom < vh) {
            // Exiting
            const fadeProgress = Math.max(0, Math.min(1, rect.bottom / (vh * 0.35)));
            wrapper.style.opacity = fadeProgress.toFixed(3);
        } else {
            // Fully within combined Sections 8 & 9
            wrapper.style.opacity = '1';
        }

        // Scroll progress across combined area
        const totalScrollable = rect.height - vh;
        if (totalScrollable > 0) {
            const currentScroll = -rect.top;
            targetP = Math.max(0, Math.min(1, currentScroll / totalScrollable));
        }

        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(() => {
                currentP = targetP;
                render();
                isTicking = false;
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        resizeCanvas();
        onScroll();
    }, { passive: true });

    resizeCanvas();
    onScroll();
}

/**
 * SECTION 9: The Big Four - Deadliest Draw Card Deck
 * Interaction Logic:
 * - 4 Playing cards with compact, realistic stack layout
 * - Opaque rear cards with vintage card back (zero transparent text ghosting)
 * - Slender portrait aspect ratio (~0.58) with dynamic coordinate measurements
 * - Draw a card button with custom arrow icon
 * - Card index progress indicator (e.g. 1 / 4, 3 / 4)
 * - Reset / Recycle deck once all cards drawn
 * - Horizontal swipe support with non-blocking vertical scroll pass-through
 * - Keyboard accessible (Enter, Space, ArrowRight, ArrowLeft, R)
 */
function initBigFourSection() {
    const stage = document.getElementById('cardStack');
    const drawBtn = document.getElementById('bigfourDrawBtn');
    const drawBtnText = document.getElementById('bigfourDrawBtnText');
    const cardIndexEl = document.getElementById('bigfourCardIndex');

    if (!stage || !drawBtn) return;

    const cards = Array.from(stage.querySelectorAll('.card'));
    if (!cards.length) return;

    let deck = [0, 1, 2, 3];
    let discarded = [];

    function updateDeckLayout() {
        deck.forEach((cardIdx, stackIndex) => {
            const card = cards[cardIdx];
            card.classList.remove('discarded');
            card.classList.add('in-deck');
            card.style.transform = ''; 
            card.style.zIndex = '';
            card.style.opacity = '';
            card.setAttribute('data-index', stackIndex);
        });

        if (deck.length > 0) {
            const activeNum = 4 - deck.length + 1;
            if (cardIndexEl) cardIndexEl.textContent = activeNum;
            if (drawBtnText) drawBtnText.textContent = "Draw a card";
            drawBtn.setAttribute('aria-label', \`Draw a card. Currently showing card \${activeNum} of 4.\`);
        } else {
            if (cardIndexEl) cardIndexEl.textContent = "4";
            if (drawBtnText) drawBtnText.textContent = "Reset deck ↺";
            drawBtn.setAttribute('aria-label', "Reset deck to draw cards again");
        }
    }

    function throwToDiscardPile(card) {
        card.classList.remove('in-deck');
        card.classList.add('discarded');
        
        const cardWidth = card.offsetWidth || 340;
        const offsetX = cardWidth + (window.innerWidth < 640 ? 60 : 140);
        const randomY = (Math.random() - 0.5) * 20;
        const randomRot = 12 + (Math.random() * 8);
        
        card.style.transform = \`translate(\${offsetX}px, \${randomY}px) rotate(\${randomRot}deg) scale(0.92)\`;
        card.style.opacity = '0';
        card.style.zIndex = discarded.length; 
    }

    function drawCard() {
        if (deck.length === 0) {
            collectCards();
            return;
        }

        const topCardIdx = deck.shift();
        discarded.push(topCardIdx);
        
        const topCard = cards[topCardIdx];
        throwToDiscardPile(topCard);
        
        updateDeckLayout();
    }

    function collectCards() {
        if (discarded.length === 0) return;
        
        deck = [...discarded.reverse(), ...deck];
        discarded = [];
        
        updateDeckLayout();
    }

    drawBtn.addEventListener('click', drawCard);

    // Keyboard accessibility on stage and individual cards
    stage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            drawCard();
        } else if (e.key === 'ArrowLeft' || e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            collectCards();
        }
    });

    cards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                e.preventDefault();
                drawCard();
            }
        });
    });

    // Touch and Drag Logic with dynamic card measurement
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let hasDeterminedDirection = false;

    function handleStart(e) {
        if (deck.length === 0) return;
        const topCard = cards[deck[0]];
        if (!e.target.closest('.card') || e.target.closest('.card') !== topCard) return;

        isDragging = true;
        hasDeterminedDirection = false;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        topCard.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging || deck.length === 0) return;
        currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Preserve natural vertical scrolling if user is scrolling page
        if (!hasDeterminedDirection) {
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isDragging = false;
                return;
            }
            hasDeterminedDirection = true;
        }

        if (e.cancelable) e.preventDefault();

        const topCard = cards[deck[0]];
        topCard.style.transform = \`translate(\${diffX}px, \${diffY * 0.25}px) rotate(\${diffX * 0.04}deg)\`;
    }

    function handleEnd() {
        if (!isDragging || deck.length === 0) return;
        isDragging = false;
        
        const diffX = currentX - startX;
        const topCard = cards[deck[0]];
        const cardWidth = topCard.offsetWidth || 340;
        const dragThreshold = cardWidth * 0.25;
        
        topCard.style.transition = 'transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease, box-shadow 0.35s ease';

        if (Math.abs(diffX) > dragThreshold) {
            drawCard();
        } else {
            topCard.style.transform = '';
        }
        
        startX = 0;
        currentX = 0;
    }

    stage.addEventListener('touchstart', handleStart, {passive: false});
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);

    stage.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    updateDeckLayout();
}

`;

js = js.substring(0, targetStart) + newFunctions + js.substring(targetEnd);
fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully updated script.js with initSharedForestEdges and initBigFourSection!');
