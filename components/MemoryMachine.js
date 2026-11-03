/**
 * MemoryMachine.js
 * Personal Photos & Vibe Section ("A LITTLE MORE ME")
 * 
 * Features:
 * - Visual style matching layout-reference.png:
 *     Warm ivory paper background, cobalt blue accents, subtle lime marker highlight.
 * - Centred "ABOUT ME" pill and "Behind the work." heading, then a four-column grid
 *   (childhood photos / copy / VR figure / printer) that becomes two columns on tablets and
 *   one stacked column on phones.
 * - Childhood column: Rotated childhood photos (turban behind, birthday in front with cake visible),
 *     yellow tape, orange sparkles, handwritten "Little me." with underline.
 * - Copy column: Heading "Still that kid.", lime marker on "trying something new.", three short
 *     paragraphs, a divider and a handwritten closing line.
 * - VR column: Cutout sticker with a dashed trail and handwritten "Still exploring." note.
 * - Printer column: "VIBE CHECK" stationary printer housing with physical paper feed:
 *     - Layer 1: Base housing (stationary, drop shadow).
 *     - Layer 2: Moving photographic paper viewport emerging from black slit line at top: 71.33%.
 *                Passes in front of lower casing of the printer housing.
 *     - Layer 3: Upper housing mask (clip-path: inset(0 0 28.67% 0)) covering upper casing.
 * - Authentic roll feed motion:
 *     - Each photo preserves intrinsic aspect ratio (portrait prints taller, landscape shorter).
 *     - Downward feed reveals leading edge (bottom of upright photo) first.
 *     - Consistent feed speed (~380px/sec for photos).
 *     - Photos hold for 2.5s; video memories feed slower and hold longer while they play.
 *     - Stable reserved viewport room prevents layout jumps.
 *     - Outgoing photos fade smoothly as they exit; old panels recycled from DOM.
 * - Accessible controls:
 *     - Pause / Resume button, counter (e.g. 01 / 06), Next & Previous manual buttons.
 *     - Navigation during active print is queued and executed smoothly.
 *     - Auto-pauses offscreen (IntersectionObserver), on hover/focus, and when tab is hidden.
 *     - Reduced-motion mode displays static photo with manual navigation.
 */

// The roll opens on the forest print with the sunset print below it; the rest feed in after
const DEFAULT_MEMORIES = [
  {
    id: "lake-sunrise",
    focusY: "70%",
    src: "assets/memory-machine/photos/lake-sunrise.jpg",
    caption: "Quiet mornings count too.",
    alt: "Sunrise over a still lake between forested hills.",
    width: 1500,
    height: 2000
  },
  {
    id: "forest",
    focusY: "80%",
    src: "assets/memory-machine/photos/forest.jpg",
    caption: "Taking a moment to look around.",
    alt: "Rushabh on a sunlit forest path.",
    width: 1536,
    height: 2048
  },
  {
    id: "motorcycle",
    focusY: "100%",
    src: "assets/memory-machine/photos/motorcycle.jpg",
    caption: "Taking the scenic route.",
    alt: "Rushabh seated on a motorcycle in the hills.",
    width: 1536,
    height: 2048
  },
  {
    id: "misty-road",
    focusY: "58%",
    src: "assets/memory-machine/photos/misty-road.jpg",
    caption: "Walking into the fog, happily.",
    alt: "Rushabh walking down a misty hill road in a floral shirt.",
    width: 1126,
    height: 2000
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
    id: "light-wall",
    focusY: "62%",
    type: "video",
    src: "assets/memory-machine/videos/light-wall.mp4",
    poster: "assets/memory-machine/videos/light-wall-poster.jpg",
    caption: "Touching everything. For research.",
    alt: "Rushabh waving a hand across an interactive light installation that ripples in response.",
    width: 540,
    height: 960
  },
  {
    id: "palace-pillar",
    focusY: "82%",
    src: "assets/memory-machine/photos/palace-pillar.jpg",
    caption: "Old arches, new questions.",
    alt: "Rushabh leaning on a carved marble pillar in a palace courtyard.",
    width: 1500,
    height: 2000
  },
  {
    id: "lake-dusk",
    type: "video",
    src: "assets/memory-machine/videos/lake-dusk.mp4",
    poster: "assets/memory-machine/videos/lake-dusk-poster.jpg",
    caption: "Dusk, slow and pink.",
    alt: "A boat drifting on a calm lake at dusk under a pink sky, a palace on the water in the distance.",
    width: 960,
    height: 540
  },
  {
    id: "mountains",
    focusY: "90%",
    src: "assets/memory-machine/photos/mountains.jpg",
    caption: "A little further from the everyday.",
    alt: "Rushabh facing the hills with arms outstretched.",
    width: 1536,
    height: 2048
  },
  {
    id: "bridge-sunset",
    src: "assets/memory-machine/photos/bridge-sunset.jpg",
    caption: "Good structure at golden hour.",
    alt: "A steel truss footbridge over a river at sunset.",
    width: 2000,
    height: 1500
  },
  {
    id: "boat",
    focusY: "90%",
    src: "assets/memory-machine/photos/boat.jpg",
    caption: "Front seat on the backwaters.",
    alt: "Rushabh lounging on the bow of a blue boat on open water.",
    width: 1500,
    height: 2000
  },
  {
    id: "coast",
    focusY: "100%",
    src: "assets/memory-machine/photos/coast.jpg",
    caption: "Some days, this is enough.",
    alt: "Palm trees overlooking the sea.",
    width: 1536,
    height: 2048
  }
];

export function createMemoryMachine(options = {}) {
  const memories = options.memories && options.memories.length > 0 ? options.memories : DEFAULT_MEMORIES;
  const section = document.createElement('section');
  section.className = 'memory-machine-section';
  section.id = 'about';
  section.setAttribute('aria-label', 'About: Behind the work');

  section.innerHTML = `
    <!-- Decorative Full-Bleed Doodle Grid Background -->
    <div class="about-paper-bg" aria-hidden="true"></div>

    <!-- Section Introduction Header: centred "ABOUT ME" pill above the heading -->
    <div class="about-intro-header">
      <div class="about-section-tab">ABOUT ME</div>
      <h2 class="about-section-heading">Behind the work.</h2>
    </div>

    <!-- Four areas, left to right: childhood photos, copy, VR figure, Vibe Check printer -->
    <div class="memory-machine-container">
      <!-- LEFT COLUMN: Childhood Collage -->
      <div class="memory-col memory-col-left">
        <div class="childhood-collage-wrap">
          <!-- Orange Sparkle (Upper-Left) -->
          <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-top" alt="" aria-hidden="true" />

          <!-- Turban Photo Card (Behind, rotated ~ -3.5deg) -->
          <div class="childhood-photo-card childhood-turban-card">
            <!-- Yellow Tape strip across top edge -->
            <img src="assets/memory-machine/assets/tape.svg" class="childhood-tape" alt="" aria-hidden="true" />
            <div class="childhood-img-frame">
              <img src="assets/memory-machine/assets/childhood-turban.svg" alt="Rushabh as a toddler in a red turban, looking at the camera" width="945" height="1260" />
            </div>
          </div>

          <!-- Birthday Photo Card (In front, rotated ~ +3.5deg) -->
          <div class="childhood-photo-card childhood-birthday-card">
            <div class="childhood-img-frame">
              <img src="assets/memory-machine/assets/childhood-birthday.svg" alt="Rushabh as a baby in a yellow sweater, sitting behind a birthday cake" width="550" height="710" />
            </div>
          </div>

          <!-- Orange Sparkle (Bottom-Right) -->
          <img src="assets/memory-machine/assets/sparkle.svg" class="childhood-sparkle childhood-sparkle-bottom" alt="" aria-hidden="true" />
        </div>

        <!-- Handwritten Caption: "Little me." with underline -->
        <p class="childhood-caption-wrap">
          <span class="childhood-caption-text">Little me.</span>
          <svg class="childhood-caption-underline" viewBox="0 0 130 18" fill="none" aria-hidden="true">
            <path d="M4 14C32 5 76 4 126 12" stroke="#0647fa" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </p>
      </div>

      <!-- SECOND COLUMN: Copy -->
      <div class="memory-col memory-col-center">
        <div class="memory-intro-block">
          <h3 class="memory-main-heading">Still<br>that kid.</h3>
          <p class="memory-main-para">
            A little older. A few more tools.<br>
            The same joy in <mark class="lime-marker">trying something new.</mark>
          </p>
          <div class="memory-body">
            <p>I’m Rushabh, studying Interaction Design at NID Bangalore.</p>
            <p>I turn curiosity into interactive stories, playful objects, and ideas to explore.</p>
            <p>Off-screen: riding, photography, and trying something unfamiliar.</p>
          </div>
          <hr class="memory-divider" />
          <p class="memory-secondary-para">
            Some of it becomes design.<br>
            <span class="memory-closing-accent">The rest becomes a good story.</span>
          </p>
        </div>
      </div>

      <!-- THIRD COLUMN: VR figure with a "Still exploring." note and one dashed arrow to the headset -->
      <div class="memory-col memory-col-vr">
        <div class="vr-sticker-wrapper">
          <span class="vr-callout-text" aria-hidden="true">Still<br>exploring.</span>
          <!-- Drawn in the cutout's own 2:3 space so the arrow stays on the headset at every size -->
          <svg class="vr-callout-arrow" viewBox="0 0 200 300" fill="none" aria-hidden="true">
            <path d="M24 84C14 63 34 47 65 47" stroke="#0647fa" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="5 5"/>
            <path d="M58 41.5L66 47L58.5 53" stroke="#0647fa" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>

          <!-- Hobby stickers around the cutout (decorative): badminton, flute, table tennis, map -->
          <img src="assets/memory-machine/assets/hobby-badminton.webp" class="hobby-sticker hobby-badminton" alt="" aria-hidden="true" width="260" height="428" loading="lazy" decoding="async" />
          <img src="assets/memory-machine/assets/hobby-flute.webp" class="hobby-sticker hobby-flute" alt="" aria-hidden="true" width="400" height="262" loading="lazy" decoding="async" />
          <img src="assets/memory-machine/assets/hobby-table-tennis.webp" class="hobby-sticker hobby-table-tennis" alt="" aria-hidden="true" width="280" height="297" loading="lazy" decoding="async" />
          <img src="assets/memory-machine/assets/hobby-map.webp" class="hobby-sticker hobby-map" alt="" aria-hidden="true" width="400" height="260" loading="lazy" decoding="async" />

          <img src="assets/memory-machine/assets/vr-sticker.webp" class="vr-sticker-img" alt="Rushabh today, wearing a VR headset and holding a controller in each hand" width="1024" height="1536" loading="lazy" decoding="async" />
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
            <div class="printer-label-text" aria-hidden="true">VIBE CHECK</div>
            <!-- Power Indicator LED -->
            <div class="printer-power-led" aria-hidden="true"></div>

            <!-- LAYER 1: Stationary Printer Housing Base (Back) -->
            <img src="assets/memory-machine/assets/printer-housing.webp" 
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
              <img src="assets/memory-machine/assets/printer-housing.webp" 
                   class="printer-housing-upper-img" 
                   alt="" 
                   width="2135" 
                   height="736" />
            </div>
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
  const pauseIcon = pauseBtn ? pauseBtn.querySelector('.pause-icon') : null;
  const pauseLabel = pauseBtn ? pauseBtn.querySelector('.pause-label') : null;
  const prevBtn = section.querySelector('#memoryPrevBtn');
  const nextBtn = section.querySelector('#memoryNextBtn');

  let currentIndex = Math.min(1, memories.length - 1); // Opens on the forest print, sunset below
  let isUserPaused = false;
  let isAutoPaused = false;
  let isAnimating = false;
  let holdTimer = null;

  // Pacing: photos print briskly; videos get a gentler feed and a longer hold so the clip can play
  const PHOTO_FEED_PX_PER_SEC = 380;
  const VIDEO_FEED_PX_PER_SEC = 260;
  const PHOTO_HOLD_MS = 2500;
  const VIDEO_HOLD_MS = 9000;
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

  // Portrait memories with a focusY print as squares (mostly sky/ceiling trimmed from the top)
  function displayRatio(memory) {
    return memory.focusY ? 1 : memory.height / memory.width;
  }

  function mediaStyle(memory) {
    return memory.focusY
      ? `aspect-ratio: 1 / 1; object-fit: cover; object-position: 50% ${memory.focusY};`
      : `aspect-ratio: ${memory.width} / ${memory.height};`;
  }

  function createPanelHTML(memory) {
    return `
      <article class="receipt-panel" data-id="${memory.id}">
        <div class="panel-photo-frame">
          ${memory.type === 'video' ? `<video src="${memory.src}"
               poster="${memory.poster}"
               class="panel-photo-img panel-video"
               width="${memory.width}"
               height="${memory.height}"
               style="${mediaStyle(memory)}"
               aria-label="${memory.alt}"
               muted autoplay loop playsinline preload="metadata"></video>` : `<img src="${memory.src}"
               alt="${memory.alt}"
               class="panel-photo-img"
               width="${memory.width}"
               height="${memory.height}"
               style="${mediaStyle(memory)}"
               loading="eager" />`}
        </div>
        <div class="panel-caption-band">
          <p class="panel-caption">${memory.caption}</p>
        </div>
        <div class="panel-tear-separator" aria-hidden="true"></div>
      </article>
    `;
  }

  function updateCounter(index) {
    if (!counterEl) return;
    const formatted = String(index + 1).padStart(2, '0');
    const total = String(memories.length).padStart(2, '0');
    counterEl.textContent = `${formatted} / ${total}`;
  }

  function renderStaticState(index) {
    // Current memory at top, previous memory (if any) in outgoing position. No wrap-around,
    // so the opening print never shows the last memory.
    paperEl.innerHTML = createPanelHTML(memories[index]) + (index > 0 ? createPanelHTML(memories[index - 1]) : '');
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
    if (isUserPaused || isAutoPaused || !isVisible || !isReady || prefersReducedMotion || isLastMemory()) {
      return;
    }
    // Hold the visible memory: short for photos, longer for videos
    const holdMs = memories[currentIndex] && memories[currentIndex].type === 'video' ? VIDEO_HOLD_MS : PHOTO_HOLD_MS;
    holdTimer = setTimeout(() => {
      feedNext();
    }, holdMs);
  }

  /**
   * Calculate responsive layout geometry based on slot coordinates:
   * Printer housing PNG: 2135 x 736
   * Slit exit line: Y = 525 (71.33% of printer container height)
   * Slit usable width: 66.8% of printer container width
   * Viewport height: Tallest panel in the roll (9:16) + outgoing buffer (~130px)
   * Controls margin: Distance from container top to bottom of paper viewport + 24px gap
   */
  function updateLayoutDimensions() {
    if (!assemblyEl || !viewportEl) return;
    const containerWidth = assemblyEl.clientWidth || 440;
    const paperWidth = containerWidth * 0.668;
    const innerPhotoWidth = Math.max(120, paperWidth - 20); // 10px side borders

    // Reserve room for the tallest memory in the roll (height / width)
    const maxRatio = Math.max(...memories.map(displayRatio));
    const tallestPhotoHeight = innerPhotoWidth * maxRatio;
    const captionAndPadding = 75; // caption band, paddings & tear line
    const tallestPanelHeight = Math.round(tallestPhotoHeight + captionAndPadding);

    // Reserved outgoing area to view previous memory comfortably
    // Enough of the previous print shows that it reads as a photo, not just an edge
    const outgoingAreaHeight = Math.round(Math.min(280, Math.max(120, innerPhotoWidth * 0.68)));
    const reservedViewportHeight = tallestPanelHeight + outgoingAreaHeight;

    viewportEl.style.setProperty('--measured-viewport-height', `${reservedViewportHeight}px`);

    // Printer height is containerWidth * (736 / 2135)
    // Slit exit line is at 71.3315% of printer height
    const printerHeight = containerWidth * (736 / 2135);
    const slitExitPx = printerHeight * 0.7133;

    // Assembly height to fit exiting paper viewport and photos
    const assemblyHeight = Math.round(slitExitPx + reservedViewportHeight + 20);
    assemblyEl.style.setProperty('--assembly-height', `${assemblyHeight}px`);
    assemblyEl.style.setProperty('--controls-margin-top', `${assemblyHeight}px`);
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
    imgLoader.src = nextMemory.poster || nextMemory.src;
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

    // 5. Calculate feed duration proportional to panel height
    const feedSpeed = nextMemory.type === 'video' ? VIDEO_FEED_PX_PER_SEC : PHOTO_FEED_PX_PER_SEC;
    const durationMs = Math.round(Math.max(700, Math.min(2600, (panelHeight / feedSpeed) * 1000)));

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

  function isLastMemory() {
    return currentIndex >= memories.length - 1;
  }

  function feedNext() {
    if (isLastMemory()) return; // each memory prints once; the roll rests on the final one
    const nextIndex = currentIndex + 1;
    if (isAnimating) {
      queuedTargetIndex = nextIndex;
      return;
    }
    executePrint(nextIndex);
  }

  function feedPrevious() {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
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
      if (pauseIcon) pauseIcon.textContent = '▶';
      if (pauseLabel) pauseLabel.textContent = 'Resume memories';
      if (pauseBtn) pauseBtn.setAttribute('aria-label', 'Resume memories');
    } else {
      if (pauseIcon) pauseIcon.textContent = '⏸';
      if (pauseLabel) pauseLabel.textContent = 'Pause memories';
      if (pauseBtn) pauseBtn.setAttribute('aria-label', 'Pause memories');
      scheduleNextCycle();
    }
  }

  // Controls event listeners (if controls present)
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      setPauseState(!isUserPaused, true);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      feedPrevious();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      feedNext();
    });
  }

  // Allow clicking / tapping the printed paper viewport directly to advance
  if (viewportEl) {
    viewportEl.style.cursor = 'pointer';
    viewportEl.setAttribute('role', 'button');
    viewportEl.setAttribute('tabindex', '0');
    viewportEl.setAttribute('aria-label', 'Memory photos roll: click or press Enter to advance');
    viewportEl.addEventListener('click', () => {
      feedNext();
    });
    viewportEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        feedNext();
      }
    });
  }

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
        img.src = m.poster || m.src;
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
