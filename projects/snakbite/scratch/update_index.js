const fs = require('fs');

// 1. Update index.html
let html = fs.readFileSync('index.html', 'utf8');

const targetSectionAnchor = `        <!-- Downward scroll space for subsequent story stages -->\r\n        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>`;
const targetSectionAnchorLF = `        <!-- Downward scroll space for subsequent story stages -->\n        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>`;

const newSectionHtml = `        <!-- SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE -->
        <section class="lookcloser-section" id="lookcloser-section" aria-label="Look closer: Species anatomy comparison">
            <div class="lookcloser-sticky-viewport">
                <!-- 1. Top Editorial Header -->
                <header class="lookcloser-header">
                    <div class="lookcloser-badge" id="lookcloserBadge">Illustrative species comparison</div>
                    <h2 class="lookcloser-title">Look closer.</h2>
                    <p class="lookcloser-subtitle" id="lookcloserSubtitle">Different species. Different anatomy.</p>
                </header>

                <!-- 2. Interactive Canvas Stage -->
                <div class="lookcloser-stage-wrapper" id="lookcloserStageWrapper">
                    <canvas id="lookcloserCanvas" role="img" aria-label="Scroll-driven anatomical comparison between Indian rat snake and Russell's viper"></canvas>
                    
                    <!-- Dynamic Feature Annotation Overlay -->
                    <div class="lookcloser-annotation-overlay" id="lookcloserAnnotationOverlay" aria-hidden="true">
                        <div class="lookcloser-callout" id="lookcloserCallout">
                            <span class="lookcloser-dot"></span>
                            <span class="lookcloser-leader"></span>
                            <span class="lookcloser-tag" id="lookcloserTag">Body form</span>
                        </div>
                    </div>
                </div>

                <!-- 3. Bottom Footer & Disclaimer -->
                <footer class="lookcloser-footer">
                    <p class="lookcloser-disclaimer">Appearance alone cannot identify a venomous snake. Observe from a distance.</p>
                    <div class="lookcloser-progress-track" aria-hidden="true">
                        <div class="lookcloser-progress-fill" id="lookcloserProgressFill"></div>
                    </div>
                </footer>
            </div>
        </section>

        <!-- Downward scroll space for subsequent story stages -->
        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>`;

if (html.includes(targetSectionAnchor)) {
  html = html.replace(targetSectionAnchor, newSectionHtml);
  console.log('Replaced target anchor (CRLF)');
} else if (html.includes(targetSectionAnchorLF)) {
  html = html.replace(targetSectionAnchorLF, newSectionHtml);
  console.log('Replaced target anchor (LF)');
} else {
  console.error('Could not find targetSectionAnchor in index.html!');
}

// Bump cache buster
html = html.replace(/script\.js\?v=[\w_]+/g, 'script.js?v=lookcloser_v1');
html = html.replace(/style\.css\?v=[\w_]+/g, 'style.css?v=lookcloser_v1');

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html successfully updated.');
