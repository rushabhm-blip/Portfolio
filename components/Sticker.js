/**
 * Reusable Sticker Component
 * Supports:
 * - 'role': Clean editable HTML/CSS badge (no raster halo)
 * - 'portrait': Illustrated portrait sticker with subtle tilt
 * - 'cursor': Blue cursor / Make it useful sticker
 *
 * Each sticker is wrapped in an outer .sticker-drag-wrapper which handles
 * normalized coordinates and pointer capture dragging, while the inner
 * element preserves its intrinsic tilt and hover animation.
 */
export function createSticker({ type, data = {}, alt = '' }) {
  const wrapper = document.createElement('div');
  wrapper.className = `sticker-drag-wrapper sticker-wrapper-${type}`;
  wrapper.dataset.stickerId = type;
  wrapper.setAttribute('tabindex', '0');
  wrapper.setAttribute('role', 'button');

  if (type === 'role') {
    const label = `${data.eyebrow || "HELLO, I'M"} ${data.title || "Interaction Designer"}`;
    wrapper.setAttribute('aria-label', `${label} sticker. Draggable. Use arrow keys to move.`);

    const badge = document.createElement('div');
    badge.className = 'sticker-role';

    const header = document.createElement('strong');
    header.className = 'role-header';
    header.textContent = data.eyebrow || "HELLO, I’M";

    const body = document.createElement('span');
    body.className = 'role-body';
    body.innerHTML = (data.title || "Interaction\nDesigner").replace('\n', '<br>');

    badge.appendChild(header);
    badge.appendChild(body);
    wrapper.appendChild(badge);
    return wrapper;
  }

  if (type === 'portrait') {
    wrapper.setAttribute('aria-label', 'Illustrated smiling portrait of Rushabh sticker. Draggable. Use arrow keys to move.');

    const img = document.createElement('img');
    img.className = 'sticker-portrait';
    img.src = 'assets/sketchbook/4k/portrait-sticker.png';
    img.srcset = 'assets/sketchbook/native/portrait-sticker.png 1x, assets/sketchbook/4k/portrait-sticker.png 2x';
    img.alt = alt || 'Illustrated smiling portrait of Rushabh';
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;

    wrapper.appendChild(img);
    return wrapper;
  }

  if (type === 'cursor') {
    wrapper.setAttribute('aria-label', 'Make it useful cursor sticker. Draggable. Use arrow keys to move.');

    const img = document.createElement('img');
    img.className = 'sticker-cursor';
    img.src = 'assets/sketchbook/4k/cursor-sticker.png';
    img.srcset = 'assets/sketchbook/native/cursor-sticker.png 1x, assets/sketchbook/4k/cursor-sticker.png 2x';
    img.alt = alt || 'Make it useful sticker with blue cursor';
    img.loading = 'eager';
    img.decoding = 'async';
    img.draggable = false;

    wrapper.appendChild(img);
    return wrapper;
  }

  throw new Error(`Unknown sticker type: ${type}`);
}

