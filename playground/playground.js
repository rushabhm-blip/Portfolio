/**
 * playground.js
 * Pans the dotted Playground board: drag (mouse or touch), scroll/trackpad, or arrow keys.
 * A drag that starts on a project tile pans instead of opening it; a plain click opens it.
 * The view opens centred on the board's middle, where the projects are.
 */
(function () {
  const viewport = document.getElementById('pgViewport');
  const board = document.getElementById('pgBoard');
  const recenterBtn = document.getElementById('pgRecenter');
  if (!viewport || !board) return;

  const DRAG_THRESHOLD = 6; // px a press must travel before it counts as a drag, not a click
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let x = 0;
  let y = 0;

  const bounds = () => ({
    minX: Math.min(0, viewport.clientWidth - board.offsetWidth),
    minY: Math.min(0, viewport.clientHeight - board.offsetHeight)
  });

  const apply = (smooth = false) => {
    const b = bounds();
    x = Math.min(0, Math.max(b.minX, x));
    y = Math.min(0, Math.max(b.minY, y));
    board.style.transition = smooth && !reducedMotion.matches ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none';
    board.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  // Centre the projects (board middle, nudged right so the title and tile share the view)
  const recenter = (smooth) => {
    x = viewport.clientWidth / 2 - (board.offsetWidth / 2 + 120);
    y = viewport.clientHeight / 2 - (board.offsetHeight / 2 - 40);
    apply(smooth);
  };

  // Drag to pan
  let press = null;
  let suppressClick = false;

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    press = { id: e.pointerId, startX: e.clientX, startY: e.clientY, x, y, dragging: false };
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!press || e.pointerId !== press.id) return;
    const dx = e.clientX - press.startX;
    const dy = e.clientY - press.startY;
    if (!press.dragging && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!press.dragging) {
      press.dragging = true;
      viewport.setPointerCapture(e.pointerId);
      viewport.classList.add('is-dragging');
    }
    x = press.x + dx;
    y = press.y + dy;
    apply();
  });

  const endPress = (e) => {
    if (!press || e.pointerId !== press.id) return;
    suppressClick = press.dragging;
    viewport.classList.remove('is-dragging');
    press = null;
  };
  viewport.addEventListener('pointerup', endPress);
  viewport.addEventListener('pointercancel', endPress);

  // A drag that began on a tile should not also open it
  viewport.addEventListener('click', (e) => {
    if (suppressClick) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick = false;
    }
  }, true);

  // Scroll wheel / trackpad pans
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    x -= e.shiftKey ? e.deltaY : e.deltaX;
    y -= e.shiftKey ? 0 : e.deltaY;
    apply();
  }, { passive: false });

  // Arrow keys pan when the board itself has focus
  viewport.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 240 : 80;
    const move = { ArrowLeft: [step, 0], ArrowRight: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (!move || e.target !== viewport) return;
    e.preventDefault();
    x += move[0];
    y += move[1];
    apply(true);
  });

  // Tabbing to an item slides it into view
  board.addEventListener('focusin', (e) => {
    const r = e.target.getBoundingClientRect();
    const pad = 80;
    if (r.left < pad) x += pad - r.left;
    if (r.right > viewport.clientWidth - pad) x -= r.right - (viewport.clientWidth - pad);
    if (r.top < pad + 60) y += pad + 60 - r.top;
    if (r.bottom > viewport.clientHeight - pad) y -= r.bottom - (viewport.clientHeight - pad);
    apply(true);
  });

  if (recenterBtn) recenterBtn.addEventListener('click', () => recenter(true));
  window.addEventListener('resize', () => apply());
  recenter(false);
})();
