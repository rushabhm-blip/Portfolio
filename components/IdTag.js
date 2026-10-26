/**
 * Reusable IdTag Component
 * Renders the hanging ID card with metal clip and short strap behind the upper-right book edge.
 */
export function createIdTag({ alt = 'Design school ID tag' } = {}) {
  const container = document.createElement('div');
  container.className = 'id-tag-wrapper';
  container.setAttribute('aria-hidden', 'true');

  const img = document.createElement('img');
  img.className = 'id-tag-img';
  img.src = 'assets/sketchbook/4k/id-tag.png';
  img.srcset = 'assets/sketchbook/native/id-tag.png 1x, assets/sketchbook/4k/id-tag.png 2x';
  img.alt = alt;
  img.loading = 'eager';
  img.decoding = 'async';

  container.appendChild(img);
  return container;
}
