const fs = require('fs');

const html = fs.readFileSync('indian_snake_diversity.html', 'utf8');
const match = html.match(/const snakesData = (\[[\s\S]*?\]);\s*document\.addEventListener/);
if (!match) {
    console.error('Could not find snakesData in indian_snake_diversity.html');
    process.exit(1);
}
const snakesDataRaw = match[1];

let scriptJs = fs.readFileSync('script.js', 'utf8');
const spectrumIdx = scriptJs.indexOf('function initSpectrumSection() {');
if (spectrumIdx === -1) {
    console.error('Could not find initSpectrumSection in script.js');
    process.exit(1);
}

const beforeSpectrum = scriptJs.substring(0, scriptJs.lastIndexOf('/**', spectrumIdx));

const newSpectrumFunc = `/**
 * SECTION 8: Diversity Spectrum Unit Chart (307 Species)
 * Real Indian Herpetological Dataset:
 * - 307 real species breakdown (73 Venomous, 57 Mildly Venomous, 177 Non-Venomous)
 * - Rich species tooltip (Common name, scientific name, venom badge, sighting count)
 * - Interactive category isolation with zero layout shift (opacity: 0)
 * - Dynamic percentage calculations
 * - Keyboard Escape and 'Show all' reset
 */
function initSpectrumSection() {
    const grid = document.getElementById('spectrumDotGrid');
    const statusText = document.getElementById('spectrumStatus');
    const resetBtn = document.getElementById('spectrumResetBtn');
    const tooltip = document.getElementById('spectrumTooltip');
    const categoryBtns = document.querySelectorAll('.spectrum-category-btn');

    if (!grid || !categoryBtns.length) return;

    // Real species dataset from uploaded Indian Herpetological Records (307 Species)
    const snakesData = ${snakesDataRaw};

    const totalSpecies = snakesData.length;
    const countMS = snakesData.filter(s => s.cat === 'ms').length;
    const countV = snakesData.filter(s => s.cat === 'v').length;
    const countNV = snakesData.filter(s => s.cat === 'nv').length;

    const pctMS = (countMS / totalSpecies * 100).toFixed(1);
    const pctV = (countV / totalSpecies * 100).toFixed(1);
    const pctNV = (countNV / totalSpecies * 100).toFixed(1);

    // Update counts & percentages in DOM dynamically
    const elCountMS = document.getElementById('cat-count-ms');
    const elCountV = document.getElementById('cat-count-v');
    const elCountNV = document.getElementById('cat-count-nv');
    if (elCountMS) elCountMS.textContent = countMS;
    if (elCountV) elCountV.textContent = countV;
    if (elCountNV) elCountNV.textContent = countNV;

    const elPctMS = document.getElementById('cat-pct-ms');
    const elPctV = document.getElementById('cat-pct-v');
    const elPctNV = document.getElementById('cat-pct-nv');
    if (elPctMS) elPctMS.textContent = \`\${pctMS}%\`;
    if (elPctV) elPctV.textContent = \`\${pctV}%\`;
    if (elPctNV) elPctNV.textContent = \`\${pctNV}%\`;

    const categoryMeta = {
        ms: {
            name: 'Venomous',
            count: countMS,
            percent: pctMS,
            color: '#d63053'
        },
        v: {
            name: 'Mildly Venomous',
            count: countV,
            percent: pctV,
            color: '#e69119'
        },
        nv: {
            name: 'Non-Venomous',
            count: countNV,
            percent: pctNV,
            color: '#10ac84'
        }
    };

    const badgeColors = {
        ms: '#d63053',
        v: '#e69119',
        nv: '#10ac84'
    };

    // Render 307 real species dots
    grid.innerHTML = '';
    const dots = [];

    snakesData.forEach((snake, i) => {
        const dot = document.createElement('div');
        dot.className = \`spectrum-dot type-\${snake.cat}\`;
        dot.setAttribute('data-category', snake.cat);
        dot.setAttribute('data-name', snake.name);
        dot.setAttribute('data-sci', snake.sci);
        dot.setAttribute('data-count', snake.count);
        dot.setAttribute('data-label', snake.label);
        dot.setAttribute('data-index', i + 1);
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'img');
        dot.setAttribute('aria-label', \`\${snake.name} (\${snake.sci}) - \${snake.label}, \${snake.count.toLocaleString()} sightings\`);

        grid.appendChild(dot);
        dots.push(dot);
    });

    // Interaction State
    let lockedCategory = null;
    let previewCategory = null;

    function renderState() {
        const active = lockedCategory || previewCategory;

        // 1. Update Dots Visibility (zero layout shift via opacity)
        dots.forEach(dot => {
            if (!active) {
                dot.classList.remove('is-hidden');
            } else {
                if (dot.getAttribute('data-category') === active) {
                    dot.classList.remove('is-hidden');
                } else {
                    dot.classList.add('is-hidden');
                }
            }
        });

        // 2. Update Category Buttons
        categoryBtns.forEach(btn => {
            const cat = btn.getAttribute('data-category');
            if (!active) {
                btn.classList.remove('is-active', 'is-faded');
                btn.setAttribute('aria-pressed', 'false');
            } else if (cat === active) {
                btn.classList.add('is-active');
                btn.classList.remove('is-faded');
                btn.setAttribute('aria-pressed', lockedCategory === cat ? 'true' : 'false');
            } else {
                btn.classList.remove('is-active');
                btn.classList.add('is-faded');
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        // 3. Update Status Message & Reset Button
        if (statusText) {
            if (lockedCategory) {
                const meta = categoryMeta[lockedCategory];
                statusText.textContent = \`Showing \${meta.name}: \${meta.count} species (\${meta.percent}% of India's documented snakes).\`;
            } else if (previewCategory) {
                const meta = categoryMeta[previewCategory];
                statusText.textContent = \`Exploring \${meta.name}: \${meta.count} species (\${meta.percent}% of India's documented snakes).\`;
            } else {
                statusText.textContent = 'Hover or select a category to explore.';
            }
        }

        if (resetBtn) {
            if (lockedCategory) {
                resetBtn.classList.add('is-active');
            } else {
                resetBtn.classList.remove('is-active');
            }
        }
    }

    // Event Listeners for Category Buttons
    categoryBtns.forEach(btn => {
        const cat = btn.getAttribute('data-category');

        btn.addEventListener('mouseenter', () => {
            previewCategory = cat;
            renderState();
        });

        btn.addEventListener('mouseleave', () => {
            previewCategory = null;
            renderState();
        });

        btn.addEventListener('focus', () => {
            previewCategory = cat;
            renderState();
        });

        btn.addEventListener('blur', () => {
            previewCategory = null;
            renderState();
        });

        btn.addEventListener('click', () => {
            if (lockedCategory === cat) {
                lockedCategory = null;
            } else {
                lockedCategory = cat;
            }
            previewCategory = null;
            renderState();
        });
    });

    // Reset Button
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            lockedCategory = null;
            previewCategory = null;
            renderState();
        });
    }

    // Keyboard Escape Key to clear selection
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lockedCategory || previewCategory) {
                lockedCategory = null;
                previewCategory = null;
                renderState();
            }
        }
    });

    // Rich Floating Tooltip
    if (tooltip) {
        function showTooltip(snake, e) {
            const countNum = parseInt(snake.count, 10) || 0;
            tooltip.innerHTML = \`
                <span class="spectrum-t-name">\${snake.name}</span>
                <span class="spectrum-t-sci">\${snake.sci}</span>
                <div class="spectrum-t-meta">
                    <span class="spectrum-t-badge" style="color:\${badgeColors[snake.cat]}">\${snake.label}</span>
                    <span class="spectrum-t-count">\${countNum.toLocaleString()} \${countNum === 1 ? 'sighting' : 'sightings'}</span>
                </div>
            \`;
            tooltip.classList.add('is-visible');
            positionTooltip(e);
        }

        function hideTooltip() {
            tooltip.classList.remove('is-visible');
        }

        function positionTooltip(e) {
            const pad = 14;
            const tooltipWidth = 260;
            const clientX = e.clientX !== undefined ? e.clientX : (e.target ? e.target.getBoundingClientRect().left + 10 : 0);
            const clientY = e.clientY !== undefined ? e.clientY : (e.target ? e.target.getBoundingClientRect().top : 0);
            const x = Math.min(window.innerWidth - tooltipWidth - 16, Math.max(16, clientX + pad));
            const y = Math.max(16, clientY - 80);
            tooltip.style.left = \`\${x}px\`;
            tooltip.style.top = \`\${y}px\`;
        }

        dots.forEach((dot, idx) => {
            const snake = snakesData[idx];
            dot.addEventListener('pointerenter', (e) => showTooltip(snake, e));
            dot.addEventListener('pointermove', (e) => positionTooltip(e));
            dot.addEventListener('pointerleave', hideTooltip);

            dot.addEventListener('focus', (e) => {
                showTooltip(snake, e);
                const rect = dot.getBoundingClientRect();
                tooltip.style.left = \`\${Math.min(window.innerWidth - 276, Math.max(16, rect.left + rect.width / 2 - 130))}px\`;
                tooltip.style.top = \`\${Math.max(16, rect.top - 84)}px\`;
            });
            dot.addEventListener('blur', hideTooltip);
        });
    }

    // Initial render
    renderState();
}
`;

fs.writeFileSync('script.js', beforeSpectrum + newSpectrumFunc, 'utf8');
console.log('Script updated successfully!');
