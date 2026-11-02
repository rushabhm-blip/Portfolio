import { createSticker } from './Sticker.js?v=2';
import { createOpenBookButton } from './OpenBookButton.js';

/**
 * FrontCover Component
 * Renders the exterior front cover of Rushabh's sketchbook,
 * containing base blank book image, blueprint grid, draggable cover stickers,
 * selectable intro typography, and the "Open my sketchbook" button.
 */
export function createFrontCover({ coverData, onOpenBook }) {
  const container = document.createElement('div');
  container.className = 'closed-cover-inner';
  container.id = 'closedCoverInner';

  // Base book image (spine, paper grain, bottom pages, rounded corners)
  const bookBasePicture = document.createElement('picture');
  bookBasePicture.className = 'book-base-picture';

  const webpSource = document.createElement('source');
  webpSource.type = 'image/webp';
  webpSource.srcset = 'assets/sketchbook/native/blank-book.webp 1x, assets/sketchbook/4k/blank-book.webp 2x';
  bookBasePicture.appendChild(webpSource);

  const bookBase = document.createElement('img');
  bookBase.className = 'book-base';
  bookBase.src = 'assets/sketchbook/native/blank-book.png';
  bookBase.srcset = 'assets/sketchbook/native/blank-book.png 1x, assets/sketchbook/4k/blank-book.png 2x';
  bookBase.alt = 'Rushabh Mahore Sketchbook Cover';
  bookBase.loading = 'eager';
  bookBase.fetchPriority = 'high';
  bookBase.draggable = false;
  bookBasePicture.appendChild(bookBase);
  container.appendChild(bookBasePicture);

  // Architectural Blueprint Grid (fades toward center)
  const grid = document.createElement('div');
  grid.className = 'book-grid';
  grid.setAttribute('aria-hidden', 'true');
  container.appendChild(grid);

  // Role Badge Sticker
  const roleBadge = createSticker({
    type: 'role',
    data: coverData?.roleBadge
  });
  roleBadge.dataset.page = 'cover';
  roleBadge.tabIndex = -1;
  roleBadge.setAttribute('aria-hidden', 'true');
  container.appendChild(roleBadge);

  // Portrait Sticker
  const portrait = createSticker({
    type: 'portrait',
    alt: coverData?.portraitSticker?.alt
  });
  portrait.dataset.page = 'cover';
  portrait.tabIndex = -1;
  portrait.setAttribute('aria-hidden', 'true');
  container.appendChild(portrait);

  // Intro Typography Block (Real selectable text)
  const intro = document.createElement('div');
  intro.className = 'intro-block';

  const greeting = document.createElement('p');
  greeting.className = 'intro-greeting';
  greeting.textContent = coverData?.greeting || "Hi, I’m";

  const name = document.createElement('h1');
  name.className = 'intro-name';
  name.textContent = coverData?.name || "Rushabh.";

  const underline = document.createElement('img');
  underline.className = 'intro-underline';
  underline.src = 'assets/sketchbook/underline.svg';
  underline.alt = '';
  underline.setAttribute('aria-hidden', 'true');
  underline.draggable = false;

  const tagline = document.createElement('p');
  tagline.className = 'intro-tagline';
  tagline.textContent = coverData?.tagline || "Things I notice. Things I make.";

  intro.appendChild(greeting);
  intro.appendChild(name);
  intro.appendChild(underline);
  intro.appendChild(tagline);
  container.appendChild(intro);

  // Cursor Sticker ("Make it useful")
  const cursor = createSticker({
    type: 'cursor',
    alt: coverData?.cursorSticker?.alt
  });
  cursor.dataset.page = 'cover';
  cursor.tabIndex = -1;
  cursor.setAttribute('aria-hidden', 'true');
  container.appendChild(cursor);

  // Open Book Interactive Button
  const openBtn = createOpenBookButton({
    label: coverData?.openButton?.label || "Open my sketchbook",
    onOpenSketchbook: onOpenBook
  });
  openBtn.tabIndex = -1;
  openBtn.setAttribute('aria-hidden', 'true');
  container.appendChild(openBtn);

  return {
    element: container,
    openButton: openBtn,
    bookBaseImg: bookBase
  };
}
