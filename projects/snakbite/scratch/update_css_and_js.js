const fs = require('fs');

// --- 1. UPDATE assets/neighbourhood_map.css ---
let css = fs.readFileSync('assets/neighbourhood_map.css', 'utf8');

// Update .snc-grid align-items: stretch and .snc-map-area height: 100%
const oldGridBlock = `        /* Responsive Editorial Grid */
        #snakes-neighbourhood-component .snc-grid {
            max-width: 1440px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, 39fr) minmax(0, 61fr);
            grid-template-areas:
                "intro map"
                "results map";
            grid-template-rows: auto 1fr;
            column-gap: clamp(40px, 4vw, 56px);
            row-gap: 28px;
            align-items: start;
        }

        #snakes-neighbourhood-component .snc-intro {
            grid-area: intro;
            min-width: 0;
        }

        #snakes-neighbourhood-component .snc-results-area {
            grid-area: results;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        #snakes-neighbourhood-component .snc-map-area {
            grid-area: map;
            min-width: 0;
            position: relative;
        }`;

const newGridBlock = `        /* Responsive Editorial Grid */
        #snakes-neighbourhood-component .snc-grid {
            max-width: 1440px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: minmax(0, 39fr) minmax(0, 61fr);
            grid-template-areas:
                "intro map"
                "results map";
            grid-template-rows: auto 1fr;
            column-gap: clamp(40px, 4vw, 56px);
            row-gap: 28px;
            align-items: stretch;
        }

        #snakes-neighbourhood-component .snc-intro {
            grid-area: intro;
            min-width: 0;
        }

        #snakes-neighbourhood-component .snc-results-area {
            grid-area: results;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        #snakes-neighbourhood-component .snc-map-area {
            grid-area: map;
            min-width: 0;
            position: relative;
            height: 100%;
            display: flex;
            flex-direction: column;
        }`;

if (css.includes(oldGridBlock)) {
    css = css.replace(oldGridBlock, newGridBlock);
    console.log('Updated .snc-grid and .snc-map-area in CSS');
} else {
    console.warn('Could not find oldGridBlock exactly in CSS');
}

// Update .snc-map-frame height
const oldMapFrame = `        /* Map Frame & Controls */
        #snakes-neighbourhood-component .snc-map-frame {
            width: 100%;
            height: clamp(560px, 68vh, 700px);
            background-color: var(--forest-surface);
            border: 1px solid var(--subtle-border);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
        }`;

const newMapFrame = `        /* Map Frame & Controls */
        #snakes-neighbourhood-component .snc-map-frame {
            width: 100%;
            height: 100%;
            flex: 1 1 auto;
            min-height: clamp(620px, 75vh, 800px);
            background-color: var(--forest-surface);
            border: 1px solid var(--subtle-border);
            border-radius: 8px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
        }`;

if (css.includes(oldMapFrame)) {
    css = css.replace(oldMapFrame, newMapFrame);
    console.log('Updated .snc-map-frame in CSS');
} else {
    console.warn('Could not find oldMapFrame exactly in CSS');
}

// Remove .snc-gesture-gate and .snc-gesture-btn
const oldGestureCss = `        /* Deliberate Scroll-Zoom Gate */
        #snakes-neighbourhood-component .snc-gesture-gate {
            position: absolute;
            top: 70px;
            right: 14px;
            z-index: 500;
            pointer-events: auto;
        }

        #snakes-neighbourhood-component .snc-gesture-btn {
            min-height: 44px;
            padding: 6px 12px;
            background: rgba(7, 31, 24, 0.90);
            border: 1px solid var(--subtle-border);
            border-radius: 6px;
            color: var(--sage);
            font-family: inherit;
            font-size: 14px;
            cursor: pointer;
            transition: color 180ms ease, border-color 180ms ease;
        }

        #snakes-neighbourhood-component .snc-gesture-btn:hover,
        #snakes-neighbourhood-component .snc-gesture-btn[aria-pressed="true"] {
            color: var(--ivory);
            border-color: var(--sage);
        }`;

if (css.includes(oldGestureCss)) {
    css = css.replace(oldGestureCss, '');
    console.log('Removed gesture gate CSS');
} else {
    console.warn('Could not find oldGestureCss exactly');
}

// Mobile responsive height
const oldMobileMapFrame = `#snakes-neighbourhood-component .snc-map-frame {
                height: clamp(380px, 54vh, 460px);
            }`;

const newMobileMapFrame = `#snakes-neighbourhood-component .snc-map-area {
                height: auto;
            }

            #snakes-neighbourhood-component .snc-map-frame {
                min-height: 0;
                height: clamp(400px, 54vh, 500px);
            }`;

if (css.includes(oldMobileMapFrame)) {
    css = css.replace(oldMobileMapFrame, newMobileMapFrame);
    console.log('Updated mobile .snc-map-frame in CSS');
}

// Remove mobile gesture gate
const oldMobileGate = `            #snakes-neighbourhood-component .snc-gesture-gate {
                top: auto;
                bottom: 28px;
                right: 10px;
            }`;

if (css.includes(oldMobileGate)) {
    css = css.replace(oldMobileGate, '');
    console.log('Removed mobile gesture gate CSS');
}

fs.writeFileSync('assets/neighbourhood_map.css', css);
console.log('Saved assets/neighbourhood_map.css');

// --- 2. UPDATE assets/neighbourhood_map.js ---
let js = fs.readFileSync('assets/neighbourhood_map.js', 'utf8');

// Enable scrollWheelZoom by default in L.map
js = js.replace('scrollWheelZoom: false', 'scrollWheelZoom: true, wheelDebounceTime: 40, wheelPxPerZoomLevel: 60');

// Replace toggleScrollWheelZoom logic
const oldToggleFn = `    // Deliberate Map Scroll-Wheel Zoom Control
    function toggleScrollWheelZoom(forceState) {
        scrollZoomEnabled = typeof forceState === 'boolean' ? forceState : !scrollZoomEnabled;
        const btn = document.getElementById('snc-gesture-btn');
        if (scrollZoomEnabled) {
            mainMap.scrollWheelZoom.enable();
            btn.setAttribute('aria-pressed', 'true');
            btn.textContent = 'Disable scroll zoom (Esc)';
        } else {
            mainMap.scrollWheelZoom.disable();
            btn.setAttribute('aria-pressed', 'false');
            btn.textContent = 'Enable scroll zoom';
        }
    }`;

const newToggleFn = `    // Map Scroll-Wheel Zoom (Enabled immediately by default)
    function toggleScrollWheelZoom() {
        // Kept for backward compatibility
    }`;

if (js.includes(oldToggleFn)) {
    js = js.replace(oldToggleFn, newToggleFn);
    console.log('Replaced toggleScrollWheelZoom function in JS');
} else {
    console.warn('Could not find oldToggleFn in JS');
}

// In keydown listener, remove scrollZoomEnabled
js = js.replace(
`        if (e.key === 'Escape') {
            if (isPickOnMapMode) togglePickOnMap(false);
            if (scrollZoomEnabled) toggleScrollWheelZoom(false);
        }`,
`        if (e.key === 'Escape') {
            if (isPickOnMapMode) togglePickOnMap(false);
        }`
);

// Proactively call invalidateSize on layout updates
js = js.replace(
    'syncMapLayers();\n        renderSpeciesList(spCounts, totalObs);',
    'syncMapLayers();\n        renderSpeciesList(spCounts, totalObs);\n        requestAnimationFrame(() => mainMap.invalidateSize({ pan: false }));'
);

js = js.replace(
    'syncMapLayers();\n        moveMapTo(INDIA_CENTER[0], INDIA_CENTER[1], INDIA_ZOOM);',
    'syncMapLayers();\n        moveMapTo(INDIA_CENTER[0], INDIA_CENTER[1], INDIA_ZOOM);\n        requestAnimationFrame(() => mainMap.invalidateSize({ pan: false }));'
);

fs.writeFileSync('assets/neighbourhood_map.js', js);
console.log('Saved assets/neighbourhood_map.js');
