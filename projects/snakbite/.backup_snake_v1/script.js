/**
 * PANIC VS POISON: A STORY OF FEAR AND COEXISTENCE
 * Parallax Canvas & Snake Entrance Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initBackgroundParallax();
    initAmbientEmbers();
    initSnakeEntrance();
    initLandscapeLayerStory();
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
 * the snake gracefully slithers into view from the top-left corner,
 * stops at the chosen frame, and remains static without looping.
 */
function initSnakeEntrance() {
    const snakeContainer = document.getElementById('snake-container');
    const snakeVideo = document.getElementById('snake-video');
    if (!snakeContainer) return;

    if (snakeVideo) {
        snakeVideo.loop = false;
        snakeVideo.removeAttribute('loop');

        // Once video reaches the end of the entrance, freeze statically on final frame
        snakeVideo.addEventListener('ended', () => {
            snakeVideo.pause();
        });

        // Trigger autoplay
        snakeVideo.play().catch(e => console.log('Autoplay handled:', e));
    }

    // Brief delay to allow background & headline to register first
    setTimeout(() => {
        snakeContainer.classList.add('is-entered');
        if (snakeVideo && snakeVideo.paused && !snakeVideo.ended) {
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

    const habitatLeft = document.getElementById('habitat-left');
    const habitatRight = document.getElementById('habitat-right') || document.getElementById('habitat-card');
    const mountainStory = document.getElementById('mountain-story');

    const statBeat1 = document.getElementById('stat-beat-1');
    const statBeat2 = document.getElementById('stat-beat-2');
    const statBeat3 = document.getElementById('stat-beat-3');
    const counter58k = document.getElementById('counter-58k');
    const statsScrim = document.getElementById('stats-scrim');

    if (!landscapeScreen || !layerMountains) return;

    // Initial state setup
    layerMountains.style.opacity = '0';
    layerLand.style.opacity = '0';
    layerTrees.style.opacity = '0';
    layerHomes.style.opacity = '0';
    layerCrack.style.opacity = '0';
    layerCrack.style.clipPath = 'inset(0 0 100% 0)';
    if (layerPanorama) layerPanorama.style.opacity = '0';

    if (statBeat1) statBeat1.style.opacity = '0';
    if (statBeat2) statBeat2.style.opacity = '0';
    if (statBeat3) statBeat3.style.opacity = '0';

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

    // Helper: calculate card fade-in, hold, fade-out with smooth vertical float
    function calcCardState(p, start, enterEnd, exitStart, end) {
        if (p < start || p > end) {
            return { opacity: 0, translateY: (p < start ? 20 : -20), visible: false };
        }
        if (p <= enterEnd) {
            const t = (p - start) / (enterEnd - start);
            return { opacity: t, translateY: (1 - t) * 20, visible: true };
        }
        if (p <= exitStart) {
            return { opacity: 1, translateY: 0, visible: true };
        }
        const t = (p - exitStart) / (end - exitStart);
        return { opacity: 1 - t, translateY: -t * 20, visible: true };
    }

    function updateLayersOnScroll() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        // 1. Hero Screen Fade-Out (Screen 1 disappears smoothly)
        const heroFadeThreshold = windowHeight * 0.55;
        const heroProgress = Math.min(1, Math.max(0, scrollY / heroFadeThreshold));

        if (heroContent) {
            heroContent.style.opacity = (1 - heroProgress).toFixed(3);
            heroContent.style.transform = `translate3d(0, ${-heroProgress * 35}px, 0)`;
            heroContent.style.pointerEvents = heroProgress > 0.85 ? 'none' : 'auto';
        }

        if (snakeContainer) {
            const snakeOpacity = Math.max(0, 1 - heroProgress * 1.4);
            snakeContainer.style.opacity = snakeOpacity.toFixed(3);
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
        const mountainEntry = Math.min(1, Math.max(0, (scrollY - windowHeight * 0.25) / (windowHeight * 0.35)));

        // Phase 1: Mountains (progress 0.00 -> 0.10)
        const mountainOp = Math.max(mountainEntry, Math.min(1, progress / 0.10));
        layerMountains.style.opacity = mountainOp.toFixed(3);

        // Mountain Narrative Statement
        if (mountainStory) {
            let mStoryOp = 0;
            if (progress < 0.11) {
                mStoryOp = Math.min(1, Math.max(0, (progress - 0.01) / 0.05));
                if (progress === 0 && mountainEntry > 0.4) {
                    mStoryOp = Math.min(1, (mountainEntry - 0.4) / 0.4);
                }
            } else {
                mStoryOp = Math.max(0, 1 - (progress - 0.11) / 0.04);
            }
            mountainStory.style.opacity = mStoryOp.toFixed(3);
            const mTransY = (1 - mStoryOp) * 20;
            mountainStory.style.transform = `translate(-50%, calc(-50% + ${mTransY}px))`;
            mountainStory.style.pointerEvents = mStoryOp > 0.5 ? 'auto' : 'none';
        }

        // Phase 2: Land (progress 0.10 -> 0.22)
        const landOp = Math.min(1, Math.max(0, (progress - 0.10) / 0.10));
        layerLand.style.opacity = landOp.toFixed(3);

        // Phase 3: Trees (progress 0.22 -> 0.34)
        const treesOp = Math.min(1, Math.max(0, (progress - 0.22) / 0.10));
        layerTrees.style.opacity = treesOp.toFixed(3);

        // Phase 4: Homes (progress 0.34 -> 0.46)
        const homesOp = Math.min(1, Math.max(0, (progress - 0.34) / 0.10));
        layerHomes.style.opacity = homesOp.toFixed(3);

        // Phase 5: The Crack (progress 0.46 -> 0.58)
        const crackProgress = Math.min(1, Math.max(0, (progress - 0.46) / 0.12));
        layerCrack.style.opacity = (crackProgress > 0.02 ? 1 : 0).toString();
        layerCrack.style.clipPath = `inset(0 0 ${(1 - crackProgress) * 100}% 0)`;

        // Split Editorial Story Text reveal across the Divide (progress 0.48 -> 0.62)
        const divCard = calcCardState(progress, 0.48, 0.53, 0.58, 0.62);
        if (habitatLeft) {
            habitatLeft.style.opacity = divCard.opacity.toFixed(3);
            habitatLeft.style.transform = `translate3d(0, ${divCard.translateY.toFixed(1)}px, 0)`;
            habitatLeft.style.pointerEvents = divCard.opacity > 0.5 ? 'auto' : 'none';
        }
        if (habitatRight) {
            habitatRight.style.opacity = divCard.opacity.toFixed(3);
            habitatRight.style.transform = `translate3d(0, ${divCard.translateY.toFixed(1)}px, 0)`;
            habitatRight.style.pointerEvents = divCard.opacity > 0.5 ? 'auto' : 'none';
        }

        // Phase 6: Seamless Panorama Cross-fade (progress 0.58 -> 0.65)
        // Since upper 1080px matches layers underneath, cross-fading is completely invisible.
        if (layerPanorama) {
            const panoOp = Math.min(1, Math.max(0, (progress - 0.58) / 0.06));
            layerPanorama.style.opacity = panoOp.toFixed(3);
        }

        // Phase 7: Camera Descent Pan into Valley (progress 0.64 -> 0.96)
        // Smoothly travels down along the fissure into the lower valley
        if (layersContainer) {
            let panY = 0;
            if (progress > 0.64) {
                const descentProgress = Math.min(1, Math.max(0, (progress - 0.64) / 0.32));
                const easeDescent = 0.5 - 0.5 * Math.cos(descentProgress * Math.PI);
                const maxPanY = Math.max(0, layersContainer.offsetHeight - windowHeight);
                panY = easeDescent * maxPanY;
            }
            layersContainer.style.transform = `translate3d(0, ${-panY.toFixed(1)}px, 0)`;
        }

        // Phase 8: Center-Aligned Scrollytelling Data Beats
        // Beat 1: Scale & 1 in 2 Donut Gauge (progress 0.63 -> 0.73)
        const b1 = calcCardState(progress, 0.63, 0.66, 0.70, 0.73);
        if (statBeat1) {
            statBeat1.style.opacity = b1.opacity.toFixed(3);
            statBeat1.style.transform = `translate(-50%, calc(-50% + ${b1.translateY.toFixed(1)}px))`;
            statBeat1.style.pointerEvents = b1.opacity > 0.5 ? 'auto' : 'none';
        }

        // Beat 2: 58,000 Lives Lost Counter (progress 0.72 -> 0.82)
        const b2 = calcCardState(progress, 0.72, 0.75, 0.79, 0.82);
        if (statBeat2) {
            statBeat2.style.opacity = b2.opacity.toFixed(3);
            statBeat2.style.transform = `translate(-50%, calc(-50% + ${b2.translateY.toFixed(1)}px))`;
            statBeat2.style.pointerEvents = b2.opacity > 0.5 ? 'auto' : 'none';

            if (b2.opacity > 0.3) {
                start58kCount();
            }
        }
        if (progress < 0.69) {
            reset58kCount();
        }

        // Beat 3: 6 Deaths Every Hour (progress 0.81 -> 0.91)
        const b3 = calcCardState(progress, 0.81, 0.84, 0.88, 0.91);
        if (statBeat3) {
            statBeat3.style.opacity = b3.opacity.toFixed(3);
            statBeat3.style.transform = `translate(-50%, calc(-50% + ${b3.translateY.toFixed(1)}px))`;
            statBeat3.style.pointerEvents = b3.opacity > 0.5 ? 'auto' : 'none';
        }

        // Soft Atmosphere Scrim for Data Beats (Gently deepens scene during stats)
        const statsActiveOp = Math.max(b1.opacity, b2.opacity, b3.opacity);
        if (statsScrim) {
            statsScrim.style.opacity = (statsActiveOp * 0.88).toFixed(3);
        }
    }

    window.addEventListener('scroll', updateLayersOnScroll, { passive: true });
    updateLayersOnScroll();

    // Global harmony/healing API for future chapters where the crack fills up
    window.setCrackHealingState = function(fillPercentage) {
        const health = Math.min(100, Math.max(0, fillPercentage)) / 100;
        if (!layerCrack) return;
        layerCrack.style.opacity = (1 - health).toFixed(3);
        layerCrack.style.filter = `drop-shadow(0 0 ${15 * (1 - health)}px rgba(239, 68, 68, 0.65)) hue-rotate(${health * 100}deg)`;
    };
}
