const fs = require('fs');

// --- 1. UPDATE index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Add closing-transition-blur layer inside #closing-section
const oldClosingOpening = `<section class="closing-screen" id="closing-section" aria-label="Closing thoughts: Less fear. More understanding.">
            <!-- 4K Atmospheric Background Layer -->
            <div class="closing-bg-layer" aria-hidden="true"></div>`;

const newClosingOpening = `<section class="closing-screen" id="closing-section" aria-label="Closing thoughts: Less fear. More understanding.">
            <!-- 4K Atmospheric Background Layer -->
            <div class="closing-bg-layer" aria-hidden="true"></div>
            <!-- Soft Boundary Transition Blur Layer -->
            <div class="closing-transition-blur" aria-hidden="true"></div>`;

if (html.includes(oldClosingOpening)) {
    html = html.replace(oldClosingOpening, newClosingOpening);
    console.log('Added closing-transition-blur in index.html');
} else {
    console.warn('Could not find oldClosingOpening in index.html');
}

// Bump cache buster for style.css
html = html.replace('style.css?v=closing_v1', 'style.css?v=blend_v1');

fs.writeFileSync('index.html', html);
console.log('Saved index.html');

// --- 2. UPDATE style.css ---
let css = fs.readFileSync('style.css', 'utf8');

const oldClosingScreenCss = `.closing-screen {
    position: relative;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    min-height: 100svh;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: clamp(80px, 10vh, 120px) clamp(24px, 5vw, 64px) clamp(240px, 28vh, 340px);
    background-color: #071F18;
    overflow: hidden;
    box-sizing: border-box;
    z-index: 10;
}

/* Separate Absolutely Positioned 4K Background Layer */
.closing-bg-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    background-image: url('assets/closing-background-4k.webp');
    background-image: -webkit-image-set(url('assets/closing-background-4k.webp') 1x, url('assets/closing-background-4k.png') 1x);
    background-image: image-set(url('assets/closing-background-4k.webp') type("image/webp"), url('assets/closing-background-4k.png') type("image/png"));
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 1;
    /* Soft transparency mask over approximately first 140–180 px */
    -webkit-mask-image: linear-gradient(to bottom, transparent 0px, rgba(0, 0, 0, 0.4) 60px, black 160px, black 100%);
    mask-image: linear-gradient(to bottom, transparent 0px, rgba(0, 0, 0, 0.4) 60px, black 160px, black 100%);
}`;

const newClosingScreenCss = `.closing-screen {
    position: relative;
    width: 100vw;
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
    min-height: 100svh;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding: clamp(80px, 10vh, 120px) clamp(24px, 5vw, 64px) clamp(240px, 28vh, 340px);
    background-color: transparent; /* Transparent so underlying forest background stays continuous */
    overflow: visible; /* Prevent clipping of transition blend layer across the section boundary */
    box-sizing: border-box;
    z-index: 10;
}

/* Separate Absolutely Positioned 4K Background Layer Overlapping Boundary */
.closing-bg-layer {
    position: absolute;
    top: -110px; /* Extends 110px up into the map section for an overlapping crossfade */
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: calc(100% + 110px);
    background-image: url('assets/closing-background-4k.webp');
    background-image: -webkit-image-set(url('assets/closing-background-4k.webp') 1x, url('assets/closing-background-4k.png') 1x);
    background-image: image-set(url('assets/closing-background-4k.webp') type("image/webp"), url('assets/closing-background-4k.png') type("image/png"));
    background-size: cover;
    background-position: center bottom;
    background-repeat: no-repeat;
    pointer-events: none;
    z-index: 1;
    /* Gradual multi-stop opacity crossfade across the 220px transition zone */
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0px,
        rgba(0, 0, 0, 0.02) 30px,
        rgba(0, 0, 0, 0.08) 60px,
        rgba(0, 0, 0, 0.20) 90px,
        rgba(0, 0, 0, 0.40) 120px,
        rgba(0, 0, 0, 0.65) 150px,
        rgba(0, 0, 0, 0.88) 185px,
        black 220px,
        black 100%
    );
    mask-image: linear-gradient(
        to bottom,
        transparent 0px,
        rgba(0, 0, 0, 0.02) 30px,
        rgba(0, 0, 0, 0.08) 60px,
        rgba(0, 0, 0, 0.20) 90px,
        rgba(0, 0, 0, 0.40) 120px,
        rgba(0, 0, 0, 0.65) 150px,
        rgba(0, 0, 0, 0.88) 185px,
        black 220px,
        black 100%
    );
}

/* Separate Feathered Blur Layer Across Boundary Transition Zone */
.closing-transition-blur {
    position: absolute;
    top: -110px;
    left: 0;
    right: 0;
    width: 100%;
    height: 220px;
    pointer-events: none;
    z-index: 2; /* In front of backgrounds, behind live content */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    /* Feather edges so the blur itself creates no hard or rectangular boundary */
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.15) 15%,
        rgba(0, 0, 0, 0.70) 35%,
        rgba(0, 0, 0, 1.0) 50%,
        rgba(0, 0, 0, 0.70) 65%,
        rgba(0, 0, 0, 0.15) 85%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        rgba(0, 0, 0, 0.15) 15%,
        rgba(0, 0, 0, 0.70) 35%,
        rgba(0, 0, 0, 1.0) 50%,
        rgba(0, 0, 0, 0.70) 65%,
        rgba(0, 0, 0, 0.15) 85%,
        transparent 100%
    );
}`;

if (css.includes(oldClosingScreenCss)) {
    css = css.replace(oldClosingScreenCss, newClosingScreenCss);
    console.log('Updated closing screen & background CSS with blend layer');
} else {
    console.warn('Could not find oldClosingScreenCss exactly');
}

// Update mobile rules
const oldMobileClosing = `@media (max-width: 768px) {
    .closing-screen {
        padding: 60px 24px clamp(180px, 26vh, 260px);
        min-height: 100svh;
    }`;

const newMobileClosing = `@media (max-width: 768px) {
    .closing-screen {
        padding: 60px 24px clamp(180px, 26vh, 260px);
        min-height: 100svh;
    }

    .closing-bg-layer {
        top: -70px;
        height: calc(100% + 70px);
        -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0px,
            rgba(0, 0, 0, 0.05) 25px,
            rgba(0, 0, 0, 0.25) 55px,
            rgba(0, 0, 0, 0.65) 90px,
            rgba(0, 0, 0, 0.90) 120px,
            black 140px,
            black 100%
        );
        mask-image: linear-gradient(
            to bottom,
            transparent 0px,
            rgba(0, 0, 0, 0.05) 25px,
            rgba(0, 0, 0, 0.25) 55px,
            rgba(0, 0, 0, 0.65) 90px,
            rgba(0, 0, 0, 0.90) 120px,
            black 140px,
            black 100%
        );
    }

    .closing-transition-blur {
        top: -70px;
        height: 140px;
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }`;

if (css.includes(oldMobileClosing)) {
    css = css.replace(oldMobileClosing, newMobileClosing);
    console.log('Updated mobile closing screen blend styles');
}

fs.writeFileSync('style.css', css);
console.log('Saved style.css');
