import React, { useEffect, useRef, useState } from 'react';

// Artwork layer paths extracted from authentic clay reference
const LAYER_ASSETS = {
  base: './assets/portfolio/plant_layer_base.png',       // Soil mound + gold coins (100% stationary)
  shoot: './assets/portfolio/plant_layer_shoot.png',     // Shoot sprout emerging gently at root
  stem: './assets/portfolio/plant_layer_stem.png',       // Lavender stem extending upward from root
  leftLeaf: './assets/portfolio/plant_layer_left.png',   // Left clay leaf attached at junction
  rightLeaf: './assets/portfolio/plant_layer_right.png'  // Right clay leaf attached at junction
};

// Smooth easing helpers
// Cubic bezier ease-out: starts with continuous momentum and decelerates smoothly
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
// Smoothstep: zero velocity at both endpoints
const smoothStep = (t) => t * t * (3 - 2 * t);
// Gentle ease out quad
const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

export default function PlantGrowthAnimation({ isActive = true }) {
  const containerRef = useRef(null);
  const shootRef = useRef(null);
  const stemRef = useRef(null);
  const leftLeafRef = useRef(null);
  const rightLeafRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Preload and decode all layer artwork
  useEffect(() => {
    let cancelled = false;
    const paths = Object.values(LAYER_ASSETS);
    
    const promises = paths.map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (img.decode) {
            img.decode().then(resolve).catch(resolve);
          } else {
            resolve();
          }
        };
        img.onerror = () => {
          console.error(`[PlantGrowthAnimation] Failed to load layer: ${src}`);
          resolve('error');
        };
      });
    });

    Promise.all(promises).then((results) => {
      if (cancelled) return;
      if (results.some(r => r === 'error')) {
        setHasError(true);
      }
      setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Hardware-accelerated requestAnimationFrame continuous timeline loop
  useEffect(() => {
    if (!isActive || !isLoaded) return;

    const shootEl = shootRef.current;
    const stemEl = stemRef.current;
    const leftLeafEl = leftLeafRef.current;
    const rightLeafEl = rightLeafRef.current;

    if (!shootEl || !stemEl || !leftLeafEl || !rightLeafEl) return;

    // If reduced motion requested or load error, immediately show completed state
    if (prefersReducedMotion || hasError) {
      shootEl.style.opacity = '0';
      stemEl.style.opacity = '1';
      stemEl.style.transform = 'scale(1)';
      leftLeafEl.style.opacity = '1';
      leftLeafEl.style.transform = 'scale(1) rotate(0deg)';
      rightLeafEl.style.opacity = '1';
      rightLeafEl.style.transform = 'scale(1) rotate(0deg)';
      return;
    }

    let rafId = null;
    let startTime = null;
    const TOTAL_DURATION = 3000; // 3.0 seconds total continuous motion

    const renderFrame = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // -------------------------------------------------------------
      // PHASE 1: Shoot emergence (0 – 350ms)
      // 0–300ms: shoot emerges gently from the soil, then cross-fades into stem
      // -------------------------------------------------------------
      if (elapsed <= 400) {
        const tShoot = Math.min(1, Math.max(0, elapsed / 300));
        const shootScale = 0.2 + 0.8 * easeOutCubic(tShoot);
        const shootOpacity = Math.min(1, elapsed / 180);
        shootEl.style.opacity = String(shootOpacity);
        shootEl.style.transform = `scale(${shootScale})`;
      } else {
        // Fade out shoot completely as main stem takes over
        const fadeShoot = Math.max(0, 1 - (elapsed - 400) / 250);
        shootEl.style.opacity = String(fadeShoot);
      }

      // -------------------------------------------------------------
      // PHASE 2: Stem continuous vertical growth (200 – 1400ms)
      // Stem grows upward continuously, slowing as it approaches full height
      // -------------------------------------------------------------
      let stemProgress = 0;
      let stemOpacity = 0;
      if (elapsed >= 200) {
        const tStem = Math.min(1, (elapsed - 200) / 1200); // 200ms to 1400ms
        stemProgress = easeOutCubic(tStem);
        stemOpacity = Math.min(1, (elapsed - 200) / 200);
      }
      // Vertical extension from root baseline (y: 69.3%)
      // Animate scaleY from 0.05 up to 1.0 continuously, with proportional subtle scaleX
      const stemScaleY = 0.05 + 0.95 * stemProgress;
      const stemScaleX = 0.6 + 0.4 * stemProgress;
      stemEl.style.opacity = String(stemOpacity);
      stemEl.style.transform = `scale(${stemScaleX}, ${stemScaleY})`;

      // -------------------------------------------------------------
      // PHASE 3: Left Leaf growth & opening (800 – 2100ms + settle to 3000ms)
      // Grows from a small folded bud and unfurls outward from stem junction
      // -------------------------------------------------------------
      let leftScale = 0;
      let leftRotate = 0;
      let leftOpacity = 0;

      if (elapsed >= 800) {
        // Main growth phase: 800ms - 2100ms
        const tLeft = Math.min(1, (elapsed - 800) / 1300);
        const easedLeft = easeOutCubic(tLeft);
        leftOpacity = Math.min(1, (elapsed - 800) / 250);

        // Scale grows from 0.05 to 1.0
        leftScale = 0.05 + 0.95 * easedLeft;

        // Rotation starts curled in (+22deg) and unfurls outward to 0deg
        leftRotate = 22 * (1 - easedLeft);

        // Subtle organic settling between 2100ms and 3000ms
        if (elapsed > 2100) {
          const tSettle = Math.min(1, (elapsed - 2100) / 900);
          const settleDamp = (1 - tSettle) * Math.sin(tSettle * Math.PI) * 0.015;
          leftScale = 1.0 + settleDamp;
          leftRotate = (1 - tSettle) * Math.sin(tSettle * Math.PI) * 1.5;
        }
      }

      leftLeafEl.style.opacity = String(leftOpacity);
      leftLeafEl.style.transform = `scale(${leftScale}) rotate(${leftRotate}deg)`;

      // -------------------------------------------------------------
      // PHASE 4: Right Leaf growth & opening (1000 – 2400ms + settle to 3000ms)
      // Follows with a slight natural delay, unfolding outward to the right
      // -------------------------------------------------------------
      let rightScale = 0;
      let rightRotate = 0;
      let rightOpacity = 0;

      if (elapsed >= 1000) {
        // Main growth phase: 1000ms - 2400ms
        const tRight = Math.min(1, (elapsed - 1000) / 1400);
        const easedRight = easeOutCubic(tRight);
        rightOpacity = Math.min(1, (elapsed - 1000) / 250);

        // Scale grows from 0.05 to 1.0
        rightScale = 0.05 + 0.95 * easedRight;

        // Rotation starts curled in (-20deg) and unfurls outward to 0deg
        rightRotate = -20 * (1 - easedRight);

        // Subtle organic settling between 2400ms and 3000ms
        if (elapsed > 2400) {
          const tSettleR = Math.min(1, (elapsed - 2400) / 600);
          const settleDampR = (1 - tSettleR) * Math.sin(tSettleR * Math.PI) * 0.012;
          rightScale = 1.0 + settleDampR;
          rightRotate = -(1 - tSettleR) * Math.sin(tSettleR * Math.PI) * 1.2;
        }
      }

      rightLeafEl.style.opacity = String(rightOpacity);
      rightLeafEl.style.transform = `scale(${rightScale}) rotate(${rightRotate}deg)`;

      // Keep loop running until duration completes
      if (elapsed < TOTAL_DURATION) {
        rafId = requestAnimationFrame(renderFrame);
      } else {
        // Hold final reference pose permanently
        shootEl.style.opacity = '0';
        stemEl.style.opacity = '1';
        stemEl.style.transform = 'scale(1, 1)';
        leftLeafEl.style.opacity = '1';
        leftLeafEl.style.transform = 'scale(1) rotate(0deg)';
        rightLeafEl.style.opacity = '1';
        rightLeafEl.style.transform = 'scale(1) rotate(0deg)';
      }
    };

    // Kick off animation
    rafId = requestAnimationFrame(renderFrame);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive, isLoaded, prefersReducedMotion, hasError]);

  return (
    <div 
      className="portfolio-growth-stage" 
      aria-label="Plant growth animation showing your portfolio journey"
    >
      <div className="portfolio-plant-container" ref={containerRef}>
        {/* Layer 1: Soil mound & gold coins - strictly stationary base */}
        <img 
          src={LAYER_ASSETS.base} 
          alt="" 
          aria-hidden="true" 
          className="plant-layer-base"
        />

        {/* Layer 2: Emerging shoot sprout anchored in soil root */}
        <img 
          ref={shootRef}
          src={LAYER_ASSETS.shoot} 
          alt="" 
          aria-hidden="true" 
          className="plant-layer-shoot"
          style={{ opacity: 0 }}
        />

        {/* Layer 3: Extending vertical stem anchored at soil root */}
        <img 
          ref={stemRef}
          src={LAYER_ASSETS.stem} 
          alt="" 
          aria-hidden="true" 
          className="plant-layer-stem"
          style={{ opacity: 0 }}
        />

        {/* Layer 4: Left clay leaf anchored at stem junction */}
        <img 
          ref={leftLeafRef}
          src={LAYER_ASSETS.leftLeaf} 
          alt="" 
          aria-hidden="true" 
          className="plant-layer-leaf-left"
          style={{ opacity: 0 }}
        />

        {/* Layer 5: Right clay leaf anchored at stem junction */}
        <img 
          ref={rightLeafRef}
          src={LAYER_ASSETS.rightLeaf} 
          alt="" 
          aria-hidden="true" 
          className="plant-layer-leaf-right"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
}
