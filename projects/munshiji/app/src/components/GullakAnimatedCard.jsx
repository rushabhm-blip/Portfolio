import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * GullakAnimatedCard
 * Implements the continuously looping elephant piggy-bank animation for Munshiji's home card.
 * Clicking/tapping anywhere on the elephant opens the interactive Gullak coin-sliding screen.
 * 
 * Rules:
 * - Continuously looping animation cycle (2.6s per cycle):
 *    0-250ms: coin appears above slot
 *    250-850ms: coin drops smoothly into slot opening
 *    850-1050ms: coin hidden, elephant compresses ~2% at feet
 *    1050-1500ms: gentle damped shake (0 -> -3deg -> +2.5deg -> -1deg -> 0)
 *    1500-1800ms: settles upright, smile develops smoothly
 *    1800-2300ms: hold smile
 *    2300-2600ms: gently return to neutral while coin resets above slot
 * - Occlusion via foreground lip mask (slot_front_lip.png)
 * - Click/Tap/Enter/Space triggers onClick prop (takes user to slide-the-coin Gullak screen)
 */

const CYCLE_DURATION = 2600; // ms

// Assets
const ASSETS = {
  base: './assets/gullak_anim/08-neutral-base.png',
  coin: './assets/gullak_anim/07-separate-coin.png',
  lip: './assets/gullak_anim/slot_front_lip.png',
  smile: './assets/gullak_anim/smile_overlay.png',
};

export default function GullakAnimatedCard({ onClick }) {
  const [isReady, setIsReady] = useState(false);
  
  // Animation state refs for display-rate 60/120fps continuous animation
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedAtRef = useRef(null);
  const isPlayingRef = useRef(false);
  
  // DOM element refs
  const elephantRef = useRef(null);
  const coinRef = useRef(null);
  const smileRef = useRef(null);
  const buttonRef = useRef(null);

  // Check prefers-reduced-motion
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Preload and decode all assets before starting
  useEffect(() => {
    let isMounted = true;

    const preloadAssets = async () => {
      try {
        const promises = Object.values(ASSETS).map((src) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            if (img.decode) {
              img.decode().then(resolve).catch(resolve);
            } else {
              img.onload = resolve;
              img.onerror = resolve;
            }
          });
        });
        await Promise.all(promises);
        if (isMounted) {
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) setIsReady(true);
      }
    };

    preloadAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute transform and opacities for a given time t in [0, CYCLE_DURATION]
  const applyFrame = useCallback((t) => {
    if (!elephantRef.current || !coinRef.current || !smileRef.current) return;

    let coinOpacity = 0;
    let coinTopPercent = 11.62; // 119px / 1024px
    let scaleY = 1;
    let scaleX = 1;
    let rotation = 0;
    let smileOpacity = 0;

    if (t < 250) {
      // 0 - 250ms: Neutral elephant; coin appears above slot
      coinOpacity = 1;
      coinTopPercent = 11.62;
      scaleY = 1;
      scaleX = 1;
      rotation = 0;
      smileOpacity = 0;
    } else if (t < 850) {
      // 250 - 850ms: Coin drops smoothly, accelerating slightly toward slot
      const p = (t - 250) / 600;
      const eased = Math.pow(p, 1.35);
      // Top goes from 11.62% (119px) to 36.13% (370px) where it's fully under the front lip
      coinTopPercent = 11.62 + (36.13 - 11.62) * eased;
      coinOpacity = 1;
      scaleY = 1;
      scaleX = 1;
      rotation = 0;
      smileOpacity = 0;
    } else if (t < 1050) {
      // 850 - 1050ms: Coin finishes entering, fully hidden. Elephant compresses ~2% at feet
      const p = (t - 850) / 200;
      coinOpacity = 0;
      const squash = Math.sin(p * Math.PI) * 0.022;
      scaleY = 1 - squash;
      scaleX = 1 + squash * 0.5;
      rotation = 0;
      smileOpacity = 0;
    } else if (t < 1500) {
      // 1050 - 1500ms: Gentle damped shake: rotation 0 -> -3deg -> +2.5deg -> -1deg -> 0
      const p = (t - 1050) / 450;
      coinOpacity = 0;
      scaleY = 1;
      scaleX = 1;
      
      if (p <= 0.25) {
        const k = p / 0.25;
        rotation = 0 + (-3 - 0) * Math.sin((k * Math.PI) / 2);
      } else if (p <= 0.55) {
        const k = (p - 0.25) / 0.3;
        rotation = -3 + (2.5 - -3) * (0.5 - 0.5 * Math.cos(k * Math.PI));
      } else if (p <= 0.8) {
        const k = (p - 0.55) / 0.25;
        rotation = 2.5 + (-1 - 2.5) * (0.5 - 0.5 * Math.cos(k * Math.PI));
      } else {
        const k = (p - 0.8) / 0.2;
        rotation = -1 + (0 - -1) * (0.5 - 0.5 * Math.cos(k * Math.PI));
      }
      smileOpacity = 0;
    } else if (t < 1800) {
      // 1500 - 1800ms: Elephant settles upright and small smile develops smoothly
      const p = (t - 1500) / 300;
      coinOpacity = 0;
      scaleY = 1;
      scaleX = 1;
      rotation = 0;
      smileOpacity = 0.5 - 0.5 * Math.cos(p * Math.PI);
    } else if (t < 2300) {
      // 1800 - 2300ms: Hold the happy expression
      coinOpacity = 0;
      scaleY = 1;
      scaleX = 1;
      rotation = 0;
      smileOpacity = 1;
    } else {
      // 2300 - 2600ms: Gently return to neutral while coin resets above slot for next cycle
      coinOpacity = 0;
      scaleY = 1;
      scaleX = 1;
      rotation = 0;
      const p = (t - 2300) / 300;
      smileOpacity = 1 - (0.5 - 0.5 * Math.cos(p * Math.PI));
    }

    // Apply styles directly to DOM
    coinRef.current.style.opacity = coinOpacity;
    coinRef.current.style.top = `${coinTopPercent}%`;
    elephantRef.current.style.transform = `scale(${scaleX}, ${scaleY}) rotate(${rotation}deg)`;
    smileRef.current.style.opacity = smileOpacity;
  }, []);

  // Set resting state (smiling, stationary, no coin)
  const setRestingSmilingState = useCallback(() => {
    if (!elephantRef.current || !coinRef.current || !smileRef.current) return;
    coinRef.current.style.opacity = '0';
    coinRef.current.style.top = '11.62%';
    elephantRef.current.style.transform = 'scale(1, 1) rotate(0deg)';
    smileRef.current.style.opacity = '1';
  }, []);

  // Start continuous loop animation runner
  const startLoop = useCallback(() => {
    if (isPlayingRef.current) return;

    if (prefersReducedMotion.current) {
      setRestingSmilingState();
      return;
    }

    isPlayingRef.current = true;
    startTimeRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startTimeRef.current;
      const cycleTime = elapsed % CYCLE_DURATION;

      applyFrame(cycleTime);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
  }, [applyFrame, setRestingSmilingState]);

  // Launch on initial mount once ready
  useEffect(() => {
    if (isReady) {
      if (prefersReducedMotion.current) {
        setRestingSmilingState();
      } else {
        startLoop();
      }
    }
  }, [isReady, startLoop, setRestingSmilingState]);

  // Handle visibilitychange (pause when backgrounded, resume when visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animFrameRef.current) {
          cancelAnimationFrame(animFrameRef.current);
          animFrameRef.current = null;
          pausedAtRef.current = performance.now();
        }
      } else {
        if (isPlayingRef.current && pausedAtRef.current && startTimeRef.current) {
          const pauseDuration = performance.now() - pausedAtRef.current;
          startTimeRef.current += pauseDuration;
          
          const tick = (now) => {
            const elapsed = now - startTimeRef.current;
            const cycleTime = elapsed % CYCLE_DURATION;

            applyFrame(cycleTime);
            animFrameRef.current = requestAnimationFrame(tick);
          };

          animFrameRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [applyFrame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Handle user interaction -> opens Gullak screen
  const handleInteraction = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick(e);
      }
    }
  };

  return (
    <div className="gullak-animated-container" style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        id="animate-gullak-btn"
        data-testid="animate-gullak-btn"
        type="button"
        className="gullak-animate-trigger"
        onClick={handleInteraction}
        onKeyDown={handleKeyDown}
        aria-label="Open Gullak to slide coins"
        title="Tap to open Gullak"
        style={{
          background: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          outline: 'none',
          display: 'block',
          width: '100%',
          height: '100%',
          position: 'relative',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Shaking & Squashing Elephant Wrapper with Transform Origin at feet */}
        <div
          ref={elephantRef}
          className="elephant-transform-wrapper"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transformOrigin: '50% 90%', // Anchor pivot at the elephant's feet
            willChange: 'transform',
          }}
        >
          {/* Layer 1: Stable Neutral Elephant Base with Slot */}
          <img
            src={ASSETS.base}
            alt=""
            aria-hidden="true"
            className="gullak-layer gullak-layer-base"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />

          {/* Layer 2: Moving Coin dropping directly into center of slot */}
          <img
            ref={coinRef}
            src={ASSETS.coin}
            alt=""
            aria-hidden="true"
            className="gullak-layer gullak-layer-coin"
            style={{
              position: 'absolute',
              left: '46.387%', // (475 / 1024) -> Centers the 110px coin at slot center 530px
              width: '10.742%', // (110 / 1024)
              height: '15.625%', // (160 / 1024)
              top: '11.62%', // 119px / 1024px
              objectFit: 'contain',
              opacity: 0,
              pointerEvents: 'none',
              willChange: 'top, opacity',
              zIndex: 2,
            }}
          />

          {/* Layer 3: Foreground Slot Lip & Body Mask (Occludes lower coin portion) */}
          <img
            src={ASSETS.lip}
            alt=""
            aria-hidden="true"
            className="gullak-layer gullak-layer-lip"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              zIndex: 3,
            }}
          />

          {/* Layer 4: Smile Overlay developing smoothly after settling */}
          <img
            ref={smileRef}
            src={ASSETS.smile}
            alt=""
            aria-hidden="true"
            className="gullak-layer gullak-layer-smile"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              pointerEvents: 'none',
              opacity: prefersReducedMotion.current ? 1 : 0,
              zIndex: 4,
              willChange: 'opacity',
            }}
          />
        </div>
      </button>
    </div>
  );
}
