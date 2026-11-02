import { sketchbookData } from './data.js?v=49';
import { createHeader } from './components/Header.js?v=49';
import { createBookScene } from './components/BookScene.js?v=48';
import { createChapterDialog } from './components/ChapterDialog.js?v=49';
import { createExperimentNote } from './components/ExperimentNote.js?v=50';
import { createSelectedWorkSection } from './components/SelectedWorkSection.js?v=52';
import { createMemoryMachine } from './components/MemoryMachine.js?v=62';
import { initScrollReveal } from './components/ScrollReveal.js?v=5';
import { createServicesSection } from './components/ServicesSection.js?v=4';

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

  // Phone layout only: single page physical-book view
  // On desktop / laptop (vw >= 1024) and tablet (vw >= 768), always maintain the two-page spread.
  const needsSinglePage = (vw < 768) && isOpen;

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
    // Single page close-up of the physical book (phone layout):
    pageW = Math.min(availW, 460);
    pageW = Math.max(pageW, 310);
    const phonePageRatio = 0.67;
    pageH = Math.round(pageW / phonePageRatio);
    spreadW = pageW;
    spreadH = pageH;
  } else if (vw >= 1024) {
    // Desktop 2-page spread: reserve ~120px on the right for the hanging ID tag
    const maxSpreadW = availW - 120;
    const maxHFromW = Math.floor(maxSpreadW / spreadRatio);
    // Fit comfortably below header using available height.
    // Use 88% of available height as the cap, but impose a firm ceiling so the
    // book never grows taller than the closed cover's proportions warrant.
    // At 1920×1080 this yields ~620px; at 1366×768 ~530px; at 2560×1440 capped at 680.
    const maxHFromAvail = Math.floor(availH * 0.88);
    const targetH = Math.min(maxHFromW, maxHFromAvail, 680);

    spreadH = Math.max(targetH, 470);
    spreadW = Math.round(spreadH * spreadRatio);
    pageW = Math.round(spreadW / 2);
    pageH = spreadH;
  } else if (vw >= 768) {
    // Tablet 2-page spread:
    const maxSpreadW = availW - 80;
    const maxHFromW = Math.floor(maxSpreadW / spreadRatio);
    const maxHFromAvail = Math.floor(availH * 0.88);
    const targetH = Math.min(maxHFromW, maxHFromAvail, 580);

    spreadH = Math.max(targetH, 440);
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
    if (chapterId === 'Architecture') {
      dialogManager.closeDialog();
      window.open('/assets/Architectural_Portfolio_2019-24_Rushabh.pdf', '_blank');
      return;
    }
    dialogManager.openChapter(chapterId, triggerEl);
  }

  // Header Component (Hydrate existing site-header from index.html if present to prevent re-render flash)
  let header = root.querySelector('.site-header');
  if (header) {
    const wordmark = header.querySelector('.wordmark');
    if (wordmark) {
      wordmark.addEventListener('click', (e) => {
        e.preventDefault();
        handleSelectChapter('Home');
      });
    }
    header.querySelectorAll('.nav-item').forEach(btn => {
      const chapter = btn.getAttribute('data-chapter');
      if (chapter && !btn.getAttribute('href')) {
        btn.addEventListener('click', () => handleSelectChapter(chapter, btn));
      }
    });
  } else {
    header = createHeader({
      brand: sketchbookData.brand,
      navigation: sketchbookData.navigation,
      onSelectChapter: handleSelectChapter
    });
  }

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

  let video = root.querySelector('.crawler-video');
  if (!video) {
    video = document.createElement('video');
    video.className = 'crawler-video';
    video.muted = true;
    video.playsInline = true;
    video.loop = true;
    video.poster = 'assets/sketchbook/character-crawler-poster.webp';
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('aria-hidden', 'true');

    if (isAppleOrSafari) {
      const sourceMp4 = document.createElement('source');
      sourceMp4.src = 'IMG_0122_blue.mp4?v=35';
      sourceMp4.type = 'video/mp4';
      video.appendChild(sourceMp4);
    } else {
      const sourceWebm = document.createElement('source');
      sourceWebm.src = 'IMG_0122_dark.webm?v=35';
      sourceWebm.type = 'video/webm';
      video.appendChild(sourceWebm);

      const sourceMp4 = document.createElement('source');
      sourceMp4.src = 'IMG_0122_blue.mp4?v=35';
      sourceMp4.type = 'video/mp4';
      video.appendChild(sourceMp4);
    }
  }

  // Reusable "Keep calm. Experiment on." Section Component
  const experimentNote = createExperimentNote();

  // "Selected work" Section Component (Header area + Projects showcase grid)
  const selectedWork = createSelectedWorkSection();

  // Personal Photos Section ("A LITTLE MORE ME" Memory Machine)
  const memoryMachine = createMemoryMachine();

  // "What can I do for you?" services section (follows About me on the same paper)
  const servicesSection = createServicesSection();

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
  // About me + services share one continuous sheet of grid paper so the grid never breaks between them
  const aboutPaperGroup = document.createElement('div');
  aboutPaperGroup.className = 'about-paper-group';
  aboutPaperGroup.appendChild(memoryMachine.element);
  aboutPaperGroup.appendChild(servicesSection.element);
  showcaseWrapper.appendChild(aboutPaperGroup);

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

  // Mount components in natural document flow without clearing static header/video
  const existingMain = root.querySelector('.main-stage');
  if (existingMain) {
    existingMain.innerHTML = '';
    existingMain.appendChild(bookScene.element);
  } else {
    root.appendChild(main);
  }

  root.appendChild(experimentNote.element);
  root.appendChild(showcaseWrapper);

  const existingDialog = root.querySelector('#chapterDialog');
  if (existingDialog) {
    existingDialog.replaceWith(dialogManager.element);
  } else {
    root.appendChild(dialogManager.element);
  }

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

  /**
   * Controlled 5-Step Hero Entrance Sequence
   * 1. Blue background, logo, and navigation shown immediately (done via CSS & HTML).
   * 2. Load and decode the complete closed-book image before revealing it.
   * 3. Reveal the whole book with a subtle 200-300ms opacity transition (no height/clip wipe).
   * 4. Once book is visible, fade in cover text, stickers, and open controls in a short restrained sequence.
   * 5. Reveal secondary decorative elements last (crawler video, drag hint, id tag).
   */
  async function revealEntranceSequence(stageEl, videoEl) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const wait = (ms) => prefersReduced ? Promise.resolve() : new Promise(r => setTimeout(r, ms));

    const bookBaseImg = stageEl.querySelector('.book-base');

    // Step 2: Ensure complete hero book asset is fully loaded and decoded
    if (bookBaseImg) {
      if (!bookBaseImg.complete || bookBaseImg.naturalWidth === 0) {
        await new Promise((resolve) => {
          let settled = false;
          const finish = () => {
            if (settled) return;
            settled = true;
            resolve();
          };
          if (typeof bookBaseImg.decode === 'function') {
            bookBaseImg.decode().then(finish).catch(() => {
              if (bookBaseImg.complete) finish();
            });
          }
          bookBaseImg.addEventListener('load', finish, { once: true });
          bookBaseImg.addEventListener('error', finish, { once: true });
          // Safety failsafe only if asset completely hangs (e.g. 6s max offline timeout)
          setTimeout(finish, 6000);
        });
      } else if (typeof bookBaseImg.decode === 'function') {
        try {
          await bookBaseImg.decode();
        } catch (e) {}
      }
    }

    // Critical fonts readiness (capped at 1s to prevent external font network stall)
    if (document.fonts && document.fonts.ready) {
      await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1000))]).catch(() => {});
    }

    // Lock layout dimensions before triggering reveal
    runLayout();

    function enableCoverControls() {
      const openBtn = stageEl.querySelector('.open-book-btn');
      if (openBtn) {
        openBtn.tabIndex = 0;
        openBtn.removeAttribute('aria-hidden');
      }
      const stickers = stageEl.querySelectorAll('.closed-cover-inner .sticker-drag-wrapper');
      stickers.forEach(s => {
        s.tabIndex = 0;
        s.removeAttribute('aria-hidden');
      });
    }

    if (prefersReduced) {
      stageEl.classList.remove('is-loading');
      stageEl.classList.add('is-book-visible', 'is-cover-ready', 'is-scene-ready', 'is-ready');
      document.body.classList.add('is-scene-ready');
      enableCoverControls();
      if (videoEl && typeof videoEl.play === 'function') {
        videoEl.play().catch(() => {});
      }
      return;
    }

    // Step 3: Reveal the whole book with a subtle 260ms opacity transition
    stageEl.classList.remove('is-loading');
    stageEl.classList.add('is-book-visible');

    await wait(260);

    // Step 4: Fade in cover text, stickers, and controls in a short restrained sequence
    stageEl.classList.add('is-cover-ready');
    enableCoverControls();

    await wait(260);

    // Step 5: Reveal secondary decorative elements last
    stageEl.classList.add('is-scene-ready', 'is-ready');
    document.body.classList.add('is-scene-ready', 'is-ready');

    if (videoEl && typeof videoEl.play === 'function') {
      try { videoEl.currentTime = 0; } catch (e) {}
      videoEl.play().catch(() => {});
    }
  }

  revealEntranceSequence(bookStage, video);
  initScrollReveal(root);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPortfolio);
} else {
  initPortfolio();
}
