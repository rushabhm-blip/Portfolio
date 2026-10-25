const fs = require('fs');

// --- 1. UPDATE index.html ---
let html = fs.readFileSync('index.html', 'utf8');

// Add id="hero-screen"
html = html.replace(
    '<section class="hero-screen">',
    '<section class="hero-screen" id="hero-screen">'
);

// Add closing section markup after #snakes-neighbourhood-component
const closingSectionHtml = `
        <!-- SECTION 11: CLOSING NARRATIVE - LESS FEAR. MORE UNDERSTANDING. -->
        <section class="closing-screen" id="closing-section" aria-label="Closing thoughts: Less fear. More understanding.">
            <!-- 4K Atmospheric Background Layer -->
            <div class="closing-bg-layer" aria-hidden="true"></div>

            <div class="closing-content">
                <p class="closing-eyebrow">THE STORY DOESN’T END HERE</p>

                <h2 class="closing-heading">
                    <span class="closing-heading-primary">Less fear. More understanding.</span>
                    <span class="closing-heading-secondary">Room for both.</span>
                </h2>

                <div class="closing-supporting">
                    <p class="closing-supporting-line">Knowing the snakes around us is a beginning.</p>
                    <p class="closing-supporting-line">Protecting people and making space for wildlife is what comes next.</p>
                </div>

                <div class="closing-return-wrap">
                    <a href="#hero-screen" class="closing-return-link" id="closingReturnBtn" aria-label="Return to the beginning of the story">
                        <svg class="closing-arrow-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="12" y1="19" x2="12" y2="5"></line>
                            <polyline points="5 12 12 5 19 12"></polyline>
                        </svg>
                        <span>Back to the story</span>
                    </a>
                </div>
            </div>
        </section>
`;

html = html.replace(
    '<!-- Zero height spacer anchor -->\n        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>',
    closingSectionHtml.trim()
);
// In case CRLF
html = html.replace(
    '<!-- Zero height spacer anchor -->\r\n        <div class="scroll-canvas-spacer" id="next-stages-anchor"></div>',
    closingSectionHtml.trim()
);

// Update cache busters
html = html.replace('style.css?v=snc_v3', 'style.css?v=closing_v1');
html = html.replace('script.js?v=snc_v1', 'script.js?v=closing_v1');

fs.writeFileSync('index.html', html);
console.log('Updated index.html successfully!');

// --- 2. UPDATE style.css ---
let css = fs.readFileSync('style.css', 'utf8');

const closingCss = `
/* ==========================================================================
   SECTION 11: CLOSING SCREEN (LESS FEAR. MORE UNDERSTANDING.)
   ========================================================================== */

.closing-screen {
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
}

/* Content Container Centered in Open Upper-Middle Space */
.closing-content {
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-sizing: border-box;
    pointer-events: auto;
}

/* Eyebrow */
.closing-eyebrow {
    font-family: 'Google Sans Flex', -apple-system, sans-serif;
    font-size: clamp(12px, 1vw, 13px);
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #A8B9A3;
    margin: 0 0 clamp(36px, 4.5vh, 48px) 0;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Main Heading */
.closing-heading {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-weight: 500;
    font-size: clamp(40px, 5.2vw, 88px);
    line-height: 1.08;
    margin: 0 0 clamp(32px, 4vh, 40px) 0;
    letter-spacing: -0.015em;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0;
    transform: translateY(16px);
    transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
}

.closing-heading-primary {
    color: #EEECE3;
    display: block;
}

.closing-heading-secondary {
    color: #A8B9A3;
    display: block;
}

/* Supporting Copy */
.closing-supporting {
    max-width: 850px;
    margin: 0 0 clamp(40px, 5vh, 56px) 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    opacity: 0;
    transform: translateY(14px);
    transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.3s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.3s;
}

.closing-supporting-line {
    font-family: 'Google Sans Flex', -apple-system, sans-serif;
    font-size: clamp(16px, 1.35vw, 20px);
    line-height: 1.55;
    color: #EEECE3;
    font-weight: 400;
    margin: 0;
}

/* Return Link Container */
.closing-return-wrap {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.42s, transform 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.42s;
}

.closing-return-link {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #A8B9A3;
    font-family: 'Google Sans Flex', -apple-system, sans-serif;
    font-size: 15px;
    font-weight: 500;
    letter-spacing: 0.04em;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.22s ease, transform 0.22s ease;
}

.closing-return-link:hover {
    color: #EEECE3;
    transform: translateY(-2px);
}

.closing-return-link:focus-visible {
    outline: 2px solid #EEECE3;
    outline-offset: 4px;
}

.closing-arrow-icon {
    transition: transform 0.22s ease;
}

.closing-return-link:hover .closing-arrow-icon {
    transform: translateY(-3px);
}

/* When In View: Revealed State */
.closing-screen.is-revealed .closing-eyebrow,
.closing-screen.is-revealed .closing-heading,
.closing-screen.is-revealed .closing-supporting,
.closing-screen.is-revealed .closing-return-wrap {
    opacity: 1;
    transform: translateY(0);
}

/* Reduced Motion: Immediate display without movement */
@media (prefers-reduced-motion: reduce) {
    .closing-eyebrow,
    .closing-heading,
    .closing-supporting,
    .closing-return-wrap {
        opacity: 1 !important;
        transform: none !important;
        transition: none !important;
    }
    .closing-return-link:hover {
        transform: none !important;
    }
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .closing-screen {
        padding: 60px 24px clamp(180px, 26vh, 260px);
        min-height: 100svh;
    }

    .closing-heading {
        font-size: clamp(36px, 9vw, 52px);
        line-height: 1.12;
    }

    .closing-supporting-line {
        font-size: 16px;
        line-height: 1.5;
    }

    .closing-eyebrow {
        margin-bottom: 28px;
    }

    .closing-supporting {
        margin-bottom: 36px;
    }
}
`;

css = css.trimEnd() + '\n' + closingCss;
fs.writeFileSync('style.css', css);
console.log('Updated style.css successfully!');

// --- 3. UPDATE script.js ---
let js = fs.readFileSync('script.js', 'utf8');

// Add initClosingSection in DOMContentLoaded
js = js.replace(
    'initSharedScaleEnvironment();\n});',
    'initSharedScaleEnvironment();\n    initClosingSection();\n});'
);
js = js.replace(
    'initSharedScaleEnvironment();\r\n});',
    'initSharedScaleEnvironment();\r\n    initClosingSection();\r\n});'
);

const closingJs = `
/**
 * SECTION 11: Closing Screen Controller
 * - Gentle viewport-linked entrance (eyebrow -> heading -> supporting & link)
 * - Reverses naturally when scrolling upward
 * - Remains fully visible while viewing
 * - Respects prefers-reduced-motion
 * - Smooth scroll return to story beginning
 */
function initClosingSection() {
    const section = document.getElementById('closing-section');
    const returnBtn = document.getElementById('closingReturnBtn');
    if (!section) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
        section.classList.add('is-revealed');
    } else {
        function checkVisibility() {
            const rect = section.getBoundingClientRect();
            const vh = window.innerHeight;

            // Trigger entrance when top enters bottom 85% of viewport
            if (rect.top < vh * 0.85) {
                section.classList.add('is-revealed');
            } else if (rect.top > vh * 0.95) {
                // Natural reverse when scrolling back up above the section
                section.classList.remove('is-revealed');
            }
        }

        window.addEventListener('scroll', checkVisibility, { passive: true });
        window.addEventListener('resize', checkVisibility, { passive: true });
        checkVisibility();
    }

    // Return to beginning of story
    if (returnBtn) {
        returnBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById('hero-screen') || document.body;
            target.scrollIntoView({
                behavior: prefersReduced ? 'auto' : 'smooth'
            });
            if (history.pushState) {
                history.pushState(null, null, '#hero-screen');
            }
        });
    }
}
`;

js = js.trimEnd() + '\n' + closingJs;
fs.writeFileSync('script.js', js);
console.log('Updated script.js successfully!');
