import React, { useState, useEffect, useRef } from 'react';

/**
 * LearnHeroPlant:
 * Reusable hero animated illustration of plant growing from the open book.
 * 
 * Layers:
 * 1. Soft shadow under book
 * 2. Open book (base)
 * 3. Stem contact shadow & Stem (emerges from centre fold via bottom-to-top mask)
 * 4. Left leaf (attaches to left branch tip, grows & rotates outward)
 * 5. Right leaf (attaches to right branch tip, grows & rotates outward)
 * 6. Gold ₹ coin & contact shadow (stands on right-hand page)
 * 
 * Timeline (2.5 seconds total):
 * 0–400ms: Book appears (fades in + translateY 8px -> 0px)
 * 400–1100ms: Stem grows (progressively reveals bottom-to-top, bottom fixed at crease)
 * 950–1650ms: Left leaf opens (scale 5% -> 100%, rotates outward around attachment base)
 * 1100–1800ms: Right leaf opens (scale 5% -> 100%, rotates outward around attachment base)
 * 1800–2200ms: Coin appears (fades in + raises 10px + settles tilt)
 * 2200–2500ms: Settle (2deg overshoot & gentle return to still pose)
 */
export default function LearnHeroPlant() {
  const [animationComplete, setAnimationComplete] = useState(false);
  const hasAnimatedRef = useRef(false);

  // Preload hero assets
  useEffect(() => {
    const assets = [
      './assets/learn/hero_book_trimmed.png',
      './assets/learn/hero_stem_trimmed.png',
      './assets/learn/hero_leaf_left_trimmed.png',
      './assets/learn/hero_leaf_right_trimmed.png',
      './assets/learn/hero_coin_trimmed.png'
    ];
    assets.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Lock animation into completely still state after 2.5s duration
  useEffect(() => {
    if (hasAnimatedRef.current) {
      setAnimationComplete(true);
      return;
    }
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      hasAnimatedRef.current = true;
    }, 2550);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="learn-hero-plant-container" aria-hidden="true">
      <div className={`hero-plant-stage ${animationComplete ? 'held-still' : ''}`}>
        {/* Layer 0: Book Floor Shadow */}
        <div className="hero-book-shadow"></div>

        {/* Layer 1: Open Book Base */}
        <img 
          src="./assets/learn/hero_book_trimmed.png" 
          alt="" 
          className="hero-layer-book" 
          draggable={false}
        />

        {/* Layer 2: Stem Contact Shadow */}
        <div className="hero-stem-shadow"></div>

        {/* Layer 3: Lavender Stem (Progressive bottom-to-top reveal mask) */}
        <div className="hero-stem-mask-wrapper">
          <img 
            src="./assets/learn/hero_stem_trimmed.png" 
            alt="" 
            className="hero-layer-stem" 
            draggable={false}
          />
        </div>

        {/* Layer 4: Left Leaf (Anchor at narrow base 95% 98.6%) */}
        <div className="hero-leaf-left-anchor">
          <img 
            src="./assets/learn/hero_leaf_left_trimmed.png" 
            alt="" 
            className="hero-layer-leaf-left" 
            draggable={false}
          />
        </div>

        {/* Layer 5: Right Leaf (Anchor at narrow base 5.4% 98.6%) */}
        <div className="hero-leaf-right-anchor">
          <img 
            src="./assets/learn/hero_leaf_right_trimmed.png" 
            alt="" 
            className="hero-layer-leaf-right" 
            draggable={false}
          />
        </div>

        {/* Layer 6: Coin Page Contact Shadow */}
        <div className="hero-coin-shadow"></div>

        {/* Layer 7: Gold ₹ Coin */}
        <img 
          src="./assets/learn/hero_coin_trimmed.png" 
          alt="" 
          className="hero-layer-coin" 
          draggable={false}
        />
      </div>
    </div>
  );
}
