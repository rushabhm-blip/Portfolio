const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf8');

const lookcloserCss = `
/* ==========================================================================
   SECTION 10: LOOK CLOSER - SCROLL-DRIVEN ANATOMY SEQUENCE
   ========================================================================== */

.lookcloser-section {
    position: relative;
    width: 100%;
    height: 580vh; /* 580vh scroll track for paced cinematic inspection */
    background: transparent;
    z-index: 10;
}

.lookcloser-sticky-viewport {
    position: sticky;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding: clamp(1.5rem, 3.5vh, 2.75rem) 1.5rem clamp(1rem, 2.5vh, 2rem);
    pointer-events: none;
    overflow: hidden;
    z-index: 11;
}

/* Editorial Header */
.lookcloser-header {
    text-align: center;
    pointer-events: auto;
    z-index: 15;
    max-width: 820px;
    margin: 0 auto;
}

.lookcloser-badge {
    display: inline-block;
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #A8B9A3;
    margin-bottom: 0.45rem;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.4s ease, transform 0.4s ease;
}

.lookcloser-badge.visible {
    opacity: 0.95;
    transform: translateY(0);
}

.lookcloser-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(38px, 4.5vw, 64px);
    font-weight: 500;
    line-height: 1.12;
    color: #EEECE3;
    margin: 0 0 0.35rem;
    letter-spacing: -0.01em;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.6);
}

.lookcloser-subtitle {
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: clamp(15px, 1.8vw, 18px);
    font-weight: 400;
    color: #A8B9A3;
    line-height: 1.35;
    text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
}

/* Canvas Stage Wrapper */
.lookcloser-stage-wrapper {
    position: relative;
    width: min(94vw, 1260px);
    height: min(62vh, 700px);
    margin: auto 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
}

canvas#lookcloserCanvas {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.45));
}

/* Dynamic Annotation Overlay */
.lookcloser-annotation-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
}

.lookcloser-callout {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 12px;
    opacity: 0;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease, transform 0.3s ease;
    white-space: nowrap;
    pointer-events: none;
    z-index: 20;
}

.lookcloser-callout.active {
    opacity: 1;
}

.lookcloser-dot {
    width: 11px;
    height: 11px;
    background-color: #D94A45; /* Muted red */
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(217, 74, 69, 0.28);
    position: relative;
    flex-shrink: 0;
}

.lookcloser-dot::after {
    content: '';
    position: absolute;
    inset: -6px;
    border: 1px solid rgba(217, 74, 69, 0.55);
    border-radius: 50%;
    animation: lookcloserPulse 2.2s cubic-bezier(0.24, 0, 0.38, 1) infinite;
}

@keyframes lookcloserPulse {
    0% { transform: scale(0.85); opacity: 0.85; }
    50% { transform: scale(1.6); opacity: 0; }
    100% { transform: scale(0.85); opacity: 0; }
}

.lookcloser-leader {
    width: 44px;
    height: 1px;
    background: linear-gradient(90deg, #D94A45, #A8B9A3);
}

.lookcloser-tag {
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: clamp(14px, 1.4vw, 16px);
    font-weight: 500;
    color: #EEECE3;
    background: rgba(13, 26, 18, 0.82);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    padding: 6px 14px;
    border-radius: 4px;
    border: 1px solid rgba(168, 185, 163, 0.3);
    letter-spacing: 0.02em;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.45);
}

/* Footer & Disclaimer */
.lookcloser-footer {
    text-align: center;
    pointer-events: auto;
    z-index: 15;
    max-width: 720px;
    margin: 0 auto;
    padding: 0.4rem 1rem;
}

.lookcloser-disclaimer {
    font-family: 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: clamp(13px, 1.3vw, 15px);
    font-weight: 400;
    color: #A8B9A3;
    opacity: 0.9;
    line-height: 1.4;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

.lookcloser-progress-track {
    margin: 0.6rem auto 0;
    width: 140px;
    height: 2px;
    background: rgba(255, 255, 255, 0.12);
    border-radius: 1px;
    overflow: hidden;
}

.lookcloser-progress-fill {
    width: 0%;
    height: 100%;
    background: #A8B9A3;
    transition: width 0.08s linear;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .lookcloser-section {
        height: 520vh;
    }
    .lookcloser-title {
        font-size: clamp(34px, 8vw, 42px);
    }
    .lookcloser-subtitle {
        font-size: 15px;
    }
    .lookcloser-stage-wrapper {
        width: 96vw;
        height: min(56vh, 480px);
    }
    .lookcloser-tag {
        font-size: 13.5px;
        padding: 5px 10px;
    }
    .lookcloser-leader {
        width: 28px;
    }
}

@media (prefers-reduced-motion: reduce) {
    .lookcloser-section {
        height: auto;
    }
    .lookcloser-sticky-viewport {
        position: relative;
        height: auto;
        padding: 4rem 1.5rem;
    }
}
`;

fs.appendFileSync('style.css', lookcloserCss, 'utf8');
console.log('style.css successfully updated with lookcloser styles.');
