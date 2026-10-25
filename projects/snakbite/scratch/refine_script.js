const fs = require('fs');

let code = fs.readFileSync('script.js', 'utf8');

// Replace the initLookCloserSection implementation with the refined version
const startIndex = code.indexOf('function initLookCloserSection() {');
if (startIndex !== -1) {
    const updatedFunc = `function initLookCloserSection() {
    const section = document.getElementById('lookcloser-section');
    const canvas = document.getElementById('lookcloserCanvas');
    const wrapper = document.getElementById('lookcloserStageWrapper');
    const badge = document.getElementById('lookcloserBadge');
    const subtitle = document.getElementById('lookcloserSubtitle');
    const callout = document.getElementById('lookcloserCallout');
    const tag = document.getElementById('lookcloserTag');
    const progressFill = document.getElementById('lookcloserProgressFill');

    if (!section || !canvas || !wrapper) return;

    const ctx = canvas.getContext('2d');
    const CANONICAL_W = 1672;
    const CANONICAL_H = 941;

    // Preload all 12 prototype frames
    const frames = [];
    let loadedCount = 0;
    for (let i = 1; i <= 12; i++) {
        const img = new Image();
        img.src = \`assets/look_closer/frame-\${String(i).padStart(2, '0')}.png\`;
        img.onload = () => {
            loadedCount++;
            if (loadedCount === 12) {
                render();
            }
        };
        frames.push(img);
    }

    // Helper interpolation functions
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function smoothstep(min, max, val) {
        const x = Math.max(0, Math.min(1, (val - min) / (max - min)));
        return x * x * (3 - 2 * x);
    }

    function getCameraAndFrames(p) {
        let focusX = 836;
        let focusY = 540;
        let zoom = 1.0;
        let activeFrameA = 1;
        let activeFrameB = 1;
        let blend = 0;
        let annotation = "Body form";
        let dotX = 680;
        let dotY = 550;
        let showBadge = false;

        if (p <= 0.10) {
            // 0 - 10%: Whole snake, Frame 1
            focusX = 836;
            focusY = 540;
            zoom = 1.0;
            activeFrameA = 1;
            activeFrameB = 1;
            blend = 0;
            annotation = "Body form";
            dotX = 680;
            dotY = 550;
            showBadge = false;
        } else if (p <= 0.26) {
            // 10 - 26%: Advance frames 2, 3, 4 toward head profile
            const t = (p - 0.10) / 0.16;
            focusX = lerp(836, 1540, smoothstep(0, 1, t));
            focusY = lerp(540, 420, smoothstep(0, 1, t));
            zoom = lerp(1.0, 2.2, smoothstep(0, 1, t));
            annotation = "Head profile";
            dotX = 1580;
            dotY = 415;
            showBadge = true;

            if (t < 0.33) {
                const subT = t / 0.33;
                activeFrameA = 1;
                activeFrameB = 2;
                blend = smoothstep(0.4, 0.6, subT);
            } else if (t < 0.66) {
                const subT = (t - 0.33) / 0.33;
                activeFrameA = 2;
                activeFrameB = 3;
                blend = smoothstep(0.4, 0.6, subT);
            } else {
                const subT = (t - 0.66) / 0.34;
                activeFrameA = 3;
                activeFrameB = 4;
                blend = smoothstep(0.4, 0.6, subT);
            }
        } else if (p <= 0.42) {
            // 26 - 42%: Frames 5, 6 closer to pupil
            const t = (p - 0.26) / 0.16;
            focusX = lerp(1540, 1535, smoothstep(0, 1, t));
            focusY = lerp(420, 425, smoothstep(0, 1, t));
            zoom = lerp(2.2, 3.2, smoothstep(0, 1, t));
            annotation = "Pupil shape";
            dotX = 1535;
            dotY = 425;
            showBadge = true;

            if (t < 0.5) {
                const subT = t / 0.5;
                activeFrameA = 4;
                activeFrameB = 5;
                blend = smoothstep(0.4, 0.6, subT);
            } else {
                const subT = (t - 0.5) / 0.5;
                activeFrameA = 5;
                activeFrameB = 6;
                blend = smoothstep(0.4, 0.6, subT);
            }
        } else if (p <= 0.60) {
            // 42 - 60%: Frames 7, 8 pull back slightly & pan to body scales
            const t = (p - 0.42) / 0.18;
            focusX = lerp(1535, 980, smoothstep(0, 1, t));
            focusY = lerp(425, 550, smoothstep(0, 1, t));
            zoom = lerp(3.2, 2.0, smoothstep(0, 1, t));
            annotation = "Scale texture";
            dotX = 980;
            dotY = 540;
            showBadge = true;

            if (t < 0.5) {
                const subT = t / 0.5;
                activeFrameA = 6;
                activeFrameB = 7;
                blend = smoothstep(0.4, 0.6, subT);
            } else {
                const subT = (t - 0.5) / 0.5;
                activeFrameA = 7;
                activeFrameB = 8;
                blend = smoothstep(0.4, 0.6, subT);
            }
        } else if (p <= 0.69) {
            // 60 - 69%: Return camera to head while holding 8, introduce 9 (mouth opening)
            const t = (p - 0.60) / 0.09;
            focusX = lerp(980, 1480, smoothstep(0, 1, t));
            focusY = lerp(550, 440, smoothstep(0, 1, t));
            zoom = lerp(2.0, 2.5, smoothstep(0, 1, t));
            annotation = "Mouth opening";
            dotX = 1540;
            dotY = 440;
            showBadge = true;

            if (t < 0.5) {
                activeFrameA = 8;
                activeFrameB = 8;
                blend = 0;
            } else {
                const subT = (t - 0.5) / 0.5;
                activeFrameA = 8;
                activeFrameB = 9;
                blend = smoothstep(0.4, 0.6, subT);
            }
        } else if (p <= 0.85) {
            // 69 - 85%: Frames 10, 11 (front fangs), hold fully open to inspect
            const t = (p - 0.69) / 0.16;
            focusX = lerp(1480, 1460, smoothstep(0, 1, t));
            focusY = lerp(440, 460, smoothstep(0, 1, t));
            zoom = lerp(2.5, 2.5, smoothstep(0, 1, t));
            annotation = "Front fangs";
            dotX = 1525;
            dotY = 485;
            showBadge = true;

            if (t < 0.3) {
                const subT = t / 0.3;
                activeFrameA = 9;
                activeFrameB = 10;
                blend = smoothstep(0.4, 0.6, subT);
            } else if (t < 0.6) {
                const subT = (t - 0.3) / 0.3;
                activeFrameA = 10;
                activeFrameB = 11;
                blend = smoothstep(0.4, 0.6, subT);
            } else {
                activeFrameA = 11;
                activeFrameB = 11;
                blend = 0;
            }
        } else {
            // 85 - 100%: Close mouth reversing 10, 09 before 12, pull back smoothly to full view
            const t = (p - 0.85) / 0.15;
            focusX = lerp(1460, 836, smoothstep(0, 1, t));
            focusY = lerp(460, 540, smoothstep(0, 1, t));
            zoom = lerp(2.5, 1.0, smoothstep(0, 1, t));
            annotation = "Different species. Different anatomy.";
            dotX = lerp(1525, 836, t);
            dotY = lerp(485, 540, t);
            showBadge = t < 0.75;

            if (t < 0.25) {
                const subT = t / 0.25;
                activeFrameA = 11;
                activeFrameB = 10;
                blend = smoothstep(0.4, 0.6, subT);
            } else if (t < 0.5) {
                const subT = (t - 0.25) / 0.25;
                activeFrameA = 10;
                activeFrameB = 9;
                blend = smoothstep(0.4, 0.6, subT);
            } else if (t < 0.75) {
                const subT = (t - 0.5) / 0.25;
                activeFrameA = 9;
                activeFrameB = 12;
                blend = smoothstep(0.4, 0.6, subT);
            } else {
                activeFrameA = 12;
                activeFrameB = 12;
                blend = 0;
            }
        }

        return { focusX, focusY, zoom, activeFrameA, activeFrameB, blend, annotation, dotX, dotY, showBadge };
    }

    function resizeCanvas() {
        const rect = wrapper.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(rect.width * dpr);
        canvas.height = Math.round(rect.height * dpr);
    }

    function getScrollProgress() {
        const rect = section.getBoundingClientRect();
        const scrollDist = rect.height - window.innerHeight;
        if (scrollDist <= 0) return 0;
        const progress = -rect.top / scrollDist;
        return Math.max(0, Math.min(1, progress));
    }

    function render() {
        const p = getScrollProgress();
        if (progressFill) {
            progressFill.style.width = (p * 100) + '%';
        }

        const state = getCameraAndFrames(p);

        // Badge visibility
        if (badge) {
            if (state.showBadge) {
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        }

        // Subtitle text update at ending
        if (subtitle) {
            subtitle.textContent = "Different species. Different anatomy.";
        }

        const rect = wrapper.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = canvas.width;
        const ch = canvas.height;

        ctx.clearRect(0, 0, cw, ch);

        // Normalize every source image into canonical 1672x941 drawing rectangle
        const baseScale = Math.min(cw / CANONICAL_W, ch / CANONICAL_H);
        const s = baseScale * state.zoom;

        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.scale(s, s);
        ctx.translate(-state.focusX, -state.focusY);

        const imgA = frames[state.activeFrameA - 1];
        const imgB = frames[state.activeFrameB - 1];

        if (imgA && imgA.complete) {
            ctx.globalAlpha = 1.0 - state.blend;
            ctx.drawImage(imgA, 0, 0, CANONICAL_W, CANONICAL_H);
        }

        if (imgB && imgB.complete && state.blend > 0) {
            ctx.globalAlpha = state.blend;
            ctx.drawImage(imgB, 0, 0, CANONICAL_W, CANONICAL_H);
        }

        // Feather the far-left prototype edge during close-ups (p between 0.15 and 0.88)
        if (p > 0.15 && p < 0.88) {
            ctx.globalCompositeOperation = 'destination-out';
            const edgeGrad = ctx.createLinearGradient(0, 0, 160, 0);
            edgeGrad.addColorStop(0, 'rgba(0,0,0,1)');
            edgeGrad.addColorStop(0.6, 'rgba(0,0,0,0.85)');
            edgeGrad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = edgeGrad;
            ctx.fillRect(0, 0, 160, CANONICAL_H);
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();

        // Calculate screen coordinates for feature annotation
        const screenX = (rect.width / 2) + (state.dotX - state.focusX) * (baseScale * state.zoom / dpr);
        const screenY = (rect.height / 2) + (state.dotY - state.focusY) * (baseScale * state.zoom / dpr);

        if (callout && tag) {
            if (p < 0.90) {
                callout.classList.add('active');
                callout.style.left = screenX + 'px';
                callout.style.top = screenY + 'px';
                tag.textContent = state.annotation;
            } else {
                callout.classList.remove('active');
            }
        }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                render();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        resizeCanvas();
        render();
    });

    resizeCanvas();
    render();
}
`;
    code = code.slice(0, startIndex) + updatedFunc;
    fs.writeFileSync('script.js', code, 'utf8');
    console.log('script.js updated with refined initLookCloserSection.');
}
