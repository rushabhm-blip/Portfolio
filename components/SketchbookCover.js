import { createIdTag } from './IdTag.js';
import { createSticker } from './Sticker.js';
import { createOpenBookButton } from './OpenBookButton.js';
import { setupDraggableStickers } from './DraggableStickers.js';

/**
 * Reusable SketchbookCover Component
 * Renders the cream hardcover sketchbook, hanging ID tag, draggable stickers, blueprint grid,
 * selectable typography, open control, and discreet reset/hint controls.
 */
export function createSketchbookCover({ coverData, onOpenSketchbook }) {
  // Scene container that wraps stage and floating controls
  const sceneWrapper = document.createElement('div');
  sceneWrapper.className = 'scene-wrapper';

  const stage = document.createElement('div');
  stage.className = 'book-stage';

  // Hanging ID tag (outside book at upper right)
  const idTag = createIdTag({ alt: coverData.idTag?.alt });
  stage.appendChild(idTag);

  // Main book container with container-type: inline-size
  const book = document.createElement('div');
  book.className = 'book';

  // Base book image (spine, paper grain, bottom pages, rounded corners)
  const bookBase = document.createElement('img');
  bookBase.className = 'book-base';
  bookBase.src = 'assets/sketchbook/4k/blank-book.png';
  bookBase.srcset = 'assets/sketchbook/native/blank-book.png 1x, assets/sketchbook/4k/blank-book.png 2x';
  bookBase.alt = '';
  bookBase.loading = 'eager';
  bookBase.decoding = 'async';
  book.appendChild(bookBase);

  // Architectural Blueprint Grid (fades toward center)
  const grid = document.createElement('div');
  grid.className = 'book-grid';
  grid.setAttribute('aria-hidden', 'true');
  book.appendChild(grid);

  // Role Badge Sticker (draggable wrapper)
  const roleBadge = createSticker({
    type: 'role',
    data: coverData.roleBadge
  });
  book.appendChild(roleBadge);

  // Portrait Sticker (draggable wrapper)
  const portrait = createSticker({
    type: 'portrait',
    alt: coverData.portraitSticker?.alt
  });
  book.appendChild(portrait);

  // Intro Typography Block (Real selectable text)
  const intro = document.createElement('div');
  intro.className = 'intro-block';

  const greeting = document.createElement('p');
  greeting.className = 'intro-greeting';
  greeting.textContent = coverData.greeting || "Hi, I’m";

  const name = document.createElement('h1');
  name.className = 'intro-name';
  name.textContent = coverData.name || "Rushabh.";

  const underline = document.createElement('img');
  underline.className = 'intro-underline';
  underline.src = 'assets/sketchbook/underline.svg';
  underline.alt = '';
  underline.setAttribute('aria-hidden', 'true');

  const tagline = document.createElement('p');
  tagline.className = 'intro-tagline';
  tagline.textContent = coverData.tagline || "Things I notice. Things I make.";

  intro.appendChild(greeting);
  intro.appendChild(name);
  intro.appendChild(underline);
  intro.appendChild(tagline);
  book.appendChild(intro);

  // Cursor Sticker ("Make it useful" draggable wrapper)
  const cursor = createSticker({
    type: 'cursor',
    alt: coverData.cursorSticker?.alt
  });
  book.appendChild(cursor);

  // Open Book Interactive Button
  const openBtn = createOpenBookButton({
    label: coverData.openButton?.label,
    onOpenSketchbook
  });
  book.appendChild(openBtn);

  stage.appendChild(book);
  sceneWrapper.appendChild(stage);

  // Screen reader live region for accessible move announcements
  const liveAnnouncer = document.createElement('div');
  liveAnnouncer.className = 'sr-only';
  liveAnnouncer.setAttribute('aria-live', 'polite');
  liveAnnouncer.setAttribute('aria-atomic', 'true');
  sceneWrapper.appendChild(liveAnnouncer);

  // Discreet Cover Controls: One-time hint + Reset Stickers button
  const controls = document.createElement('div');
  controls.className = 'cover-controls';
  controls.setAttribute('aria-label', 'Sticker controls');

  const hint = document.createElement('span');
  hint.className = 'sticker-drag-hint';
  hint.id = 'stickerDragHint';
  hint.textContent = 'Drag the stickers around ✦';
  hint.setAttribute('aria-hidden', 'true');

  const isHintDismissed = localStorage.getItem('rushabh_sticker_hint_dismissed') === 'true';
  if (isHintDismissed) {
    hint.classList.add('is-hidden');
  }

  controls.appendChild(hint);
  sceneWrapper.appendChild(controls);

  // Initialize Draggable Stickers system
  // Runs after microtask so dimensions are laid out
  setTimeout(() => {
    setupDraggableStickers({
      bookStage: stage,
      bookEl: book,
      liveAnnouncer,
      onFirstDrag: () => {
        hint.classList.add('is-hidden');
        try {
          localStorage.setItem('rushabh_sticker_hint_dismissed', 'true');
        } catch (e) {}
      }
    });
  }, 0);

  return sceneWrapper;
}

