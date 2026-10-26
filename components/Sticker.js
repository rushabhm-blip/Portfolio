/**
 * Reusable Sticker Component
 * Supports:
 * - 'role': Clean editable HTML/CSS badge (no raster halo)
 * - 'portrait': Illustrated portrait sticker with subtle tilt
 * - 'cursor': Blue cursor / Make it useful sticker
 */
export function createSticker({ type, data = {}, alt = '' }) {
  if (type === 'role') {
    const badge = document.createElement('div');
    badge.className = 'sticker-role';
    badge.setAttribute('aria-label', `${data.eyebrow || "HELLO, I'M"} ${data.title || "Interaction Designer"}`);

    const header = document.createElement('strong');
    header.className = 'role-header';
    header.textContent = data.eyebrow || "HELLO, I’M";

    const body = document.createElement('span');
    body.className = 'role-body';
    body.innerHTML = (data.title || "Interaction\nDesigner").replace('\n', '<br>');

    badge.appendChild(header);
    badge.appendChild(body);
    return badge;
  }

  if (type === 'portrait') {
    const img = document.createElement('img');
    img.className = 'sticker-portrait';
    img.src = 'assets/sketchbook/4k/portrait-sticker.png';
    img.srcset = 'assets/sketchbook/native/portrait-sticker.png 1x, assets/sketchbook/4k/portrait-sticker.png 2x';
    img.alt = alt || 'Illustrated smiling portrait of Rushabh';
    img.loading = 'eager';
    img.decoding = 'async';
    return img;
  }

  if (type === 'cursor') {
    const img = document.createElement('img');
    img.className = 'sticker-cursor';
    img.src = 'assets/sketchbook/4k/cursor-sticker.png';
    img.srcset = 'assets/sketchbook/native/cursor-sticker.png 1x, assets/sketchbook/4k/cursor-sticker.png 2x';
    img.alt = alt || 'Make it useful sticker with blue cursor';
    img.loading = 'eager';
    img.decoding = 'async';
    return img;
  }

  throw new Error(`Unknown sticker type: ${type}`);
}
