const fs = require('fs');

const rawScript = fs.readFileSync('scratch/snc_script.js', 'utf8');

// Customize snc_script for direct embedding and reference aesthetics
let script = rawScript;

// 1. Ensure DB resolution checks window.SNC_DB as well
script = script.replace(
    "const SPECIES = (typeof DB !== 'undefined' && Array.isArray(DB.species)) ? DB.species : null;",
    "const SPECIES = (typeof DB !== 'undefined' && Array.isArray(DB.species)) ? DB.species : (window.SNC_DB && Array.isArray(window.SNC_DB.species) ? window.SNC_DB.species : null);"
);
script = script.replace(
    "const DATA = (typeof DB !== 'undefined' && Array.isArray(DB.data)) ? DB.data : null;",
    "const DATA = (typeof DB !== 'undefined' && Array.isArray(DB.data)) ? DB.data : (window.SNC_DB && Array.isArray(window.SNC_DB.data) ? window.SNC_DB.data : null);"
);

// 2. Update default invitation text on reset
script = script.replace(
    "document.getElementById('snc-invitation').hidden = false;",
    "const inv = document.getElementById('snc-invitation'); if (inv) { inv.hidden = false; inv.textContent = 'Search your area to discover species recorded within 5 km.'; }"
);

// 3. Add right arrow icon to species card in renderSpeciesList
const oldCardHtml = `            btn.innerHTML = \`
                <div class="snc-row-left">
                    \${thumbHtml}
                    <div class="snc-row-names">
                        <div class="snc-com-name">\${escapeHtml(comDisplay)}</div>
                        <div class="snc-sci-name">\${escapeHtml(sp.sci)}</div>
                    </div>
                </div>
                <div class="snc-row-right">
                    <span class="snc-obs-count">\${escapeHtml(obsLabel)}</span>
                    \${isSelected ? \`<span class="snc-selected-tag">✓ Filtered on map</span>\` : ''}
                </div>
            \`;`;

const newCardHtml = `            btn.innerHTML = \`
                <div class="snc-row-left">
                    \${thumbHtml}
                    <div class="snc-row-names">
                        <div class="snc-com-name">\${escapeHtml(comDisplay)}</div>
                        <div class="snc-sci-name">\${escapeHtml(sp.sci)}</div>
                    </div>
                </div>
                <div class="snc-row-right">
                    <div class="snc-obs-count-line">
                        <span class="snc-obs-count">\${escapeHtml(obsLabel)}</span>
                        \${isSelected ? \`<span class="snc-selected-tag">✓ Filtered</span>\` : ''}
                    </div>
                    <svg class="snc-row-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </div>
            \`;`;

if (script.includes(oldCardHtml)) {
    script = script.replace(oldCardHtml, newCardHtml);
    console.log('Replaced card HTML with arrow successfully.');
} else {
    console.warn('Could not find oldCardHtml pattern directly.');
}

// 4. Wrap with init check and IntersectionObserver
const initIntersection = `
    // Invalidate map size when section scrolls into viewport
    if ('IntersectionObserver' in window && rootEl) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mainMap.invalidateSize({ pan: false });
                }
            });
        }, { threshold: 0.1 });
        observer.observe(rootEl);
    }
`;

script = script.replace(
    "// Expose public controller methods",
    initIntersection + "\n    // Expose public controller methods"
);

fs.writeFileSync('assets/neighbourhood_map.js', script);
console.log('Wrote assets/neighbourhood_map.js successfully!');
