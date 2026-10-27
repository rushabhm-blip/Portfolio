/**
 * WalkingCutout Component
 * Central animated cutout of Rushabh walking with yellow starburst background.
 * Uses rushabh-walking.webp with fallbacks.
 * Pauses on static walking-frame-1.png during 3D cover swing or reduced-motion.
 */
export function createWalkingCutout({ alt = 'Rushabh walking with yellow starburst' } = {}) {
  const container = document.createElement('div');
  container.className = 'walking-cutout-container';
  container.id = 'walkingCutout';

  const img = document.createElement('img');
  img.className = 'walking-cutout-img';
  img.id = 'walkingCutoutImg';
  img.src = 'assets/sketchbook/walking-frame-1.png'; // initial / static frame
  img.alt = alt;
  img.loading = 'eager';
  img.decoding = 'async';
  img.draggable = false;
  img.dataset.animatedWebp = 'assets/sketchbook/rushabh-walking.webp';
  img.dataset.animatedGif = 'assets/sketchbook/rushabh-walking.gif';
  img.dataset.staticPng = 'assets/sketchbook/walking-frame-1.png';

  container.appendChild(img);

  function startAnimation() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      img.src = img.dataset.staticPng;
      return;
    }
    // Try WebP first; on error fallback to gif
    img.onerror = () => {
      img.onerror = null;
      img.src = img.dataset.animatedGif;
    };
    img.src = img.dataset.animatedWebp;
  }

  function stopAnimation() {
    img.onerror = null;
    img.src = img.dataset.staticPng;
  }

  return {
    element: container,
    startAnimation,
    stopAnimation
  };
}
