const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const cssPath = path.join(baseDir, 'style.css');
const indexPath = path.join(baseDir, 'index.html');

// 1. In index.html, update cache buster query for style.css to ensure mobile devices load the new CSS
let html = fs.readFileSync(indexPath, 'utf8');
html = html.replace(/style\.css\?v=[^"']+/g, 'style.css?v=m_refine_v1');
fs.writeFileSync(indexPath, html, 'utf8');

// 2. In style.css, append strictly scoped mobile-only rules (<= 640px and <= 768px)
let css = fs.readFileSync(cssPath, 'utf8');

const mobileRefinementCss = `
/* ==========================================================================
   MOBILE-ONLY REFINEMENTS (PC LAYOUT IS 100% UNTOUCHED)
   Strictly scoped to mobile viewports (<= 768px and <= 640px)
   Locks horizontal frame drift & adjusts text bounding without altering JS scroll flow
   ========================================================================== */

@media (max-width: 768px) {
    /* 1. Lock horizontal frame to prevent horizontal swiping / wobble */
    html,
    body {
        overflow-x: clip;
        max-width: 100vw;
    }

    .story-container {
        overflow-x: clip;
        max-width: 100vw;
    }

    .closing-screen {
        width: 100%;
        max-width: 100vw;
        margin-left: 0;
        margin-right: 0;
        box-sizing: border-box;
    }
}

@media (max-width: 640px) {
    /* 2. Section 2: Habitat Editorial Text (Position centered between left & right margins, preserving JS transforms) */
    .habitat-editorial-card.habitat-right {
        right: 20px;
        left: 20px;
        top: 15%;
        max-width: none;
        width: auto;
        text-align: center;
    }

    .habitat-editorial-card.habitat-left {
        left: 20px;
        right: 20px;
        bottom: 12%;
        max-width: none;
        width: auto;
        text-align: center;
    }

    .habitat-title.habitat-title-right,
    .habitat-title.habitat-title-left,
    .habitat-description.habitat-desc-right {
        text-align: center;
        margin-left: auto;
        margin-right: auto;
    }

    .mountain-story-block {
        width: calc(100% - 32px);
        max-width: 380px;
    }

    .mountain-headline {
        font-size: clamp(30px, 7.5vw, 44px);
    }

    .mountain-subtext {
        font-size: 15px;
        margin-top: 18px;
    }

    /* 3. Section 3: Paddy Field Encounter Text */
    .paddy-story-card {
        padding: 20px 16px;
        box-sizing: border-box;
    }

    .paddy-story-card .intro-line-stat {
        font-size: clamp(38px, 10vw, 54px) !important;
        white-space: normal !important;
        line-height: 1.1 !important;
    }

    .paddy-story-card .intro-line-lead {
        font-size: 18px !important;
        margin-bottom: 10px !important;
    }

    .paddy-story-card .intro-line-question {
        font-size: 19px !important;
        margin-bottom: 12px !important;
    }

    .paddy-story-card .intro-line-pathways {
        font-size: 16px !important;
    }

    /* 4. Section 3: 1 in 2 Crisis Section Text */
    .crisis-headline {
        font-size: clamp(28px, 7.2vw, 36px);
        padding: 0 16px;
    }

    .crisis-num-lead,
    .crisis-num-end {
        font-size: clamp(62px, 16vw, 84px);
    }

    /* 5. Section 8: Species Threat Spectrum */
    .spectrum-container {
        padding: 0 16px;
        box-sizing: border-box;
    }

    .spectrum-categories {
        gap: 6px;
        margin-bottom: 24px;
    }

    .spectrum-category-btn {
        padding: 8px 6px;
    }

    .spectrum-cat-percent {
        font-size: clamp(24px, 6vw, 34px) !important;
    }

    .spectrum-cat-title {
        font-size: 11px !important;
    }

    .spectrum-dot-grid {
        gap: 5px;
        max-width: 330px;
    }

    .spectrum-dot {
        width: 6px;
        height: 6px;
    }

    /* 6. Section 9: The Big Four Card Stack */
    .bigfour-stage {
        width: min(290px, calc(100vw - 44px));
        aspect-ratio: 340 / 560;
        height: auto;
        margin: 0 auto;
    }

    /* 7. Section 10: Neighbourhood Observations Map */
    #snakes-neighbourhood-component {
        padding: 24px 16px;
        overflow-x: clip;
        max-width: 100vw;
    }
}
`;

if (!css.includes('MOBILE-ONLY REFINEMENTS (PC LAYOUT IS 100% UNTOUCHED)')) {
    css += `\n${mobileRefinementCss}\n`;
    fs.writeFileSync(cssPath, css, 'utf8');
    console.log('Mobile-only refinements appended successfully!');
} else {
    console.log('Mobile-only refinements already present.');
}
console.log('index.html and style.css updated!');
