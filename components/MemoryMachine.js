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
 * - Right column: "THE MEMORY MACHINE" printer housing with continuous downward-emerging photographic receipt.
 * - Automatic printing loop (4s hold, 1.2s downward feed, fading bottom panel, modulo 6 recycling).
 * - Accessible controls: Quiet Pause/Resume memories, counter (e.g. 01 / 06), manual next/prev, reduced-motion fallback.
 * - Responsive breakpoints: Desktop 3-column, Tablet 2-row/centered printer, Mobile content-driven single column.
 */

const DEFAULT_MEMORIES = [
  {
    id: "motorcycle",
    src: "assets/memory-machine/photos/motorcycle.jpg",
    caption: "Taking the scenic route.",
    alt: "Rushabh seated on a motorcycle in the hills.",
    width: 1536,
    height: 2048,
    objectFit: "cover",
    objectPosition: "center 28%"
  },
  {
    id: "kayaking",
    src: "assets/memory-machine/photos/kayaking.jpg",
    caption: "Good company. New directions.",
    alt: "Two friends kayaking on a forest-lined river.",
    width: 2048,
    height: 1153,
    objectFit: "cover",
    objectPosition: "center center"
  },
  {
    id: "vr-work",
    src: "assets/memory-machine/photos/vr-work.jpg",
    caption: "Still figuring things out.",
    alt: "Rushabh trying a VR headset and controllers.",
    width: 1153,
    height: 2048,
    objectFit: "contain",
    objectPosition: "center center"
  },
  {
    id: "mountains",
    src: "assets/memory-machine/photos/mountains.jpg",
    caption: "A little further from the everyday.",
    alt: "Rushabh facing the hills with arms outstretched.",
    width: 1536,
    height: 2048,
    objectFit: "cover",
    objectPosition: "center 30%"
  },
  {
    id: "coast",
    src: "assets/memory-machine/photos/coast.jpg",
    caption: "Some days, this is enough.",
    alt: "Palm trees overlooking the sea.",
    width: 1536,
    height: 2048,
    objectFit: "cover",
    objectPosition: "center 40%"
  },
  {
    id: "forest",
    src: "assets/memory-machine/photos/forest.jpg",
    caption: "Taking a moment to look around.",
    alt: "Rushabh on a sunlit forest path.",
    width: 1536,
    height: 2048,
    objectFit: "cover",
    objectPosition: "center 25%"
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
          <h2 class="memory-main-heading">Still<br>that kid.</h2>
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

          <!-- The Printer Housing & Ejection Assembly -->
          <div class="printer-container">
            <!-- Label on the printer -->
            <div class="printer-label-text" aria-hidden="true">THE MEMORY MACHINE</div>
            <!-- Power Indicator LED -->
            <div class="printer-power-led" aria-hidden="true"></div>

            <!-- Stationary Printer Housing -->
            <img src="assets/memory-machine/assets/printer-housing.png" class="printer-housing-img" alt="" aria-hidden="true" width="2135" height="736" />

            <!-- Foreground Slot Lip Occlusion (ensures emerging paper emerges from inside slot) -->
            <div class="printer-slot-lip" aria-hidden="true"></div>

            <!-- Receipt Viewport (Local clipping starting precisely at outlet mouth) -->
            <div class="receipt-viewport" id="receiptViewport" aria-label="Photographic memory receipt">
              <!-- Continuous Receipt Paper Strip (moving downward) -->
              <div class="receipt-paper" id="receiptPaper">
                <!-- Panels populated dynamically by state machine -->
              </div>
              <!-- Subtle soft fade mask at bottom of receipt viewport -->
              <div class="receipt-bottom-fade" aria-hidden="true"></div>
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

  // Internal State Machine
  const assemblyEl = section.querySelector('#memoryPrinterAssembly');
  const viewportEl = section.querySelector('#receiptViewport');
  const paperEl = section.querySelector('#receiptPaper');
  const counterEl = section.querySelector('#memoryCounter');
  const pauseBtn = section.querySelector('#memoryPauseBtn');
  const pauseIcon = pauseBtn.querySelector('.pause-icon');
  const pauseLabel = pauseBtn.querySelector('.pause-label');
  const prevBtn = section.querySelector('#memoryPrevBtn');
  const nextBtn = section.querySelector('#memoryNextBtn');

  let currentTopIndex = 0; // Starts with motorcycle (0)
  let currentBottomIndex = 1; // Starts with kayaking (1)
  let isUserPaused = false;
  let isAutoPaused = false;
  let isAnimating = false;
  let holdTimer = null;
  let isVisible = false;
  let isReady = false;
  let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Watch for reduced-motion changes
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
    const objFit = memory.objectFit || 'contain';
    const objPos = memory.objectPosition || 'center center';
    return `
      <article class="receipt-panel" data-id="${memory.id}">
        <div class="panel-photo-frame">
          <img src="${memory.src}" 
               alt="${memory.alt}" 
               class="panel-photo-img" 
               style="object-fit: ${objFit}; object-position: ${objPos};" 
               loading="lazy" 
               width="${memory.width}" 
               height="${memory.height}" />
        </div>
        <p class="panel-caption">${memory.caption}</p>
      </article>
    `;
  }

  function updateCounter(index) {
    const formatted = String(index + 1).padStart(2, '0');
    const total = String(memories.length).padStart(2, '0');
    counterEl.textContent = `${formatted} / ${total}`;
  }

  function renderInitialPanels() {
    paperEl.innerHTML = `
      ${createPanelHTML(memories[currentTopIndex])}
      ${createPanelHTML(memories[currentBottomIndex])}
    `;
    updateCounter(currentTopIndex);
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
    // Hold visible pair for approx 4000ms
    holdTimer = setTimeout(() => {
      feedNext();
    }, 4000);
  }

  /**
   * Automatic feed:
   * 1. Next photo enters from inside the printer slot at the top.
   * 2. Existing top photo moves into the lower position.
   * 3. Existing bottom photo moves down and fades away during final 450ms.
   * Modulo 6 recycling.
   */
  async function feedNext() {
    if (isAnimating) return;
    isAnimating = true;
    clearHoldTimer();

    // Next memory to emerge from the printer slot
    // Sequence: 0 (Motorcycle) -> 2 (VR) -> 3 (Mountains) -> 4 (Coast) -> 5 (Forest) -> 0 (Motorcycle) -> 1 (Kayaking)...
    // In general, if bottom is currentBottomIndex, the next incoming memory is (currentBottomIndex + 1) % memories.length
    let nextIndex;
    if (currentTopIndex === 0 && currentBottomIndex === 1) {
      nextIndex = 2; // VR
    } else {
      nextIndex = (currentTopIndex + 1) % memories.length;
    }

    const nextMemory = memories[nextIndex];

    // Preload & decode next image before transitioning to prevent blank flashes
    const imgLoader = new Image();
    imgLoader.src = nextMemory.src;
    if (typeof imgLoader.decode === 'function') {
      try {
        await imgLoader.decode();
      } catch (e) {
        // Continue even if decode rejects
      }
    }

    // Measure current panel pitch (height + gap)
    const existingPanels = paperEl.querySelectorAll('.receipt-panel');
    let panelPitch = 260; // fallback
    if (existingPanels.length >= 2) {
      const topRect = existingPanels[0].getBoundingClientRect();
      const bottomRect = existingPanels[1].getBoundingClientRect();
      panelPitch = bottomRect.top - topRect.top;
      if (panelPitch <= 0) panelPitch = existingPanels[0].offsetHeight + 24;
    } else if (existingPanels.length === 1) {
      panelPitch = existingPanels[0].offsetHeight + 24;
    }

    if (prefersReducedMotion) {
      // Instant transition for reduced motion
      currentBottomIndex = currentTopIndex;
      currentTopIndex = nextIndex;
      renderInitialPanels();
      isAnimating = false;
      return;
    }

    // Create the entering panel node and insert at the top of the paper strip
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = createPanelHTML(nextMemory);
    const enteringPanel = tempDiv.firstElementChild;
    enteringPanel.classList.add('is-entering');

    paperEl.insertBefore(enteringPanel, paperEl.firstElementChild);

    // Position paper offset upwards by panelPitch so the entering panel is hidden inside the printer slot mouth
    paperEl.style.transition = 'none';
    paperEl.style.transform = `translateY(-${panelPitch}px)`;

    // Force reflow
    void paperEl.offsetHeight;

    // Start 1.2s downward translate
    const transitionDurationMs = 1200;
    const fadeOutDurationMs = 450;
    const fadeOutStartMs = transitionDurationMs - fadeOutDurationMs; // 750ms

    paperEl.style.transition = `transform ${transitionDurationMs}ms cubic-bezier(0.25, 1, 0.5, 1)`;
    paperEl.style.transform = 'translateY(0px)';

    // Existing bottom panel (now 3rd item in paperEl) fades out during final 450ms
    const exitingPanel = paperEl.children[2];
    let fadeTimer = null;
    if (exitingPanel) {
      fadeTimer = setTimeout(() => {
        exitingPanel.style.transition = `opacity ${fadeOutDurationMs}ms ease-out`;
        exitingPanel.style.opacity = '0';
      }, fadeOutStartMs);
    }

    // When downward feed completes
    setTimeout(() => {
      if (fadeTimer) clearTimeout(fadeTimer);

      // Clean up exited panel(s): strictly maintain exactly 2 panels at rest
      while (paperEl.children.length > 2) {
        paperEl.removeChild(paperEl.lastElementChild);
      }
      if (enteringPanel) {
        enteringPanel.classList.remove('is-entering');
      }

      // Reset transform
      paperEl.style.transition = 'none';
      paperEl.style.transform = 'none';

      // Update state indices
      currentBottomIndex = currentTopIndex;
      currentTopIndex = nextIndex;
      updateCounter(currentTopIndex);

      isAnimating = false;

      // Schedule next hold
      if (!isUserPaused && !isAutoPaused && isVisible) {
        scheduleNextCycle();
      }
    }, transitionDurationMs);

  }

  function stepPrevious() {
    if (isAnimating) return;
    clearHoldTimer();
    // Step backwards
    const prevIndex = (currentTopIndex - 1 + memories.length) % memories.length;
    currentBottomIndex = currentTopIndex;
    currentTopIndex = prevIndex;
    renderInitialPanels();
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

  // User manual controls
  pauseBtn.addEventListener('click', () => {
    setPauseState(!isUserPaused, true);
  });

  prevBtn.addEventListener('click', () => {
    stepPrevious();
  });

  nextBtn.addEventListener('click', () => {
    if (prefersReducedMotion) {
      feedNext();
    } else {
      feedNext();
    }
  });

  // Automatic pause triggers
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

  // IntersectionObserver to start/pause only when meaningfully visible
  let observer = null;
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        if (isVisible) {
          if (!isUserPaused && isReady) {
            scheduleNextCycle();
          }
        } else {
          clearHoldTimer();
        }
      });
    }, { threshold: [0, 0.25, 0.5, 0.75] });
    observer.observe(section);
  } else {
    isVisible = true;
  }

  // Asset readiness coordinator:
  // Shows quiet ivory placeholder until printer housing and initial 2 photos are decoded
  async function waitForInitialAssets() {
    renderInitialPanels();

    const promises = [];

    // Housing image
    const housingImg = assemblyEl.querySelector('.printer-housing-img');
    if (housingImg) {
      if (housingImg.complete && housingImg.naturalWidth > 0) {
        // already loaded
      } else if (typeof housingImg.decode === 'function') {
        promises.push(housingImg.decode().catch(() => {}));
      } else {
        promises.push(new Promise(res => {
          housingImg.onload = res;
          housingImg.onerror = res;
        }));
      }
    }

    // VR sticker
    const vrImg = section.querySelector('.vr-sticker-img');
    if (vrImg && typeof vrImg.decode === 'function') {
      promises.push(vrImg.decode().catch(() => {}));
    }

    // Childhood photos
    const childhoodImgs = section.querySelectorAll('.childhood-img-frame img');
    childhoodImgs.forEach(img => {
      if (typeof img.decode === 'function') {
        promises.push(img.decode().catch(() => {}));
      }
    });

    // First two photos
    const firstImgs = paperEl.querySelectorAll('.panel-photo-img');

    firstImgs.forEach(img => {
      if (typeof img.decode === 'function') {
        promises.push(img.decode().catch(() => {}));
      }
    });

    if (document.fonts && document.fonts.ready) {
      promises.push(document.fonts.ready.catch(() => {}));
    }

    // Bounded wait (max 1000ms)
    const timeout = new Promise(res => setTimeout(res, 1000));
    await Promise.race([Promise.all(promises), timeout]);

    isReady = true;
    assemblyEl.classList.remove('is-loading');
    assemblyEl.classList.add('is-ready');

    if (isVisible && !isUserPaused && !prefersReducedMotion) {
      scheduleNextCycle();
    }

    // Preload remaining memories in background for instant feed transitions
    setTimeout(() => {
      memories.forEach(m => {
        const img = new Image();
        img.src = m.src;
        if (typeof img.decode === 'function') img.decode().catch(() => {});
      });
    }, 200);
  }

  // Initialize assets when DOM connects
  setTimeout(() => {
    waitForInitialAssets();
  }, 10);

  // Resize handler to re-measure pitch and adjust viewport height cleanly
  const handleResize = () => {
    // When viewport or fonts change, ensure paper height and panels are seated
    if (paperEl.children.length >= 2) {
      const topPanel = paperEl.children[0];
      const bottomPanel = paperEl.children[1];
      if (topPanel && bottomPanel) {
        const h = topPanel.offsetHeight + bottomPanel.offsetHeight + 24;
        viewportEl.style.setProperty('--measured-receipt-height', `${h}px`);
      }
    }
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
