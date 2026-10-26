/**
 * Reusable OpenBookButton Component
 * Renders the handwritten label in Caveat, curved arrow SVG, and lime circle button.
 * The entire area acts as a semantic button with full keyboard accessibility.
 */
export function createOpenBookButton({ label = 'Open my sketchbook', onOpenSketchbook }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'open-book-btn';
  button.setAttribute('aria-label', label);
  button.setAttribute('data-chapter', 'Sketchbook');

  // Handwritten text label
  const textSpan = document.createElement('span');
  textSpan.className = 'open-book-label';
  textSpan.textContent = label;

  // Curved arrow SVG
  const arrowImg = document.createElement('img');
  arrowImg.className = 'curved-arrow-img';
  arrowImg.src = 'assets/sketchbook/curved-arrow.svg';
  arrowImg.alt = '';
  arrowImg.setAttribute('aria-hidden', 'true');

  // Lime circle with right arrow
  const circle = document.createElement('b');
  circle.className = 'lime-circle';
  circle.setAttribute('aria-hidden', 'true');

  const arrowRight = document.createElement('img');
  arrowRight.className = 'arrow-right-img';
  arrowRight.src = 'assets/sketchbook/arrow-right.svg';
  arrowRight.alt = '';

  circle.appendChild(arrowRight);

  button.appendChild(textSpan);
  button.appendChild(arrowImg);
  button.appendChild(circle);

  button.addEventListener('click', () => {
    if (typeof onOpenSketchbook === 'function') {
      onOpenSketchbook();
    }
  });

  return button;
}
