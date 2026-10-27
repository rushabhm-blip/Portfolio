/**
 * HangingIdCard Component
 * Renders the complete hanging cream tag with black strap, metal clasp,
 * and the geometric NID logo (nid-card-logo.png).
 * Anchored to the stationary right block, visible outside the upper-right edge.
 */
export function createHangingIdCard({ alt = 'NID design school student ID tag with geometric logo' } = {}) {
  const container = document.createElement('div');
  container.className = 'id-tag-wrapper';
  container.id = 'hangingIdCard';
  container.setAttribute('aria-label', alt);

  const img = document.createElement('img');
  img.className = 'id-tag-img';
  img.src = 'assets/sketchbook/nid-card-logo.png';
  img.alt = alt;
  img.loading = 'eager';
  img.decoding = 'async';
  img.draggable = false;

  container.appendChild(img);
  return container;
}
