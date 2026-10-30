import { sketchbookData } from './data.js?v=48';
import { createHeader } from './components/Header.js?v=48';
import { createBookScene } from './components/BookScene.js?v=46';
import { createChapterDialog } from './components/ChapterDialog.js?v=48';
import { createExperimentNote } from './components/ExperimentNote.js?v=46';
import { createSelectedWorkSection } from './components/SelectedWorkSection.js?v=47';
import { createMemoryMachine } from './components/MemoryMachine.js?v=56';

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
    stageEl.classList.remove('is-single-page', 'show-page-1', 'show-page-2');
  }

  let spreadW, spreadH, pageW, pageH;

  if (needsSinglePage) {
    // Single page close-up of the physical book:
    pageW = Math.min(availW, 460);
    pageW = Math.max(pageW, 310);
    if (vw < 768) {
      // Phone layout only: proportionate, balanced page shape matching natural sketchbook aspect ratio (~0.67)
      // Eliminates excessive height and large empty areas while maintaining clean readability
      const phonePageRatio = 0.67;
      pageH = Math.round(pageW / phonePageRatio);
    } else {
      // Tablet / high zoom fallback (preserve existing behavior)
      const minSinglePageH = 640;
      pageH = Math.max(minSinglePageH, Math.round(pageW / 0.58));
    }
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
    if (chapterId === 'About') {
      dialogManager.closeDialog();
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    if (chapterId === 'Resume') {
      dialogManager.closeDialog();
      window.open('/assets/Rushabh_Mahore_Resume.pdf', '_blank');
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
  let runLayout;
  const bookScene = createBookScene({
    coverData: sketchbookData.cover,
    openBookData: sketchbookData.openBook,
    onSelectChapter: handleSelectChapter,
    onOpenChange: () => {
      if (typeof runLayout === 'function') {
        runLayout();
      }
    }
  });

  main.appendChild(bookScene.element);

  // Background crawler video (dark stroke webm for Chrome/Firefox, precomposited cobalt-blue MP4 for Safari/iPadOS)
  const isAppleOrSafari = (() => {
    const ua = navigator.userAgent || '';
    const isIOSorIPad = /iPad|iPhone|iPod/.test(navigator.platform) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isSafariUA = /^((?!chrome|android).)*safari/i.test(ua);
    return isIOSorIPad || isSafariUA;
  })();

  const video = document.createElement('video');
  video.className = 'crawler-video';
  video.autoplay = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.poster = 'assets/sketchbook/character-crawler-poster.png';
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('aria-hidden', 'true');

  if (isAppleOrSafari) {
    // Safari on iPad/iPhone does not support WebM alpha; use precomposited cobalt-blue MP4
    const sourceMp4 = document.createElement('source');
    sourceMp4.src = 'IMG_0122_blue.mp4?v=35';
    sourceMp4.type = 'video/mp4';
    video.appendChild(sourceMp4);
  } else {
    // Chrome, Firefox, Edge, Android: native transparent WebM with MP4 fallback
    const sourceWebm = document.createElement('source');
    sourceWebm.src = 'IMG_0122_dark.webm?v=35';
    sourceWebm.type = 'video/webm';
    video.appendChild(sourceWebm);

    const sourceMp4 = document.createElement('source');
    sourceMp4.src = 'IMG_0122_blue.mp4?v=35';
    sourceMp4.type = 'video/mp4';
    video.appendChild(sourceMp4);
  }

  // Reusable "Keep calm. Experiment on." Section Component
  const experimentNote = createExperimentNote();

  // "Selected work" Section Component (Header area + Projects showcase grid)
  const selectedWork = createSelectedWorkSection();

  // Personal Photos Section ("A LITTLE MORE ME" Memory Machine)
  const memoryMachine = createMemoryMachine();

  // Unified Showcase & About Container (Single continuous seamless hand-drawn grid background across Selected Work + Still That Kid)
  const showcaseWrapper = document.createElement('div');
  showcaseWrapper.className = 'works-and-about-wrapper';

  // Dedicated background grid layer matching Keep Calm notebook tile
  const gridBackground = document.createElement('div');
  gridBackground.className = 'works-and-about-grid-bg';
  gridBackground.setAttribute('aria-hidden', 'true');
  showcaseWrapper.appendChild(gridBackground);

  showcaseWrapper.appendChild(selectedWork.headerElement);
  showcaseWrapper.appendChild(selectedWork.projectsElement);
  showcaseWrapper.appendChild(memoryMachine.element);

  // Update boundary height for background grid mask transition
  function updateGridTransition() {
    if (selectedWork.headerElement && selectedWork.projectsElement) {
      const h = selectedWork.headerElement.offsetHeight + selectedWork.projectsElement.offsetHeight;
      showcaseWrapper.style.setProperty('--selected-works-height', `${h}px`);
    }
  }

  updateGridTransition();
  window.addEventListener('resize', updateGridTransition);
  if ('ResizeObserver' in window) {
    const gridRo = new ResizeObserver(updateGridTransition);
    if (selectedWork.headerElement) gridRo.observe(selectedWork.headerElement);
    if (selectedWork.projectsElement) gridRo.observe(selectedWork.projectsElement);
  }

  // Mount components in natural document flow
  root.innerHTML = '';
  root.appendChild(header);
  root.appendChild(video);
  root.appendChild(main);
  root.appendChild(experimentNote.element);
  root.appendChild(showcaseWrapper);
  root.appendChild(dialogManager.element);

  // Setup layout fitting with ResizeObserver
  const bookStage = bookScene.stage;
  runLayout = () => fitBookComposition(header, bookStage);

  runLayout();
  window.addEventListener('resize', runLayout);

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => {
      runLayout();
    });
    ro.observe(document.body);
    if (header) ro.observe(header);
  }

  // Bounded hero asset readiness coordinator (avoids disjointed elements or floating text on cold loads)
  async function waitForHeroAssets(stageEl, videoEl) {
    const promises = [];
    const bookBaseImg = stageEl.querySelector('.book-base');
    if (bookBaseImg) {
      if (bookBaseImg.complete && bookBaseImg.naturalWidth > 0) {
        // already decoded
      } else if (typeof bookBaseImg.decode === 'function') {
        promises.push(bookBaseImg.decode().catch(() => {}));
      } else {
        promises.push(new Promise(res => {
          bookBaseImg.onload = res;
          bookBaseImg.onerror = res;
        }));
      }
    }

    if (document.fonts && document.fonts.ready) {
      promises.push(document.fonts.ready.catch(() => {}));
    }

    // Bounded wait (max 1200ms) ensuring the interface never hangs
    const timeout = new Promise(res => setTimeout(res, 1200));
    await Promise.race([Promise.all(promises), timeout]);

    runLayout();
    stageEl.classList.remove('is-loading');
    stageEl.classList.add('is-ready');

    if (videoEl && typeof videoEl.play === 'function') {
      try { videoEl.currentTime = 0; } catch (e) {}
      videoEl.play().catch(() => {});
    }
  }

  waitForHeroAssets(bookStage, video);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
