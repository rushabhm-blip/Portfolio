/**
 * MemoryMachine.js
 * Personal Photos & Vibe Section ("A LITTLE MORE ME")
 * 
 * Features:
 * - Visual style matching layout-reference.png:
 *     Warm ivory paper background, cobalt blue accents, subtle lime marker highlight.
 * - Left column: Rotated childhood photos (turban behind, birthday in front with cake visible),
 *     yellow tape, orange sparkles, handwritten "Little me." with underline.
 * - Center column: Heading "Still that kid.", short paragraphs with lime marker on "trying something new.",
 *     VR cutout sticker with cobalt callout badge "Still figuring things out."
 * - Right column: "THE MEMORY MACHINE" stationary printer housing with physical paper feed:
 *     - Layer 1: Base housing (stationary, drop shadow).
 *     - Layer 2: Moving photographic paper viewport emerging from black slit line at top: 71.33%.
 *                Passes in front of lower casing of the printer housing.
 *     - Layer 3: Upper housing mask (clip-path: inset(0 0 28.67% 0)) covering upper casing.
 * - Authentic roll feed motion:
 *     - Each photo preserves intrinsic aspect ratio (portrait prints taller, landscape shorter).
 *     - Downward feed reveals leading edge (bottom of upright photo) first.
 *     - Consistent feed speed (~240px/sec).
 *     - 4-second hold on completed photo.
 *     - Stable reserved viewport room prevents layout jumps.
 *     - Outgoing photos fade smoothly as they exit; old panels recycled from DOM.
 * - Accessible controls:
 *     - Pause / Resume button, counter (e.g. 01 / 06), Next & Previous manual buttons.
 *     - Navigation during active print is queued and executed smoothly.
 *     - Auto-pauses offscreen (IntersectionObserver), on hover/focus, and when tab is hidden.
 *     - Reduced-motion mode displays static photo with manual navigation.
 */

const DEFAULT_MEMORIES = [
  {
    id: "motorcycle",
    src: "assets/memory-machine/photos/motorcycle.jpg",
    caption: "Taking the scenic route.",
    alt: "Rushabh seated on a motorcycle in the hills.",
    width: 1536,
    height: 2048
  },
  {
    id: "kayaking",
    src: "assets/memory-machine/photos/kayaking.jpg",
    caption: "Good company. New directions.",
    alt: "Two friends kayaking on a forest-lined river.",
    width: 2048,
    height: 1153
  },
  {
    id: "vr-work",
    src: "assets/memory-machine/photos/vr-work.jpg",
    caption: "Still figuring things out.",
    alt: "Rushabh trying a VR headset and controllers.",
    width: 1153,
    height: 2048
  },
  {
    id: "mountains",
    src: "assets/memory-machine/photos/mountains.jpg",
    caption: "A little further from the everyday.",
    alt: "Rushabh facing the hills with arms outstretched.",
    width: 1536,
    height: 2048
  },
  {
    id: "coast",
    src: "assets/memory-machine/photos/coast.jpg",
    caption: "Some days, this is enough.",
    alt: "Palm trees overlooking the sea.",
    width: 1536,
    height: 2048
  },
  {
    id: "forest",
    src: "assets/memory-machine/photos/forest.jpg",
    caption: "Taking a moment to look around.",
    alt: "Rushabh on a sunlit forest path.",
    width: 1536,
    height: 2048
  }
];

export function createMemoryMachine(options = {}) {
  const memories = options.memories && options.memories.length > 0 ? options.memories : DEFAULT_MEMORIES;
  const section = document.createElement('section');
  section.className = 'memory-machine-section';
  section.id = 'about';
  section.setAttribute('aria-label', 'A little more me');

  section.innerHTML = `
    <div class="memory-machine-bg-texture" aria-hidden="true"></div>

    <div class="memory-machine-container">
      <!-- Decorative Trail SVG (connecting free space across columns on desktop) -->
      <div class="memory-machine-trail-wrapper" aria-hidden="true">
        <svg class="memory-machine-trail-svg" viewBox="0 0 800 170" fill="none" preserveAspectRatio="none">
          <path d="M5 140C170 35 355 15 445 65S490 170 440 135S600 5 795 25" stroke="#1744ef" stroke-width="2" stroke-dasharray="10 12"/>
        </svg>
      </div>

      <!-- LEFT COLUMN: Childhood Collage -->
      <div class="memory-col memory-col-left">
        <div class="memory-eyebrow-container">
          <span class="memory-eyebrow-text">A LITTLE MORE ME</span>
          <span class="memory-eyebrow-line" aria-hidden="true"></span>
        </div>

        <div class="childhood-collage-wrap">
          <!-- Orange Sparkle (Upper-Left) -->
          <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-top" alt="" aria-hidden="true" />

          <!-- Turban Photo Card (Behind, rotated ~ -3.5deg) -->
          <div class="childhood-photo-card childhood-turban-card">
            <!-- Yellow Tape strip across top edge -->
            <img src="assets/memory-machine/assets/tape.svg" class="childhood-tape" alt="" aria-hidden="true" />
            <div class="childhood-img-frame">
              <img src="assets/memory-machine/assets/childhood-turban.svg" alt="Little Rushabh wearing a red turban" width="945" height="1260" />
            </div>
          </div>

          <!-- Birthday Photo Card (In front, rotated ~ +3.5deg) -->
          <div class="childhood-photo-card childhood-birthday-card">
            <div class="childhood-img-frame">
              <img src="assets/memory-machine/assets/childhood-birthday.svg" alt="Little Rushabh on his birthday with cake" width="550" height="710" />
            </div>
          </div>

          <!-- Orange Sparkle (Bottom-Right) -->
          <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-bottom" alt="" aria-hidden="true" />

          <!-- Handwritten Caption: "Little me." with underline -->
          <div class="childhood-caption-wrap" aria-label="Little me.">
            <span class="childhood-caption-text">Little me.</span>
            <svg class="childhood-caption-underline" viewBox="0 0 130 18" fill="none" aria-hidden="true">
              <path d="M4 14C32 5 76 4 126 12" stroke="#0647fa" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- CENTER COLUMN: Introduction & Copy & VR Sticker -->
      <div class="memory-col memory-col-center">
        <div class="memory-intro-block">
          <div class="memory-mobile-heading-row">
            <div class="memory-mobile-childhood-slot" aria-hidden="true">
              <div class="childhood-collage-wrap childhood-collage-mobile">
                <!-- Orange Sparkle (Upper-Left) -->
                <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-top" alt="" aria-hidden="true" />

                <!-- Turban Photo Card (Behind, rotated ~ -3.5deg) -->
                <div class="childhood-photo-card childhood-turban-card">
                  <!-- Yellow Tape strip across top edge -->
                  <img src="assets/memory-machine/assets/tape.svg" class="childhood-tape" alt="" aria-hidden="true" />
                  <div class="childhood-img-frame">
                    <img src="assets/memory-machine/assets/childhood-turban.svg" alt="Little Rushabh wearing a red turban" width="945" height="1260" />
                  </div>
                </div>

                <!-- Birthday Photo Card (In front, rotated ~ +3.5deg) -->
                <div class="childhood-photo-card childhood-birthday-card">
                  <div class="childhood-img-frame">
                    <img src="assets/memory-machine/assets/childhood-birthday.svg" alt="Little Rushabh on his birthday with cake" width="550" height="710" />
                  </div>
                </div>

                <!-- Orange Sparkle (Bottom-Right) -->
                <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-bottom" alt="" aria-hidden="true" />
              </div>
            </div>
            <h2 class="memory-main-heading">Still<br>that kid.</h2>
          </div>
          <p class="memory-main-para">
            A little older. A few more tools.<br>
            The same joy in <mark class="lime-marker">trying something new.</mark>
          </p>
          <p class="memory-secondary-para">
            Some of it becomes design.<br>
            The rest becomes a good story.
          </p>
        </div>

        <div class="vr-sticker-wrapper">
          <!-- Callout Badge: "Still figuring things out." in handwritten style with arrow -->
          <div class="vr-callout-badge" aria-hidden="true">
            <span class="vr-callout-text">Still figuring<br>things out.</span>
            <svg class="vr-callout-arrow" viewBox="0 0 32 24" fill="none">
              <path d="M4 4C10 16 22 18 28 14" stroke="#0647fa" stroke-width="2" stroke-linecap="round" fill="none"/>
              <path d="M22 12L28 14L26 20" stroke="#0647fa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <!-- VR sticker cutout image -->
          <img src="assets/memory-machine/assets/vr-sticker.png" class="vr-sticker-img" alt="Rushabh trying a VR headset and controllers" width="1024" height="1536" loading="lazy" />
        </div>
      </div>

      <!-- RIGHT COLUMN: Memory Machine Printer & Photographic Receipt -->
      <div class="memory-col memory-col-right">
        <div class="memory-printer-assembly is-loading" id="memoryPrinterAssembly">
          <!-- Quiet ivory placeholder while loading initial assets -->
          <div class="printer-placeholder" aria-hidden="true">
            <div class="placeholder-spinner"></div>
          </div>

          <!-- The Printer Assembly: 3-Layer Architecture -->
          <div class="printer-container">
            <!-- Label on the printer -->
            <div class="printer-label-text" aria-hidden="true">THE MEMORY MACHINE</div>
            <!-- Power Indicator LED -->
            <div class="printer-power-led" aria-hidden="true"></div>

            <!-- LAYER 1: Stationary Printer Housing Base (Back) -->
            <img src="assets/memory-machine/assets/printer-housing.png" 
                 class="printer-housing-base" 
                 alt="" 
                 aria-hidden="true" 
                 width="2135" 
                 height="736" />

            <!-- LAYER 2: Moving Photographic Receipt Viewport (Middle) -->
            <div class="receipt-viewport" id="receiptViewport" aria-label="Photographic memory receipt">
              <div class="receipt-paper" id="receiptPaper">
                <!-- Dynamically fed panels -->
              </div>
              <div class="receipt-bottom-fade" aria-hidden="true"></div>
            </div>

            <!-- LAYER 3: Foreground Housing Upper Mask (Front) -->
            <div class="printer-housing-upper-clip" aria-hidden="true">
              <img src="assets/memory-machine/assets/printer-housing.png" 
                   class="printer-housing-upper-img" 
                   alt="" 
                   width="2135" 
                   height="736" />
            </div>
          </div>

          <!-- Quiet Memory Controls beneath the receipt -->
          <div class="memory-controls" aria-label="Memory machine controls">
            <button type="button" class="memory-nav-btn memory-prev-btn" id="memoryPrevBtn" aria-label="Previous memory">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>

            <span class="memory-counter" id="memoryCounter" aria-live="polite">01 / 06</span>

            <button type="button" class="memory-pause-btn" id="memoryPauseBtn" aria-label="Pause memories">
              <span class="pause-icon" aria-hidden="true">⏸</span>
              <span class="pause-label">Pause memories</span>
            </button>

            <button type="button" class="memory-nav-btn memory-next-btn" id="memoryNextBtn" aria-label="Next memory">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
  `;

  // Internal State
  const assemblyEl = section.querySelector('#memoryPrinterAssembly');
  const viewportEl = section.querySelector('#receiptViewport');
  const paperEl = section.querySelector('#receiptPaper');
  const counterEl = section.querySelector('#memoryCounter');
  const pauseBtn = section.querySelector('#memoryPauseBtn');
  const pauseIcon = pauseBtn.querySelector('.pause-icon');
  const pauseLabel = pauseBtn.querySelector('.pause-label');
  const prevBtn = section.querySelector('#memoryPrevBtn');
  const nextBtn = section.querySelector('#memoryNextBtn');

  let currentIndex = 0; // Starts with motorcycle (0)
  let isUserPaused = false;
  let isAutoPaused = false;
  let isAnimating = false;
  let holdTimer = null;
  let isVisible = false;
  let isReady = false;
  let queuedTargetIndex = null;
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Watch for system reduced-motion preference changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        clearHoldTimer();
      } else if (!isUserPaused && !isAutoPaused && isVisible && isReady) {
        scheduleNextCycle();
      }
    });
  }

  function createPanelHTML(memory) {
    return `
      <article class="receipt-panel" data-id="${memory.id}">
        <div class="panel-photo-frame">
          <img src="${memory.src}" 
               alt="${memory.alt}" 
               class="panel-photo-img" 
               width="${memory.width}" 
               height="${memory.height}"
               loading="eager" />
        </div>
        <div class="panel-caption-band">
          <p class="panel-caption">${memory.caption}</p>
        </div>
        <div class="panel-tear-separator" aria-hidden="true"></div>
      </article>
    `;
  }

  function updateCounter(index) {
    const formatted = String(index + 1).padStart(2, '0');
    const total = String(memories.length).padStart(2, '0');
    counterEl.textContent = `${formatted} / ${total}`;
  }

  function renderStaticState(index) {
    // Current memory at top, previous memory in outgoing position
    const prevIndex = (index - 1 + memories.length) % memories.length;
    paperEl.innerHTML = `
      ${createPanelHTML(memories[index])}
      ${createPanelHTML(memories[prevIndex])}
    `;
    paperEl.style.transition = 'none';
    paperEl.style.transform = 'none';
    updateCounter(index);
  }

  function clearHoldTimer() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function scheduleNextCycle() {
    clearHoldTimer();
    if (isUserPaused || isAutoPaused || !isVisible || !isReady || prefersReducedMotion) {
      return;
    }
    // Hold visible photo for ~4000ms
    holdTimer = setTimeout(() => {
      feedNext();
    }, 4000);
  }

  /**
   * Calculate responsive layout geometry based on slot coordinates:
   * Printer housing PNG: 2135 x 736
   * Slit exit line: Y = 525 (71.33% of printer container height)
   * Slit usable width: 66.8% of printer container width
   * Viewport height: Tallest panel (vr-work 9:16) + outgoing buffer (~130px)
   * Controls margin: Distance from container top to bottom of paper viewport + 24px gap
   */
  function updateLayoutDimensions() {
    if (!assemblyEl || !viewportEl) return;
    const containerWidth = assemblyEl.clientWidth || 440;
    const paperWidth = containerWidth * 0.668;
    const innerPhotoWidth = Math.max(120, paperWidth - 20); // 10px side borders

    // Maximum photo aspect ratio: vr-work is 1153 x 2048 -> ratio = 1.7762
    const maxRatio = 1.7762;
    const tallestPhotoHeight = innerPhotoWidth * maxRatio;
    const captionAndPadding = 75; // caption band, paddings & tear line
    const tallestPanelHeight = Math.round(tallestPhotoHeight + captionAndPadding);

    // Reserved outgoing area to view previous memory comfortably
    const outgoingAreaHeight = Math.round(Math.min(150, Math.max(90, innerPhotoWidth * 0.45)));
    const reservedViewportHeight = tallestPanelHeight + outgoingAreaHeight;

    viewportEl.style.setProperty('--measured-viewport-height', `${reservedViewportHeight}px`);

    // Printer height is containerWidth * (736 / 2135)
    // Slit exit line is at 71.3315% of printer height
    const printerHeight = containerWidth * (736 / 2135);
    const slitExitPx = printerHeight * 0.7133;

    // Controls placed below the paper with 24px clearance
    const controlsMarginTop = Math.round(slitExitPx + reservedViewportHeight + 24);
    assemblyEl.style.setProperty('--controls-margin-top', `${controlsMarginTop}px`);
  }

  /**
   * Physical roll feed animation:
   * 1. Decodes incoming photograph before feed starts.
   * 2. Inserts incoming panel at the top of the strip.
   * 3. Measures exact rendered panel height.
   * 4. Offsets paper strip upward by panel height so incoming panel is hidden above the slit mouth.
   * 5. Smoothly translates strip downward: leading edge emerges from slit line first,
   *    passes in front of lower casing, and existing panel moves down by same distance.
   * 6. Fades outgoing panel at bottom and prunes excess panels from DOM.
   */
  async function executePrint(nextIndex) {
    if (isAnimating) return;
    isAnimating = true;
    clearHoldTimer();

    const nextMemory = memories[nextIndex];

    // 1. Preload & decode incoming image
    const imgLoader = new Image();
    imgLoader.src = nextMemory.src;
    if (typeof imgLoader.decode === 'function') {
      try {
        await imgLoader.decode();
      } catch (e) {
        // Continue even if decode fails
      }
    }

    // 2. Reduced-motion instant path
    if (prefersReducedMotion) {
      currentIndex = nextIndex;
      renderStaticState(currentIndex);
      isAnimating = false;
      if (queuedTargetIndex !== null) {
        const next = queuedTargetIndex;
        queuedTargetIndex = null;
        executePrint(next);
      }
      return;
    }

    // 3. Create and insert incoming panel node
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createPanelHTML(nextMemory);
    const incomingPanel = tempDiv.firstElementChild;
    incomingPanel.classList.add('is-printing');

    paperEl.insertBefore(incomingPanel, paperEl.firstElementChild);

    // 4. Measure exact rendered panel height
    paperEl.style.transition = 'none';
    const panelHeight = incomingPanel.offsetHeight;

    // Position paper offset upward so incoming panel is inside the slit cavity
    paperEl.style.transform = `translateY(-${panelHeight}px)`;

    // Force reflow
    void paperEl.offsetHeight;

    // 5. Calculate feed duration proportional to panel height (~240px / sec)
    const durationMs = Math.round(Math.max(900, Math.min(2600, (panelHeight / 240) * 1000)));

    // Update counter as new photo emerges
    updateCounter(nextIndex);

    // 6. Animate downward feed: mostly linear with subtle start/end ease
    paperEl.style.transition = `transform ${durationMs}ms cubic-bezier(0.35, 0.05, 0.25, 1)`;
    paperEl.style.transform = 'translateY(0px)';

    // 7. Fade outgoing panel (3rd child in paperEl) as it exits downward
    const exitingPanel = paperEl.children[2];
    if (exitingPanel) {
      exitingPanel.style.transition = `opacity ${durationMs}ms ease-out`;
      exitingPanel.style.opacity = '0';
    }

    // 8. On feed completion
    setTimeout(() => {
      // Recycle exited panel(s): keep exactly 2 panels at rest
      while (paperEl.children.length > 2) {
        paperEl.removeChild(paperEl.lastElementChild);
      }

      if (incomingPanel) {
        incomingPanel.classList.remove('is-printing');
      }

      // Reset transform cleanly
      paperEl.style.transition = 'none';
      paperEl.style.transform = 'none';

      currentIndex = nextIndex;
      isAnimating = false;

      // Process any queued manual navigation
      if (queuedTargetIndex !== null) {
        const nextTarget = queuedTargetIndex;
        queuedTargetIndex = null;
        executePrint(nextTarget);
      } else if (!isUserPaused && !isAutoPaused && isVisible && !prefersReducedMotion) {
        scheduleNextCycle();
      }
    }, durationMs);
  }

  function feedNext() {
    const nextIndex = (currentIndex + 1) % memories.length;
    if (isAnimating) {
      queuedTargetIndex = nextIndex;
      return;
    }
    executePrint(nextIndex);
  }

  function feedPrevious() {
    const prevIndex = (currentIndex - 1 + memories.length) % memories.length;
    if (isAnimating) {
      queuedTargetIndex = prevIndex;
      return;
    }
    executePrint(prevIndex);
  }

  function setPauseState(paused, isManualUserAction = false) {
    if (isManualUserAction) {
      isUserPaused = paused;
    } else {
      isAutoPaused = paused;
    }

    const effectivePaused = isUserPaused || isAutoPaused;
    if (effectivePaused) {
      clearHoldTimer();
      pauseIcon.textContent = '▶';
      pauseLabel.textContent = 'Resume memories';
      pauseBtn.setAttribute('aria-label', 'Resume memories');
    } else {
      pauseIcon.textContent = '⏸';
      pauseLabel.textContent = 'Pause memories';
      pauseBtn.setAttribute('aria-label', 'Pause memories');
      scheduleNextCycle();
    }
  }

  // Controls event listeners
  pauseBtn.addEventListener('click', () => {
    setPauseState(!isUserPaused, true);
  });

  prevBtn.addEventListener('click', () => {
    feedPrevious();
  });

  nextBtn.addEventListener('click', () => {
    feedNext();
  });

  // Autoplay pause triggers (hover, focus, tab visibility)
  viewportEl.addEventListener('mouseenter', () => setPauseState(true, false));
  viewportEl.addEventListener('mouseleave', () => setPauseState(false, false));
  viewportEl.addEventListener('focusin', () => setPauseState(true, false));
  viewportEl.addEventListener('focusout', () => setPauseState(false, false));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      setPauseState(true, false);
    } else {
      setPauseState(false, false);
    }
  });

  // IntersectionObserver to pause when offscreen
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.2;
        if (isVisible) {
          if (!isUserPaused && isReady && !prefersReducedMotion) {
            scheduleNextCycle();
          }
        } else {
          clearHoldTimer();
        }
      });
    }, { threshold: [0, 0.2, 0.5] });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  // Asset readiness coordinator: shows placeholder until base assets are loaded
  async function waitForInitialAssets() {
    renderStaticState(currentIndex);
    updateLayoutDimensions();

    const promises = [];

    // Base housing image
    const housingImg = assemblyEl.querySelector('.printer-housing-base');
    if (housingImg) {
      if (housingImg.complete && housingImg.naturalWidth > 0) {
        // already cached
      } else if (typeof housingImg.decode === 'function') {
        promises.push(housingImg.decode().catch(() => {}));
      } else {
        promises.push(new Promise(res => {
          housingImg.onload = res;
          housingImg.onerror = res;
        }));
      }
    }

    // Childhood photos
    const childhoodImgs = section.querySelectorAll('.childhood-img-frame img');
    childhoodImgs.forEach(img => {
      if (typeof img.decode === 'function') {
        promises.push(img.decode().catch(() => {}));
      }
    });

    // Initial 2 photos in paper strip
    const firstImgs = paperEl.querySelectorAll('.panel-photo-img');
    firstImgs.forEach(img => {
      if (typeof img.decode === 'function') {
        promises.push(img.decode().catch(() => {}));
      }
    });

    if (document.fonts && document.fonts.ready) {
      promises.push(document.fonts.ready.catch(() => {}));
    }

    // Bounded timeout (max 1000ms)
    const timeout = new Promise(res => setTimeout(res, 1000));
    await Promise.race([Promise.all(promises), timeout]);

    isReady = true;
    updateLayoutDimensions();
    assemblyEl.classList.remove('is-loading');
    assemblyEl.classList.add('is-ready');

    if (isVisible && !isUserPaused && !prefersReducedMotion) {
      scheduleNextCycle();
    }

    // Preload remaining photos in background
    setTimeout(() => {
      memories.forEach(m => {
        const img = new Image();
        img.src = m.src;
        if (typeof img.decode === 'function') img.decode().catch(() => {});
      });
    }, 200);
  }

  setTimeout(() => {
    waitForInitialAssets();
  }, 10);

  // Resize handler to recalculate geometry proportionally
  let resizeTimer = null;
  const handleResize = () => {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      updateLayoutDimensions();
    });
  };
  window.addEventListener('resize', handleResize);

  return {
    element: section,
    destroy: () => {
      clearHoldTimer();
      if (observer) observer.disconnect();
      window.removeEventListener('resize', handleResize);
    }
  };
}
