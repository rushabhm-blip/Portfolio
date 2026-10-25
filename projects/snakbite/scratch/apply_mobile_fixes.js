const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const indexPath = path.join(baseDir, 'index.html');
const cssPath = path.join(baseDir, 'style.css');

// 1. UPDATE index.html viewport meta tag
let html = fs.readFileSync(indexPath, 'utf8');

html = html.replace(
    /<meta\s+name="viewport"[^>]*>/i,
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">'
);

// Cache busters
html = html.replace(/style\.css\?v=[^"']+/g, 'style.css?v=mobile_v1');
html = html.replace(/script\.js\?v=[^"']+/g, 'script.js?v=mobile_v1');

fs.writeFileSync(indexPath, html, 'utf8');
console.log('index.html viewport and cache busters updated!');

// 2. UPDATE style.css
let css = fs.readFileSync(cssPath, 'utf8');

// Ensure html and body have strict horizontal overflow lock
css = css.replace(
    /html\s*\{[^}]*\}/i,
    `html {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden !important;
    position: relative;
    -webkit-text-size-adjust: 100%;
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE / Edge */
}`
);

css = css.replace(
    /body\s*\{[^}]*\}/i,
    `body {
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    overflow-x: hidden !important;
    position: relative;
    scrollbar-width: none !important; /* Firefox */
    -ms-overflow-style: none !important; /* IE / Edge */
    background-color: #03120B;
    color: var(--text-light);
    font-family: var(--font-body);
}`
);

// Add master mobile responsive block at the end of style.css
const masterMobileCss = `
/* ==========================================================================
   MASTER MOBILE PHONE RESPONSIVENESS & HORIZONTAL LOCK (<= 768px & <= 480px)
   Fixes horizontal scroll drift and aligns corner texts to center
   ========================================================================== */

/* 1. Global Container & Stage Horizontal Lock */
@media (max-width: 768px) {
    html,
    body,
    .story-body,
    .story-container,
    #story-root {
        width: 100% !important;
        max-width: 100vw !important;
        overflow-x: hidden !important;
        position: relative;
    }

    /* Constrain all full-bleed stages to prevent mobile overflow */
    .parallax-bg-wrapper,
    .landscape-sticky-stage,
    .landscape-layers-container,
    .landscape-layer,
    .layer-panorama,
    .encounter-canvas,
    .paddy-scene-stage,
    .closing-screen {
        max-width: 100vw !important;
        box-sizing: border-box;
    }

    /* 2. Fix Section 2: Habitat Editorial Text (Shifted from upper/bottom corners to center) */
    .habitat-editorial-card.habitat-right {
        position: absolute !important;
        top: 14% !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: calc(100% - 36px) !important;
        max-width: 380px !important;
        text-align: center !important;
        align-items: center !important;
        margin: 0 auto !important;
    }

    .habitat-editorial-card.habitat-left {
        position: absolute !important;
        bottom: 12% !important;
        left: 50% !important;
        right: auto !important;
        transform: translateX(-50%) !important;
        width: calc(100% - 36px) !important;
        max-width: 380px !important;
        text-align: center !important;
        align-items: center !important;
        margin: 0 auto !important;
    }

    .habitat-title.habitat-title-right,
    .habitat-title.habitat-title-left,
    .habitat-description.habitat-desc-right,
    .h-right-line-1,
    .h-right-line-2,
    .h-left-line-1,
    .h-left-line-2 {
        text-align: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    .mountain-story-block {
        width: calc(100% - 32px) !important;
        max-width: 380px !important;
    }

    .mountain-map-svg {
        max-width: min(85vw, 360px) !important;
    }

    /* 3. Fix Section 3: Paddy Field Story Card (Center in viewport instead of left: 49%) */
    .paddy-story-overlay {
        justify-content: center !important;
        align-items: center !important;
        padding: 16px !important;
    }

    .paddy-story-card {
        position: relative !important;
        left: auto !important;
        right: auto !important;
        transform: none !important;
        width: calc(100% - 24px) !important;
        max-width: 380px !important;
        margin: 0 auto !important;
        align-items: center !important;
        text-align: center !important;
        padding: 24px 20px !important;
        box-sizing: border-box !important;
    }

    .paddy-story-card .intro-line-lead,
    .paddy-story-card .intro-line-stat,
    .paddy-story-card .intro-line-question,
    .paddy-story-card .intro-line-pathways {
        text-align: center !important;
        align-self: center !important;
    }

    .paddy-sankey-scrim,
    .counterfactual-sankey-scrim {
        width: 100% !important;
        max-width: 100vw !important;
        left: 0 !important;
        transform: none !important;
    }

    /* 4. Fix Section 3: Stat Beat 3 (Hourly Human Cost & 5-Frame Animation) */
    #stat-beat-3.stat-beat-card {
        width: 100% !important;
        max-width: 100vw !important;
        overflow: hidden !important;
    }

    #stat-beat-3 .hourly-composition-wrapper {
        grid-template-columns: 1fr !important;
        gap: 16px !important;
        width: calc(100% - 32px) !important;
        max-width: 380px !important;
        margin-inline: auto !important;
        padding: 12px 0 !important;
    }

    #stat-beat-3 .hourly-composition-wrapper::before {
        width: 100% !important;
        max-width: 100% !important;
    }

    #stat-beat-3 .hourly-stat-number {
        font-size: clamp(110px, 26vw, 150px) !important;
        line-height: 0.85 !important;
    }

    #stat-beat-3 .hourly-snakebite-wrapper {
        width: min(65vw, 240px) !important;
        aspect-ratio: 1 / 1 !important;
        margin: 0 auto !important;
    }

    /* 5. Fix Beat Chart (Mortality Comparison) */
    .beat-chart {
        width: 100% !important;
        max-width: 100vw !important;
        padding: 0 12px !important;
        box-sizing: border-box !important;
    }

    .beat-chart .mortality-chart-iframe {
        width: 100% !important;
        height: clamp(480px, 68vh, 600px) !important;
    }

    /* 6. Fix Sankey Cards */
    .paddy-sankey-card,
    .counterfactual-sankey-card {
        width: 100% !important;
        max-width: 100vw !important;
        height: clamp(460px, 68vh, 580px) !important;
        padding: 0 8px !important;
        box-sizing: border-box !important;
    }

    /* 7. Fix Section 7: Threat Spectrum Unit Grid */
    .spectrum-container {
        width: 100% !important;
        max-width: 100vw !important;
        padding: 0 14px !important;
        box-sizing: border-box !important;
    }

    .spectrum-categories {
        display: grid !important;
        grid-template-columns: repeat(3, 1fr) !important;
        gap: 8px !important;
        width: 100% !important;
        max-width: 360px !important;
        margin-bottom: 24px !important;
    }

    .spectrum-category-btn {
        padding: 8px 6px 12px 6px !important;
    }

    .spectrum-cat-percent {
        font-size: clamp(24px, 5.5vw, 32px) !important;
    }

    .spectrum-cat-title {
        font-size: 11px !important;
    }

    .spectrum-dot-grid {
        gap: 5px !important;
        max-width: 340px !important;
        padding: 4px 0 !important;
    }

    .spectrum-dot {
        width: 6.5px !important;
        height: 6.5px !important;
    }

    /* 8. Fix Section 8: The Big Four Card Stack */
    .bigfour-container {
        grid-template-columns: 1fr !important;
        gap: 28px !important;
        padding: 0 16px !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
    }

    .bigfour-col-left {
        align-items: center !important;
        text-align: center !important;
        padding: 0 8px !important;
    }

    .bigfour-header,
    .bigfour-main-question,
    .bigfour-subtext {
        text-align: center !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    .bigfour-stage {
        width: min(290px, calc(100vw - 44px)) !important;
        height: auto !important;
        aspect-ratio: 340 / 560 !important;
        margin: 0 auto !important;
    }

    /* 9. Fix Section 10: Closing Screen Horizontal Lock */
    .closing-screen {
        width: 100% !important;
        max-width: 100vw !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
        padding: 60px 20px clamp(180px, 24vh, 240px) 20px !important;
        overflow-x: hidden !important;
        box-sizing: border-box !important;
    }

    .closing-content {
        max-width: 100% !important;
        padding: 0 12px !important;
    }

    .closing-heading {
        font-size: clamp(34px, 8.5vw, 48px) !important;
    }

    /* 10. Start Screen Hero Header Spacing */
    .hero-screen {
        padding-top: clamp(80px, 12vh, 110px) !important;
        padding-left: 20px !important;
        padding-right: 20px !important;
    }
}
`;

if (!css.includes('MASTER MOBILE PHONE RESPONSIVENESS')) {
    css += `\n${masterMobileCss}\n`;
} else {
    // Replace old master mobile block if present
    const startIdx = css.indexOf('/* ==========================================================================\n   MASTER MOBILE PHONE RESPONSIVENESS');
    if (startIdx !== -1) {
        css = css.slice(0, startIdx) + masterMobileCss;
    }
}

fs.writeFileSync(cssPath, css, 'utf8');
console.log('style.css updated with Master Mobile Responsiveness & Horizontal Lock!');
