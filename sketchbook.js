import { sketchbookData } from './data.js?v=41';
import { createHeader } from './components/Header.js?v=41';
import { createBookScene } from './components/BookScene.js?v=41';
import { createChapterDialog } from './components/ChapterDialog.js?v=41';
import { createExperimentNote } from './components/ExperimentNote.js?v=41';
import { createSelectedWorkSection } from './components/SelectedWorkSection.js?v=42';

/**
 * Fits the book composition (both closed and open spread) to available viewport space below header.
 * Spread aspect ratio is 1586 / 992 = 1.59879.
 * Single page aspect ratio is ~0.8.
 * Reserves 6–9% scene width on the right for the hanging NID ID tag, and at least 20px perimeter clearance.
 */
function fitBookComposition(headerEl, stageEl) {
  if (!stageEl) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const headerRect = headerEl ? headerEl.getBoundingClientRect() : { height: 68 };
  const headerH = headerRect.height || 68;

  const spreadRatio = 1586 / 992; // ~1.59879
  const pageRatio = spreadRatio / 2; // ~0.7994

  const safeMarginY = 20;
  const availH = Math.max(300, vh - headerH - safeMarginY * 2);
  const safeMarginX = 24;
  const availW = Math.max(300, vw - safeMarginX * 2);

  const isOpen = stageEl.classList.contains('is-open') || stageEl.classList.contains('is-opening');

  // When increased zoom or a narrow viewport leaves insufficient space for a readable two-page spread,
  // switch to a physical-book ONE-PAGE-AT-A-TIME view retaining paper textures, edges, and spine shadows.
  const needsSinglePage = isOpen && (availW < 960 || availH < 520);

  if (needsSinglePage) {
    stageEl.classList.add('is-single-page');
    // Ensure one page is active (default to Page 1: Intro on first entry)
    if (!stageEl.classList.contains('show-page-1') && !stageEl.classList.contains('show-page-2')) {
      stageEl.classList.add('show-page-1');
    }
  } else {
    stageEl.classList.remove('is-single-page');
  }

  let spreadW, spreadH, pageW, pageH;

  if (needsSinglePage) {
    // Single page close-up of the physical book (aspect ratio ~0.8)
    pageW = Math.min(availW - 16, 520);
    pageW = Math.max(pageW, 340);
    pageH = Math.round(pageW / 0.8);
    // Allow document to scroll vertically if page is taller than viewport
    spreadW = pageW;
    spreadH = pageH;
  } else if (vw >= 1024) {
    // Desktop 2-page spread: reserve ~120px on the right for the hanging ID tag
    const maxSpreadW = availW - 120;
    const maxHFromW = Math.floor(maxSpreadW / spreadRatio);
    // Allow vertical scrolling; do not compress book height below 540px
    const maxHFromAvail = Math.floor(availH * 0.94);

    spreadH = Math.min(Math.max(maxHFromAvail, 540), maxHFromW, 740);
    spreadH = Math.max(spreadH, 540);
    spreadW = Math.round(spreadH * spreadRatio);
    pageW = Math.round(spreadW / 2);
    pageH = spreadH;
  } else if (vw >= 768) {
    // Tablet 2-page spread:
    const maxSpreadW = availW - 80;
    const maxHFromW = Math.floor(maxSpreadW / spreadRatio);
    const maxHFromAvail = Math.floor(availH * 0.92);

    spreadH = Math.min(Math.max(maxHFromAvail, 520), maxHFromW, 680);
    spreadH = Math.max(spreadH, 520);
    spreadW = Math.round(spreadH * spreadRatio);
    pageW = Math.round(spreadW / 2);
    pageH = spreadH;
  } else {
    // Mobile closed cover
    pageW = Math.min(availW, 440);
    pageH = Math.round(pageW / 0.8);
    spreadW = pageW;
    spreadH = pageH;
  }

  stageEl.style.setProperty('--spread-width', `${spreadW}px`);
  stageEl.style.setProperty('--spread-height', `${spreadH}px`);
  stageEl.style.setProperty('--page-width', `${pageW}px`);
  stageEl.style.setProperty('--page-height', `${pageH}px`);
  stageEl.style.setProperty('--book-width', `${pageW}px`);
  stageEl.style.setProperty('--book-height', `${pageH}px`);
}

/**
 * Controller for Rushabh's Portfolio (Closed & Open Book States)
 */
function initPortfolio() {
  const root = document.getElementById('appRoot') || document.body;

  // Chapter Dialog Manager
  const dialogManager = createChapterDialog({
    chaptersData: sketchbookData.chapters
  });

  // Handler for opening chapters
  function handleSelectChapter(chapterId, triggerEl = null) {
    if (chapterId === 'Home') {
      dialogManager.closeDialog();
      if (bookScene && typeof bookScene.closeBook === 'function' && bookScene.getState() === 'open') {
        bookScene.closeBook();
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (chapterId === 'Works') {
      dialogManager.closeDialog();
      const worksSection = document.getElementById('works');
      if (worksSection) {
        worksSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    dialogManager.openChapter(chapterId, triggerEl);
  }

  // Header Component
  const header = createHeader({
    brand: sketchbookData.brand,
    navigation: sketchbookData.navigation,
    onSelectChapter: handleSelectChapter
  });

  // Main Stage
  const main = document.createElement('main');
  main.className = 'main-stage';

  // 3D Book Scene Component
  const bookScene = createBookScene({
    coverData: sketchbookData.cover,
    openBookData: sketchbookData.openBook,
    onSelectChapter: handleSelectChapter
  });

  main.appendChild(bookScene.element);

  // Background crawler video (dark stroke webm)
  const video = document.createElement('video');
  video.className = 'crawler-video';
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');

  const sourceWebm = document.createElement('source');
  sourceWebm.src = 'IMG_0122_dark.webm?v=28';
  sourceWebm.type = 'video/webm';
  video.appendChild(sourceWebm);

  // Reusable "Keep calm. Experiment on." Section Component
  const experimentNote = createExperimentNote();

  // "Selected work" Section Component (Header area + Projects showcase grid)
  const selectedWork = createSelectedWorkSection();

  // Mount components in natural document flow
  root.innerHTML = '';
  root.appendChild(header);
  root.appendChild(video);
  root.appendChild(main);
  root.appendChild(experimentNote.element);
  root.appendChild(selectedWork.headerElement);
  root.appendChild(selectedWork.projectsElement);
  root.appendChild(dialogManager.element);

  // Setup layout fitting with ResizeObserver
  const bookStage = bookScene.stage;
  const runLayout = () => fitBookComposition(header, bookStage);

  runLayout();
  window.addEventListener('resize', runLayout);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      runLayout();
    });
    ro.observe(document.body);
    if (header) ro.observe(header);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
