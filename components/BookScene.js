import { createHangingIdCard } from './HangingIdCard.js?v=41';
import { createFrontCover } from './FrontCover.js?v=41';
import { createLeftPage } from './LeftPage.js?v=41';
import { createRightPage } from './RightPage.js?v=41';
import { setupDraggableStickers } from './DraggableStickers.js?v=41';

/**
 * BookScene Component
 * Coordinates the 3D hinged book assembly, front cover, inside spread (left & right pages),
 * hanging ID tag, audio/visual cues, draggable stickers, and state machine.
 */
export function createBookScene({ coverData, openBookData, onSelectChapter, onOpenChange }) {
  // Current state: 'closed' | 'opening' | 'open' | 'closing'
  let state = 'closed';

  const sceneWrapper = document.createElement('div');
  sceneWrapper.className = 'scene-wrapper book-scene-wrapper';
  sceneWrapper.id = 'bookSceneWrapper';

  // Perspective stage
  const stage = document.createElement('div');
  stage.className = 'book-stage is-closed is-loading';
  stage.id = 'bookStage';

  // 2. The 3D Book Assembly
  const bookSpread = document.createElement('div');
  bookSpread.className = 'book-spread';
  bookSpread.id = 'bookSpread';

  // 1. Hanging ID Card (Sibling layer inside bookSpread, follows natural book transform and settled position)
  const idTag = createHangingIdCard({ alt: coverData?.idTag?.alt });
  bookSpread.appendChild(idTag);

  // Ambient ground shadow underneath spread
  const groundShadow = document.createElement('div');
  groundShadow.className = 'book-ground-shadow';
  groundShadow.setAttribute('aria-hidden', 'true');
  bookSpread.appendChild(groundShadow);

  // Stationary Resting Open Book Base (open-book-blank.png)
  const spreadBase = document.createElement('div');
  spreadBase.className = 'spread-base';
  spreadBase.id = 'spreadBase';
  spreadBase.setAttribute('aria-hidden', 'true');

  const spreadImg = document.createElement('img');
  spreadImg.className = 'spread-base-img';
  spreadImg.src = 'assets/sketchbook/open-book-blank.png';
  spreadImg.alt = '';
  spreadImg.loading = 'eager';
  spreadImg.decoding = 'async';
  spreadImg.draggable = false;
  spreadBase.appendChild(spreadImg);
  bookSpread.appendChild(spreadBase);

  // Layered 3-slice paper frame for mobile single-page browsing
  const mobilePaperFrame = document.createElement('div');
  mobilePaperFrame.className = 'mobile-paper-frame';
  mobilePaperFrame.id = 'mobilePaperFrame';
  mobilePaperFrame.setAttribute('aria-hidden', 'true');

  const paperCapTop = document.createElement('div');
  paperCapTop.className = 'mobile-paper-cap mobile-paper-cap-top';

  const paperBody = document.createElement('div');
  paperBody.className = 'mobile-paper-body';

  const paperCapBottom = document.createElement('div');
  paperCapBottom.className = 'mobile-paper-cap mobile-paper-cap-bottom';

  mobilePaperFrame.appendChild(paperCapTop);
  mobilePaperFrame.appendChild(paperBody);
  mobilePaperFrame.appendChild(paperCapBottom);
  bookSpread.appendChild(mobilePaperFrame);

  let singlePageIndex = 1;

  function setSinglePage(pageIdx) {
    singlePageIndex = pageIdx === 2 ? 2 : 1;
    if (singlePageIndex === 1) {
      stage.classList.remove('show-page-2');
      stage.classList.add('show-page-1');
      if (page1Btn) page1Btn.classList.add('is-active');
      if (page2Btn) page2Btn.classList.remove('is-active');
      liveAnnouncer.textContent = 'Showing Page 1: Introduction.';
      if (leftPageObj && typeof leftPageObj.updateTimelineLine === 'function') {
        setTimeout(leftPageObj.updateTimelineLine, 50);
      }
    } else {
      stage.classList.remove('show-page-1');
      stage.classList.add('show-page-2');
      if (page1Btn) page1Btn.classList.remove('is-active');
      if (page2Btn) page2Btn.classList.add('is-active');
      liveAnnouncer.textContent = 'Showing Page 2: A little more me.';
      if (rightPageObj && typeof rightPageObj.updateSvgConnectors === 'function') {
        setTimeout(rightPageObj.updateSvgConnectors, 50);
      }
    }
    if (typeof onOpenChange === 'function') {
      onOpenChange(true);
    }
  }

  // 3. Stationary Right Page (mounted inside spread)
  const rightPageObj = createRightPage({
    rightData: openBookData?.rightPage,
    onSelectChapter,
    onPrevPage: () => setSinglePage(1)
  });
  bookSpread.appendChild(rightPageObj.element);

  // 4. 3D Hinged Cover Assembly
  const hingedCover = document.createElement('div');
  hingedCover.className = 'hinged-cover';
  hingedCover.id = 'hingedCover';

  // Front Face: Closed Cover Content
  const faceFront = document.createElement('div');
  faceFront.className = 'cover-face cover-face-front';
  faceFront.id = 'coverFaceFront';

  const frontCoverObj = createFrontCover({
    coverData,
    onOpenBook: () => openBook()
  });
  faceFront.appendChild(frontCoverObj.element);
  hingedCover.appendChild(faceFront);

  // Back Face: Left Page Content (rotated 180deg locally)
  const faceBack = document.createElement('div');
  faceBack.className = 'cover-face cover-face-back';
  faceBack.id = 'coverFaceBack';

  const leftPageObj = createLeftPage({
    leftData: openBookData?.leftPage,
    onNextPage: () => setSinglePage(2)
  });
  faceBack.appendChild(leftPageObj.element);
  hingedCover.appendChild(faceBack);

  bookSpread.appendChild(hingedCover);
  stage.appendChild(bookSpread);
  sceneWrapper.appendChild(stage);

  // Screen reader announcer
  const liveAnnouncer = document.createElement('div');
  liveAnnouncer.className = 'sr-only';
  liveAnnouncer.setAttribute('aria-live', 'polite');
  liveAnnouncer.setAttribute('aria-atomic', 'true');
  sceneWrapper.appendChild(liveAnnouncer);

  // Discreet Floating Controls (Close book, Drag hint, Reset stickers)
  const controls = document.createElement('div');
  controls.className = 'scene-controls';
  controls.id = 'sceneControls';

  // Page Switcher buttons for Single Page mode
  const pageNavGroup = document.createElement('div');
  pageNavGroup.className = 'page-nav-controls';
  pageNavGroup.id = 'pageNavControls';

  const page1Btn = document.createElement('button');
  page1Btn.type = 'button';
  page1Btn.className = 'control-btn page-switch-btn page-switch-1 is-active';
  page1Btn.id = 'pageSwitch1Btn';
  page1Btn.textContent = 'Page 1: Intro';
  page1Btn.setAttribute('aria-label', 'Show Page 1: Introduction');
  page1Btn.addEventListener('click', () => setSinglePage(1));

  const page2Btn = document.createElement('button');
  page2Btn.type = 'button';
  page2Btn.className = 'control-btn page-switch-btn page-switch-2';
  page2Btn.id = 'pageSwitch2Btn';
  page2Btn.textContent = 'Page 2: More me →';
  page2Btn.setAttribute('aria-label', 'Show Page 2: A little more me');
  page2Btn.addEventListener('click', () => setSinglePage(2));

  pageNavGroup.appendChild(page1Btn);
  pageNavGroup.appendChild(page2Btn);

  // Close book button
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'control-btn close-book-btn';
  closeBtn.id = 'closeBookBtn';
  closeBtn.setAttribute('aria-label', 'Close book and return to cover');

  const closeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  closeSvg.setAttribute('class', 'close-icon-svg');
  closeSvg.setAttribute('viewBox', '0 0 16 16');
  closeSvg.setAttribute('fill', 'none');
  closeSvg.setAttribute('stroke', 'currentColor');
  closeSvg.setAttribute('stroke-width', '2');
  closeSvg.setAttribute('stroke-linecap', 'round');
  closeSvg.setAttribute('aria-hidden', 'true');

  const closePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  closePath.setAttribute('d', 'M4 12L12 4M4 4l8 8');
  closeSvg.appendChild(closePath);

  const closeLabel = document.createElement('span');
  closeLabel.textContent = 'Close book';

  closeBtn.appendChild(closeSvg);
  closeBtn.appendChild(closeLabel);
  closeBtn.addEventListener('click', () => closeBook());

  // Reset travel stamps button
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'control-btn reset-stamps-btn';
  resetBtn.id = 'resetStampsBtn';
  resetBtn.setAttribute('aria-label', 'Reset travel stamps to default positions');

  const resetSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  resetSvg.setAttribute('class', 'reset-icon-svg');
  resetSvg.setAttribute('viewBox', '0 0 16 16');
  resetSvg.setAttribute('fill', 'none');
  resetSvg.setAttribute('stroke', 'currentColor');
  resetSvg.setAttribute('stroke-width', '1.8');
  resetSvg.setAttribute('stroke-linecap', 'round');
  resetSvg.setAttribute('stroke-linejoin', 'round');
  resetSvg.setAttribute('aria-hidden', 'true');

  const resetPath1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  resetPath1.setAttribute('d', 'M2.5 8a5.5 5.5 0 0 1 9.39-3.89l1.61 1.39');
  const resetPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  resetPath2.setAttribute('d', 'M13.5 8a5.5 5.5 0 0 1-9.39 3.89l-1.61-1.39');
  const resetArrow1 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  resetArrow1.setAttribute('points', '13.5 2.5 13.5 5.5 10.5 5.5');
  const resetArrow2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  resetArrow2.setAttribute('points', '2.5 13.5 2.5 10.5 5.5 10.5');

  resetSvg.appendChild(resetPath1);
  resetSvg.appendChild(resetPath2);
  resetSvg.appendChild(resetArrow1);
  resetSvg.appendChild(resetArrow2);

  const resetLabel = document.createElement('span');
  resetLabel.textContent = 'Reset travel stamps';

  resetBtn.appendChild(resetSvg);
  resetBtn.appendChild(resetLabel);

  resetBtn.addEventListener('click', () => {
    if (rightPageObj && typeof rightPageObj.resetStamps === 'function') {
      rightPageObj.resetStamps();
    }
    if (leftPageObj && typeof leftPageObj.resetStickers === 'function') {
      leftPageObj.resetStickers();
    }
    if (draggableManager && typeof draggableManager.resetStickers === 'function') {
      draggableManager.resetStickers();
    }
    liveAnnouncer.textContent = 'Stickers and travel stamps restored to default positions.';
  });

  // Drag hint
  const hint = document.createElement('span');
  hint.className = 'sticker-drag-hint';
  hint.id = 'stickerDragHint';
  hint.textContent = 'Drag the stamps & stickers around ✦';
  hint.setAttribute('aria-hidden', 'true');

  const isHintDismissed = localStorage.getItem('rushabh_sticker_hint_dismissed') === 'true';
  if (isHintDismissed) {
    hint.classList.add('is-hidden');
  }

  controls.appendChild(pageNavGroup);
  controls.appendChild(closeBtn);
  controls.appendChild(resetBtn);
  controls.appendChild(hint);
  sceneWrapper.appendChild(controls);

  // Initialize Draggable Stickers
  let draggableManager = null;
  setTimeout(() => {
    draggableManager = setupDraggableStickers({
      stageEl: stage,
      coverEl: frontCoverObj.element,
      rightPageEl: rightPageObj.element,
      liveAnnouncer,
      onFirstDrag: () => {
        hint.classList.add('is-hidden');
        try {
          localStorage.setItem('rushabh_sticker_hint_dismissed', 'true');
        } catch (e) {}
      },
      getState: () => state
    });
  }, 0);

  // State Transition Methods
  function openBook() {
    if (state !== 'closed') return;
    state = 'opening';

    stage.classList.remove('is-closed');
    stage.classList.add('is-opening');
    document.body.classList.add('is-book-open');
    liveAnnouncer.textContent = 'Opening sketchbook.';

    if (typeof onOpenChange === 'function') {
      onOpenChange(true);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 200 : 1100;

    setTimeout(() => {
      state = 'open';
      stage.classList.remove('is-opening');
      stage.classList.add('is-open');

      if (typeof onOpenChange === 'function') {
        onOpenChange(true);
      }

      // Start animated WebP walking cutout
      rightPageObj.walkingCutout.startAnimation();

      // Focus open book heading for accessibility
      const heading = leftPageObj?.element?.querySelector('#openBookHeading');
      if (heading) {
        heading.focus();
      }
      liveAnnouncer.textContent = 'Sketchbook is open. Left page: Architect by training. Explorer at heart. Right page: A little more me.';
    }, duration);
  }

  function closeBook() {
    if (state !== 'open') return;
    state = 'closing';

    // Stop animated cutout immediately
    rightPageObj.walkingCutout.stopAnimation();

    stage.classList.remove('is-open');
    stage.classList.add('is-closing');
    document.body.classList.remove('is-book-open');
    liveAnnouncer.textContent = 'Closing sketchbook.';

    if (typeof onOpenChange === 'function') {
      onOpenChange(false);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const duration = prefersReducedMotion ? 200 : 1100;

    setTimeout(() => {
      state = 'closed';
      stage.classList.remove('is-closing');
      stage.classList.add('is-closed');

      if (typeof onOpenChange === 'function') {
        onOpenChange(false);
      }

      // Return focus to the open button
      const openBtn = frontCoverObj.openButton;
      if (openBtn) {
        openBtn.focus();
      }
      liveAnnouncer.textContent = 'Sketchbook closed.';
    }, duration);
  }

  // Keyboard shortcut: Escape closes the book if open
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state === 'open') {
      const dialog = document.getElementById('chapterDialog');
      if (!dialog || !dialog.open) {
        closeBook();
      }
    }
  });

  return {
    element: sceneWrapper,
    stage,
    openBook,
    closeBook,
    getState: () => state,
    setSinglePage,
    getSinglePage: () => singlePageIndex,
    updateTimelineLine: () => leftPageObj?.updateTimelineLine?.()
  };
}
