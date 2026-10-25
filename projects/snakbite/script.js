/**
 * PANIC VS POISON: A STORY OF FEAR AND COEXISTENCE
 * Parallax Canvas & Snake Entrance Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundParallax();
    initAmbientEmbers();
    initSnakeEntrance();
    initLandscapeLayerStory();
    initUnseenChapter();
    initDiversityScrolly();
    initThreatChapter();
    initSpectrumSection();
    initBigFourSection();
    initSharedScaleEnvironment();
    initClosingSection();
});

/**
 * Continuous Parallax Depth & Interactive Pointer Tilt
 */
function initBackgroundParallax() {
    const bg = document.getElementById('parallax-bg');
    const snakeContainer = document.getElementById('snake-container');
    if (!bg) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener('mousemove', (e) => {
        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        targetX = (e.clientX - halfW) / halfW;
        targetY = (e.clientY - halfH) / halfH;
    }, { passive: true });

    let scrollY = window.scrollY;
    let targetScrollY = scrollY;
    window.addEventListener('scroll', () => {
        targetScrollY = window.scrollY;
    }, { passive: true });

    function loop() {
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;
        scrollY += (targetScrollY - scrollY) * 0.08;

        const maxParallax = 120;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? scrollY / totalHeight : 0;
        const scrollOffset = progress * -maxParallax;

        const tiltX = (currentX * -8).toFixed(2);
        const tiltY = (currentY * -6 + scrollOffset).toFixed(2);

        bg.style.transform = `translate3d(${tiltX}px, ${tiltY}px, 0) scale(1.04)`;

        // Snake subtle parallax on scroll: glides naturally with scroll and pointer
        if (snakeContainer && snakeContainer.classList.contains('is-entered')) {
            const snakeScrollShift = -scrollY * 0.28;
            const snakeTiltX = (currentX * 10).toFixed(2);
            const snakeTiltY = (currentY * 8 + snakeScrollShift).toFixed(2);
            snakeContainer.style.transform = `translate3d(${snakeTiltX}px, ${snakeTiltY}px, 0)`;
        }

        requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}

/**
 * Snake Entrance Animation:
 * After user loads the page and sees the topic name and dark background,
 * the snake gracefully slithers into view and moves across the hero stage.
 * [RESTORE NOTE] Previous video froze on ended: snakeVideo.loop = false
 */
function initSnakeEntrance() {
    const snakeContainer = document.getElementById('snake-container');
    const snakeVideo = document.getElementById('snake-video');
    if (!snakeContainer) return;

    if (snakeVideo) {
        snakeVideo.loop = true;
        // Trigger autoplay
        snakeVideo.play().catch(e => console.log('Autoplay handled:', e));
    }

    // Brief delay to allow background & headline to register first
    setTimeout(() => {
        snakeContainer.classList.add('is-entered');
        if (snakeVideo && snakeVideo.paused) {
            snakeVideo.play().catch(e => console.log('Autoplay handled:', e));
        }
    }, 300);
}

/**
 * Subtle Ambient Warm Embers / Fireflies
 * Adds gentle floating golden specks as seen in the reference aesthetic
 */
function initAmbientEmbers() {
    const canvas = document.getElementById('ambient-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }, { passive: true });

    const numParticles = 28;
    const particles = [];

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            radius: Math.random() * 1.8 + 0.8,
            alpha: Math.random() * 0.55 + 0.15,
            speedY: Math.random() * 0.35 + 0.12,
            speedX: (Math.random() - 0.5) * 0.25,
            pulseSpeed: Math.random() * 0.02 + 0.01,
            pulseVal: Math.random() * Math.PI * 2
        });
    }

    function render() {
        ctx.clearRect(0, 0, w, h);

        for (let i = 0; i < numParticles; i++) {
            const p = particles[i];
            p.y -= p.speedY;
            p.x += p.speedX;
            p.pulseVal += p.pulseSpeed;

            if (p.y < -10) {
                p.y = h + 10;
                p.x = Math.random() * w;
            }
            if (p.x < -10) p.x = w + 10;
            if (p.x > w + 10) p.x = -10;

            const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulseVal));

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(235, 196, 110, ${currentAlpha.toFixed(3)})`;
            ctx.shadowColor = 'rgba(245, 190, 80, 0.7)';
            ctx.shadowBlur = 8;
            ctx.fill();
        }

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}

/**
 * Landscape & Crack Takeover Controller:
 * As user scrolls down, Screen 1 (Hero Title & Snake) gracefully fades out and disappears.
/**
 * Section 2: Progressive 2D Layered Landscape Emergence & The Fracture
 * Slowly reveals one by one as the user scrolls:
 * Mountains -> Land -> Trees -> Homes -> The Crack.
 * Plus prepares the foundation for future sections where the crack fills and heals.
 */
function initLandscapeLayerStory() {
    const heroContent = document.querySelector('.hero-content');
    const snakeContainer = document.getElementById('snake-container');
    const landscapeScreen = document.getElementById('landscape-screen');

    const layerMountains = document.getElementById('layer-mountains');
    const layerLand = document.getElementById('layer-land');
    const layerTrees = document.getElementById('layer-trees');
    const layerHomes = document.getElementById('layer-homes');
    const layerCrack = document.getElementById('layer-crack');
    const layerPanorama = document.getElementById('layer-panorama');
    const layersContainer = document.getElementById('landscape-layers-container');
    const layersTopFeather = document.querySelector('.landscape-layers-top-feather');
    const layersBottomFeather = document.querySelector('.landscape-layers-bottom-feather');

    const habitatLeft = document.getElementById('habitat-left');
    const habitatRight = document.getElementById('habitat-right') || document.getElementById('habitat-card');
    const layerEncounter = document.getElementById('layer-encounter');
    const encounterCtx = layerEncounter ? layerEncounter.getContext('2d') : null;

    const ENCOUNTER_FRAME_SRCS = [
        'assets/frames/img_5.png', // 0: Frame 01 - Approach
        'assets/frames/img_7.png', // 1: Frame 02 - Notice
        'assets/frames/img_8.png', // 2: Frame 03 - React (Corrected)
        'assets/frames/img_6.png', // 3: Frame 04 - Turn left
        'assets/frames/img_2.png', // 4: Frame 05 - Cross crack A
        'assets/frames/img_3.png', // 5: Frame 06 - Cross crack B
        'assets/frames/img_0.png', // 6: Frame 07 - Retreat
        'assets/frames/img_1.png'  // 7: Frame 08 - Safe distance hold
    ];

    const encounterImages = [];
    ENCOUNTER_FRAME_SRCS.forEach((src, idx) => {
        const img = new Image();
        img.src = src;
        if (idx === 3) {
            // Frame 04 (img_6.png) was drawn 11% larger (398px vs 360px).
            // Pre-normalize onto an offscreen canvas to guarantee identical 360px character height & 498px foot baseline.
            img.onload = () => {
                const offCanvas = document.createElement('canvas');
                offCanvas.width = 1024;
                offCanvas.height = 576;
                const offCtx = offCanvas.getContext('2d');
                const s = 360 / 398;
                const dx = 83;
                const dy = 32.2;
                offCtx.drawImage(img, dx, dy, 1024 * s, 576 * s);
                encounterImages[idx] = offCanvas;
            };
        } else {
            encounterImages[idx] = img;
        }
    });

    const ENCOUNTER_MILESTONES = [
        { t: 0.00, frame: 0 },
        { t: 0.12, frame: 1 },
        { t: 0.25, frame: 2 },
        { t: 0.38, frame: 3 },
        { t: 0.48, frame: 4 },
        { t: 0.58, frame: 5 },
        { t: 0.68, frame: 6 },
        { t: 0.88, frame: 7 },
        { t: 1.00, frame: 7 }
    ];

    function resizeEncounterCanvas() {
        if (!layerEncounter || !encounterCtx) return;
        const dpr = window.devicePixelRatio || 1;
        layerEncounter.width = window.innerWidth * dpr;
        layerEncounter.height = window.innerHeight * dpr;
        encounterCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resizeEncounterCanvas();
    window.addEventListener('resize', resizeEncounterCanvas);

    function calculateEncounterFraming(vpW, vpH) {
        const groundY = Math.min(vpH * 0.92, Math.max(vpH * 0.84, vpH - 65));
        
        // Static ceiling baseline (headroom below upper-right text) independent of animated transform
        const staticCeilingY = Math.max(vpH * 0.38, 310);

        const maxVillagerH = Math.max(220, groundY - staticCeilingY);
        let scale = maxVillagerH / 360;
        const maxScale = Math.min(vpW / 1024, (vpH * 0.56) / 360);
        scale = Math.min(scale, maxScale);

        const renderW = 1024 * scale;
        const renderH = 576 * scale;
        const renderT = groundY - 498 * scale;

        const bgCrackX = vpW * 0.534;
        const frameCrackX = 534 * scale;
        let renderL = bgCrackX - frameCrackX;

        if (renderL + 980 * scale > vpW) {
            renderL = vpW - 980 * scale - 15;
        }
        if (renderL < 0) {
            renderL = Math.max(renderL, vpW - renderW);
        }

        return { renderW, renderH, renderL, renderT, scale };
    }

    function renderEncounterScene(t, alpha) {
        if (!encounterCtx || !layerEncounter || alpha <= 0.001) {
            if (encounterCtx) encounterCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            if (layerEncounter) layerEncounter.style.opacity = '0';
            return;
        }

        const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const vpW = window.innerWidth;
        const vpH = window.innerHeight;
        encounterCtx.clearRect(0, 0, vpW, vpH);

        const { renderW, renderH, renderL, renderT } = calculateEncounterFraming(vpW, vpH);
        layerEncounter.style.opacity = alpha.toFixed(3);

        if (isReducedMotion) {
            encounterCtx.globalAlpha = 1.0;
            const finalImg = encounterImages[7];
            if (finalImg && (finalImg.complete || finalImg instanceof HTMLCanvasElement)) {
                encounterCtx.drawImage(finalImg, 0, 0, 1024, 576, renderL, renderT, renderW, renderH);
            }
            return;
        }

        // Discrete snap to nearest frame so at any scroll stop it displays a single clean frame with ZERO ghosting
        let activeFrame = 0;
        for (let i = 0; i < ENCOUNTER_MILESTONES.length - 1; i++) {
            const m1 = ENCOUNTER_MILESTONES[i];
            const m2 = ENCOUNTER_MILESTONES[i+1];
            if (t >= m1.t && t <= m2.t) {
                const span = m2.t - m1.t;
                const progressInSpan = span > 0 ? (t - m1.t) / span : 0;
                activeFrame = progressInSpan < 0.5 ? m1.frame : m2.frame;
                break;
            }
        }
        if (t >= 0.88) activeFrame = 7;

        const img = encounterImages[activeFrame];
        if (img && (img.complete || img instanceof HTMLCanvasElement)) {
            encounterCtx.globalAlpha = 1.0;
            encounterCtx.drawImage(img, 0, 0, 1024, 576, renderL, renderT, renderW, renderH);
        }
        encounterCtx.globalAlpha = 1.0;
    }
    const mountainStory = document.getElementById('mountain-story');
    const mountainMapContainer = document.getElementById('mountain-map-container');
    const mapMainlandStroke = document.getElementById('map-mainland-stroke');
    const mapIslandsStroke = document.getElementById('map-islands-stroke');
    const mapOutlineLayer = document.getElementById('map-outline-layer');
    const mapFillLayer = document.getElementById('map-fill-layer');
    const mapMaskRect = document.getElementById('map-mask-rect');
    const mLine1 = document.getElementById('m-line-1');
    const mLine2 = document.getElementById('m-line-2');
    const mountainSubtext = document.getElementById('mountain-subtext');
    const MAINLAND_PATH_LENGTH = 3390;

    if (mapMainlandStroke) {
        mapMainlandStroke.style.strokeDasharray = MAINLAND_PATH_LENGTH;
        mapMainlandStroke.style.strokeDashoffset = MAINLAND_PATH_LENGTH;
    }

    const statBeat1 = document.getElementById('stat-beat-1');
    const crisisEyebrow = document.getElementById('crisis-eyebrow');
    const crisisHeadline = document.getElementById('crisis-headline');
    const crisisNum1 = document.getElementById('crisis-num-1');
    const crisisWordIn = document.getElementById('crisis-word-in');
    const crisisNum2 = document.getElementById('crisis-num-2');
    const crisisStatLabel = document.getElementById('crisis-stat-label');
    const crisisDivider = document.getElementById('crisis-divider');
    const crisisExpLine1 = document.getElementById('crisis-exp-line-1');
    const crisisExpLine2 = document.getElementById('crisis-exp-line-2');
    const crisisExpLine3 = document.getElementById('crisis-exp-line-3');
    const crisisIndia = document.getElementById('crisis-india');
    const statBeat2 = document.getElementById('stat-beat-2');
    const statBeat3 = document.getElementById('stat-beat-3');
    const hourlyCompositionWrapper = document.getElementById('hourly-composition-wrapper');
    const hourlyTextStack = document.getElementById('hourly-text-stack');
    const snakebiteWrapper = document.getElementById('hourly-snakebite-wrapper');
    const snakebiteCanvas = document.getElementById('hourly-snakebite-canvas');
    const snakebiteCtx = snakebiteCanvas ? snakebiteCanvas.getContext('2d') : null;
    const statBeat4 = document.getElementById('stat-beat-4');
    const statBeat5 = document.getElementById('stat-beat-5');
    const counter58k = document.getElementById('counter-58k');
    const statsScrim = document.getElementById('stats-scrim');
    const paddySceneStage = document.getElementById('paddy-scene-stage');
    const paddyStoryCard = document.getElementById('paddy-story-card');
    const paddyStoryScrim = document.getElementById('paddy-story-scrim');
    const paddySankeyStage = document.getElementById('paddy-sankey-stage');
    const sankeyIframe = document.getElementById('sankey-iframe');
    // ==========================================================================
    // SNAKEBITE CONTROLLER (5 Key Poses Mapped Directly to Scroll Progress)
    // 0%–24%: Frame 1 (snake beside clean ankle)
    // 24%–40%: Frame 2 (snake prepares to strike)
    // 40%–50%: Frame 3 (snake contacts ankle)
    // 50%–66%: Frame 4 (snake withdraws; bite mark appears)
    // 66%–100%: Frame 5 (snake retreats; bite mark remains)
    // ==========================================================================
    const SNAKEBITE_FRAME_PATHS = [
        'assets/snakebite_animation/snakebite-01.png',
        'assets/snakebite_animation/snakebite-02.png',
        'assets/snakebite_animation/snakebite-03.png',
        'assets/snakebite_animation/snakebite-04.png',
        'assets/snakebite_animation/snakebite-05.png'
    ];

    const snakebiteImages = new Array(5);
    let currentSnakebiteFrameIdx = -1;

    function drawSnakebiteFrame(frameIndex) {
        if (!snakebiteCtx || !snakebiteCanvas) return;
        const img = snakebiteImages[frameIndex];
        if (img && (img.complete || img.naturalWidth > 0)) {
            snakebiteCtx.clearRect(0, 0, 1254, 1254);
            snakebiteCtx.drawImage(img, 0, 0, 1254, 1254);
        }
    }

    // Preload & decode all 5 frames
    for (let i = 0; i < 5; i++) {
        const img = new Image();
        img.src = SNAKEBITE_FRAME_PATHS[i];
        if (i === 0) {
            img.onload = () => {
                if (currentSnakebiteFrameIdx === -1 || currentSnakebiteFrameIdx === 0) {
                    currentSnakebiteFrameIdx = 0;
                    drawSnakebiteFrame(0);
                }
            };
            if (img.complete && img.naturalWidth > 0 && currentSnakebiteFrameIdx === -1) {
                currentSnakebiteFrameIdx = 0;
                drawSnakebiteFrame(0);
            }
        }
        if (img.decode) {
            img.decode().then(() => {
                if (currentSnakebiteFrameIdx === i) {
                    drawSnakebiteFrame(i);
                }
            }).catch(() => {});
        }
        snakebiteImages[i] = img;
    }

    function setSnakebiteFrameFromProgress(p) {
        const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReducedMotion) {
            if (currentSnakebiteFrameIdx !== 4) {
                currentSnakebiteFrameIdx = 4;
                drawSnakebiteFrame(4);
            }
            return;
        }

        let targetFrame = 0;
        if (p < 0.24) {
            targetFrame = 0;
        } else if (p < 0.40) {
            targetFrame = 1;
        } else if (p < 0.50) {
            targetFrame = 2;
        } else if (p < 0.66) {
            targetFrame = 3;
        } else {
            targetFrame = 4;
        }

        if (targetFrame !== currentSnakebiteFrameIdx) {
            currentSnakebiteFrameIdx = targetFrame;
            drawSnakebiteFrame(targetFrame);
        }
    }

    if (!landscapeScreen || !layerMountains) return;

    // Initial state setup
    layerMountains.style.opacity = '0';
    layerLand.style.opacity = '0';
    layerTrees.style.opacity = '0';
    layerHomes.style.opacity = '0';
    layerCrack.style.opacity = '0';
    layerCrack.style.clipPath = 'inset(0 0 100% 0)';
    if (layerPanorama) layerPanorama.style.opacity = '0';
    if (layersTopFeather) layersTopFeather.style.opacity = '0';
    if (layersBottomFeather) layersBottomFeather.style.opacity = '0';
    if (paddySceneStage) {
        paddySceneStage.style.transform = 'translate3d(0, 100vh, 0)';
        paddySceneStage.style.visibility = 'hidden';
    }
    if (paddyStoryCard) {
        paddyStoryCard.style.opacity = '0';
    }
    if (paddyStoryScrim) {
        paddyStoryScrim.style.opacity = '0';
    }
    if (paddySankeyStage) {
        paddySankeyStage.style.opacity = '0';
        paddySankeyStage.style.pointerEvents = 'none';
    }

    if (statBeat1) {
        statBeat1.style.opacity = '0';
        renderCrisisBeat(0);
    }
    if (statBeat2) statBeat2.style.opacity = '0';
    if (statBeat3) {
        statBeat3.style.opacity = '0';
        renderHourlyBeat(0);
    }
    if (statBeat4) statBeat4.style.opacity = '0';
    if (statBeat5) statBeat5.style.opacity = '0';

    // 58,000 Counter Animation Controller
    let counterStarted = false;
    let counterAnimId = null;
    const numFormatter = new Intl.NumberFormat('en-US');

    function start58kCount() {
        if (counterStarted) return;
        counterStarted = true;
        if (counterAnimId) cancelAnimationFrame(counterAnimId);

        const startTime = performance.now();
        const duration = 1000; // ~1 second as requested
        const targetVal = 58000;

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease-out cubic for rapid roll and clean landing
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.round(easeOut * targetVal);

            if (counter58k) {
                counter58k.textContent = numFormatter.format(currentVal);
            }

            if (progress < 1) {
                counterAnimId = requestAnimationFrame(step);
            } else {
                if (counter58k) counter58k.textContent = numFormatter.format(targetVal);
                counterAnimId = null;
            }
        }
        counterAnimId = requestAnimationFrame(step);
    }

    function reset58kCount() {
        if (!counterStarted) return;
        counterStarted = false;
        if (counterAnimId) {
            cancelAnimationFrame(counterAnimId);
            counterAnimId = null;
        }
        if (counter58k) {
            counter58k.textContent = "0";
        }
    }


    // Universal Smooth Easing Function (Cosine S-Curve: zero velocity at start and end)
    function smoothEase(t) {
        const clamped = Math.max(0, Math.min(1, t));
        return 0.5 - 0.5 * Math.cos(clamped * Math.PI);
    }

    // Smart Animate Card Engine:
    // Computes organic S-curve easing, smooth vertical float, subtle micro-scale,
    // and gentle optical focus for a uniform, premium editorial feel across all beats.
    function calcCardState(p, start, enterEnd, exitStart, end) {
        if (p < start || p > end) {
            const offY = p < start ? 22 : -18;
            return { opacity: 0, translateY: offY, scale: 0.965, blur: 3.5, visible: false };
        }
        if (p <= enterEnd) {
            const rawT = (p - start) / (enterEnd - start);
            const ease = 0.5 - 0.5 * Math.cos(Math.max(0, Math.min(1, rawT)) * Math.PI);
            return {
                opacity: ease,
                translateY: (1 - ease) * 22,
                scale: 0.965 + ease * 0.035, // 0.965 -> 1.000
                blur: (1 - ease) * 3.5,      // 3.5px -> 0px
                visible: true
            };
        }
        if (p <= exitStart) {
            return {
                opacity: 1,
                translateY: 0,
                scale: 1.0,
                blur: 0,
                visible: true
            };
        }
        const rawT = (p - exitStart) / (end - exitStart);
        const ease = 0.5 - 0.5 * Math.cos(Math.max(0, Math.min(1, rawT)) * Math.PI);
        return {
            opacity: 1 - ease,
            translateY: -ease * 18,
            scale: 1.0 - ease * 0.03, // 1.000 -> 0.970
            blur: ease * 3.5,         // 0px -> 3.5px
            visible: true
        };
    }

    // ==========================================================================
    // CRISIS BEAT 1: "A CRISIS MEASURED IN SILENCE" (Progress 0.0 -> 1.0)
    // Normalized scroll animation engine scoped to Section 2 Beat 1
    // ==========================================================================
    function renderCrisisBeat(beatP) {
        if (!crisisEyebrow) return;

        const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (isReducedMotion) {
            crisisEyebrow.style.opacity = '1';
            crisisEyebrow.style.transform = 'translateY(0)';
            if (crisisHeadline) { crisisHeadline.style.opacity = '1'; crisisHeadline.style.transform = 'translateY(0)'; }
            if (crisisNum1) { crisisNum1.style.opacity = '1'; crisisNum1.style.color = '#EEECE3'; }
            if (crisisWordIn) { crisisWordIn.style.opacity = '1'; crisisWordIn.style.color = '#EEECE3'; }
            if (crisisNum2) { crisisNum2.style.opacity = '1'; crisisNum2.style.color = '#EEECE3'; }
            if (crisisStatLabel) { crisisStatLabel.style.opacity = '1'; crisisStatLabel.style.transform = 'translateY(0)'; }
            if (crisisDivider) {
                crisisDivider.style.opacity = '1';
                crisisDivider.style.transform = window.innerWidth <= 768 ? 'scaleX(1)' : 'scaleY(1)';
            }
            if (crisisExpLine1) { crisisExpLine1.style.opacity = '1'; crisisExpLine1.style.transform = 'translateY(0)'; }
            if (crisisExpLine2) { crisisExpLine2.style.opacity = '1'; crisisExpLine2.style.transform = 'translateY(0)'; }
            if (crisisExpLine3) { crisisExpLine3.style.opacity = '1'; crisisExpLine3.style.transform = 'translateY(0)'; }
            if (crisisIndia) crisisIndia.style.color = '#BC7868';
            return;
        }

        // Clamp normalized beat progress between 0 and 1
        const p = Math.min(1, Math.max(0, beatP));

        // 1. 0 - 15%: INTRODUCTION
        // Eyebrow: Opacity 0 -> 1, translateY 10px -> 0 (0 to 9%)
        const tEye = Math.min(1, Math.max(0, p / 0.09));
        const easeEye = smoothEase(tEye);
        crisisEyebrow.style.opacity = easeEye.toFixed(3);
        crisisEyebrow.style.transform = `translateY(${((1 - easeEye) * 10).toFixed(1)}px)`;

        // Heading: Opacity 0 -> 1, translateY 10px -> 0 (followed slightly: 4 to 15%)
        if (crisisHeadline) {
            const tHead = Math.min(1, Math.max(0, (p - 0.04) / 0.11));
            const easeHead = smoothEase(tHead);
            crisisHeadline.style.opacity = easeHead.toFixed(3);
            crisisHeadline.style.transform = `translateY(${((1 - easeHead) * 10).toFixed(1)}px)`;
        }

        // 2. 15 - 30%: STATISTIC REVEAL
        // Numerals 1 and 2 reveal together in sage #A8B9A3 (15 to 20%)
        const tNums = Math.min(1, Math.max(0, (p - 0.15) / 0.05));
        const easeNums = smoothEase(tNums);
        if (crisisNum1) crisisNum1.style.opacity = easeNums.toFixed(3);
        if (crisisNum2) crisisNum2.style.opacity = easeNums.toFixed(3);

        // Small italic "in" reveals between them shortly after (18 to 22%)
        const tIn = Math.min(1, Math.max(0, (p - 0.18) / 0.04));
        const easeIn = smoothEase(tIn);
        if (crisisWordIn) crisisWordIn.style.opacity = easeIn.toFixed(3);

        // Transition entire phrase from sage (#A8B9A3) to ivory (#EEECE3) (23 to 27%)
        const tIvory = Math.min(1, Math.max(0, (p - 0.23) / 0.04));
        const easeIvory = smoothEase(tIvory);
        const rIv = Math.round(168 + (238 - 168) * easeIvory);
        const gIv = Math.round(185 + (236 - 185) * easeIvory);
        const bIv = Math.round(163 + (227 - 163) * easeIvory);
        const phraseColor = `rgb(${rIv}, ${gIv}, ${bIv})`;
        if (crisisNum1) crisisNum1.style.color = phraseColor;
        if (crisisWordIn) crisisWordIn.style.color = phraseColor;
        if (crisisNum2) crisisNum2.style.color = phraseColor;

        // Reveal “GLOBAL SNAKEBITE DEATHS” just after phrase becomes complete (26 to 30%)
        // Opacity: 0 -> 1, translateY: 6px -> 0
        if (crisisStatLabel) {
            const tLabel = Math.min(1, Math.max(0, (p - 0.26) / 0.04));
            const easeLabel = smoothEase(tLabel);
            crisisStatLabel.style.opacity = easeLabel.toFixed(3);
            crisisStatLabel.style.transform = `translateY(${((1 - easeLabel) * 6).toFixed(1)}px)`;
        }

        // 3. 30 - 40%: DIVIDER
        // Draw vertical divider using scaleY from 0 -> 1 with transform-origin: top
        // On mobile, draw horizontal divider using scaleX from 0 -> 1 with transform-origin: left
        if (crisisDivider) {
            const tDiv = Math.min(1, Math.max(0, (p - 0.30) / 0.10));
            const easeDiv = smoothEase(tDiv);
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                crisisDivider.style.transformOrigin = 'left center';
                crisisDivider.style.transform = `scaleX(${easeDiv.toFixed(3)})`;
            } else {
                crisisDivider.style.transformOrigin = 'top center';
                crisisDivider.style.transform = `scaleY(${easeDiv.toFixed(3)})`;
            }
            crisisDivider.style.opacity = easeDiv > 0.01 ? '1' : '0';
        }

        // 4. 40 - 60%: EXPLANATION (Three lines in order)
        // Line 1: “Half of the world’s” (40 to 46%)
        if (crisisExpLine1) {
            const tL1 = Math.min(1, Math.max(0, (p - 0.40) / 0.06));
            const easeL1 = smoothEase(tL1);
            crisisExpLine1.style.opacity = easeL1.toFixed(3);
            crisisExpLine1.style.transform = `translateY(${((1 - easeL1) * 8).toFixed(1)}px)`;
        }

        // Line 2: “snakebite deaths” (45 to 51%)
        if (crisisExpLine2) {
            const tL2 = Math.min(1, Math.max(0, (p - 0.45) / 0.06));
            const easeL2 = smoothEase(tL2);
            crisisExpLine2.style.opacity = easeL2.toFixed(3);
            crisisExpLine2.style.transform = `translateY(${((1 - easeL2) * 8).toFixed(1)}px)`;
        }

        // Line 3: “occur in India.” (50 to 56%)
        if (crisisExpLine3) {
            const tL3 = Math.min(1, Math.max(0, (p - 0.50) / 0.06));
            const easeL3 = smoothEase(tL3);
            crisisExpLine3.style.opacity = easeL3.toFixed(3);
            crisisExpLine3.style.transform = `translateY(${((1 - easeL3) * 8).toFixed(1)}px)`;
        }

        // Transition “India.” from ivory #EEECE3 to terracotta #BC7868 (56 to 60%)
        if (crisisIndia) {
            const tInd = Math.min(1, Math.max(0, (p - 0.56) / 0.04));
            const easeInd = smoothEase(tInd);
            const rInd = Math.round(238 + (188 - 238) * easeInd);
            const gInd = Math.round(236 + (120 - 236) * easeInd);
            const bInd = Math.round(227 + (104 - 227) * easeInd);
            crisisIndia.style.color = `rgb(${rInd}, ${gInd}, ${bInd})`;
        }

        // 5. 60 - 100%: READING HOLD (all values stay completed, no extra code needed as clamped)
    }

    // ==========================================================================
    // HOURLY BEAT 3: "MORE THAN 6 LIVES LOST" (Progress 0.0 -> 1.0)
    // Balanced Two-Column Composition with Scroll-Controlled Snakebite Animation
    // ==========================================================================
    function renderHourlyBeat(beatP) {
        if (!hourlyCompositionWrapper && !hourlyTextStack) return;

        const p = Math.min(1, Math.max(0, beatP));

        // Advance or reverse snakebite pose based directly on scroll progress
        setSnakebiteFrameFromProgress(p);
    }

    function updateLayersOnScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // 1. Hero Screen Fade-Out (Screen 1 disappears with smart-animate easing)
        const heroFadeThreshold = windowHeight * 0.55;
        const heroProgress = Math.min(1, Math.max(0, scrollY / heroFadeThreshold));
        const heroEase = smoothEase(heroProgress);

        if (heroContent) {
            heroContent.style.opacity = (1 - heroEase).toFixed(3);
            heroContent.style.transform = `translate3d(0, ${-heroEase * 35}px, 0) scale(${(1 - heroEase * 0.035).toFixed(3)})`;
            heroContent.style.filter = heroEase > 0.05 ? `blur(${(heroEase * 3.0).toFixed(1)}px)` : 'none';
            heroContent.style.pointerEvents = heroProgress > 0.85 ? 'none' : 'auto';
        }

        if (snakeContainer) {
            const snakeOpacity = Math.max(0, 1 - heroEase * 1.3);
            snakeContainer.style.opacity = snakeOpacity.toFixed(3);
            snakeContainer.style.filter = heroEase > 0.05 ? `blur(${(heroEase * 2.5).toFixed(1)}px)` : 'none';
            snakeContainer.style.pointerEvents = snakeOpacity < 0.15 ? 'none' : 'auto';
        }

        // 2. Section 2 Sticky Scroll Progress (0.0 to 1.0)
        const rect = landscapeScreen.getBoundingClientRect();
        const totalScrollRange = landscapeScreen.offsetHeight - windowHeight;

        let progress = 0;
        if (rect.top <= 0) {
            progress = Math.min(1, Math.max(0, -rect.top / totalScrollRange));
        }

        // Mountain entry right as hero starts fading
        const mountainEntry = smoothEase(Math.max(0, (scrollY - windowHeight * 0.25) / (windowHeight * 0.35)));

        // ============================================================
        // "DIP TO DARK" TRANSITION: Layers → Panorama
        // Eased scrim fade in and fade out with soft cross-dissolve
        // Transition window: progress 0.44 → 0.52
        // ============================================================
        const SWAP_START = 0.44;
        const SWAP_MID   = 0.48;
        const SWAP_END   = 0.52;

        let transitionScrimOp = 0;
        if (progress >= SWAP_START && progress < SWAP_MID) {
            transitionScrimOp = smoothEase((progress - SWAP_START) / (SWAP_MID - SWAP_START));
        } else if (progress >= SWAP_MID && progress < SWAP_END) {
            transitionScrimOp = smoothEase(1 - (progress - SWAP_MID) / (SWAP_END - SWAP_MID));
        }

        // Soft smooth dissolve during the darkest point of the transition
        let layersAlpha = 1;
        let panoAlpha = 0;
        if (progress < 0.46) {
            layersAlpha = 1;
            panoAlpha = 0;
        } else if (progress <= 0.50) {
            const swapT = smoothEase((progress - 0.46) / 0.04);
            layersAlpha = 1 - swapT;
            panoAlpha = swapT;
        } else {
            layersAlpha = 0;
            panoAlpha = 1;
        }

        // Phase 1: Mountains (progress 0.00 -> 0.08)
        const mountainOp = Math.max(mountainEntry, smoothEase(progress / 0.08));
        layerMountains.style.opacity = (mountainOp * layersAlpha).toFixed(3);

        // Mountain Narrative Statement & India Map Scroll Animation
        const BEAT_START = 0.012;
        const BEAT_END   = 0.118;
        
        if (mountainStory) {
            const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (progress < BEAT_START || progress > BEAT_END) {
                mountainStory.style.opacity = '0';
                mountainStory.style.pointerEvents = 'none';
            } else if (isReducedMotion) {
                mountainStory.style.opacity = '1';
                mountainStory.style.pointerEvents = 'auto';
                if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.22';
                if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                if (mapFillLayer) mapFillLayer.style.opacity = '0.16';
                if (mapMaskRect) mapMaskRect.setAttribute('y', '-100');
                if (mLine1) { mLine1.style.opacity = '1'; mLine1.style.transform = 'translateY(0)'; }
                if (mLine2) { mLine2.style.opacity = '1'; mLine2.style.transform = 'translateY(0)'; }
                if (mountainSubtext) { mountainSubtext.style.opacity = '0.85'; mountainSubtext.style.transform = 'translateY(0)'; }
                if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
            } else {
                mountainStory.style.opacity = '1';
                mountainStory.style.pointerEvents = 'auto';
                const beatP = Math.min(1, Math.max(0, (progress - BEAT_START) / (BEAT_END - BEAT_START)));
                
                // 0 - 20%: Outline draws, text hidden
                if (beatP <= 0.20) {
                    const drawT = Math.min(1, Math.max(0, beatP / 0.20));
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = (MAINLAND_PATH_LENGTH * (1 - drawT)).toFixed(1);
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = Math.max(0, (drawT - 0.4) / 0.6).toFixed(3);
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.50';
                    if (mapFillLayer) mapFillLayer.style.opacity = '0';
                    if (mLine1) { mLine1.style.opacity = '0'; mLine1.style.transform = 'translateY(12px)'; }
                    if (mLine2) { mLine2.style.opacity = '0'; mLine2.style.transform = 'translateY(12px)'; }
                    if (mountainSubtext) { mountainSubtext.style.opacity = '0'; mountainSubtext.style.transform = 'translateY(8px)'; }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 20 - 35%: Complete outline holds briefly
                else if (beatP <= 0.35) {
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.50';
                    if (mapFillLayer) mapFillLayer.style.opacity = '0';
                    if (mLine1) { mLine1.style.opacity = '0'; mLine1.style.transform = 'translateY(12px)'; }
                    if (mLine2) { mLine2.style.opacity = '0'; mLine2.style.transform = 'translateY(12px)'; }
                    if (mountainSubtext) { mountainSubtext.style.opacity = '0'; mountainSubtext.style.transform = 'translateY(8px)'; }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 35 - 50%: Reveal heading line 1 then line 2 (opacity 0 -> 1, translateY 12 -> 0). Reduce outline opacity to 0.22
                else if (beatP <= 0.50) {
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                    const t1 = Math.min(1, Math.max(0, (beatP - 0.35) / 0.10));
                    const t2 = Math.min(1, Math.max(0, (beatP - 0.39) / 0.11));
                    
                    if (mLine1) {
                        mLine1.style.opacity = t1.toFixed(3);
                        mLine1.style.transform = `translateY(${((1 - t1) * 12).toFixed(1)}px)`;
                    }
                    if (mLine2) {
                        mLine2.style.opacity = t2.toFixed(3);
                        mLine2.style.transform = `translateY(${((1 - t2) * 12).toFixed(1)}px)`;
                    }
                    
                    const outlineOp = 0.50 - 0.28 * Math.max(t1, t2);
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = outlineOp.toFixed(3);
                    if (mapFillLayer) mapFillLayer.style.opacity = '0';
                    if (mountainSubtext) { mountainSubtext.style.opacity = '0'; mountainSubtext.style.transform = 'translateY(8px)'; }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 50 - 65%: Reveal amber fill from bottom to top via soft-edged mask
                else if (beatP <= 0.65) {
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.22';
                    if (mLine1) { mLine1.style.opacity = '1'; mLine1.style.transform = 'translateY(0)'; }
                    if (mLine2) { mLine2.style.opacity = '1'; mLine2.style.transform = 'translateY(0)'; }
                    
                    const fillT = (beatP - 0.50) / 0.15;
                    if (mapFillLayer) mapFillLayer.style.opacity = '0.16';
                    const maskY = 800 - fillT * 900;
                    if (mapMaskRect) mapMaskRect.setAttribute('y', maskY.toFixed(1));
                    
                    if (mountainSubtext) { mountainSubtext.style.opacity = '0'; mountainSubtext.style.transform = 'translateY(8px)'; }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 65 - 75%: Fade in supporting sentence (translateY 8 -> 0, opacity 0 -> 0.85)
                else if (beatP <= 0.75) {
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.22';
                    if (mapFillLayer) mapFillLayer.style.opacity = '0.16';
                    if (mapMaskRect) mapMaskRect.setAttribute('y', '-100');
                    if (mLine1) { mLine1.style.opacity = '1'; mLine1.style.transform = 'translateY(0)'; }
                    if (mLine2) { mLine2.style.opacity = '1'; mLine2.style.transform = 'translateY(0)'; }
                    
                    const subT = (beatP - 0.65) / 0.10;
                    if (mountainSubtext) {
                        mountainSubtext.style.opacity = (subT * 0.85).toFixed(3);
                        mountainSubtext.style.transform = `translateY(${((1 - subT) * 8).toFixed(1)}px)`;
                    }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 75 - 90%: Hold entire composition still for reading
                else if (beatP <= 0.90) {
                    if (mapMainlandStroke) mapMainlandStroke.style.strokeDashoffset = '0';
                    if (mapIslandsStroke) mapIslandsStroke.style.opacity = '1';
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = '0.22';
                    if (mapFillLayer) mapFillLayer.style.opacity = '0.16';
                    if (mapMaskRect) mapMaskRect.setAttribute('y', '-100');
                    if (mLine1) { mLine1.style.opacity = '1'; mLine1.style.transform = 'translateY(0)'; }
                    if (mLine2) { mLine2.style.opacity = '1'; mLine2.style.transform = 'translateY(0)'; }
                    if (mountainSubtext) {
                        mountainSubtext.style.opacity = '0.85';
                        mountainSubtext.style.transform = 'translateY(0)';
                    }
                    if (mountainMapContainer) mountainMapContainer.style.opacity = '1';
                }
                // 90 - 100%: Fade out heading and supporting text (90 - 96%), then map (94 - 100%)
                else {
                    const textFadeT = Math.min(1, Math.max(0, (beatP - 0.90) / 0.06));
                    const textOp = 1 - textFadeT;
                    if (mLine1) mLine1.style.opacity = textOp.toFixed(3);
                    if (mLine2) mLine2.style.opacity = textOp.toFixed(3);
                    if (mountainSubtext) mountainSubtext.style.opacity = (textOp * 0.85).toFixed(3);
                    
                    const mapFadeT = Math.min(1, Math.max(0, (beatP - 0.94) / 0.06));
                    if (mountainMapContainer) mountainMapContainer.style.opacity = (1 - mapFadeT).toFixed(3);
                    if (mapOutlineLayer) mapOutlineLayer.style.opacity = (0.22 * (1 - mapFadeT)).toFixed(3);
                    if (mapFillLayer) mapFillLayer.style.opacity = (0.16 * (1 - mapFadeT)).toFixed(3);
                }
            }
        }

        // Phase 2: Land (progress 0.08 -> 0.17)
        const landOp = smoothEase((progress - 0.08) / 0.07);
        layerLand.style.opacity = (landOp * layersAlpha).toFixed(3);

        // Phase 3: Trees (progress 0.17 -> 0.26)
        const treesOp = smoothEase((progress - 0.17) / 0.07);
        layerTrees.style.opacity = (treesOp * layersAlpha).toFixed(3);

        // Phase 4: Homes (progress 0.26 -> 0.35)
        const homesOp = smoothEase((progress - 0.26) / 0.07);
        layerHomes.style.opacity = (homesOp * layersAlpha).toFixed(3);

        // Phase 5: The Crack (progress 0.35 -> 0.45)
        const crackProgress = smoothEase((progress - 0.35) / 0.09);
        const crackBaseOp = crackProgress > 0.02 ? 1 : 0;
        layerCrack.style.opacity = (crackBaseOp * layersAlpha).toFixed(3);
        layerCrack.style.clipPath = `inset(0 0 ${(1 - crackProgress) * 100}% 0)`;

        // Split Editorial Story Text reveal across the Divide (Unified Smart Animate)
        const divCard = calcCardState(progress, 0.355, 0.375, 0.460, 0.480);
        if (habitatLeft) {
            habitatLeft.style.opacity = divCard.opacity.toFixed(3);
            habitatLeft.style.transform = `translate3d(0, ${divCard.translateY.toFixed(1)}px, 0) scale(${divCard.scale.toFixed(3)})`;
            habitatLeft.style.filter = divCard.blur > 0.2 ? `blur(${divCard.blur.toFixed(1)}px)` : 'none';
            habitatLeft.style.pointerEvents = divCard.opacity > 0.5 ? 'auto' : 'none';
        }
        if (habitatRight) {
            habitatRight.style.opacity = divCard.opacity.toFixed(3);
            habitatRight.style.transform = `translate3d(0, ${divCard.translateY.toFixed(1)}px, 0) scale(${divCard.scale.toFixed(3)})`;
            habitatRight.style.filter = divCard.blur > 0.2 ? `blur(${divCard.blur.toFixed(1)}px)` : 'none';
            habitatRight.style.pointerEvents = divCard.opacity > 0.5 ? 'auto' : 'none';
        }

        // Beat 5: Villager & Snake Encounter Animation Scene (progress 0.365 -> 0.460)
        const ENCOUNTER_START = 0.365;
        const ENCOUNTER_END   = 0.460;
        if (progress < 0.355 || progress > 0.490) {
            renderEncounterScene(0, 0);
        } else {
            const rawEncT = Math.min(1, Math.max(0, (progress - ENCOUNTER_START) / (ENCOUNTER_END - ENCOUNTER_START)));
            let encAlpha = 1;
            if (progress < ENCOUNTER_START) {
                encAlpha = Math.max(0, (progress - 0.355) / (ENCOUNTER_START - 0.355));
            } else if (progress > ENCOUNTER_END) {
                encAlpha = Math.max(0, 1 - (progress - ENCOUNTER_END) / 0.025);
            }
            encAlpha *= layersAlpha;
            renderEncounterScene(rawEncT, encAlpha);
        }

        // Phase 6: Panorama smooth blend at swap point
        if (layerPanorama) {
            layerPanorama.style.opacity = panoAlpha.toFixed(3);
            if (layersTopFeather) layersTopFeather.style.opacity = panoAlpha.toFixed(3);
            if (layersBottomFeather) layersBottomFeather.style.opacity = panoAlpha.toFixed(3);
        }

        // Phase 7: Camera Descent Pan into Valley (progress 0.50 -> 0.80)
        let panY = 0;
        if (progress > 0.50) {
            const descentProgress = Math.min(1, Math.max(0, (progress - 0.50) / 0.30));
            const easeDescent = 0.5 - 0.5 * Math.cos(descentProgress * Math.PI);
            const maxPanY = Math.max(0, layersContainer.offsetHeight - windowHeight);
            panY = easeDescent * maxPanY;
        }
        if (layersContainer && progress < 0.875) {
            layersContainer.style.transform = `translate3d(0, ${-panY.toFixed(1)}px, 0)`;
            layersContainer.style.opacity = '1';
            layersContainer.style.filter = 'none';
            layersContainer.style.visibility = 'visible';
        }

        // Phase 8: Center-Aligned Scrollytelling Data Beats
        // Beat 1: The Scale & 1 in 2 Crisis Section (progress 0.500 -> 0.595)
        const BEAT1_START    = 0.500;
        const BEAT1_HOLD_END = 0.565;
        const BEAT1_EXIT_END = 0.595;
        let b1 = { opacity: 0 };

        if (statBeat1) {
            if (progress < BEAT1_START) {
                b1 = { opacity: 0 };
                statBeat1.style.opacity = '0';
                statBeat1.style.pointerEvents = 'none';
                renderCrisisBeat(0);
            } else if (progress <= BEAT1_HOLD_END) {
                b1 = { opacity: 1 };
                statBeat1.style.opacity = '1';
                statBeat1.style.transform = 'translate(-50%, -50%)';
                statBeat1.style.filter = 'none';
                statBeat1.style.pointerEvents = 'auto';
                const beatP = (progress - BEAT1_START) / (BEAT1_HOLD_END - BEAT1_START);
                renderCrisisBeat(beatP);
            } else if (progress <= BEAT1_EXIT_END) {
                renderCrisisBeat(1.0);
                const exitT = (progress - BEAT1_HOLD_END) / (BEAT1_EXIT_END - BEAT1_HOLD_END);
                const exitEase = smoothEase(exitT);
                const currentOp = 1 - exitEase;
                b1 = { opacity: currentOp };
                statBeat1.style.opacity = currentOp.toFixed(3);
                statBeat1.style.transform = `translate(-50%, calc(-50% - ${(exitEase * 18).toFixed(1)}px))`;
                statBeat1.style.filter = 'none';
                statBeat1.style.pointerEvents = currentOp > 0.5 ? 'auto' : 'none';
            } else {
                b1 = { opacity: 0 };
                statBeat1.style.opacity = '0';
                statBeat1.style.pointerEvents = 'none';
                renderCrisisBeat(1.0);
            }
        }

        // Beat 2: 58,000 Lives Lost Counter (progress 0.585 -> 0.675)
        const b2 = calcCardState(progress, 0.585, 0.615, 0.645, 0.675);
        if (statBeat2) {
            statBeat2.style.opacity = b2.opacity.toFixed(3);
            statBeat2.style.transform = `translate(-50%, calc(-50% + ${b2.translateY.toFixed(1)}px)) scale(${b2.scale.toFixed(3)})`;
            statBeat2.style.filter = b2.blur > 0.2 ? `blur(${b2.blur.toFixed(1)}px)` : 'none';
            statBeat2.style.pointerEvents = b2.opacity > 0.5 ? 'auto' : 'none';

            if (b2.opacity > 0.3) {
                start58kCount();
            }
        }
        if (progress < 0.55) {
            reset58kCount();
        }

        // Beat 3: More than 6 Lives Lost (Snakebite Illustration) (progress 0.665 -> 0.755)
        const BEAT3_START    = 0.665;
        const BEAT3_HOLD_END = 0.730;
        const BEAT3_EXIT_END = 0.755;
        let b3 = { opacity: 0 };

        if (statBeat3) {
            if (progress < BEAT3_START) {
                b3 = { opacity: 0 };
                statBeat3.style.opacity = '0';
                statBeat3.style.transform = 'none';
                statBeat3.style.pointerEvents = 'none';
                renderHourlyBeat(0);
            } else if (progress <= BEAT3_HOLD_END) {
                b3 = { opacity: 1 };
                statBeat3.style.opacity = '1';
                statBeat3.style.transform = 'none';
                statBeat3.style.filter = 'none';
                statBeat3.style.pointerEvents = 'auto';
                const beatP = (progress - BEAT3_START) / (BEAT3_HOLD_END - BEAT3_START);
                renderHourlyBeat(beatP);
            } else if (progress <= BEAT3_EXIT_END) {
                const exitT = (progress - BEAT3_HOLD_END) / (BEAT3_EXIT_END - BEAT3_HOLD_END);
                const exitEase = smoothEase(exitT);
                const currentOp = 1 - exitEase;
                b3 = { opacity: currentOp };
                statBeat3.style.opacity = currentOp.toFixed(3);
                statBeat3.style.transform = `translate3d(0, -${(exitEase * 18).toFixed(1)}px, 0)`;
                statBeat3.style.filter = 'none';
                statBeat3.style.pointerEvents = currentOp > 0.5 ? 'auto' : 'none';
                renderHourlyBeat(1.0);
            } else {
                b3 = { opacity: 0 };
                statBeat3.style.opacity = '0';
                statBeat3.style.transform = 'none';
                statBeat3.style.pointerEvents = 'none';
                renderHourlyBeat(1.0);
            }
        }

        // Beat 4: Mortality Chart (progress 0.745 -> 0.845)
        const mortalityIframe = document.getElementById('mortality-iframe');
        const b4 = calcCardState(progress, 0.745, 0.775, 0.815, 0.845);
        if (statBeat4) {
            statBeat4.style.opacity = b4.opacity.toFixed(3);
            statBeat4.style.transform = `translate(-50%, calc(-50% + ${b4.translateY.toFixed(1)}px)) scale(${b4.scale.toFixed(3)})`;
            statBeat4.style.filter = b4.blur > 0.2 ? `blur(${b4.blur.toFixed(1)}px)` : 'none';
            statBeat4.style.pointerEvents = b4.opacity > 0.5 ? 'auto' : 'none';

            // Trigger chart bar animation when it first becomes visible
            if (b4.opacity > 0.4 && mortalityIframe && !statBeat4._chartTriggered) {
                statBeat4._chartTriggered = true;
                try {
                    mortalityIframe.contentWindow.postMessage('animateChart', '*');
                } catch (e) { }
            }
        }
        if (progress < 0.70 && statBeat4) {
            statBeat4._chartTriggered = false;
        }

        // Beat 5: Natural Disaster Comparison (progress 0.835 -> 0.885)
        const b5 = calcCardState(progress, 0.835, 0.855, 0.870, 0.885);
        if (statBeat5) {
            statBeat5.style.opacity = b5.opacity.toFixed(3);
            statBeat5.style.transform = `translate(-50%, calc(-50% + ${b5.translateY.toFixed(1)}px)) scale(${b5.scale.toFixed(3)})`;
            statBeat5.style.filter = b5.blur > 0.2 ? `blur(${b5.blur.toFixed(1)}px)` : 'none';
            statBeat5.style.pointerEvents = b5.opacity > 0.5 ? 'auto' : 'none';
        }

        // Phase 8.5: Paddy Field Encounter Scene - Smooth Cinematic Cross-Dissolve & Parallax Float with Motion Blur
        // 1. FIRST: Outgoing landscape dissolves softly upward; paddy scene glides in gracefully (progress 0.875 -> 0.910)
        // Stays bright and unobstructed from 0.910 to 0.922 so the viewer absorbs the scene in full clarity
        if (progress < 0.875) {
            if (layersContainer) {
                layersContainer.style.transform = `translate3d(0, ${-panY.toFixed(1)}px, 0)`;
                layersContainer.style.opacity = '1';
                layersContainer.style.filter = 'none';
                layersContainer.style.visibility = 'visible';
            }
            if (paddySceneStage) {
                paddySceneStage.style.transform = `translate3d(0, ${windowHeight * 0.16}px, 0)`;
                paddySceneStage.style.opacity = '0';
                paddySceneStage.style.filter = 'none';
                paddySceneStage.style.visibility = 'hidden';
                paddySceneStage.style.pointerEvents = 'none';
            }
        } else if (progress <= 0.910) {
            const t = (progress - 0.875) / 0.035; // 0.0 -> 1.0 (relaxed, silky smooth transition)
            const easeT = 0.5 - 0.5 * Math.cos(t * Math.PI); // Cosine ease for organic acceleration & deceleration

            // Optical motion blur that peaks dynamically at mid-transition (~6.5px) and clears to 0
            const motionBlur = (Math.sin(t * Math.PI) * 6.5).toFixed(1);

            // Outgoing landscape gently dissolves, drifts upward, and softly blurs
            if (layersContainer) {
                layersContainer.style.opacity = (1 - easeT).toFixed(3);
                layersContainer.style.transform = `translate3d(0, ${(-panY - easeT * 60).toFixed(1)}px, 0)`;
                layersContainer.style.filter = motionBlur > 0.2 ? `blur(${motionBlur}px)` : 'none';
                layersContainer.style.visibility = easeT < 1 ? 'visible' : 'hidden';
            }

            // Incoming paddy scene fades in, floats up from a gentle +16vh offset, and clarifies as motion settles
            if (paddySceneStage) {
                const glideY = (1 - easeT) * (windowHeight * 0.16);
                paddySceneStage.style.opacity = easeT.toFixed(3);
                paddySceneStage.style.transform = `translate3d(0, ${glideY.toFixed(1)}px, 0)`;
                paddySceneStage.style.filter = motionBlur > 0.2 ? `blur(${motionBlur}px)` : 'none';
                paddySceneStage.style.visibility = 'visible';
                paddySceneStage.style.pointerEvents = easeT > 0.8 ? 'auto' : 'none';
            }
        } else {
            // Settled in full view - pristine optical sharpness
            if (layersContainer) {
                layersContainer.style.opacity = '0';
                layersContainer.style.filter = 'none';
                layersContainer.style.visibility = 'hidden';
            }
            if (paddySceneStage) {
                paddySceneStage.style.opacity = '1';
                paddySceneStage.style.transform = 'translate3d(0, 0, 0)';
                paddySceneStage.style.filter = 'none';
                paddySceneStage.style.visibility = 'visible';
                paddySceneStage.style.pointerEvents = 'auto';
            }
        }

        // 2. THEN: It gets darker where the text has to appear (scrim fades in 0.922 -> 0.934)
        const scrimFade = calcCardState(progress, 0.922, 0.934, 0.958, 0.968);

        // 3. AND THEN: Text appears into the center of the darkened area (fades in 0.930 -> 0.938)
        // Phase 9: Beat 6 - Pathways Narrative Text ("For every 100 snakebites, 21 lives are lost...")
        const b6 = calcCardState(progress, 0.930, 0.938, 0.954, 0.962);
        if (paddyStoryCard) {
            paddyStoryCard.style.opacity = b6.opacity.toFixed(3);
            paddyStoryCard.style.transform = `translateY(${b6.translateY.toFixed(1)}px) scale(${b6.scale.toFixed(3)})`;
            paddyStoryCard.style.filter = b6.blur > 0.2 ? `blur(${b6.blur.toFixed(1)}px)` : 'none';
            paddyStoryCard.style.pointerEvents = b6.opacity > 0.5 ? 'auto' : 'none';
        }

        // Phase 10: Beat 7 - Pure Animated Sankey Diagram Overlay
        // Appears smoothly as Beat 6 fades out (progress 0.962 -> 1.00)
        const b7 = calcCardState(progress, 0.962, 0.970, 1.0, 1.0);
        if (paddySankeyStage) {
            paddySankeyStage.style.opacity = b7.opacity.toFixed(3);
            paddySankeyStage.style.transform = `translateY(${b7.translateY.toFixed(1)}px) scale(${b7.scale.toFixed(3)})`;
            paddySankeyStage.style.filter = b7.blur > 0.2 ? `blur(${b7.blur.toFixed(1)}px)` : 'none';
            paddySankeyStage.style.pointerEvents = b7.opacity > 0.5 ? 'auto' : 'none';

            // Auto-trigger Sankey animation when card becomes visible
            if (b7.opacity > 0.20 && sankeyIframe && !paddySankeyStage._sankeyTriggered) {
                paddySankeyStage._sankeyTriggered = true;
                try {
                    sankeyIframe.contentWindow.postMessage('playSankey', '*');
                } catch (e) { }
            }
        }
        if (progress < 0.950 && paddySankeyStage) {
            paddySankeyStage._sankeyTriggered = false;
        }

        // Paddy scene blackout scrim (darkens underlying image to ~20-30% opacity where text appears)
        if (paddyStoryScrim) {
            const paddyScrim = Math.max(scrimFade.opacity * 0.80, b7.opacity * 0.72);
            paddyStoryScrim.style.opacity = paddyScrim.toFixed(3);
        }

        // Soft Atmosphere Scrim:
        // Combines the dip-to-dark transition scrim with the data beat scrims.
        // Fades out naturally during the transition (0.875 -> 0.900) instead of an abrupt cutoff
        const statsActiveOp = Math.max(b1.opacity, b2.opacity, b3.opacity);
        const chartOp = b4 ? b4.opacity : 0;
        const disasterOp = b5 ? b5.opacity : 0;
        const dataScrimOp = Math.max(statsActiveOp * 0.85, chartOp * 0.89, disasterOp * 0.78);
        const fadeMultiplier = progress < 0.875 ? 1 : Math.max(0, 1 - (progress - 0.875) / 0.025);
        const scrimOp = Math.max(transitionScrimOp, dataScrimOp) * fadeMultiplier;
        if (statsScrim) {
            statsScrim.style.opacity = scrimOp.toFixed(3);
        }
    }

    window.addEventListener('scroll', updateLayersOnScroll, { passive: true });
    updateLayersOnScroll();

    // Recalculate animation measurements once web fonts are fully loaded
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            updateLayersOnScroll();
        });
    }

    // Global harmony/healing API for future chapters where the crack fills up
    window.setCrackHealingState = function (fillPercentage) {
        const health = Math.min(100, Math.max(0, fillPercentage)) / 100;
        if (!layerCrack) return;
        layerCrack.style.opacity = (1 - health).toFixed(3);
        layerCrack.style.filter = `drop-shadow(0 0 ${15 * (1 - health)}px rgba(239, 68, 68, 0.65)) hue-rotate(${health * 100}deg)`;
    };

    // Auto-trigger Counterfactual Sankey when scrolled into view
    const counterfactualStage = document.getElementById('counterfactual-stage');
    const counterfactualIframe = document.getElementById('counterfactual-iframe');

    if (counterfactualStage && counterfactualIframe) {
        let counterfactualTriggered = false;

        const cfObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.20) {
                    if (!counterfactualTriggered) {
                        counterfactualTriggered = true;
                        try {
                            counterfactualIframe.contentWindow.postMessage('playCounterfactual', '*');
                        } catch (e) {}
                    }
                } else if (!entry.isIntersecting) {
                    counterfactualTriggered = false;
                }
            });
        }, { threshold: [0.1, 0.25, 0.5] });

        cfObserver.observe(counterfactualStage);
    }
}

/**
 * SECTION 5: The Unseen Toll (Fear-Driven Retaliation) Scroll Reveal
 */
function initUnseenChapter() {
    const unseenSection = document.getElementById('unseen-section');
    const unseenContainer = document.getElementById('unseen-container');
    if (!unseenSection || !unseenContainer) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
                unseenContainer.classList.add('is-visible');
            }
        });
    }, {
        threshold: [0.12, 0.35]
    });

    observer.observe(unseenSection);

    // Instant check if already scrolled into view on page load / reload
    const rect = unseenSection.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        unseenContainer.classList.add('is-visible');
    }
}

/**
 * SECTION 6: Beyond The Fear (Snake Diversity) Scroll-Driven Animation & Transition
 * Separate Layers:
 * 1. Background: fixed continuous forest in .parallax-bg (always visible)
 * 2. Visual Scene (#diversity-scene-wrapper):
 *    - 0.00 to 0.12 (Entry): opacity 0 -> 1, blur 4px -> 0px
 *    - 0.12 to 0.78 (Reading/Animation): opacity 1, blur 0px
 *    - 0.78 to 1.00 (Exit): opacity 1 -> 0, blur 0px -> 4px
 * 3. Live HTML Text (.diversity-center-editorial):
 *    - sharp and readable through p = 0.86
 *    - 0.86 to 1.00: opacity 1 -> 0 (no blur)
 * 4. Snake Frames Progression:
 *    - discrete stepped poses (Frames 01 -> 05) synchronized with scroll
 */
function initDiversityScrolly() {
    const section = document.getElementById('diversity-section');
    if (!section) return;

    const sceneWrapper = document.getElementById('diversity-scene-wrapper');
    const scrim = document.querySelector('.diversity-text-scrim');
    const editorial = document.querySelector('.diversity-center-editorial');
    const frames = Array.from(document.querySelectorAll('#diversity-scene-frames .diversity-scene-frame'));
    if (!frames.length || !sceneWrapper) return;

    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let activeFrameIndex = 0;

    // Helper functions for smoothstep curves
    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    // Preload and decode all 5 scene images before playback
    frames.forEach(img => {
        if (img.decode) {
            img.decode().catch(() => {});
        }
    });

    if (isReducedMotion) {
        // Reduced motion: Frame 01 static, disable blur, simple restrained opacity
        frames.forEach((f, i) => {
            f.classList.toggle('is-active', i === 0);
        });
    }

    let ticking = false;

    function updateScroll() {
        const rect = section.getBoundingClientRect();
        const vpH = window.innerHeight;
        const maxScroll = rect.height - vpH;

        if (maxScroll <= 0) {
            ticking = false;
            return;
        }

        // p: normalized section progress from 0 to 1
        const p = clamp(-rect.top / maxScroll, 0, 1);

        // Active state detection: apply will-change only while this section is active
        const isActive = (rect.bottom > -50 && rect.top < vpH + 50);
        if (isActive) {
            sceneWrapper.style.willChange = 'opacity, filter';
            if (editorial) editorial.style.willChange = 'opacity';
        } else {
            sceneWrapper.style.willChange = 'auto';
            if (editorial) editorial.style.willChange = 'auto';
        }

        // --- 1. Scene Entry & Exit Transitions ---
        // 0.00 - 0.12: Entry (opacity 0 -> 1, blur 4px -> 0px)
        const entry = smoothstep(clamp(p / 0.12, 0, 1));
        // 0.78 - 1.00: Exit (opacity 1 -> 0, blur 0px -> 4px)
        const exit = smoothstep(clamp((p - 0.78) / 0.22, 0, 1));

        const sceneOpacity = entry * (1 - exit);
        const sceneBlur = isReducedMotion ? 0 : (4 * (1 - entry) + 4 * exit);

        sceneWrapper.style.opacity = sceneOpacity.toFixed(4);
        sceneWrapper.style.filter = sceneBlur > 0.05 ? `blur(${sceneBlur.toFixed(2)}px)` : 'none';

        // --- 2. Live Text Transition ---
        // Sharp and fully readable through p = 0.86, then fades 1 -> 0 from 0.86 to 1.00
        const textExit = smoothstep(clamp((p - 0.86) / 0.14, 0, 1));
        const textOpacity = entry * (1 - textExit);

        if (editorial) {
            editorial.style.opacity = textOpacity.toFixed(4);
        }

        // Central soft scrim fades out with the scene and text
        if (scrim) {
            scrim.style.opacity = (sceneOpacity * textOpacity).toFixed(4);
        }

        // --- 3. Snake Frame Playback ---
        if (!isReducedMotion) {
            // Map middle reading & animation window (0.14 to 0.76) to frames 0..4
            const q = clamp((p - 0.14) / 0.62, 0, 1);
            const frameIndex = Math.min(4, Math.max(0, Math.round(q * 4)));

            if (activeFrameIndex !== frameIndex) {
                if (frames[activeFrameIndex]) {
                    frames[activeFrameIndex].classList.remove('is-active');
                }
                if (frames[frameIndex]) {
                    frames[frameIndex].classList.add('is-active');
                }
                activeFrameIndex = frameIndex;
            }
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (!ticking) {
            requestAnimationFrame(updateScroll);
            ticking = true;
        }
    }, { passive: true });

    // Initial evaluation
    updateScroll();
}

/**
 * SECTION 7: Transition Question - Threat To Human Life
 * Direct scroll-progress-driven reveal:
 * - Enter viewport: fade 0 -> 1, subtle upward translation (<= 12px)
 * - Middle viewport: stationary, fully readable (opacity 1)
 * - Exit viewport: fade 1 -> 0
 * - Bidirectional: scrolls up and down with direct progress tracking
 * - Reduced motion: no movement, pure opacity fade
 */
function initThreatChapter() {
    const section = document.getElementById('threat-section');
    const container = document.getElementById('threat-container');
    if (!section || !container) return;

    const isReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function clamp(val, min, max) {
        return Math.max(min, Math.min(max, val));
    }

    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    let ticking = false;

    function updateThreatScroll() {
        const rect = section.getBoundingClientRect();
        const vpH = window.innerHeight;

        // Total distance from when section top enters viewport bottom to when section bottom leaves viewport top:
        const totalTravel = vpH + rect.height;
        if (totalTravel <= 0) {
            ticking = false;
            return;
        }

        const currentDist = vpH - rect.top;
        const p = clamp(currentDist / totalTravel, 0, 1);

        // Active range check
        const isActive = (rect.bottom > -50 && rect.top < vpH + 50);
        container.style.willChange = isActive ? 'opacity, transform' : 'auto';

        if (!isActive) {
            if (rect.top >= vpH) {
                container.style.opacity = '0';
                if (!isReducedMotion) container.style.transform = 'translate3d(0, 12px, 0)';
            } else if (rect.bottom <= 0) {
                container.style.opacity = '0';
                if (!isReducedMotion) container.style.transform = 'translate3d(0, -10px, 0)';
            }
            ticking = false;
            return;
        }

        // Progression intervals:
        // 0.00 to 0.16: hidden before entering comfortable view zone
        // 0.16 to 0.38: Entry phase (opacity 0 -> 1, translateY 12px -> 0px)
        // 0.38 to 0.64: Middle phase (opacity 1, fully visible & stationary)
        // 0.64 to 0.88: Exit phase (opacity 1 -> 0, subtle drift translateY 0px -> -10px)
        // 0.88 to 1.00: hidden
        let opacity = 0;
        let translateY = isReducedMotion ? 0 : 12;

        if (p < 0.16) {
            opacity = 0;
            translateY = isReducedMotion ? 0 : 12;
        } else if (p < 0.38) {
            const entryT = smoothstep((p - 0.16) / 0.22);
            opacity = entryT;
            translateY = isReducedMotion ? 0 : (12 * (1 - entryT));
        } else if (p <= 0.64) {
            opacity = 1;
            translateY = 0;
        } else if (p < 0.88) {
            const exitT = smoothstep((p - 0.64) / 0.24);
            opacity = 1 - exitT;
            translateY = isReducedMotion ? 0 : (-10 * exitT);
        } else {
            opacity = 0;
            translateY = isReducedMotion ? 0 : -10;
        }

        container.style.opacity = opacity.toFixed(4);
        if (isReducedMotion) {
            container.style.transform = 'none';
        } else {
            container.style.transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
        }

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateThreatScroll);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        if (!ticking) {
            requestAnimationFrame(updateThreatScroll);
            ticking = true;
        }
    }, { passive: true });

    // Initial check on load
    updateThreatScroll();
}

/**
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
    const snakesData = [
            {"name": "Indian Cobra", "sci": "Naja naja", "count": 1974, "cat": "ms", "label": "Venomous"},
            {"name": "Malabarian Pit Viper", "sci": "Craspedocephalus malabaricus", "count": 1538, "cat": "ms", "label": "Venomous"},
            {"name": "Russell's Viper", "sci": "Daboia russelii", "count": 1245, "cat": "ms", "label": "Venomous"},
            {"name": "Common Bamboo Viper", "sci": "Craspedocephalus gramineus", "count": 902, "cat": "ms", "label": "Venomous"},
            {"name": "Common Krait", "sci": "Bungarus caeruleus", "count": 811, "cat": "ms", "label": "Venomous"},
            {"name": "Hump-nosed Viper", "sci": "Hypnale hypnale", "count": 666, "cat": "ms", "label": "Venomous"},
            {"name": "Saw-scaled Viper", "sci": "Echis carinatus", "count": 460, "cat": "ms", "label": "Venomous"},
            {"name": "Indian saw-scaled viper", "sci": "Echis carinatus carinatus", "count": 272, "cat": "ms", "label": "Venomous"},
            {"name": "Beaked Sea Snake", "sci": "Hydrophis schistosus", "count": 215, "cat": "ms", "label": "Venomous"},
            {"name": "Anamala Pit Viper", "sci": "Craspedocephalus anamallensis", "count": 147, "cat": "ms", "label": "Venomous"},
            {"name": "Banded Krait", "sci": "Bungarus fasciatus", "count": 135, "cat": "ms", "label": "Venomous"},
            {"name": "Large-scaled Pit Viper", "sci": "Craspedocephalus macrolepis", "count": 135, "cat": "ms", "label": "Venomous"},
            {"name": "Black Coralsnake", "sci": "Calliophis nigrescens", "count": 126, "cat": "ms", "label": "Venomous"},
            {"name": "Spot-tailed Pitviper", "sci": "Trimeresurus erythrurus", "count": 91, "cat": "ms", "label": "Venomous"},
            {"name": "Monocellate Cobra", "sci": "Naja kaouthia", "count": 88, "cat": "ms", "label": "Venomous"},
            {"name": "Northern King Cobra", "sci": "Ophiophagus hannah", "count": 84, "cat": "ms", "label": "Venomous"},
            {"name": "Western Ghats King Cobra", "sci": "Ophiophagus kaalinga", "count": 84, "cat": "ms", "label": "Venomous"},
            {"name": "Himalayan Pitviper", "sci": "Gloydius himalayanus", "count": 73, "cat": "ms", "label": "Venomous"},
            {"name": "Andaman Pitviper", "sci": "Trimeresurus andersonii", "count": 65, "cat": "ms", "label": "Venomous"},
            {"name": "Travancore Pit Viper", "sci": "Craspedocephalus travancoricus", "count": 63, "cat": "ms", "label": "Venomous"},
            {"name": "Slender Coralsnake", "sci": "Calliophis melanurus", "count": 54, "cat": "ms", "label": "Venomous"},
            {"name": "Chinese Mountain Pit Viper", "sci": "Ovophis monticola", "count": 54, "cat": "ms", "label": "Venomous"},
            {"name": "Sochurek's saw-scaled viper", "sci": "Echis carinatus sochureki", "count": 53, "cat": "ms", "label": "Venomous"},
            {"name": "Yellow-lipped Sea Krait", "sci": "Laticauda colubrina", "count": 47, "cat": "ms", "label": "Venomous"},
            {"name": "Nepal Pitviper", "sci": "Trimeresurus septentrionalis", "count": 46, "cat": "ms", "label": "Venomous"},
            {"name": "Bibron's Slender Coralsnake", "sci": "Calliophis bibroni", "count": 42, "cat": "ms", "label": "Venomous"},
            {"name": "Salazar's Pit Viper", "sci": "Trimeresurus salazar", "count": 39, "cat": "ms", "label": "Venomous"},
            {"name": "Spine-bellied Sea Snake", "sci": "Hydrophis curtus", "count": 33, "cat": "ms", "label": "Venomous"},
            {"name": "Annulated Sea Snake", "sci": "Hydrophis cyanocinctus", "count": 30, "cat": "ms", "label": "Venomous"},
            {"name": "Greater Black Krait", "sci": "Bungarus niger", "count": 29, "cat": "ms", "label": "Venomous"},
            {"name": "Andaman Krait", "sci": "Bungarus andamanensis", "count": 24, "cat": "ms", "label": "Venomous"},
            {"name": "MacClelland’s Coral Snake", "sci": "Sinomicrurus macclellandi", "count": 21, "cat": "ms", "label": "Venomous"},
            {"name": "Yellow-bellied Sea Snake", "sci": "Hydrophis platurus", "count": 19, "cat": "ms", "label": "Venomous"},
            {"name": "Pope’s Tree Viper", "sci": "Trimeresurus popeiorum", "count": 19, "cat": "ms", "label": "Venomous"},
            {"name": "Southern Large-scaled pit viper", "sci": "Craspedocephalus peltopelor", "count": 13, "cat": "ms", "label": "Venomous"},
            {"name": "Yellow Sea Snake", "sci": "Hydrophis spiralis", "count": 12, "cat": "ms", "label": "Venomous"},
            {"name": "Sind Krait", "sci": "Bungarus sindanus", "count": 11, "cat": "ms", "label": "Venomous"},
            {"name": "Jerdon's Pitviper", "sci": "Protobothrops jerdonii", "count": 11, "cat": "ms", "label": "Venomous"},
            {"name": "Green Bamboo Leaf Pit Viper", "sci": "Trimeresurus medoensis", "count": 11, "cat": "ms", "label": "Venomous"},
            {"name": "Northeastern Hill Krait", "sci": "Bungarus bungaroides", "count": 10, "cat": "ms", "label": "Venomous"},
            {"name": "Dwarf Sea Snake", "sci": "Hydrophis caerulescens", "count": 9, "cat": "ms", "label": "Venomous"},
            {"name": "Castoe's Coralsnake", "sci": "Calliophis castoe", "count": 7, "cat": "ms", "label": "Venomous"},
            {"name": "Lesser Black Krait", "sci": "Bungarus lividus", "count": 6, "cat": "ms", "label": "Venomous"},
            {"name": "Horseshoe Pitviper", "sci": "Craspedocephalus strigatus", "count": 6, "cat": "ms", "label": "Venomous"},
            {"name": "Brown spotted pitviper", "sci": "Protobothrops mucrosquamatus", "count": 6, "cat": "ms", "label": "Venomous"},
            {"name": "Wall's Sind Krait", "sci": "Bungarus walli", "count": 4, "cat": "ms", "label": "Venomous"},
            {"name": "Andaman Cobra", "sci": "Naja sagittifera", "count": 4, "cat": "ms", "label": "Venomous"},
            {"name": "Zayuan Mountain Pitviper", "sci": "Ovophis zayuensis", "count": 4, "cat": "ms", "label": "Venomous"},
            {"name": "Kaulback's Lance-headed Pitviper", "sci": "Protobothrops kaulbacki", "count": 4, "cat": "ms", "label": "Venomous"},
            {"name": "Striped Sea Snake", "sci": "Hydrophis fasciatus", "count": 3, "cat": "ms", "label": "Venomous"},
            {"name": "Blue-lipped Sea Krait", "sci": "Laticauda laticaudata", "count": 3, "cat": "ms", "label": "Venomous"},
            {"name": "Red spotted pitviper", "sci": "Protobothrops jerdonii xanthomelas", "count": 3, "cat": "ms", "label": "Venomous"},
            {"name": "Gore's coral snake", "sci": "Sinomicrurus gorei", "count": 3, "cat": "ms", "label": "Venomous"},
            {"name": "Car Nicobar Green Pitviper", "sci": "Trimeresurus davidi", "count": 3, "cat": "ms", "label": "Venomous"},
            {"name": "Beddome's Coralsnake", "sci": "Calliophis beddomei", "count": 2, "cat": "ms", "label": "Venomous"},
            {"name": "black coral snake", "sci": "Calliophis nigrescens nigrescens", "count": 2, "cat": "ms", "label": "Venomous"},
            {"name": "Western bamboo pit viper", "sci": "Craspedocephalus occidentalis", "count": 2, "cat": "ms", "label": "Venomous"},
            {"name": "Maya's pit viper", "sci": "Trimeresurus mayaae", "count": 2, "cat": "ms", "label": "Venomous"},
            {"name": "Khandala Coralsnake", "sci": "Calliophis nigrescens khandallensis", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Chamba pit viper", "sci": "Gloydius chambensis", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Persian Gulf Sea Snake", "sci": "Hydrophis lapemoides", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Russell's Sea Snake", "sci": "Hydrophis obscurus", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Ornate Sea Snake", "sci": "Hydrophis ornatus", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Stokes' Sea Snake", "sci": "Hydrophis stokesii", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Viperine Sea Snake", "sci": "Hydrophis viperinus", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Levantine Viper", "sci": "Macrovipera lebetinus", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Gunther's Sea Snake", "sci": "Microcephalophis cantoris", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Slender Sea Snake", "sci": "Microcephalophis gracilis", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Asian Lanceheads", "sci": "Trimeresurus", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "White-lipped Pit Viper", "sci": "Trimeresurus albolabris", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Cantor's Pit Viper", "sci": "Trimeresurus cantori", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Island Pit Viper", "sci": "Trimeresurus labialis", "count": 1, "cat": "ms", "label": "Venomous"},
            {"name": "Burmese White-lipped Tree Pitviper", "sci": "Trimeresurus uetzi", "count": 1, "cat": "ms", "label": "Venomous"},

            {"name": "Chequered Keelback", "sci": "Fowlea piscator", "count": 3480, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Buff Striped Keelback", "sci": "Amphiesma stolatum", "count": 1325, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Indian Vine Snake", "sci": "Ahaetulla oxyrhynca", "count": 663, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Northern Western Ghats Vine Snake", "sci": "Ahaetulla borealis", "count": 600, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Farnsworth's Vine Snake", "sci": "Ahaetulla farnsworthi", "count": 389, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Common Cat Snake", "sci": "Boiga trigonata", "count": 345, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Nilgiri keelback", "sci": "Sahyadriophis beddomei", "count": 335, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Forsten's Cat Snake", "sci": "Boiga forsteni", "count": 200, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Green Keelback", "sci": "Rhabdophis plumbicolor", "count": 191, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Malabar Vine Snake", "sci": "Ahaetulla malabarica", "count": 170, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Split Keelback", "sci": "Atretium schistosum", "count": 160, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Collared Cat Snake", "sci": "Boiga nuchalis", "count": 151, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Indian Green Keelback", "sci": "Rhabdophis plumbicolor plumbicolor", "count": 143, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Beddome's Cat Snake", "sci": "Boiga beddomei", "count": 141, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Wynad Keelback", "sci": "Amphiesma monticola", "count": 137, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Asian Bockadam", "sci": "Cerberus rynchops", "count": 134, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Wall's Vine Snake", "sci": "Ahaetulla isabellina", "count": 119, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Thackeray's cat snake", "sci": "Boiga thackerayi", "count": 114, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Heller's Red-necked Keelback", "sci": "Rhabdophis helleri", "count": 84, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Yellow-green Cat Snake", "sci": "Boiga flaviviridis", "count": 75, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Andaman Keelback", "sci": "Fowlea tytleri", "count": 60, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Common Mock Viper", "sci": "Psammodynastes pulverulentus", "count": 60, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Sahyadri Hills Whipsnake", "sci": "Ahaetulla sahyadrensis", "count": 56, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Northern sahyadri keelback", "sci": "Sahyadriophis uttaraghati", "count": 46, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Günther's Vine Snake", "sci": "Ahaetulla dispar", "count": 44, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Ornate Flying Snake", "sci": "Chrysopelea ornata ornata", "count": 40, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Himalayan Keelback", "sci": "Herpetoreas platyceps", "count": 32, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Many-banded Cat Snake", "sci": "Boiga multifasciata", "count": 29, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Orange-collared Keelback", "sci": "Rhabdophis himalayanus", "count": 29, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Green Cat Snake", "sci": "Boiga cyanea", "count": 27, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Eyed Cat Snake", "sci": "Boiga siamensis", "count": 27, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Andaman Cat Snake", "sci": "Boiga andamanensis", "count": 24, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Variable Coloured Vine Snake", "sci": "Ahaetulla anomala", "count": 23, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Tawny Asian Cat Snake", "sci": "Boiga multomaculata ochracea", "count": 23, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Laudankia Vine Snake", "sci": "Ahaetulla laudankia", "count": 17, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Sri Lankan Flying Snake", "sci": "Chrysopelea taprobanica", "count": 17, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Pirmad Cat Snake", "sci": "Boiga dightoni", "count": 16, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Bindee keelback", "sci": "Rhabdophis bindi", "count": 14, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Leonard's Keelback", "sci": "Rhabdophis leonardi", "count": 13, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Wall's Keelback", "sci": "Herpetoreas xenura", "count": 8, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Many-spotted Cat Snake", "sci": "Boiga multomaculata", "count": 7, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Stoliczka's Asian Cat Snake", "sci": "Boiga stoliczkae", "count": 7, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Nicobar Cat Snake", "sci": "Boiga wallachi", "count": 6, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Bar-necked Keelback", "sci": "Fowlea schnurrenbergeri", "count": 6, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Yunnan keelback", "sci": "Hebius clerki", "count": 6, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Northern Polymorphic Asian Cat Snake", "sci": "Boiga multomaculata septentrionalis", "count": 5, "cat": "v", "label": "Mildly Venomous"},
            {"name": "St. John's Keelback", "sci": "Fowlea sanctijohannis", "count": 4, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Painted Keelback", "sci": "Xenochrophis cerasogaster", "count": 4, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Oriental Whipsnake", "sci": "Ahaetulla prasina", "count": 3, "cat": "v", "label": "Mildly Venomous"},
            {"name": "White-bellied Mangrove Snake", "sci": "Fordonia leucobalia", "count": 3, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Khasi Hills Keelback", "sci": "Hebius khasiensis", "count": 3, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Chin Hills Keelback", "sci": "Hebius venningi", "count": 2, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Sikkim Keelback", "sci": "Herpetoreas sieboldii", "count": 2, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Triangle Keelback", "sci": "Xenochrophis trianguligerus", "count": 2, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Travancore Vine Snake", "sci": "Ahaetulla travancorica", "count": 1, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Australasian Cat Snakes", "sci": "Boiga", "count": 1, "cat": "v", "label": "Mildly Venomous"},
            {"name": "Yunnan Keelback Water Snake", "sci": "Trimerodytes yunnanensis", "count": 1, "cat": "v", "label": "Mildly Venomous"},

            {"name": "Oriental Rat Snake", "sci": "Ptyas mucosa", "count": 2700, "cat": "nv", "label": "Non-venomous"},
            {"name": "Brahminy Blindsnake", "sci": "Indotyphlops braminus", "count": 942, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Wolf Snake", "sci": "Lycodon aulicus", "count": 937, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Python", "sci": "Python molurus", "count": 832, "cat": "nv", "label": "Non-venomous"},
            {"name": "Common Bronzeback Tree Snake", "sci": "Dendrelaphis tristis", "count": 812, "cat": "nv", "label": "Non-venomous"},
            {"name": "Streaked Kukri Snake", "sci": "Oligodon taeniolatus", "count": 721, "cat": "nv", "label": "Non-venomous"},
            {"name": "Rough-scaled Sand Boa", "sci": "Eryx conicus", "count": 708, "cat": "nv", "label": "Non-venomous"},
            {"name": "Common Indian trinket snake", "sci": "Coelognathus helena helena", "count": 485, "cat": "nv", "label": "Non-venomous"},
            {"name": "Travancore Wolf Snake", "sci": "Lycodon travancoricus", "count": 469, "cat": "nv", "label": "Non-venomous"},
            {"name": "Russell's Wolf Snake", "sci": "Lycodon fasciolatus", "count": 397, "cat": "nv", "label": "Non-venomous"},
            {"name": "Banded kukri snake", "sci": "Oligodon arnensis", "count": 329, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red Sand Boa", "sci": "Eryx johnii", "count": 316, "cat": "nv", "label": "Non-venomous"},
            {"name": "Montane Trinket Snake", "sci": "Coelognathus helena monticollaris", "count": 294, "cat": "nv", "label": "Non-venomous"},
            {"name": "Barred Wolf Snake", "sci": "Lycodon striatus", "count": 219, "cat": "nv", "label": "Non-venomous"},
            {"name": "Tillack's Kukri Snake", "sci": "Oligodon tillacki", "count": 177, "cat": "nv", "label": "Non-venomous"},
            {"name": "Trinket Snake", "sci": "Coelognathus helena", "count": 171, "cat": "nv", "label": "Non-venomous"},
            {"name": "Karnataka Bronzeback", "sci": "Dendrelaphis chairecacos", "count": 149, "cat": "nv", "label": "Non-venomous"},
            {"name": "Russell's Kukri Snake", "sci": "Oligodon russelius", "count": 145, "cat": "nv", "label": "Non-venomous"},
            {"name": "Whitaker’s sand boa", "sci": "Eryx whitakeri", "count": 143, "cat": "nv", "label": "Non-venomous"},
            {"name": "Black-headed snake", "sci": "Sibynophis subpunctatus", "count": 126, "cat": "nv", "label": "Non-venomous"},
            {"name": "Beaked Blind Snake", "sci": "Grypotyphlops acutus", "count": 121, "cat": "nv", "label": "Non-venomous"},
            {"name": "Giri's Bronzeback", "sci": "Dendrelaphis girii", "count": 120, "cat": "nv", "label": "Non-venomous"},
            {"name": "Burmese Python", "sci": "Python bivittatus", "count": 115, "cat": "nv", "label": "Non-venomous"},
            {"name": "Golden Tree Snake", "sci": "Chrysopelea ornata", "count": 108, "cat": "nv", "label": "Non-venomous"},
            {"name": "Large-eyed bronzeback", "sci": "Dendrelaphis grandoculis", "count": 88, "cat": "nv", "label": "Non-venomous"},
            {"name": "Rainbow Mud Snake", "sci": "Enhydris enhydris", "count": 84, "cat": "nv", "label": "Non-venomous"},
            {"name": "Banded Racer", "sci": "Platyceps plinii", "count": 84, "cat": "nv", "label": "Non-venomous"},
            {"name": "Eastern bronzeback tree snake", "sci": "Dendrelaphis proarchos", "count": 81, "cat": "nv", "label": "Non-venomous"},
            {"name": "Phipson's Shieldtail", "sci": "Uropeltis phipsonii", "count": 81, "cat": "nv", "label": "Non-venomous"},
            {"name": "Copperhead Rat Snake", "sci": "Coelognathus radiatus", "count": 78, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bombay Earth Snake", "sci": "Uropeltis macrolepis", "count": 66, "cat": "nv", "label": "Non-venomous"},
            {"name": "Big-eyed Bamboo Snake", "sci": "Pseudoxenodon macrops", "count": 57, "cat": "nv", "label": "Non-venomous"},
            {"name": "Perrotet's Mountain Snake", "sci": "Xylophis perroteti", "count": 54, "cat": "nv", "label": "Non-venomous"},
            {"name": "Collared Black-headed Snake", "sci": "Sibynophis collaris", "count": 51, "cat": "nv", "label": "Non-venomous"},
            {"name": "Vellore Bridal Snake", "sci": "Lycodon nympha", "count": 48, "cat": "nv", "label": "Non-venomous"},
            {"name": "Andaman Bronzeback", "sci": "Dendrelaphis andamanensis", "count": 46, "cat": "nv", "label": "Non-venomous"},
            {"name": "Light-barred Kukri Snake", "sci": "Oligodon albocinctus", "count": 44, "cat": "nv", "label": "Non-venomous"},
            {"name": "Ashok's Bronzeback", "sci": "Dendrelaphis ashoki", "count": 43, "cat": "nv", "label": "Non-venomous"},
            {"name": "Andaman Wolf Snake", "sci": "Lycodon hypsirhinoides", "count": 43, "cat": "nv", "label": "Non-venomous"},
            {"name": "Cat-eyed Fishing Snake", "sci": "Gerarda prevostiana", "count": 41, "cat": "nv", "label": "Non-venomous"},
            {"name": "Yellow-speckled Wolfsnake", "sci": "Lycodon jara", "count": 41, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indo-Chinese Rat Snake", "sci": "Ptyas korros", "count": 40, "cat": "nv", "label": "Non-venomous"},
            {"name": "Himalayan Trinket", "sci": "Elaphe hodgsoni", "count": 39, "cat": "nv", "label": "Non-venomous"},
            {"name": "Elliot's Earth Snake", "sci": "Uropeltis ellioti", "count": 37, "cat": "nv", "label": "Non-venomous"},
            {"name": "Khaire's black earth snake", "sci": "Melanophidium khairei", "count": 36, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Black Earth Snake", "sci": "Melanophidium wynaudense", "count": 36, "cat": "nv", "label": "Non-venomous"},
            {"name": "Malabar Brown Kukri Snake", "sci": "Oligodon affinis", "count": 36, "cat": "nv", "label": "Non-venomous"},
            {"name": "Kerala Mud Snake", "sci": "Dieurostus dussumieri", "count": 34, "cat": "nv", "label": "Non-venomous"},
            {"name": "Yellow-collared Wolf Snake", "sci": "Lycodon flavicollis", "count": 34, "cat": "nv", "label": "Non-venomous"},
            {"name": "Glossy-bellied Racer", "sci": "Platyceps ventromaculatus", "count": 34, "cat": "nv", "label": "Non-venomous"},
            {"name": "Green Rat Snake", "sci": "Ptyas nigromarginata", "count": 34, "cat": "nv", "label": "Non-venomous"},
            {"name": "Little File Snake", "sci": "Acrochordus granulatus", "count": 31, "cat": "nv", "label": "Non-venomous"},
            {"name": "Graceful Racer", "sci": "Platyceps gracilis", "count": 31, "cat": "nv", "label": "Non-venomous"},
            {"name": "Water Rhabdops", "sci": "Rhabdops aquaticus", "count": 31, "cat": "nv", "label": "Non-venomous"},
            {"name": "Eastern Trinket Snake", "sci": "Elaphe cantoris", "count": 30, "cat": "nv", "label": "Non-venomous"},
            {"name": "Nilgiri Burrowing Snake", "sci": "Plectrurus perroteti", "count": 30, "cat": "nv", "label": "Non-venomous"},
            {"name": "Calamaria Reed Snake", "sci": "Liopeltis calamaria", "count": 29, "cat": "nv", "label": "Non-venomous"},
            {"name": "Olive Trapezoid Snake", "sci": "Rhabdops olivaceus", "count": 28, "cat": "nv", "label": "Non-venomous"},
            {"name": "Madurai Shieldtail", "sci": "Platyplectrurus madurensis", "count": 27, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bicoloured shieldtail", "sci": "Rhinophis melanoleucus", "count": 25, "cat": "nv", "label": "Non-venomous"},
            {"name": "Common Slug Snake", "sci": "Pareas monticola", "count": 22, "cat": "nv", "label": "Non-venomous"},
            {"name": "Nilgiri Uropeltis", "sci": "Uropeltis ocellata", "count": 22, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sharma's Racer", "sci": "Platyceps bholanathi", "count": 21, "cat": "nv", "label": "Non-venomous"},
            {"name": "Siebold's Water Snake", "sci": "Ferania sieboldii", "count": 20, "cat": "nv", "label": "Non-venomous"},
            {"name": "Black-headed Royal Snake", "sci": "Spalerosophis atriceps", "count": 19, "cat": "nv", "label": "Non-venomous"},
            {"name": "Kerala Shieldtail", "sci": "Uropeltis ceylanica", "count": 19, "cat": "nv", "label": "Non-venomous"},
            {"name": "Captain’s Wood Snake", "sci": "Xylophis captaini", "count": 19, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Egg-eater", "sci": "Boiga westermanni", "count": 18, "cat": "nv", "label": "Non-venomous"},
            {"name": "Northern Large-toothed Snake", "sci": "Lycodon septentrionalis", "count": 18, "cat": "nv", "label": "Non-venomous"},
            {"name": "Oreocryptophis porphyraceus porphyraceus", "sci": "Oreocryptophis porphyraceus porphyraceus", "count": 18, "cat": "nv", "label": "Non-venomous"},
            {"name": "Long Sand Racer", "sci": "Psammophis longifrons", "count": 16, "cat": "nv", "label": "Non-venomous"},
            {"name": "Yellow Whip Snake", "sci": "Ahaetulla flavescens", "count": 15, "cat": "nv", "label": "Non-venomous"},
            {"name": "Diard's Blindsnake", "sci": "Argyrophis diardii", "count": 14, "cat": "nv", "label": "Non-venomous"},
            {"name": "Zaw's Wolf Snake", "sci": "Lycodon zawi", "count": 14, "cat": "nv", "label": "Non-venomous"},
            {"name": "Cantor’s black-headed snake", "sci": "Sibynophis sagittarius", "count": 14, "cat": "nv", "label": "Non-venomous"},
            {"name": "Uropeltis macrolepis mahableshwarensis", "sci": "Uropeltis macrolepis mahableshwarensis", "count": 14, "cat": "nv", "label": "Non-venomous"},
            {"name": "Western Ghats Bronzeback", "sci": "Ahaetulla perroteti", "count": 13, "cat": "nv", "label": "Non-venomous"},
            {"name": "Arrow-headed trinket snake", "sci": "Coelognathus helena nigriangularis", "count": 13, "cat": "nv", "label": "Non-venomous"},
            {"name": "Black Cross-barred Kukri Snake", "sci": "Oligodon cinereus", "count": 13, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red Mountain Ratsnake", "sci": "Oreocryptophis porphyraceus", "count": 13, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sind Longnose Sand Snake", "sci": "Lytorhynchus paradoxus", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Joseph's Racer", "sci": "Platyceps josephi", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Condanarous Sandsnake", "sci": "Psammophis condanarus", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Pakistan Sand Racer", "sci": "Psammophis leithii", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Karinthandan's shield tail", "sci": "Rhinophis karinthandani", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Boulenger's Earth Snake", "sci": "Uropeltis myhendrae", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Smooth Snake", "sci": "Wallophis brachyura", "count": 11, "cat": "nv", "label": "Non-venomous"},
            {"name": "Arrowback Tree Snake", "sci": "Boiga gocool", "count": 10, "cat": "nv", "label": "Non-venomous"},
            {"name": "Two-lined Black Earth Snake", "sci": "Melanophidium bilineatum", "count": 10, "cat": "nv", "label": "Non-venomous"},
            {"name": "Beddome's Black Earth Snake", "sci": "Melanophidium punctatum", "count": 10, "cat": "nv", "label": "Non-venomous"},
            {"name": "Forskal Sand Snake", "sci": "Psammophis schokari", "count": 10, "cat": "nv", "label": "Non-venomous"},
            {"name": "Yunnan Beauty Snake", "sci": "Elaphe taeniura yunnanensis", "count": 9, "cat": "nv", "label": "Non-venomous"},
            {"name": "Jerdon's Kukri Snake", "sci": "Oligodon venustus", "count": 9, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red-tailed Green Ratsnake", "sci": "Gonyosoma oxycephalum", "count": 8, "cat": "nv", "label": "Non-venomous"},
            {"name": "Travancore Kukri Snake", "sci": "Oligodon travancoricus", "count": 8, "cat": "nv", "label": "Non-venomous"},
            {"name": "Ladakh Cliff Racer", "sci": "Platyceps rhodorachis ladacensis", "count": 8, "cat": "nv", "label": "Non-venomous"},
            {"name": "Slender Worm Snake", "sci": "Pseudoindotyphlops porrectus", "count": 8, "cat": "nv", "label": "Non-venomous"},
            {"name": "Mackinnon's Wolf Snake", "sci": "Lycodon bicolor", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Banded Wolf Snake", "sci": "Lycodon fasciatus", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Yellow-spotted Wolf Snake", "sci": "Lycodon flavomaculatus", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Uropeltis jerdoni", "sci": "Uropeltis jerdoni", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Spotted Earth Snake", "sci": "Uropeltis maculata", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Shevaroy Hills earth snake", "sci": "Uropeltis shorttii", "count": 7, "cat": "nv", "label": "Non-venomous"},
            {"name": "Boiga quincunciata", "sci": "Boiga quincunciata", "count": 6, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bicatenate Uropeltis", "sci": "Uropeltis bicatenata", "count": 6, "cat": "nv", "label": "Non-venomous"},
            {"name": "Tailspot Uropeltis", "sci": "Uropeltis caudomaculata", "count": 6, "cat": "nv", "label": "Non-venomous"},
            {"name": "Anamalai Wood Snake", "sci": "Xylophis mosaicus", "count": 6, "cat": "nv", "label": "Non-venomous"},
            {"name": "Black Copper Rat Snake", "sci": "Coelognathus flavolineatus", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Blue Bronzeback", "sci": "Dendrelaphis cyanochloris", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Rice Paddy Snake", "sci": "Hypsiscopus plumbeus", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Deccan Wolf Snake", "sci": "Lycodon deccanensis", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Shorthead Kukri Snake", "sci": "Oligodon brevicauda", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Coral kukri snake", "sci": "Oligodon violaceus", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Pareas andersonii", "sci": "Pareas andersonii", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Salty Earth Snake", "sci": "Rhinophis sanguineus", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Lushai Hills Dragon Snake", "sci": "Stoliczkia vanhnuailianai", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Coral-bellied Wormsnake", "sci": "Trachischium guentheri", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Wallace's striped snake", "sci": "Wallaceophis gujaratensis", "count": 5, "cat": "nv", "label": "Non-venomous"},
            {"name": "Boulenger's Bronzeback", "sci": "Dendrelaphis bifrenalis", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Gore's bronzeback", "sci": "Dendrelaphis biloreatus", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Tiwar's Bronzeback", "sci": "Dendrelaphis humayuni", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sistan Sand Boa", "sci": "Eryx sistanensis", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Green Bush Rat Snake", "sci": "Gonyosoma prasinum", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Reticulated Python", "sci": "Malayopython reticulatus", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "North-east Indian Kukri Snake", "sci": "Oligodon cyclurus", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Walnut Kukri Snake", "sci": "Oligodon juglandifer", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Cardamom Hills Earth Snake", "sci": "Rhinophis fergusonianus", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Diadem Snake", "sci": "Spalerosophis diadema", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Uropeltis", "sci": "Uropeltis", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bhupathy’s shieldtail", "sci": "Uropeltis bhupathyi", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Madurai Shieldtail", "sci": "Uropeltis madurensis", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red-spotted Shieldtail", "sci": "Uropeltis rubromaculata", "count": 4, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bella Rat Snake", "sci": "Archelaphe bella", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Rein Snake", "sci": "Gonyosoma frenatum", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Gammie's Wolf Snake", "sci": "Lycodon gammiei", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Kukri Snakes", "sci": "Oligodon", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bengalese Kukri Snake", "sci": "Oligodon dorsalis", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Pareas modestus", "sci": "Pareas modestus", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Jan’s Cliff Racer", "sci": "Platyceps rhodorachis", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red-spotted Royal Snake", "sci": "Spalerosophis arenarius", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Blyth's Reticulate Snake", "sci": "Trachischium reticulata", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Indian Earth Snake", "sci": "Uropeltis pulneyensis", "count": 3, "cat": "nv", "label": "Non-venomous"},
            {"name": "Three-lined Shieldtail", "sci": "Platyplectrurus trilineatus", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Kerala Burrowing Snake", "sci": "Plectrurus aureus", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Smithophis atemporalis", "sci": "Smithophis atemporalis", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Hewston's Earth Snake", "sci": "Teretrurus hewstoni", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Travancore Earth Snake", "sci": "Teretrurus travancoricus", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Mizoram Ground Snake", "sci": "Trachischium hmuifang", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Olive Oriental Slender Snake", "sci": "Trachischium laeve", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Gunther's Shieldtail", "sci": "Uropeltis arcticeps", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sirumalai Hills Earth Snake", "sci": "Uropeltis dindigalensis", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Asian Sunbeam Snake", "sci": "Xenopeltis unicolor", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Wayanad Narrow-headed Snake", "sci": "Xylophis chenkaruppan", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Günther's Mountain Snake", "sci": "Xylophis stenorhynchus", "count": 2, "cat": "nv", "label": "Non-venomous"},
            {"name": "Bronzebacks", "sci": "Dendrelaphis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Mountain Bronzeback", "sci": "Dendrelaphis subocularis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Beauty Ratsnake", "sci": "Elaphe taeniura", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Mandarin Ratsnake", "sci": "Euprepiophis mandarinus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Günther's Reed Snake", "sci": "Gongylosoma frenata", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Common Ring-neck", "sci": "Gongylosoma scriptum", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Wolf Snakes and Bridal Snakes", "sci": "Lycodon", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Scarce Bridal Snake", "sci": "Lycodon gracilis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "East Himalayan Banded Wolf Snake", "sci": "Lycodon latifasciatus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Tiwari's Wolf Snake", "sci": "Lycodon tiwarii", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Zayu Wolf Snake", "sci": "Lycodon zayuensis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Greater Reticulated Python", "sci": "Malayopython reticulatus reticulatus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Assam Kukri Snake", "sci": "Oligodon catenatus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Andaman Black Kukri Snake", "sci": "Oligodon woodmasoni", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Siruvani Hills Shieldtail", "sci": "Rhinophis siruvaniensis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Tamil Nadu Earth Snake", "sci": "Rhinophis travancoricus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sinomicrurus macclellandi macclellandi", "sci": "Sinomicrurus macclellandi macclellandi", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Sinomicrurus macclellandi univirgatus", "sci": "Sinomicrurus macclellandi univirgatus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Smithophis arunachalensis", "sci": "Smithophis arunachalensis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Narrow-banded Rain Snake", "sci": "Smithophis leptofasciatus", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Teretrurus siruvaniensis", "sci": "Teretrurus siruvaniensis", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Mountain Worm-eating Snake", "sci": "Trachischium monticola", "count": 1, "cat": "nv", "label": "Non-venomous"},
            {"name": "Red-lined Earth Snake", "sci": "Uropeltis rubrolineata", "count": 1, "cat": "nv", "label": "Non-venomous"}
        ];

    const totalSpecies = snakesData.length;
    const countMS = snakesData.filter(s => s.cat === 'ms').length;
    const countV = snakesData.filter(s => s.cat === 'v').length;
    const countNV = snakesData.filter(s => s.cat === 'nv').length;

    const pctMS = (countMS / totalSpecies * 100).toFixed(1);
    const pctV = (countV / totalSpecies * 100).toFixed(1);
    const pctNV = (countNV / totalSpecies * 100).toFixed(1);

    // Update percentages in DOM dynamically
    const elPctMS = document.getElementById('cat-pct-ms');
    const elPctV = document.getElementById('cat-pct-v');
    const elPctNV = document.getElementById('cat-pct-nv');
    if (elPctMS) elPctMS.textContent = `${pctMS}%`;
    if (elPctV) elPctV.textContent = `${pctV}%`;
    if (elPctNV) elPctNV.textContent = `${pctNV}%`;

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
        dot.className = `spectrum-dot type-${snake.cat}`;
        dot.setAttribute('data-category', snake.cat);
        dot.setAttribute('data-name', snake.name);
        dot.setAttribute('data-sci', snake.sci);
        dot.setAttribute('data-count', snake.count);
        dot.setAttribute('data-label', snake.label);
        dot.setAttribute('data-index', i + 1);
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('role', 'img');
        dot.setAttribute('aria-label', `${snake.name} (${snake.sci}) - ${snake.label}, ${snake.count.toLocaleString()} sightings`);

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
                statusText.textContent = `Showing ${meta.name}: ${meta.percent}% of India's documented snakes.`;
            } else if (previewCategory) {
                const meta = categoryMeta[previewCategory];
                statusText.textContent = `Exploring ${meta.name}: ${meta.percent}% of India's documented snakes.`;
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
            tooltip.innerHTML = `
                <span class="spectrum-t-name">${snake.name}</span>
                <span class="spectrum-t-sci">${snake.sci}</span>
                <div class="spectrum-t-meta">
                    <span class="spectrum-t-badge" style="color:${badgeColors[snake.cat]}">${snake.label}</span>
                    <span class="spectrum-t-count">${countNum.toLocaleString()} ${countNum === 1 ? 'sighting' : 'sightings'}</span>
                </div>
            `;
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
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        }

        dots.forEach((dot, idx) => {
            const snake = snakesData[idx];
            dot.addEventListener('pointerenter', (e) => showTooltip(snake, e));
            dot.addEventListener('pointermove', (e) => positionTooltip(e));
            dot.addEventListener('pointerleave', hideTooltip);

            dot.addEventListener('focus', (e) => {
                showTooltip(snake, e);
                const rect = dot.getBoundingClientRect();
                tooltip.style.left = `${Math.min(window.innerWidth - 276, Math.max(16, rect.left + rect.width / 2 - 130))}px`;
                tooltip.style.top = `${Math.max(16, rect.top - 84)}px`;
            });
            dot.addEventListener('blur', hideTooltip);
        });
    }

    // Initial render
    renderState();
}


/**
 * SECTIONS 8 & 9: Continuous Shared Snake-Scale Environment
 * - One continuous sticky decorative layer spanning both Section 8 and Section 9
 * - Fade in on entry to Section 8, stay 100% visible across the boundary, fade out at exit of Section 9
 * - Restrained scroll-linked parallax:
 *   Left illustration: translateY from +12px to -12px across combined scroll
 *   Right illustration: translateY from -8px to +8px across combined scroll
 * - Movement directly tracks scrolling (scroll down advances, scroll up reverses, pause freezes)
 * - Reduced-motion preference disables parallax transforms
 */
function initSharedScaleEnvironment() {
    const group = document.getElementById('forestEnvironmentGroup');
    const overlay = document.getElementById('sharedScaleOverlay');
    const leftImg = document.getElementById('sharedScaleImgLeft');
    const rightImg = document.getElementById('sharedScaleImgRight');

    if (!group || !overlay || !leftImg || !rightImg) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isTicking = false;

    function update() {
        const rect = group.getBoundingClientRect();
        const vh = window.innerHeight;

        // Check if group is within or near viewport
        if (rect.bottom <= 0 || rect.top >= vh) {
            overlay.style.opacity = '0';
            overlay.style.visibility = 'hidden';
            return;
        }

        overlay.style.visibility = 'visible';

        // 1. Smooth fade at entrance of Section 8 and exit of Section 9
        let fadeProgress = 1.0;
        if (rect.top > 0) {
            // Entering Section 8 from Section 7
            fadeProgress = Math.max(0, Math.min(1, (vh - rect.top) / (vh * 0.45)));
        } else if (rect.bottom < vh) {
            // Exiting Section 9 toward Section 10
            fadeProgress = Math.max(0, Math.min(1, rect.bottom / (vh * 0.45)));
        }
        overlay.style.opacity = fadeProgress.toFixed(3);

        // 2. Normalized progress p from 0 to 1 across the combined height of both sections
        const totalScrollable = rect.height - vh;
        let p = 0;
        if (totalScrollable > 0) {
            const currentScroll = -rect.top;
            p = Math.max(0, Math.min(1, currentScroll / totalScrollable));
        }

        // 3. Gentle scroll-linked movement across the combined area
        if (prefersReducedMotion) {
            leftImg.style.transform = 'translate3d(0, 0, 0)';
            rightImg.style.transform = 'translate3d(0, 0, 0)';
        } else {
            // Left: approximately +12px to -12px vertically
            const leftY = 12 - (24 * p);
            // Right: approximately -8px to +8px vertically
            const rightY = -8 + (16 * p);

            leftImg.style.transform = `translate3d(0, ${leftY.toFixed(2)}px, 0)`;
            rightImg.style.transform = `translate3d(0, ${rightY.toFixed(2)}px, 0)`;
        }
    }

    function onScroll() {
        if (!isTicking) {
            isTicking = true;
            requestAnimationFrame(() => {
                update();
                isTicking = false;
            });
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    update();
}

/**
 * SECTION 9: The Big Four - Deadliest Draw Card Deck
 * Interaction Logic:
 * - 4 Playing cards with compact, realistic stack layout
 * - Opaque rear cards with vintage card back (zero transparent text ghosting)
 * - Slender portrait aspect ratio (~0.58) with dynamic coordinate measurements
 * - Draw a card button with custom arrow icon
 * - Card index progress indicator (e.g. 1 / 4, 3 / 4)
 * - Reset / Recycle deck once all cards drawn
 * - Horizontal swipe support with non-blocking vertical scroll pass-through
 * - Keyboard accessible (Enter, Space, ArrowRight, ArrowLeft, R)
 */

function initBigFourSection() {
    const stage = document.getElementById('cardStack');
    const drawBtn = document.getElementById('bigfourDrawBtn');
    const drawBtnText = document.getElementById('bigfourDrawBtnText');
    const cardIndexEl = document.getElementById('bigfourCardIndex');

    if (!stage || !drawBtn) return;

    const cards = Array.from(stage.querySelectorAll('.card'));
    if (!cards.length) return;

    let deck = [0, 1, 2, 3];
    let discarded = [];

    function updateDeckLayout() {
        deck.forEach((cardIdx, stackIndex) => {
            const card = cards[cardIdx];
            card.classList.remove('discarded');
            card.classList.add('in-deck');
            card.style.transform = ''; 
            card.style.zIndex = '';
            card.style.opacity = '';
            card.setAttribute('data-index', stackIndex);
        });

        if (deck.length > 0) {
            const activeNum = 4 - deck.length + 1;
            if (cardIndexEl) cardIndexEl.textContent = activeNum;
            if (drawBtnText) drawBtnText.textContent = "Draw a card";
            drawBtn.setAttribute('aria-label', `Draw a card. Currently showing card ${activeNum} of 4.`);
        } else {
            if (cardIndexEl) cardIndexEl.textContent = "4";
            if (drawBtnText) drawBtnText.textContent = "Reset deck ↺";
            drawBtn.setAttribute('aria-label', "Reset deck to draw cards again");
        }
    }

    function throwToDiscardPile(card) {
        card.classList.remove('in-deck');
        card.classList.add('discarded');
        
        const cardWidth = card.offsetWidth || 340;
        const offsetX = cardWidth + (window.innerWidth < 640 ? 60 : 140);
        const randomY = (Math.random() - 0.5) * 20;
        const randomRot = 12 + (Math.random() * 8);
        
        card.style.transform = `translate(${offsetX}px, ${randomY}px) rotate(${randomRot}deg) scale(0.92)`;
        card.style.opacity = '0';
        card.style.zIndex = discarded.length; 
    }

    function drawCard() {
        if (deck.length === 0) {
            collectCards();
            return;
        }

        const topCardIdx = deck.shift();
        discarded.push(topCardIdx);
        
        const topCard = cards[topCardIdx];
        throwToDiscardPile(topCard);
        
        updateDeckLayout();
    }

    function collectCards() {
        if (discarded.length === 0) return;
        
        deck = [...discarded.reverse(), ...deck];
        discarded = [];
        
        updateDeckLayout();
    }

    drawBtn.addEventListener('click', drawCard);

    // Keyboard accessibility on stage and individual cards
    stage.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
            e.preventDefault();
            drawCard();
        } else if (e.key === 'ArrowLeft' || e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            collectCards();
        }
    });

    cards.forEach(card => {
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
                e.preventDefault();
                drawCard();
            }
        });
    });

    // Touch and Drag Logic with dynamic card measurement
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let hasDeterminedDirection = false;

    function handleStart(e) {
        if (deck.length === 0) return;
        const topCard = cards[deck[0]];
        if (!e.target.closest('.card') || e.target.closest('.card') !== topCard) return;

        isDragging = true;
        hasDeterminedDirection = false;
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        topCard.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging || deck.length === 0) return;
        currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        currentY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Preserve natural vertical scrolling if user is scrolling page
        if (!hasDeterminedDirection) {
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isDragging = false;
                return;
            }
            hasDeterminedDirection = true;
        }

        if (e.cancelable) e.preventDefault();

        const topCard = cards[deck[0]];
        topCard.style.transform = `translate(${diffX}px, ${diffY * 0.25}px) rotate(${diffX * 0.04}deg)`;
    }

    function handleEnd() {
        if (!isDragging || deck.length === 0) return;
        isDragging = false;
        
        const diffX = currentX - startX;
        const topCard = cards[deck[0]];
        const cardWidth = topCard.offsetWidth || 340;
        const dragThreshold = cardWidth * 0.25;
        
        topCard.style.transition = 'transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease, box-shadow 0.35s ease';

        if (Math.abs(diffX) > dragThreshold) {
            drawCard();
        } else {
            topCard.style.transform = '';
        }
        
        startX = 0;
        currentX = 0;
    }

    stage.addEventListener('touchstart', handleStart, {passive: false});
    window.addEventListener('touchmove', handleMove, {passive: false});
    window.addEventListener('touchend', handleEnd);

    stage.addEventListener('mousedown', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    updateDeckLayout();
}

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
