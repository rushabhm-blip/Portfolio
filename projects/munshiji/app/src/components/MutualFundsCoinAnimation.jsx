import React, { useEffect, useRef, useState } from 'react';

// Layer paths
const ASSETS = {
  basketBase: './assets/portfolio/basket_stationary_base.png', // Layer 1: Stationary basket + geometric tokens
  rupeeCoin: './assets/portfolio/coin_rupee_clean.png',         // Layer 2: Moving rupee coin
  basketRim: './assets/portfolio/basket_front_rim.png'         // Layer 3: Masked front rim and wall
};

// Smooth cubic bezier ease-in-out / ease-out
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

export default function MutualFundsCoinAnimation({ isActive = true }) {
  const coinRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preload and decode images before playback
  useEffect(() => {
    let cancelled = false;
    const promises = Object.values(ASSETS).map((src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (img.decode) img.decode().then(resolve).catch(resolve);
          else resolve();
        };
        img.onerror = resolve;
      });
    });

    Promise.all(promises).then(() => {
      if (!cancelled) setIsLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Hardware-accelerated requestAnimationFrame continuous timeline loop
  useEffect(() => {
    if (!isActive || !isLoaded) return;
    const coinEl = coinRef.current;
    if (!coinEl) return;

    // Coordinate mapping (percentages relative to the 1024x1024 container):
    // Coin size: width = 203/1024 = 19.82%, height = 216/1024 = 21.09%
    // Horizontal position: left = 28.5% (centers around x = 390px / 38%)
    // Start position (Frame 02): y = 75px -> top = 7.32%
    // Approach rim (Frame 04): y = 350px -> top = 34.18%
    // Final settled position (Frame 06): y = 500px -> top = 48.83%
    const START_TOP = 7.32;
    const LAND_TOP = 48.83;

    if (prefersReducedMotion) {
      coinEl.style.opacity = '1';
      coinEl.style.top = `${LAND_TOP}%`;
      return;
    }

    let rafId = null;
    let startTime = null;
    const TOTAL_DURATION = 1500; // ms

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (elapsed < 250) {
        // 0–250ms: show basket only (coin hidden)
        coinEl.style.opacity = '0';
        coinEl.style.top = `${START_TOP}%`;
      } else if (elapsed <= 350) {
        // 250–350ms: coin appears above the basket with a brief opacity entrance
        const tFade = (elapsed - 250) / 100;
        coinEl.style.opacity = String(tFade);
        coinEl.style.top = `${START_TOP}%`;
      } else if (elapsed <= 1250) {
        // 350–1250ms: coin descends continuously toward the landing position
        const tDescend = (elapsed - 350) / 900;
        const progress = easeInOutCubic(tDescend);
        const currentTop = START_TOP + (LAND_TOP - START_TOP) * 0.95 * progress;
        coinEl.style.opacity = '1';
        coinEl.style.top = `${currentTop}%`;
      } else if (elapsed <= 1450) {
        // 1250–1450ms: gently settle downward into the basket behind the rim
        const tSettle = (elapsed - 1250) / 200;
        const currentTop = (START_TOP + (LAND_TOP - START_TOP) * 0.95) + (LAND_TOP - START_TOP) * 0.05 * easeOutCubic(tSettle);
        coinEl.style.opacity = '1';
        coinEl.style.top = `${currentTop}%`;
      } else {
        // After 1450ms: hold the final pose permanently
        coinEl.style.opacity = '1';
        coinEl.style.top = `${LAND_TOP}%`;
      }

      if (elapsed < TOTAL_DURATION) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive, isLoaded, prefersReducedMotion]);

  return (
    <div className="mf-anim-container" aria-label="Rupee coin falling into shared mutual funds asset basket">
      {/* Layer 1: Stationary Basket Base & Geometric Tokens */}
      <img 
        src={ASSETS.basketBase} 
        alt="" 
        aria-hidden="true" 
        className="mf-layer-basket-base" 
      />

      {/* Layer 2: Continuously Animated Rupee Coin */}
      <img 
        ref={coinRef}
        src={ASSETS.rupeeCoin} 
        alt="" 
        aria-hidden="true" 
        className="mf-layer-coin" 
        style={{ opacity: prefersReducedMotion ? 1 : 0 }}
      />

      {/* Layer 3: Masked Front Rim and Wall (perfectly aligned clone of basket) */}
      <img 
        src={ASSETS.basketRim} 
        alt="" 
        aria-hidden="true" 
        className="mf-layer-basket-rim" 
      />
    </div>
  );
}
