const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// Replace forest-shared-edges block up to SECTION 9 header
const startTarget = '.forest-shared-edges {';
const endTarget = '/* ==========================================================================\n   SECTION 9: THE BIG FOUR - DEADLIEST DRAW CARD DECK\n   ========================================================================== */';

const sharedOverlayCss = `/* Continuous Shared Snake-Scale Sticky Layer */
.shared-scale-overlay {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    margin-bottom: -100vh;
    pointer-events: none;
    z-index: 1; /* Behind section content, above continuous dark-green background */
    overflow: hidden;
    opacity: 0;
    transition: opacity 0.35s ease-out;
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 14%,
        black 86%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 14%,
        black 86%,
        transparent 100%
    );
}

.shared-scale-side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: clamp(200px, 18vw, 340px);
    overflow: hidden;
    pointer-events: none;
}

/* Independent opacity controls:
   Left: ~0.24 (approx 0.20-0.25)
   Right: ~0.50 (approx 0.40-0.55) */
.shared-scale-left {
    left: 0;
    opacity: 0.24;
}

.shared-scale-right {
    right: 0;
    opacity: 0.50;
}

.shared-scale-img {
    position: absolute;
    top: 50%;
    height: clamp(540px, 76vh, 860px);
    width: calc(clamp(540px, 76vh, 860px) * 2.34325);
    margin-top: calc(-0.5 * clamp(540px, 76vh, 860px));
    background-image: url('assets/bigfour_scales_overlay.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    pointer-events: none;
    will-change: transform;
}

.shared-scale-img-left {
    left: 0;
    transform: translate3d(0, 12px, 0);
}

.shared-scale-img-right {
    right: 0;
    transform: translate3d(0, -8px, 0);
}

@media (max-width: 1200px) {
    .shared-scale-side {
        width: clamp(130px, 13vw, 190px);
    }
    .shared-scale-left {
        opacity: 0.20;
    }
    .shared-scale-right {
        opacity: 0.45;
    }
}

@media (max-width: 900px) {
    .shared-scale-overlay {
        display: none !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    .shared-scale-img {
        transform: none !important;
        transition: none !important;
    }
}

`;

// Normalize crlf
css = css.replace(/\r\n/g, '\n');

const idxStart = css.indexOf(startTarget);
const idxEnd = css.indexOf(endTarget);

if (idxStart !== -1 && idxEnd !== -1) {
    css = css.substring(0, idxStart) + sharedOverlayCss + css.substring(idxEnd);
    console.log('Replaced forest-shared-edges with shared-scale-overlay');
} else {
    console.error('Could not find forest-shared-edges or section 9 header', idxStart, idxEnd);
}

// Remove bigfour-scale-overlay definitions from Section 9
const localOverlayStart = '/* Decorative Snake-Scale Overlay for Section 9 */';
const localOverlayEnd = '.bigfour-container {';

const idxLocalStart = css.indexOf(localOverlayStart);
const idxLocalEnd = css.indexOf(localOverlayEnd);

if (idxLocalStart !== -1 && idxLocalEnd !== -1) {
    css = css.substring(0, idxLocalStart) + css.substring(idxLocalEnd);
    console.log('Removed local bigfour-scale-overlay from style.css');
} else {
    console.log('Local overlay not found or already removed');
}

fs.writeFileSync('style.css', css, 'utf8');
console.log('Successfully updated style.css');
