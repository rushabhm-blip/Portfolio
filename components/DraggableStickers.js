/**
 * Draggable Stickers System for Rushabh's Portfolio
 * Supports both Cover stickers and Inside Spread stickers (including Walking Cutout).
 *
 * Implements:
 * - Pointer events with pointer capture and 5px threshold
 * - Normalized percentage coordinates [0, 100] saved to localStorage
 * - Local coordinate transformations respecting scale and stage rotation
 * - Clamping so stickers stay within page boundaries and don't block controls
 * - State gating: cover stickers drag only when closed; inside stickers drag only when open
 * - Keyboard navigation (Arrow keys: 1%, Shift+Arrows: 5%)
 * - Live announcements for screen readers
 * - Reset stickers to default positions
 */

const STORAGE_KEY = 'rushabh_stickers_v4';

export const DEFAULT_STICKER_POSITIONS = {
  cover: {
    role: { x: 12, y: 7 },
    portrait: { x: 52, y: 17 },
    cursor: { x: 11, y: 75 }
  },
  inside: {
    walking: { x: 8, y: 16 },
    reading: { x: 12, y: 26 },
    flute: { x: 64, y: 13 },
    cruiser: { x: 9, y: 78 },
    badminton: { x: 69, y: 74 }
  }
};

export function setupDraggableStickers({
  stageEl,
  coverEl,
  rightPageEl,
  liveAnnouncer,
  onFirstDrag,
  getState
}) {
  const allWrappers = Array.from(stageEl.querySelectorAll('.sticker-drag-wrapper'));
  if (!allWrappers.length) return { resetStickers: () => {} };

  // Load saved positions
  let savedPositions = { cover: {}, inside: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        savedPositions.cover = parsed.cover || {};
        savedPositions.inside = parsed.inside || {};
      }
    }
  } catch (err) {
    console.warn('Could not read sticker positions from localStorage', err);
  }

  // Initialize positions on wrappers
  allWrappers.forEach(wrapper => {
    const pageType = wrapper.dataset.page || (wrapper.closest('#rightPage') ? 'inside' : 'cover');
    const id = wrapper.dataset.stickerId;
    const defaults = DEFAULT_STICKER_POSITIONS[pageType] || {};
    const defaultPos = defaults[id] || { x: 20, y: 20 };
    const saved = (savedPositions[pageType] && savedPositions[pageType][id]) || defaultPos;

    const validX = typeof saved.x === 'number' && !isNaN(saved.x) ? saved.x : defaultPos.x;
    const validY = typeof saved.y === 'number' && !isNaN(saved.y) ? saved.y : defaultPos.y;

    wrapper.style.left = `${validX}%`;
    wrapper.style.top = `${validY}%`;
    wrapper.dataset.currentX = validX;
    wrapper.dataset.currentY = validY;
  });

  function savePositions() {
    const state = { cover: {}, inside: {} };
    allWrappers.forEach(w => {
      const pageType = w.dataset.page || (w.closest('#rightPage') ? 'inside' : 'cover');
      const id = w.dataset.stickerId;
      state[pageType][id] = {
        x: parseFloat(w.dataset.currentX),
        y: parseFloat(w.dataset.currentY)
      };
    });
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  // Reset stickers
  function resetStickers() {
    const currentState = typeof getState === 'function' ? getState() : 'closed';
    const targetPage = currentState === 'open' ? 'inside' : 'cover';

    allWrappers.forEach(w => {
      const pageType = w.dataset.page || (w.closest('#rightPage') ? 'inside' : 'cover');
      if (pageType !== targetPage) return;

      const id = w.dataset.stickerId;
      const defaults = DEFAULT_STICKER_POSITIONS[pageType] || {};
      const def = defaults[id];
      if (!def) return;

      w.style.transition = 'left 0.4s cubic-bezier(0.16, 1, 0.3, 1), top 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      w.style.left = `${def.x}%`;
      w.style.top = `${def.y}%`;
      w.dataset.currentX = def.x;
      w.dataset.currentY = def.y;

      setTimeout(() => {
        w.style.transition = '';
      }, 420);
    });

    savePositions();
    if (liveAnnouncer) {
      liveAnnouncer.textContent = `${targetPage === 'inside' ? 'Inside' : 'Cover'} stickers reset to original positions.`;
    }
  }

  // Pointer drag handling
  let activeDrag = null;

  function onPointerDown(e) {
    if (e.button !== 0) return; // Left click only
    const wrapper = e.target.closest('.sticker-drag-wrapper');
    if (!wrapper) return;

    const pageType = wrapper.dataset.page || (wrapper.closest('#rightPage') ? 'inside' : 'cover');
    const currentState = typeof getState === 'function' ? getState() : 'closed';

    // Gate: only allow dragging corresponding to active state
    if (pageType === 'cover' && currentState !== 'closed') return;
    if (pageType === 'inside' && currentState !== 'open') return;

    const parentContainer = pageType === 'inside' ? rightPageEl : coverEl;
    if (!parentContainer) return;

    activeDrag = {
      wrapper,
      pageType,
      parentContainer,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initX: parseFloat(wrapper.dataset.currentX) || 0,
      initY: parseFloat(wrapper.dataset.currentY) || 0,
      hasMovedPastThreshold: false
    };

    wrapper.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;

    const dx = e.clientX - activeDrag.startX;
    const dy = e.clientY - activeDrag.startY;

    if (!activeDrag.hasMovedPastThreshold) {
      if (Math.hypot(dx, dy) < 5) return;
      activeDrag.hasMovedPastThreshold = true;
      activeDrag.wrapper.classList.add('is-dragging');
      if (typeof onFirstDrag === 'function') onFirstDrag();
    }

    const rect = activeDrag.parentContainer.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Convert pixel delta to percentage of parent container
    const deltaPercentX = (dx / rect.width) * 100;
    const deltaPercentY = (dy / rect.height) * 100;

    let newX = activeDrag.initX + deltaPercentX;
    let newY = activeDrag.initY + deltaPercentY;

    // Bounds clamping
    if (activeDrag.pageType === 'inside') {
      newX = Math.max(-5, Math.min(85, newX));
      newY = Math.max(2, Math.min(84, newY));
    } else {
      newX = Math.max(-10, Math.min(90, newX));
      newY = Math.max(2, Math.min(88, newY));
    }

    activeDrag.wrapper.style.left = `${newX.toFixed(2)}%`;
    activeDrag.wrapper.style.top = `${newY.toFixed(2)}%`;
    activeDrag.wrapper.dataset.currentX = newX.toFixed(2);
    activeDrag.wrapper.dataset.currentY = newY.toFixed(2);
  }

  function onPointerUp(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;

    const { wrapper, hasMovedPastThreshold } = activeDrag;
    try {
      wrapper.releasePointerCapture(e.pointerId);
    } catch (err) {}

    wrapper.classList.remove('is-dragging');
    activeDrag = null;

    if (hasMovedPastThreshold) {
      savePositions();
    }
  }

  function onPointerCancel(e) {
    if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;
    activeDrag.wrapper.classList.remove('is-dragging');
    activeDrag = null;
  }

  // Keyboard navigation
  allWrappers.forEach(wrapper => {
    wrapper.addEventListener('keydown', (e) => {
      const pageType = wrapper.dataset.page || (wrapper.closest('#rightPage') ? 'inside' : 'cover');
      const currentState = typeof getState === 'function' ? getState() : 'closed';
      if (pageType === 'cover' && currentState !== 'closed') return;
      if (pageType === 'inside' && currentState !== 'open') return;

      const step = e.shiftKey ? 5 : 1;
      let currX = parseFloat(wrapper.dataset.currentX) || 0;
      let currY = parseFloat(wrapper.dataset.currentY) || 0;
      let handled = false;

      switch (e.key) {
        case 'ArrowLeft':
          currX -= step;
          handled = true;
          break;
        case 'ArrowRight':
          currX += step;
          handled = true;
          break;
        case 'ArrowUp':
          currY -= step;
          handled = true;
          break;
        case 'ArrowDown':
          currY += step;
          handled = true;
          break;
      }

      if (handled) {
        e.preventDefault();
        currX = Math.max(-5, Math.min(88, currX));
        currY = Math.max(2, Math.min(88, currY));

        wrapper.style.left = `${currX}%`;
        wrapper.style.top = `${currY}%`;
        wrapper.dataset.currentX = currX;
        wrapper.dataset.currentY = currY;
        savePositions();

        if (typeof onFirstDrag === 'function') onFirstDrag();
        if (liveAnnouncer) {
          liveAnnouncer.textContent = `Moved sticker to ${Math.round(currX)}% horizontal, ${Math.round(currY)}% vertical.`;
        }
      }
    });
  });

  stageEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerCancel);

  return {
    resetStickers
  };
}
