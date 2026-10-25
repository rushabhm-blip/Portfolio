const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

// 1. Overlay CSS to insert after .bigfour-text-scrim { ... }
const overlayCss = `
/* Decorative Snake-Scale Overlay for Section 9 */
.bigfour-scale-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
    opacity: 0.16;
    transition: opacity 0.35s ease-out;
    -webkit-mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16%,
        black 82%,
        transparent 100%
    );
    mask-image: linear-gradient(
        to bottom,
        transparent 0%,
        black 16%,
        black 82%,
        transparent 100%
    );
}

.bigfour-scale-side {
    position: absolute;
    top: 0;
    bottom: 0;
    width: clamp(180px, 16vw, 290px);
    overflow: hidden;
    pointer-events: none;
}

.bigfour-scale-left {
    left: 0;
}

.bigfour-scale-right {
    right: 0;
}

.bigfour-scale-img {
    position: absolute;
    top: 50%;
    height: clamp(520px, 75vh, 850px);
    width: calc(clamp(520px, 75vh, 850px) * 2.34325);
    margin-top: calc(-0.5 * clamp(520px, 75vh, 850px));
    background-image: url('assets/bigfour_scales_overlay.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    pointer-events: none;
    will-change: transform;
}

.bigfour-scale-img-left {
    left: 0;
    transform: translate3d(0, 12px, 0);
}

.bigfour-scale-img-right {
    right: 0;
    transform: translate3d(0, -8px, 0);
}

@media (max-width: 1200px) {
    .bigfour-scale-side {
        width: clamp(120px, 12vw, 180px);
    }
}

@media (max-width: 900px) {
    .bigfour-scale-overlay {
        display: none !important;
    }
}

@media (prefers-reduced-motion: reduce) {
    .bigfour-scale-img {
        transform: none !important;
        transition: none !important;
    }
}
`;

const scrimMarker = '.bigfour-text-scrim {\n    position: absolute;\n    inset: 0;\n    pointer-events: none;\n    background: radial-gradient(ellipse 75% 65% at 50% 50%, rgba(3, 18, 13, 0.72) 0%, rgba(3, 18, 13, 0) 100%);\n    z-index: 0;\n}';

// Find scrimMarker regardless of crlf
const scrimIdx = css.indexOf('.bigfour-text-scrim {');
if (scrimIdx === -1) {
    console.error('scrim not found');
    process.exit(1);
}
const scrimCloseIdx = css.indexOf('}', scrimIdx);
const insertPos = scrimCloseIdx + 1;

if (!css.includes('.bigfour-scale-overlay {')) {
    css = css.substring(0, insertPos) + '\n' + overlayCss + css.substring(insertPos);
}

// 2. Refine Card Spacing
const oldCardArt = `.bigfour-stage .card-art {
    width: 100%;
    height: 40%;
    min-height: 220px;
    max-height: 240px;
    padding: 14px 20px 4px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}`;

const newCardArt = `.bigfour-stage .card-art {
    width: 100%;
    height: 220px;
    min-height: 220px;
    max-height: 220px;
    padding: 16px 20px 6px;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}`;

// Replace card-content & spacing
const oldCardContent = `.bigfour-stage .card-content {
    padding: 6px 20px 18px; /* 20-24px internal padding */
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: space-between;
    box-sizing: border-box;
    z-index: 2;
}

.bigfour-stage .card-name {
    font-family: 'Cinzel', 'Cormorant Garamond', serif;
    font-size: 1.22rem;
    font-weight: 800;
    text-align: center;
    line-height: 1.15;
    letter-spacing: 0.05em;
    margin: 0 0 2px 0;
    color: #243D2C;
}

/* Divider with Star Icon */
.bigfour-stage .divider {
    display: flex;
    align-items: center;
    width: 76%;
    margin: 2px auto 8px;
    color: #243D2C;
}

.bigfour-stage .divider::before,
.bigfour-stage .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(36, 61, 44, 0.4);
}

.bigfour-stage .divider svg {
    width: 12px;
    height: 12px;
    margin: 0 8px;
    fill: #243D2C;
    flex-shrink: 0;
}

/* Stats Table: Google Sans Flex per AGENTS.md */
.bigfour-stage .stats-table {
    width: 100%;
    margin-top: 2px;
}

.bigfour-stage .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 7px 0;
    border-bottom: 1px solid rgba(36, 61, 44, 0.16);
}

.bigfour-stage .stat-icon {
    width: 15px;
    height: 15px;
    fill: #243D2C;
    margin-right: 8px;
    opacity: 0.85;
    flex-shrink: 0;
}

.bigfour-stage .stat-label {
    display: flex;
    align-items: center;
    font-family: 'Google Sans Flex', -apple-system, sans-serif !important;
    font-size: 13.5px;
    font-weight: 500;
    color: #27382D;
    flex-grow: 1;
}

.bigfour-stage .stat-value {
    font-family: 'Google Sans Flex', -apple-system, sans-serif !important;
    font-weight: 600;
    font-size: 14.5px;
    color: #121F16;
    text-align: right;
}

/* Primary Toxicity Type */
.bigfour-stage .stat-row.stat-row-toxicity {
    border-bottom: none;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
    gap: 3px;
    padding-bottom: 0;
}`;

const newCardContent = `.bigfour-stage .card-content {
    padding: 8px 22px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    justify-content: flex-start;
    box-sizing: border-box;
    z-index: 2;
}

.bigfour-stage .card-name {
    font-family: 'Cinzel', 'Cormorant Garamond', serif;
    font-size: 1.22rem;
    font-weight: 800;
    text-align: center;
    line-height: 1.15;
    letter-spacing: 0.05em;
    margin: 4px 0 24px 0; /* 24px before divider per requirements */
    color: #243D2C;
}

/* Divider with Star Icon */
.bigfour-stage .divider {
    display: flex;
    align-items: center;
    width: 76%;
    margin: 0 auto 24px; /* 24px between divider and metrics */
    color: #243D2C;
}

.bigfour-stage .divider::before,
.bigfour-stage .divider::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(36, 61, 44, 0.4);
}

.bigfour-stage .divider svg {
    width: 12px;
    height: 12px;
    margin: 0 8px;
    fill: #243D2C;
    flex-shrink: 0;
}

/* Stats Table: Google Sans Flex per AGENTS.md */
.bigfour-stage .stats-table {
    width: 100%;
    margin-top: 0;
}

.bigfour-stage .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0; /* consistent metric-row spacing */
    border-bottom: 1px solid rgba(36, 61, 44, 0.16);
}

.bigfour-stage .stat-icon {
    width: 15px;
    height: 15px;
    fill: #243D2C;
    margin-right: 8px;
    opacity: 0.85;
    flex-shrink: 0;
}

.bigfour-stage .stat-label {
    display: flex;
    align-items: center;
    font-family: 'Google Sans Flex', -apple-system, sans-serif !important;
    font-size: 13.5px;
    font-weight: 500;
    color: #27382D;
    flex-grow: 1;
}

.bigfour-stage .stat-value {
    font-family: 'Google Sans Flex', -apple-system, sans-serif !important;
    font-weight: 600;
    font-size: 14.5px;
    color: #121F16;
    text-align: right;
}

/* Primary Toxicity Type */
.bigfour-stage .stat-row.stat-row-toxicity {
    border-bottom: none;
    flex-direction: column;
    align-items: center;
    margin-top: 22px; /* comfortable spacing below metrics */
    gap: 4px;
    padding-bottom: 0;
}`;

// Normalize line breaks for matching
const norm = (s) => s.replace(/\\r\\n/g, '\\n');
css = norm(css);

if (css.includes(norm(oldCardArt))) {
    css = css.replace(norm(oldCardArt), newCardArt);
    console.log('Replaced card-art');
} else {
    console.log('card-art not matched directly');
}

if (css.includes(norm(oldCardContent))) {
    css = css.replace(norm(oldCardContent), newCardContent);
    console.log('Replaced card-content and spacing');
} else {
    console.log('card-content not matched directly');
}

fs.writeFileSync('style.css', css, 'utf8');
console.log('Successfully updated style.css');
