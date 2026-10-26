// =========================================================
// PORTFOLIO - INFINITE FLOWING FABRIC MESH CONTROLLER
// =========================================================

const canvas = document.getElementById('fabricCanvas');
const ctx = canvas.getContext('2d');
const replayBtn = document.getElementById('replayBtn');
const cursorEl = document.getElementById('customCursor');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);
let dpr = window.devicePixelRatio || 1;

// =========================================================
// CONFIGURATION: RADIUS & RESOLUTION
// =========================================================
// Radius (in pixels) of the visible mesh around cursor on hover
function getHoverRadius() {
  return window.innerWidth <= 768 ? Math.min(width * 0.36, 135) : 350;
}
const HOVER_RADIUS = 350;

// Grid dimensions & resolution
function getCellSize() {
  return window.innerWidth <= 768 ? 24 : 34;
}
let CELL_SIZE = 34; // spacing between vertices
let COLS = 0;
let ROWS = 0;
let gridWidth = 0;
let gridHeight = 0;
let startColOffset = 0;
let startRowOffset = 0;

// Interactive Drag & Infinite Panning State
const pan = {
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  velocityX: 0,
  velocityY: 0
};

// Opening Sequence Animation Timeline State
const animState = {
  dotsOpacity: 0,     // Phase 1: Dots fade in & rest
  wavePower: 0,       // Phase 2: Dots start moving/flowing in 3D
  linesProgress: 0,   // Phase 3: Lines connect one by one slowly
  linesOpacity: 0,    // Overall lines alpha
  globalReveal: 1.0,  // Phase 4: 1.0 = entire screen mesh visible, fades to 0.0 leaving only hover spotlight
  transitionPull: 0   // Textile / Cloth pull effect from center down during screen transitions
};

let startTime = performance.now();
let lastFrameTime = performance.now();
let simTime = 0;
let flowSpeed = 1.0;
let targetFlowSpeed = 1.0;
let mouseStopTimer = null;
let animTimeline = null;

function notifyMouseActivity() {
  targetFlowSpeed = 1.0;
  clearTimeout(mouseStopTimer);
  mouseStopTimer = setTimeout(() => {
    if (animState.globalReveal <= 0.15) {
      targetFlowSpeed = 0.0;
    }
  }, 1500); // 1.5s delay after stopping movement before slow deceleration begins
}

// Screen-space cursor & spotlight coordinates
const screenMouse = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2,
  targetX: window.innerWidth / 2,
  targetY: window.innerHeight / 2,
  isVisible: false
};

// Mouse ambient breeze tracking (-1 to 1)
let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };


// =========================================================
// INTERACTION DESIGN KEYWORDS (MESH 3D PROJECTION)
// =========================================================
const IXD_KEYWORDS = [
  "User research",
  "Interaction design",
  "Prototyping",
  "Creative thinking",
  "Micro-interactions",
  "Information Architecture",
  "Wireframing",
  "Usability Testing",
  "Motion Design",
  "Design Systems",
  "Spatial Navigation",
  "Tactile Interface"
];

// Curated electric violet palette matching reference mockup identity (#693bfe)
const KEYWORD_COLORS = [
  { text: "#693bfe", dot: "#693bfe", bg: "rgba(105, 59, 254, 0.16)" },
  { text: "#693bfe", dot: "#693bfe", bg: "rgba(105, 59, 254, 0.12)" },
  { text: "#693bfe", dot: "#693bfe", bg: "rgba(105, 59, 254, 0.20)" }
];

function getGridKeywordData(actualR, actualC) {
  // Deterministic 2D spatial hash to permanently link grid nodes to shuffled keywords
  const hash = Math.abs((actualR * 73856093) ^ (actualC * 19349663) ^ 83492791);
  const keyword = IXD_KEYWORDS[hash % IXD_KEYWORDS.length];
  const color = KEYWORD_COLORS[(hash >> 3) % KEYWORD_COLORS.length];
  // Rich, distinctly varied readable scales from clear standard (1.05x) to bold hero (1.88x)
  const scalePool = [1.05, 1.22, 1.40, 1.62, 1.88];
  const fontScale = scalePool[(hash >> 5) % scalePool.length];
  return { keyword, color, hash, fontScale };
}

// Active lingering keyword trail nodes
let trailKeywordNodes = [];
let lastKeywordSpawnX = 0;
let lastKeywordSpawnY = 0;
let keywordIndexCounter = 0;

// Rectangle intersection helper
function rectsIntersect(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

// Get exclusion boxes for hero text, portrait, top nav, and center lockup
function getCenterExclusionRects(padding = 55) {
  const rects = [];
  const topNav = document.getElementById('topNavHeader');
  const elements = [heroTextWrapper, portraitWrapper, heroCenterAnchorEl, topNav];
  for (const el of elements) {
    if (el) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        rects.push({
          left: r.left - padding,
          top: r.top - padding,
          right: r.right + padding,
          bottom: r.bottom + padding
        });
      }
    }
  }
  return rects;
}

// Compute the accurate bounding box of a word
function computeWordBoundingBox(x, y, dirX, dirY, keyword, fontScale, buffer = 20) {
  const approxCharWidth = 11.5 * fontScale;
  const tw = keyword.length * approxCharWidth + 24;
  const th = 32 * fontScale;
  
  const left = (dirX > 0) ? x - buffer : x - tw - buffer;
  const right = (dirX > 0) ? x + tw + buffer : x + buffer;
  const top = y - th * 0.5 - buffer;
  const bottom = y + th * 0.5 + buffer;

  return { left, top, right, bottom };
}

function isInsideCenterExclusion(x, y, margin = 45) {
  const rects = getCenterExclusionRects(margin);
  for (const r of rects) {
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      return true;
    }
  }
  return false;
}

// Flag to only allow keywords after the text and portrait sequence has fully finished
let isHeroSequenceComplete = false;
let isWorksMode = false;
let isTransitioning = false;

// Try to spawn a new lingering trail keyword near cursor without any overlap
function trySpawnTrailKeyword(points, cursorX, cursorY, now) {
  if (isWorksMode || !isHeroSequenceComplete || !screenMouse.isVisible || isInsideCenterExclusion(cursorX, cursorY, 30)) {
    return;
  }

  const centerRects = getCenterExclusionRects(65);
  const centerX = width * 0.5;
  const centerY = height * 0.5;

  // Build bounding boxes of all currently active visible words to prevent any coincidence
  const activeWordBoxes = [];
  for (const existing of trailKeywordNodes) {
    const er = existing.actualR - startRowOffset;
    const ec = existing.actualC - startColOffset;
    if (er >= 0 && er < ROWS && ec >= 0 && ec < COLS) {
      const ep = points[er][ec];
      if (ep) {
        activeWordBoxes.push(
          computeWordBoundingBox(ep.x, ep.y, existing.dirX, existing.dirY, existing.keyword, existing.fontScale, 28)
        );
      }
    }
  }

  let bestCandidate = null;
  let bestScore = -999;
  const targetDist = 110;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const p = points[r][c];
      if (!p) continue;

      // Skip points outside screen bounds
      if (p.x < 40 || p.x > width - 40 || p.y < 40 || p.y > height - 40) continue;

      const dx = p.x - cursorX;
      const dy = p.y - cursorY;
      const dist = Math.hypot(dx, dy);

      if (dist >= 75 && dist <= 180) {
        // Natural outward orientation away from center elements
        const dirX = (p.x >= centerX) ? 1 : -1;
        const dirY = (p.y >= centerY) ? 1 : -1;

        const kwData = getGridKeywordData(p.actualR, p.actualC);
        const candidateBox = computeWordBoundingBox(p.x, p.y, dirX, dirY, kwData.keyword, kwData.fontScale, 30);

        // 1. Strict check against hero text and portrait exclusion zones
        let collidesWithCenter = false;
        for (const cr of centerRects) {
          if (rectsIntersect(candidateBox, cr)) {
            collidesWithCenter = true;
            break;
          }
        }
        if (collidesWithCenter) continue;

        // 2. Strict check against all active words (no overlapping/coinciding words)
        let collidesWithActiveWords = false;
        for (const ab of activeWordBoxes) {
          if (rectsIntersect(candidateBox, ab)) {
            collidesWithActiveWords = true;
            break;
          }
        }
        if (collidesWithActiveWords) continue;

        const score = 180 - Math.abs(dist - targetDist);
        if (score > bestScore) {
          bestScore = score;
          bestCandidate = { actualR: p.actualR, actualC: p.actualC, dirX, dirY, kwData };
        }
      }
    }
  }

  if (bestCandidate) {
    keywordIndexCounter++;
    const kwData = bestCandidate.kwData;

    trailKeywordNodes.push({
      actualR: bestCandidate.actualR,
      actualC: bestCandidate.actualC,
      dirX: bestCandidate.dirX,
      dirY: bestCandidate.dirY,
      spawnTime: now,
      lingerDuration: 2200, // Generous reading hold time (2.2s)
      fadeDuration: 1300,   // Graceful smooth fade out (1.3s) -> ~3.5s total lifespan
      keyword: kwData.keyword,
      color: kwData.color,
      hash: kwData.hash,
      fontScale: kwData.fontScale
    });

    // Keep up to 8 active non-overlapping words on screen across both regions
    if (trailKeywordNodes.length > 8) {
      trailKeywordNodes[0].spawnTime -= 3000; // Expire oldest cleanly
    }
  }
}

let lastStationarySpawnTime = 0;

function updateGridHighlights(points, spotlightX, spotlightY, oppSpotlightX, oppSpotlightY, now) {
  // Floating keywords on mesh completely removed
}

function resizeCanvas() {
  dpr = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(dpr, dpr);

  // Extend grid far beyond the screen bounds (150% extra on each side) for true infinity
  const marginX = width * 1.2;
  const marginY = height * 0.8;

  CELL_SIZE = getCellSize();
  COLS = Math.ceil((width + marginX * 2) / CELL_SIZE);
  ROWS = Math.ceil((height + marginY * 2) / CELL_SIZE);

  gridWidth = COLS * CELL_SIZE;
  gridHeight = ROWS * CELL_SIZE;

  startColOffset = -Math.floor(marginX / CELL_SIZE);
  startRowOffset = -Math.floor(marginY / CELL_SIZE);
}

window.addEventListener('resize', resizeCanvas);

// =========================================================
// =========================================================
// TYPEWRITER & PORTRAIT HERO SEQUENCE CONTROLLER
// =========================================================
const PHRASE_1 = "Hi, I'm Rushabh";
const PHRASE_2_PREFIX = "an";
const PHRASE_2_HIGHLIGHT = "Interaction designer";

const heroCenterAnchorEl = document.getElementById('heroCenterAnchor');
const heroTextWrapper = document.getElementById('heroTextWrapper');
const heroManifesto = document.getElementById('heroManifesto');
const line1ContentEl = document.querySelector('.line-1-content');
const line2PrefixEl = document.querySelector('.line-2-prefix');
const line2HighlightEl = document.querySelector('.line-2-highlight');
const cursor1El = document.querySelector('.cursor-1');
const cursor2El = document.querySelector('.cursor-2');

const portraitWrapper = document.getElementById('portraitWrapper');
const portraitSmile = document.getElementById('portraitSmile');
const portraitEyes = document.getElementById('portraitEyes');
const heroSubdescriptionEl = document.getElementById('heroSubdescription');
const heroKickerEl = document.getElementById('heroKicker');
const firmsShowcaseEl = document.getElementById('firmsShowcase');
const educationShowcaseEl = document.getElementById('educationShowcase');
const heroWorksActionEl = null;
const bottomScrollPromptEl = document.getElementById('bottomScrollPrompt');
const worksScreenEl = document.getElementById('worksScreen');
const backHomeBtnEl = document.getElementById('backHomeBtn');
const portraitPupils = document.getElementById('portraitPupils');

let typewriterTimeout = null;
let heroAnimTimeline = null;
let eyeFollowActive = true;

function getHeroMidScreenOffset() {
  if (!heroCenterAnchorEl) return 0;
  gsap.set(heroCenterAnchorEl, { y: 0 });
  const isMobile = window.innerWidth <= 900;

  if (isMobile) {
    const lineEl = document.querySelector('.hero-line-1') || document.getElementById('heroLine1');
    const textTarget = heroTextWrapper || lineEl || heroCenterAnchorEl;
    const textRect = textTarget.getBoundingClientRect();
    const currentCenterY = textRect.top + textRect.height * 0.5;
    const targetViewportCenter = window.innerHeight * 0.44;
    return targetViewportCenter - currentCenterY;
  }

  // Natural layout placement for desktop (unchanged)
  const anchorRect = heroCenterAnchorEl.getBoundingClientRect();
  const lineEl = document.querySelector('.hero-line-1') || document.getElementById('heroLine1');
  const lineFontSize = lineEl ? (parseFloat(window.getComputedStyle(lineEl).fontSize) || 54) : 54;
  
  // Natural vertical position of line 1 (from top of viewport)
  const line1NaturalCenter = anchorRect.top + lineFontSize * 0.72;
  // Target vertical center: middle of the viewport
  const viewportCenter = window.innerHeight * 0.48;
  return Math.max(0, viewportCenter - line1NaturalCenter);
}

// Page scroll lock controller: Keeps downward scroll disabled until all hero elements finish appearing
function lockPageScroll() {
  document.documentElement.classList.add('scroll-locked');
  document.body.classList.add('scroll-locked');
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
}

function unlockPageScroll() {
  document.documentElement.classList.remove('scroll-locked');
  document.body.classList.remove('scroll-locked');
}

function revealWorksShowcase() {
  unlockPageScroll();
  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}
  const worksShowcaseSection = document.getElementById('works');
  if (worksShowcaseSection) {
    worksShowcaseSection.style.opacity = '1';
    worksShowcaseSection.style.transform = 'none';
    gsap.set(worksShowcaseSection, {
      opacity: 1,
      y: 0,
      clearProps: 'transform'
    });
  }
}

function showCompletedHomeScreen() {
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }
  if (heroAnimTimeline) {
    heroAnimTimeline.kill();
    heroAnimTimeline = null;
  }
  if (animTimeline) {
    animTimeline.kill();
  }

  isHeroSequenceComplete = true;
  unlockPageScroll();
  isWorksMode = false;
  animState.transitionPull = 0;

  const navHomeEl = document.getElementById('navHome');
  const navWorksEl = document.getElementById('navWorks');
  const navPlaygroundEl = document.getElementById('navPlayground');
  const navAboutEl = document.getElementById('navAbout');
  const navArchEl = document.getElementById('navArchitecture');
  if (navHomeEl) navHomeEl.classList.add('active');
  if (navWorksEl) navWorksEl.classList.remove('active');
  if (navPlaygroundEl) navPlaygroundEl.classList.remove('active');
  if (navAboutEl) navAboutEl.classList.remove('active');
  if (navArchEl) navArchEl.classList.remove('active');

  if (worksScreenEl) {
    worksScreenEl.classList.remove('active');
    gsap.set(worksScreenEl, { opacity: 0, y: 50 });
  }

  if (heroContainer) {
    heroContainer.style.opacity = '1';
    heroContainer.style.transform = 'none';
    gsap.set(heroContainer, { y: 0, scaleX: 1, scaleY: 1, opacity: 1, clearProps: 'transform' });
  }

  // Populate hero text immediately so it is NEVER blank
  if (line1ContentEl) line1ContentEl.textContent = PHRASE_1;
  if (line2PrefixEl) line2PrefixEl.textContent = PHRASE_2_PREFIX;
  if (line2HighlightEl) line2HighlightEl.textContent = PHRASE_2_HIGHLIGHT;
  if (cursor1El) cursor1El.classList.add('hidden');
  if (cursor2El) cursor2El.classList.remove('hidden');

  if (heroCenterAnchorEl) {
    heroCenterAnchorEl.style.opacity = '1';
    heroCenterAnchorEl.style.transform = 'none';
    gsap.set(heroCenterAnchorEl, { x: 0, y: 0, opacity: 1, clearProps: 'transform' });
  }
  if (heroTextWrapper) {
    heroTextWrapper.style.opacity = '1';
    heroTextWrapper.style.transform = 'none';
    gsap.set(heroTextWrapper, { y: 0, x: 0, rotation: 0, opacity: 1, clearProps: 'transform' });
  }
  if (portraitWrapper) {
    portraitWrapper.style.width = '';
    portraitWrapper.style.height = '';
    portraitWrapper.style.margin = '';
    portraitWrapper.style.overflow = 'visible';
    portraitWrapper.style.opacity = '1';
    portraitWrapper.style.transform = 'none';
    gsap.set(portraitWrapper, { opacity: 1, scale: 1, y: 0, clearProps: 'transform' });
  }
  if (portraitSmile) {
    gsap.set(portraitSmile, { scaleX: 1, scaleY: 1, transformOrigin: '242.5px 424px' });
  }
  if (portraitEyes) {
    gsap.set(portraitEyes, { scaleX: 1, scaleY: 1, transformOrigin: '50% 50%' });
  }
  if (portraitPupils) {
    gsap.set(portraitPupils, { x: 0, y: 0 });
  }
  if (heroSubdescriptionEl) {
    heroSubdescriptionEl.style.opacity = '1';
    heroSubdescriptionEl.style.transform = 'none';
    gsap.set(heroSubdescriptionEl, { opacity: 1, y: 0, clearProps: 'transform' });
  }
  if (firmsShowcaseEl) {
    firmsShowcaseEl.style.opacity = '1';
    firmsShowcaseEl.style.transform = 'none';
    gsap.set(firmsShowcaseEl, { opacity: 1, y: 0, clearProps: 'transform' });
  }
  if (educationShowcaseEl) {
    educationShowcaseEl.style.opacity = '1';
    educationShowcaseEl.style.transform = 'none';
    gsap.set(educationShowcaseEl, { opacity: 1, y: 0, clearProps: 'transform' });
  }
  if (heroKickerEl) {
    heroKickerEl.style.opacity = '1';
    heroKickerEl.style.transform = 'none';
    gsap.set(heroKickerEl, { opacity: 1, y: 0, clearProps: 'transform' });
    const kickerItems = heroKickerEl.querySelectorAll('.kicker-word, .kicker-dot');
    if (kickerItems.length > 0) {
      kickerItems.forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'none';
        gsap.set(item, { opacity: 1, y: 0, clearProps: 'transform' });
      });
    }
  }
  const worksShowcaseSection = document.getElementById('works');
  if (worksShowcaseSection) {
    worksShowcaseSection.style.opacity = '1';
    worksShowcaseSection.style.transform = 'none';
    gsap.set(worksShowcaseSection, { opacity: 1, y: 0, clearProps: 'transform' });
  }
  if (bottomScrollPromptEl) {
    bottomScrollPromptEl.classList.add('visible');
    bottomScrollPromptEl.style.opacity = '1';
    bottomScrollPromptEl.style.pointerEvents = 'auto';
    bottomScrollPromptEl.style.transform = 'none';
    gsap.set(bottomScrollPromptEl, { opacity: 1, y: 0, clearProps: 'transform' });
  }

  // Set fabric to active ambient state
  animState.dotsOpacity = 1;
  animState.wavePower = 1;
  animState.linesOpacity = 1;
  animState.linesProgress = 1;
  animState.globalReveal = 0.0;
  targetFlowSpeed = 1.0;
  flowSpeed = 1.0;

  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}
}

function resetHeroAndCharacter() {
  isHeroSequenceComplete = false;
  lockPageScroll();
  isWorksMode = false;
  animState.transitionPull = 0;
  trailKeywordNodes = [];
  if (typewriterTimeout) {
    clearTimeout(typewriterTimeout);
    typewriterTimeout = null;
  }
  if (heroAnimTimeline) {
    heroAnimTimeline.kill();
    heroAnimTimeline = null;
  }

  const navHomeEl = document.getElementById('navHome');
  const navPlaygroundEl = document.getElementById('navPlayground');
  if (navHomeEl) navHomeEl.classList.add('active');
  if (navPlaygroundEl) navPlaygroundEl.classList.remove('active');

  if (worksScreenEl) {
    worksScreenEl.classList.remove('active');
    gsap.set(worksScreenEl, { opacity: 0, y: 50 });
  }
  if (bottomScrollPromptEl) {
    bottomScrollPromptEl.classList.remove('visible');
    gsap.set(bottomScrollPromptEl, { opacity: 0, y: 0 });
  }
  if (heroContainer) {
    gsap.set(heroContainer, { y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
  }

  if (line1ContentEl) line1ContentEl.textContent = '';
  if (line2PrefixEl) line2PrefixEl.textContent = '';
  if (line2HighlightEl) line2HighlightEl.textContent = '';
  if (cursor1El) cursor1El.classList.add('hidden');
  if (cursor2El) cursor2El.classList.add('hidden');

  const isMobile = window.innerWidth <= 900;
  // Hide portrait wrapper completely at start so text can center
  if (portraitWrapper) {
    if (isMobile) {
      portraitWrapper.style.width = '0px';
      portraitWrapper.style.height = '0px';
      portraitWrapper.style.margin = '0px';
      portraitWrapper.style.overflow = 'hidden';
      gsap.set(portraitWrapper, { opacity: 0, scale: 0.85, y: -20 });
    } else {
      portraitWrapper.style.width = '0px';
      portraitWrapper.style.height = '';
      portraitWrapper.style.margin = '';
      portraitWrapper.style.overflow = 'hidden';
      gsap.set(portraitWrapper, { opacity: 0, scale: 0.88, y: 15 });
    }
  }

  const midScreenY = getHeroMidScreenOffset();
  if (heroCenterAnchorEl) {
    // Start vertically in the middle of the screen
    gsap.set(heroCenterAnchorEl, { x: 0, y: midScreenY });
  }
  if (heroTextWrapper) {
    // Start text centered
    gsap.set(heroTextWrapper, { y: 0, x: 0, rotation: 0, transformOrigin: '50% 50%' });
  }
  if (heroKickerEl) {
    gsap.set(heroKickerEl, { opacity: 1, y: 0 });
    const kickerItems = heroKickerEl.querySelectorAll('.kicker-word, .kicker-dot');
    if (kickerItems.length > 0) {
      gsap.set(kickerItems, { opacity: 0, y: 6 });
    }
  }
  if (heroSubdescriptionEl) {
    gsap.set(heroSubdescriptionEl, { opacity: 0, y: 10 });
  }
  if (firmsShowcaseEl) {
    gsap.set(firmsShowcaseEl, { opacity: 0, y: 12 });
  }
  if (educationShowcaseEl) {
    gsap.set(educationShowcaseEl, { opacity: 0, y: 12 });
  }
  const worksShowcaseSection = document.getElementById('works');
  if (worksShowcaseSection) {
    gsap.set(worksShowcaseSection, { opacity: 0, y: 24 });
  }
  if (portraitSmile) {
    gsap.set(portraitSmile, { scaleX: 1, scaleY: 1, x: 0, y: 0, transformOrigin: '242.5px 424px' });
  }
  if (portraitEyes) {
    gsap.set(portraitEyes, { scaleX: 1, scaleY: 1, x: 0, y: 0, transformOrigin: '50% 50%' });
  }
  if (portraitPupils) {
    gsap.set(portraitPupils, { x: 0, y: 0 });
  }
}

function typeTextToElement(targetEl, text, onComplete) {
  let charIdx = 0;

  function step() {
    if (charIdx < text.length) {
      targetEl.textContent = text.slice(0, charIdx + 1);
      charIdx++;
      const lastChar = text[charIdx - 1];
      const delay = (lastChar === ',') ? 180 : (lastChar === ' ') ? 110 : 55 + Math.random() * 20;
      typewriterTimeout = setTimeout(step, delay);
    } else {
      if (onComplete) onComplete();
    }
  }

  step();
}

function startHeroSequence() {
  try {
    sessionStorage.setItem('portfolio_has_seen_intro', 'true');
  } catch (e) {}
  resetHeroAndCharacter();
  if (!heroTextWrapper || !line1ContentEl || !line2PrefixEl || !line2HighlightEl || !cursor1El || !cursor2El) return;

  cursor1El.classList.remove('hidden');

  const kickerItems = heroKickerEl ? heroKickerEl.querySelectorAll('.kicker-word, .kicker-dot') : [];
  if (kickerItems.length > 0) {
    gsap.set(kickerItems, { opacity: 0, y: 6 });
  }

  // Step 1: Type "Hi, I'm Rushabh"
  typewriterTimeout = setTimeout(() => {
    typeTextToElement(line1ContentEl, PHRASE_1, () => {
      // Step 2: Brief pause, switch cursor to line 2
      typewriterTimeout = setTimeout(() => {
        cursor1El.classList.add('hidden');
        cursor2El.classList.remove('hidden');

          // Step 3: Type "an" then "Interaction designer"
          typewriterTimeout = setTimeout(() => {
            typeTextToElement(line2PrefixEl, PHRASE_2_PREFIX, () => {
              typewriterTimeout = setTimeout(() => {
                typeTextToElement(line2HighlightEl, PHRASE_2_HIGHLIGHT, () => {
                  // Step 4: Reveal portrait on right (desktop) or above (mobile)
                  typewriterTimeout = setTimeout(() => {
                  const isMobile = window.innerWidth <= 900;

                  if (heroCenterAnchorEl) {
                    gsap.to(heroCenterAnchorEl, {
                      y: 0,
                      duration: isMobile ? 0.95 : 1.05,
                      ease: 'power3.out'
                    });
                  }

                  if (portraitWrapper) {
                    portraitWrapper.style.overflow = 'visible';
                    
                    if (isMobile) {
                      portraitWrapper.style.width = '';
                      portraitWrapper.style.margin = '';
                      // On mobile: expand height from 0 to 200px - smoothly pushes text DOWN below portrait
                      gsap.to(portraitWrapper, {
                        height: 200,
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.88,
                        ease: 'power3.out',
                        onComplete: () => {
                          portraitWrapper.style.height = '';
                          portraitWrapper.style.overflow = '';
                          // Step 5: Portrait character smile settles cleanly
                          if (portraitSmile) {
                            gsap.set(portraitSmile, { scaleX: 1, scaleY: 1, transformOrigin: '242.5px 424px' });
                          }
                          // Step 6: Reveal subtitle & previously worked with firm logos
                          typewriterTimeout = setTimeout(() => {
                            if (heroSubdescriptionEl) {
                              gsap.to(heroSubdescriptionEl, {
                                opacity: 1, y: 0, duration: 0.65, ease: 'power2.out'
                              });
                            }
                            const credentialShowcases = [firmsShowcaseEl, educationShowcaseEl].filter(Boolean);
                            if (credentialShowcases.length > 0) {
                              gsap.to(credentialShowcases, {
                                opacity: 1,
                                y: 0,
                                duration: 0.65,
                                stagger: 0.12,
                                delay: 0.1,
                                ease: 'power2.out',
                                onComplete: () => {
                                  const kickerItems = heroKickerEl ? heroKickerEl.querySelectorAll('.kicker-word, .kicker-dot') : [];
                                  if (kickerItems.length > 0) {
                                    gsap.to(kickerItems, {
                                      opacity: 1,
                                      y: 0,
                                      duration: 0.45,
                                      stagger: 0.14,
                                      ease: 'power2.out',
                                      onComplete: () => {
                                        isHeroSequenceComplete = true;
                                        revealWorksShowcase();
                                      }
                                    });
                                  } else {
                                    isHeroSequenceComplete = true;
                                    revealWorksShowcase();
                                  }
                                }
                              });
                            } else {
                              isHeroSequenceComplete = true;
                              revealWorksShowcase();
                            }
                          }, 200);
                        }
                      });
                    } else {
                      // Desktop: natural horizontal expansion pushing text left
                      gsap.set(portraitWrapper, { width: 'auto' });
                      const naturalWidth = portraitWrapper.scrollWidth || portraitWrapper.offsetWidth;
                      gsap.set(portraitWrapper, { width: 0 });
                      
                      // Smoothly expand the portrait container - this pushes text left
                      gsap.to(portraitWrapper, {
                        width: naturalWidth,
                        duration: 0.85,
                        ease: 'power3.out',
                        onComplete: () => {
                          portraitWrapper.style.width = '';
                          portraitWrapper.style.overflow = '';
                        }
                      });
                      
                      // Fade in and scale the portrait
                      gsap.to(portraitWrapper, {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.72,
                        ease: 'back.out(1.5)',
                        onComplete: () => {
                        // Step 5: Portrait character smile settles cleanly
                        if (portraitSmile) {
                          gsap.set(portraitSmile, { scaleX: 1, scaleY: 1, transformOrigin: '242.5px 424px' });
                        }
                        // Step 6: Reveal subtitle & previously worked with firm logos
                        typewriterTimeout = setTimeout(() => {
                          if (heroSubdescriptionEl) {
                            gsap.to(heroSubdescriptionEl, {
                              opacity: 1, y: 0, duration: 0.65, ease: 'power2.out'
                            });
                          }
                          const credentialShowcases = [firmsShowcaseEl, educationShowcaseEl].filter(Boolean);
                          if (credentialShowcases.length > 0) {
                            gsap.to(credentialShowcases, {
                              opacity: 1,
                              y: 0,
                              duration: 0.65,
                              stagger: 0.12,
                              delay: 0.1,
                              ease: 'power2.out',
                              onComplete: () => {
                                // Step 7: Final flourish - Reveal "Architect • Explorer • Traveller" one by one
                                const kickerItems = heroKickerEl ? heroKickerEl.querySelectorAll('.kicker-word, .kicker-dot') : [];
                                if (kickerItems.length > 0) {
                                  gsap.to(kickerItems, {
                                    opacity: 1,
                                    y: 0,
                                    duration: 0.45,
                                    stagger: 0.14,
                                    ease: 'power2.out',
                                    onComplete: () => {
                                      isHeroSequenceComplete = true;
                                      revealWorksShowcase();
                                      if (bottomScrollPromptEl) {
                                        bottomScrollPromptEl.classList.add('visible');
                                        gsap.to(bottomScrollPromptEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                                      }
                                    }
                                  });
                                } else {
                                  isHeroSequenceComplete = true;
                                  revealWorksShowcase();
                                  if (bottomScrollPromptEl) {
                                    bottomScrollPromptEl.classList.add('visible');
                                    gsap.to(bottomScrollPromptEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                                  }
                                }
                              }
                            });
                          } else {
                            isHeroSequenceComplete = true;
                            revealWorksShowcase();
                            if (bottomScrollPromptEl) {
                              bottomScrollPromptEl.classList.add('visible');
                              gsap.to(bottomScrollPromptEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
                            }
                          }
                        }, 200);
                      }
                    });
                  }
                  } else {
                    isHeroSequenceComplete = true;
                    revealWorksShowcase();
                  }
                }, 240);
              });
            }, 90);
          });
        }, 120);
      }, 200);
    });
  }, 350);
}


// Choreographed Multi-Phase Opening Sequence
function playOpeningSequence() {
  if (animTimeline) {
    animTimeline.kill();
  }
  resetHeroAndCharacter();

  animState.dotsOpacity = 0;
  animState.wavePower = 0;
  animState.linesProgress = 0;
  animState.linesOpacity = 0;
  animState.globalReveal = 1.0; // Start fully revealed across the screen

  animTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' }
  });

  // PHASE 1: Dots fade in across the entire infinite screen
  animTimeline.to(animState, {
    dotsOpacity: 1,
    duration: 1.6,
    ease: 'power2.out'
  });

  // PHASE 2: Dots start floating and moving in 3D (wave starts)
  // Typewriter starts early right as the wave starts flowing
  animTimeline.to(
    animState,
    {
      wavePower: 1,
      duration: 2.6,
      ease: 'sine.inOut',
      onStart: () => {
        startHeroSequence();
      }
    },
    '+=0.2'
  );

  // PHASE 3: Lines slowly form one by one, connecting the entire moving fabric
  animTimeline.to(
    animState,
    {
      linesOpacity: 1,
      linesProgress: 1,
      duration: 3.2,
      ease: 'power1.inOut'
    },
    '-=1.2'
  );

  // PHASE 4: Gradually dissolve the outer mesh, keeping ONLY the mesh near the cursor visible
  animTimeline.to(
    animState,
    {
      globalReveal: 0.0,
      duration: 2.4,
      ease: 'power2.inOut'
    },
    '+=0.6' // hold so the interaction designer text and full mesh settle together
  );
}

// Render and Continuous 3D Simulation Loop
function render(now) {
  const deltaSec = Math.min(0.08, (now - lastFrameTime) * 0.001);
  lastFrameTime = now;

  // Full flow during intro animation; otherwise driven by hover activity
  const effectiveTargetSpeed = (animState.globalReveal > 0.1) ? 1.0 : targetFlowSpeed;
  
  // Asymmetric physics: fast pickup on move (0.10), slow cinematic coasting on stop (0.02)
  const lerpRate = (effectiveTargetSpeed > flowSpeed) ? 0.10 : 0.02;
  flowSpeed += (effectiveTargetSpeed - flowSpeed) * lerpRate;

  // Advance simulation time only when hover movement is active
  simTime += deltaSec * flowSpeed;
  const t = simTime;

  ctx.clearRect(0, 0, width, height);

  // Smooth drag inertia & pan lerping
  if (!pan.isDragging) {
    pan.targetX += pan.velocityX;
    pan.targetY += pan.velocityY;
    pan.velocityX *= 0.94; // damping
    pan.velocityY *= 0.94;
  }

  pan.x += (pan.targetX - pan.x) * 0.12;
  pan.y += (pan.targetY - pan.y) * 0.12;

  // Mouse wind tracking
  mouse.x += (mouse.targetX - mouse.x) * 0.05;
  mouse.y += (mouse.targetY - mouse.y) * 0.05;

  // Smooth screen-space cursor & spotlight position tracking
  screenMouse.x += (screenMouse.targetX - screenMouse.x) * 0.2;
  screenMouse.y += (screenMouse.targetY - screenMouse.y) * 0.2;

  const isMobile = window.innerWidth <= 768;
  if (cursorEl) {
    if (isMobile) {
      cursorEl.style.display = 'none';
    } else {
      cursorEl.style.display = '';
      cursorEl.style.transform = `translate3d(${screenMouse.targetX}px, ${screenMouse.targetY}px, 0)`;
    }
  }

  const fov = 750;
  const centerX = width / 2;
  const centerY = height / 2;
  const wavePower = animState.wavePower;
  const globalReveal = animState.globalReveal;
  const spotlightX = screenMouse.x;
  const spotlightY = screenMouse.y;
  const oppSpotlightX = width - spotlightX;
  const oppSpotlightY = height - spotlightY;
  const currentHoverRadius = getHoverRadius();
  const OPP_HOVER_RADIUS = isMobile ? 0 : currentHoverRadius * 0.68; // Removed opposite spotlight on phone
  const GRAVITY_RADIUS = currentHoverRadius * 1.15;
  const cellSize = getCellSize();

  // 2D Array of projected points for current frame
  const points = [];

  // Compute 3D physics coordinates for all visible + buffer points
  for (let r = 0; r < ROWS; r++) {
    const rowPoints = [];
    const actualR = r + startRowOffset;

    for (let c = 0; c < COLS; c++) {
      const actualC = c + startColOffset;

      // Base coordinate with infinite pan wrapping
      let baseX = actualC * cellSize + pan.x;
      let baseY = actualR * cellSize + pan.y;

      // Modulo wrap to make dragging truly infinite across screen
      baseX = ((((baseX + width) % gridWidth) + gridWidth) % gridWidth) - width * 0.5;
      baseY = ((((baseY + height) % gridHeight) + gridHeight) % gridHeight) - height * 0.4;

      // Normalized coordinates relative to screen center
      const normX = (baseX - centerX) / (width * 0.5);
      const normY = (baseY - centerY) / (height * 0.5);

      // Multi-harmonic traveling fabric waves (flowing air silk)
      const wave1 = Math.sin(t * 1.1 - normX * 2.5 - normY * 1.8);
      const wave2 = Math.cos(t * 1.5 + normX * 3.2 - normY * 2.4);
      const wave3 = Math.sin(t * 0.75 + normY * 2.0);

      // Gravitational Pull / Spacetime Inward Funnel (matching reference curvature)
      const dx0 = baseX - spotlightX;
      const dy0 = baseY - spotlightY;
      const distFromCursor = Math.hypot(dx0, dy0);
      const GRAVITY_RADIUS = HOVER_RADIUS * 1.15;

      let gravityDepth = 0;
      let pullX = 0;
      let pullY = 0;

      if (distFromCursor < GRAVITY_RADIUS) {
        const normDist = distFromCursor / GRAVITY_RADIUS;
        // Smooth continuous cosine curve (1.0 at center -> 0.0 at perimeter)
        const curve = 0.5 * (1 + Math.cos(normDist * Math.PI));

        // 1. Z-depth inward depression (3D funnel into the screen)
        gravityDepth = curve * 115;

        // 2. Inward radial curvature pull (smooth parabolic bowing toward cursor)
        const pullFactor = curve * 0.24;
        pullX = -dx0 * pullFactor;
        pullY = -dy0 * pullFactor;
      }

      // 3. Central Textile / Cloth Pulled from Middle Bottom Towards TOP
      if (animState.transitionPull !== 0) {
        const pullCenterX = centerX;
        const pullCenterY = height * 0.92; // Middle bottom
        const dxCloth = baseX - pullCenterX;
        const dyCloth = baseY - pullCenterY;
        const distToCloth = Math.hypot(dxCloth, dyCloth);
        const maxClothRadius = width * 0.95;

        if (distToCloth < maxClothRadius) {
          const clothWeight = Math.pow(Math.cos((distToCloth / maxClothRadius) * (Math.PI * 0.5)), 1.6);
          // Pull fabric UPWARDS toward the top with silk tension
          pullY -= animState.transitionPull * clothWeight * 2.2;
          pullX += (pullCenterX - baseX) * (animState.transitionPull / 240) * clothWeight * 0.35;
          gravityDepth += animState.transitionPull * clothWeight * 0.85;
        }
      }

      // 3D Depth displacement (wave + gravitational funnel + textile pull)
      const z = (wave1 * 60 + wave2 * 25 + wave3 * 15) * wavePower + gravityDepth;

      // Lateral floating wind sway + gravitational curvature pull
      const dx = (Math.sin(t * 0.85 + normY * 2.2) * 10 + mouse.x * (normY + 1) * 14) * wavePower + pullX;
      const dy = (Math.cos(t * 0.95 - normX * 1.8) * 8 + mouse.y * (normX + 1) * 12) * wavePower + pullY;

      // 3D Perspective Projection
      const scale = fov / (fov + z);
      const projX = centerX + (baseX - centerX + dx) * scale;
      const projY = centerY + (baseY - centerY + dy) * scale;

      // Distance from center for radial sequential line connection
      const distFromCenter = Math.sqrt(normX * normX + normY * normY);

      // Proximity to primary cursor spotlight & smaller balanced opposite diagonal spotlight
      const distToCursor = Math.hypot(projX - spotlightX, projY - spotlightY);
      const distToOpp = Math.hypot(projX - oppSpotlightX, projY - oppSpotlightY);
      let proximity = 0;
      if (distToCursor < currentHoverRadius) {
        const normDist = distToCursor / currentHoverRadius;
        proximity = Math.max(proximity, 0.5 * (1 + Math.cos(normDist * Math.PI)));
      }
      if (OPP_HOVER_RADIUS > 0 && distToOpp < OPP_HOVER_RADIUS) {
        const normDist = distToOpp / OPP_HOVER_RADIUS;
        const oppProx = 0.5 * (1 + Math.cos(normDist * Math.PI)) * 0.88;
        proximity = Math.max(proximity, oppProx);
      }

      const visibility = Math.max(globalReveal, proximity);

      rowPoints.push({
        x: projX,
        y: projY,
        z,
        scale,
        normX,
        normY,
        distFromCenter,
        distToCursor,
        proximity,
        visibility,
        actualR,
        actualC,
        valid: true
      });
    }
    points.push(rowPoints);
  }

  // Update lingering trail of interaction design keywords across both zones
  updateGridHighlights(points, spotlightX, spotlightY, oppSpotlightX, oppSpotlightY, now);

  // 1. Render Connecting Lines (Horizontal & Vertical)
  if (animState.linesProgress > 0 && animState.linesOpacity > 0) {
    ctx.lineWidth = 1;

    const isDark = document.body.classList.contains('dark-theme');
    const lineRgb = isDark ? '167, 139, 250' : '105, 59, 254';
    const dotRgb = isDark ? '224, 231, 255' : '105, 59, 254';

    const maxLineRadius = 2.4;
    const currentMaxProg = animState.linesProgress * maxLineRadius;

    // A. Horizontal Lines
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 1; c++) {
        const p1 = points[r][c];
        const p2 = points[r][c + 1];

        // Skip wrapped screen jumps across canvas boundaries
        if (Math.hypot(p2.x - p1.x, p2.y - p1.y) > width * 0.25) continue;

        // Line visibility based on dual spotlights (cursor + smaller opposite)
        const lineMidX = (p1.x + p2.x) * 0.5;
        const lineMidY = (p1.y + p2.y) * 0.5;
        const lineDistToCursor = Math.hypot(lineMidX - spotlightX, lineMidY - spotlightY);
        const lineDistToOpp = Math.hypot(lineMidX - oppSpotlightX, lineMidY - oppSpotlightY);
        
        let lineProximity = 0;
        if (lineDistToCursor < currentHoverRadius) {
          const normDist = lineDistToCursor / currentHoverRadius;
          lineProximity = Math.max(lineProximity, 0.5 * (1 + Math.cos(normDist * Math.PI)));
        }
        if (OPP_HOVER_RADIUS > 0 && lineDistToOpp < OPP_HOVER_RADIUS) {
          const normDist = lineDistToOpp / OPP_HOVER_RADIUS;
          const oppLineProx = 0.5 * (1 + Math.cos(normDist * Math.PI)) * 0.88;
          lineProximity = Math.max(lineProximity, oppLineProx);
        }

        const lineVisibility = Math.max(globalReveal, lineProximity);
        if (lineVisibility <= 0.005) continue;

        // Radial outward connection cascade
        const dist = Math.min(p1.distFromCenter, p2.distFromCenter);
        if (currentMaxProg >= dist) {
          const drawRatio = Math.min(1, (currentMaxProg - dist) / 0.25);

          // Subtle tinted delicate line
          const baseAlpha = 0.048 * animState.linesOpacity * lineVisibility;
          const depthAlpha = baseAlpha * (0.8 + (p1.scale - 1) * 1.2);
          const finalAlpha = Math.max(0.004, Math.min(isDark ? 0.16 : 0.095, depthAlpha * (isDark ? 1.55 : 1)));

          ctx.strokeStyle = `rgba(${lineRgb}, ${finalAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p1.x + (p2.x - p1.x) * drawRatio, p1.y + (p2.y - p1.y) * drawRatio);
          ctx.stroke();
        }
      }
    }

    // B. Vertical Lines
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 1; r++) {
        const p1 = points[r][c];
        const p2 = points[r + 1][c];

        // Skip wrapped screen jumps across canvas boundaries
        if (Math.hypot(p2.x - p1.x, p2.y - p1.y) > height * 0.25) continue;

        const lineMidX = (p1.x + p2.x) * 0.5;
        const lineMidY = (p1.y + p2.y) * 0.5;
        const lineDistToCursor = Math.hypot(lineMidX - spotlightX, lineMidY - spotlightY);
        const lineDistToOpp = Math.hypot(lineMidX - oppSpotlightX, lineMidY - oppSpotlightY);
        
        let lineProximity = 0;
        if (lineDistToCursor < currentHoverRadius) {
          const normDist = lineDistToCursor / currentHoverRadius;
          lineProximity = Math.max(lineProximity, 0.5 * (1 + Math.cos(normDist * Math.PI)));
        }
        if (OPP_HOVER_RADIUS > 0 && lineDistToOpp < OPP_HOVER_RADIUS) {
          const normDist = lineDistToOpp / OPP_HOVER_RADIUS;
          const oppLineProx = 0.5 * (1 + Math.cos(normDist * Math.PI)) * 0.88;
          lineProximity = Math.max(lineProximity, oppLineProx);
        }

        const lineVisibility = Math.max(globalReveal, lineProximity);
        if (lineVisibility <= 0.005) continue;

        const dist = Math.min(p1.distFromCenter, p2.distFromCenter);
        if (currentMaxProg >= dist) {
          const drawRatio = Math.min(1, (currentMaxProg - dist) / 0.25);

          const baseAlpha = 0.048 * animState.linesOpacity * lineVisibility;
          const depthAlpha = baseAlpha * (0.8 + (p1.scale - 1) * 1.2);
          const finalAlpha = Math.max(0.004, Math.min(isDark ? 0.16 : 0.095, depthAlpha * (isDark ? 1.55 : 1)));

          ctx.strokeStyle = `rgba(${lineRgb}, ${finalAlpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p1.x + (p2.x - p1.x) * drawRatio, p1.y + (p2.y - p1.y) * drawRatio);
          ctx.stroke();
        }
      }
    }
  }

  // 2. Render Grid of Dots
  if (animState.dotsOpacity > 0) {
    const isDark = document.body.classList.contains('dark-theme');
    const dotRgb = isDark ? '224, 231, 255' : '105, 59, 254';

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const p = points[r][c];

        // Skip points outside screen bounds
        if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) continue;

        // Skip points outside reveal / spotlight radius
        if (p.visibility <= 0.005) continue;

        const dotAlpha = ((isDark ? 0.42 : 0.28) * animState.dotsOpacity * p.visibility).toFixed(3);
        ctx.fillStyle = `rgba(${dotRgb}, ${dotAlpha})`;

        const baseDotRadius = isMobile ? 0.9 : 1.35;
        const radius = baseDotRadius * (p.scale || 1) * (0.55 + 0.45 * p.visibility);
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // 3. Floating keywords removed per user request
  trailKeywordNodes = [];

  requestAnimationFrame(render);
}

// =========================================================
// SAJAG SCREEN SHOWCASE CONTROLLER (sajag-animation-kit)
// =========================================================
function initSajagShowcase() {
  const stage = document.getElementById('stage');
  const outside = document.getElementById('outside');
  const win = document.getElementById('window');
  const current = document.getElementById('current');
  const captionEl = document.getElementById('carouselCaption');
  const phoneCol = document.querySelector('.carousel-phone-col');

  if (!stage || !outside || !win) return;

  const SCREENS = [
    { id: "home", label: "Home", caption: "Your city, connected", src: "assets/sajag-animation-kit/assets/screens/01-home.png" },
    { id: "voice", label: "Voice", caption: "Just say it", src: "assets/sajag-animation-kit/assets/screens/06-voice.png" },
    { id: "parking", label: "Parking", caption: "Parking, simplified", src: "assets/sajag-animation-kit/assets/screens/03-parking.png" },
    { id: "transit", label: "Transit", caption: "Journeys, simplified", src: "assets/sajag-animation-kit/assets/screens/02-transit.png" },
    { id: "safety", label: "Safety", caption: "Feel safer", src: "assets/sajag-animation-kit/assets/screens/04-safety.png" },
    { id: "city-makers", label: "City Makers", caption: "Small acts, impact", src: "assets/sajag-animation-kit/assets/screens/05-city-makers.png" },
    { id: "kannada", label: "Kannada", caption: "Feel at home", src: "assets/sajag-animation-kit/assets/screens/07-kannada.png" }
  ];

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  outside.innerHTML = '';
  win.innerHTML = '';

  const nodes = SCREENS.map((s) =>
    [outside, win].map((parent) => {
      const card = document.createElement('div');
      card.className = 'screen';
      card.setAttribute('data-screen-id', s.id);
      const img = new Image();
      img.src = s.src;
      img.alt = s.label;
      img.draggable = false;
      card.appendChild(img);
      parent.appendChild(card);
      return card;
    })
  );

  let gap = 260;
  let phase = 0;
  let elapsed = 0;
  let inView = true;
  let busy = false;
  let last = 0;
  let raf = null;
  let shown = -1;
  let isHovered = false;
  let isFocused = false;
  let isInteracting = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let captionFadeTimeout = null;

  function updateCaption(newIndex) {
    if (!captionEl) return;
    const currentScreen = SCREENS[newIndex];
    if (!currentScreen) return;
    const targetText = currentScreen.caption || currentScreen.label;
    if (captionEl.textContent === targetText) return;

    if (captionFadeTimeout) clearTimeout(captionFadeTimeout);
    captionEl.classList.add('is-fading');
    captionFadeTimeout = setTimeout(() => {
      captionEl.textContent = targetText;
      captionEl.classList.remove('is-fading');
    }, 180);
  }

  const mod = (a, n) => ((a % n) + n) % n;

  function measure() {
    if (!stage) return;
    const stageWidth = stage.clientWidth || 400;
    const isMobile = stageWidth < 640;
    // Central phone frame width
    const frameW = isMobile
      ? Math.min(220, Math.max(160, stageWidth * 0.48))
      : Math.min(256, Math.max(220, stageWidth * 0.52));
    const frameH = (frameW * 558) / 287;
    const screenW = (frameW * 254) / 287;
    const screenH = (frameW * 508) / 287;
    const offY = (frameW * 11) / 287;
    gap = screenW + Math.max(18, screenW * (isMobile ? 0.16 : 0.22));

    stage.style.height = `${frameH + (isMobile ? 20 : 28)}px`;
    stage.style.setProperty('--fw', `${frameW}px`);
    stage.style.setProperty('--fh', `${frameH}px`);
    stage.style.setProperty('--sw', `${screenW}px`);
    stage.style.setProperty('--sh', `${screenH}px`);
    stage.style.setProperty('--off-y', `${offY}px`);
    paint();
  }

  function paint() {
    SCREENS.forEach((s, i) => {
      const slot = mod(-i + phase + SCREENS.length / 2, SCREENS.length) - SCREENS.length / 2;
      const dist = Math.abs(slot);
      const focus = Math.max(0, 1 - dist);
      const scale = 0.88 + 0.12 * focus;

      // Central phone stays crisp and prominent (scale 1.0, opacity 1.0)
      // Adjacent screens are slightly smaller (scale 0.88) and faded (opacity ~0.42)
      let opacity = 0;
      if (dist <= 1.0) {
        opacity = 0.42 + 0.58 * (1.0 - dist);
      } else if (dist < 2.0) {
        const travel = (2.0 - dist) / 1.0;
        opacity = 0.42 * travel;
      } else {
        opacity = 0;
      }

      nodes[i].forEach((n) => {
        n.style.transform = `translate(-50%, -50%) translateX(${slot * gap}px) scale(${scale})`;
        n.style.opacity = String(opacity);
        n.style.visibility = opacity <= 0.005 ? 'hidden' : 'visible';
      });
    });

    const active = mod(Math.round(phase), SCREENS.length);
    if (active !== shown) {
      shown = active;
      if (current) current.textContent = `${SCREENS[active].label} - ${SCREENS[active].caption}`;
      updateCaption(active);
    }
  }

  // Smooth ease-in-out
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function move(direction = 1) {
    if (busy) return;
    busy = true;
    elapsed = 0;
    const start = phase;
    const end = Math.round(phase) + direction;
    // 0.5-second smooth transition
    const duration = reduced.matches ? 0 : 500;
    let begin = null;

    if (duration === 0) {
      phase = mod(end, SCREENS.length);
      busy = false;
      paint();
      return;
    }

    function tick(now) {
      if (begin === null) begin = now;
      const t = Math.min((now - begin) / duration, 1);
      phase = start + (end - start) * ease(t);
      paint();
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        phase = mod(end, SCREENS.length);
        busy = false;
        elapsed = 0;
        paint();
      }
    }
    requestAnimationFrame(tick);
  }

  function loop(now) {
    const dt = last ? Math.min(now - last, 100) : 0;
    last = now;

    // Advance automatically every 2 seconds: 1.5s stationary + 0.5s transition
    // Pauses when hovering, focused, dragging, tab hidden, offscreen, or prefers-reduced-motion
    const isSuspended = busy || isHovered || isFocused || isInteracting || !inView || document.hidden || reduced.matches;
    if (!isSuspended) {
      elapsed += dt;
      if (elapsed >= 1500) {
        move(1);
      }
    }
    raf = requestAnimationFrame(loop);
  }

  // Hover pauses autoplay
  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; elapsed = 0; });
  if (phoneCol) {
    phoneCol.addEventListener('mouseenter', () => { isHovered = true; });
    phoneCol.addEventListener('mouseleave', () => { isHovered = false; elapsed = 0; });
  }

  // Focus pauses autoplay
  stage.addEventListener('focusin', () => { isFocused = true; });
  stage.addEventListener('focusout', () => { isFocused = false; elapsed = 0; });

  // Keyboard navigation
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      elapsed = 0;
      move(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      elapsed = 0;
      move(-1);
    }
  });

  // Touch swipe navigation for mobile
  stage.addEventListener('touchstart', (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
      isInteracting = true;
    }
  }, { passive: true });

  stage.addEventListener('touchend', (e) => {
    isInteracting = false;
    if (e.changedTouches && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
        elapsed = 0;
        move(dx < 0 ? 1 : -1);
      }
    }
  }, { passive: true });

  // Tab hidden / visibility change: reset elapsed and timestamp to resume normally without replaying
  document.addEventListener('visibilitychange', () => {
    elapsed = 0;
    last = performance.now();
  });
  window.addEventListener('blur', () => {
    elapsed = 0;
  });
  window.addEventListener('focus', () => {
    elapsed = 0;
    last = performance.now();
  });

  reduced.addEventListener('change', () => {
    elapsed = 0;
  });

  const ro = new ResizeObserver(measure);
  ro.observe(stage);

  const io = new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    elapsed = 0;
    last = performance.now();
  }, { threshold: 0.15 });
  io.observe(stage);

  Promise.all(
    Array.from(document.querySelectorAll('.stage img, .frame img')).map((img) => img.decode().catch(() => {}))
  ).then(() => {
    measure();
    raf = requestAnimationFrame(loop);
  });

  window.addEventListener('pagehide', () => {
    if (raf) cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
  });
}

// =========================================================
// FIGMA-STYLE PROJECT SHOWCASE REVEAL CONTROLLER
// Repeatable on entry (scrolling down or up); clean offscreen reset
// =========================================================
function initProjectShowcase() {
  const projects = document.querySelectorAll('.project-row');
  if (!projects.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Clear previous session storage keys so animation repeats whenever scrolled into view
  try {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('portfolio_revealed')) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (e) {}

  // Map to track active GSAP timelines per project row
  const activeTimelines = new Map();

  function disableKeyboardAccess(row) {
    const interactive = row.querySelectorAll('a, button, [tabindex]');
    interactive.forEach((el) => {
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
    });
  }

  function enableKeyboardAccess(row) {
    const interactive = row.querySelectorAll('a, button, [tabindex]');
    interactive.forEach((el) => {
      el.removeAttribute('tabindex');
      el.removeAttribute('aria-hidden');
    });
  }

  // Calculate and display the REAL pixel dimensions of the area the rectangle covers
  function updateProjectBadgeDimensions(row) {
    const container = row.querySelector('.project-frame-container');
    const badge = row.querySelector('.figma-dimension-badge');
    if (!container || !badge) return;
    const rect = container.getBoundingClientRect();
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);
    if (width > 0 && height > 0) {
      badge.textContent = `${width} × ${height}`;
    }
  }

  function updateAllProjectDimensions() {
    projects.forEach((row) => updateProjectBadgeDimensions(row));
  }

  // Extract each discrete text element in natural reading order for one-by-one waterfall entrance
  function getInfoElements(row) {
    const info = row.querySelector('.project-info-column');
    if (!info) return [];
    const list = [];
    const title = info.querySelector('.project-title');
    if (title) list.push(title);
    const lead = info.querySelector('.project-lead');
    if (lead) list.push(lead);
    const descParagraphs = info.querySelectorAll('.project-description p');
    descParagraphs.forEach((p) => list.push(p));
    const metadata = info.querySelector('.project-metadata');
    if (metadata) list.push(metadata);
    const tags = info.querySelectorAll('.project-tags .project-tag');
    tags.forEach((tag) => list.push(tag));
    const cta = info.querySelector('.project-cta-wrapper');
    if (cta) list.push(cta);
    return list;
  }

  function setImmediateComplete(row) {
    row.setAttribute('data-state', 'complete');
    row.classList.add('is-complete');
    updateProjectBadgeDimensions(row);

    const metaTop = row.querySelector('.figma-frame-meta-top');
    const metaBottom = row.querySelector('.figma-frame-meta-bottom');
    const box = row.querySelector('.figma-selection-box');
    const img = row.querySelector('.project-image');
    const handles = row.querySelectorAll('.figma-handle');
    const crosshair = row.querySelector('.figma-crosshair');
    const info = row.querySelector('.project-info-column');
    const infoElements = getInfoElements(row);

    if (metaTop) {
      metaTop.style.visibility = 'visible';
      metaTop.style.opacity = '1';
    }
    if (metaBottom) {
      metaBottom.style.visibility = 'visible';
      metaBottom.style.opacity = '1';
    }
    if (box) {
      box.style.visibility = 'visible';
      box.style.opacity = '1';
      box.style.width = '100%';
      box.style.height = '100%';
      box.style.backgroundColor = 'transparent';
    }
    if (img) {
      img.style.visibility = 'visible';
      img.style.opacity = '1';
      if (img.tagName === 'VIDEO' && img.paused) {
        img.play().catch(() => {});
      }
    }
    if (crosshair) {
      crosshair.style.opacity = '0';
      crosshair.style.visibility = 'hidden';
    }
    handles.forEach((h) => {
      h.style.opacity = '1';
      h.style.visibility = 'visible';
    });
    if (info) {
      info.style.visibility = 'visible';
      info.style.opacity = '1';
      info.style.transform = 'translateY(0)';
      info.style.pointerEvents = 'auto';
    }
    infoElements.forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    enableKeyboardAccess(row);
  }

  // Reset row to idle state completely offscreen without layout collapse
  function resetToIdle(row) {
    row.setAttribute('data-state', 'idle');
    row.classList.remove('is-complete');

    const metaTop = row.querySelector('.figma-frame-meta-top');
    const metaBottom = row.querySelector('.figma-frame-meta-bottom');
    const box = row.querySelector('.figma-selection-box');
    const img = row.querySelector('.project-image');
    const handles = row.querySelectorAll('.figma-handle');
    const crosshair = row.querySelector('.figma-crosshair');
    const info = row.querySelector('.project-info-column');
    const infoElements = getInfoElements(row);

    if (box) {
      gsap.killTweensOf(box);
      box.style.width = '0%';
      box.style.height = '0%';
      box.style.opacity = '0';
      box.style.visibility = 'hidden';
      box.style.backgroundColor = 'rgba(0, 102, 255, 0.04)';
    }
    if (crosshair) {
      gsap.killTweensOf(crosshair);
      crosshair.style.opacity = '0';
      crosshair.style.visibility = 'hidden';
    }
    handles.forEach((h) => {
      gsap.killTweensOf(h);
      h.style.opacity = '0';
      h.style.visibility = 'hidden';
    });
    if (metaTop) {
      gsap.killTweensOf(metaTop);
      metaTop.style.opacity = '0';
      metaTop.style.visibility = 'hidden';
    }
    if (metaBottom) {
      gsap.killTweensOf(metaBottom);
      metaBottom.style.opacity = '0';
      metaBottom.style.visibility = 'hidden';
    }
    if (img) {
      gsap.killTweensOf(img);
      img.style.opacity = '0';
      img.style.visibility = 'hidden';
      if (img.tagName === 'VIDEO' && !img.paused) {
        img.pause();
      }
    }
    if (info) {
      gsap.killTweensOf(info);
      info.style.opacity = '0';
      info.style.visibility = 'hidden';
      info.style.pointerEvents = 'none';
      info.style.transform = 'translateY(0)';
    }
    infoElements.forEach((el) => {
      gsap.killTweensOf(el);
      el.style.opacity = '0';
      el.style.transform = 'translateY(18px)';
    });

    disableKeyboardAccess(row);
  }

  function triggerProject(row) {
    const currentState = row.getAttribute('data-state');
    if (currentState && currentState !== 'idle') return;

    row.setAttribute('data-state', 'drawing');

    if (reduced || typeof gsap === 'undefined') {
      setImmediateComplete(row);
      return;
    }

    const metaTop = row.querySelector('.figma-frame-meta-top');
    const metaBottom = row.querySelector('.figma-frame-meta-bottom');
    const box = row.querySelector('.figma-selection-box');
    const img = row.querySelector('.project-image');
    const handles = row.querySelectorAll('.figma-handle');
    const crosshair = row.querySelector('.figma-crosshair');
    const info = row.querySelector('.project-info-column');
    const infoElements = getInfoElements(row);

    const tl = gsap.timeline({
      onComplete: () => {
        row.setAttribute('data-state', 'complete');
        row.classList.add('is-complete');
        enableKeyboardAccess(row);
        activeTimelines.delete(row);
      }
    });

    activeTimelines.set(row, tl);

    // Initial state: crosshair appears at top-left corner
    tl.set(box, {
      visibility: 'visible',
      opacity: 1,
      width: '0%',
      height: '0%',
      backgroundColor: 'rgba(0, 102, 255, 0.04)'
    });
    tl.set(crosshair, {
      visibility: 'visible',
      opacity: 1
    });
    tl.set(handles, {
      opacity: 0,
      visibility: 'hidden'
    });
    tl.set([metaTop, metaBottom], {
      opacity: 0,
      visibility: 'hidden'
    });
    tl.set(img, {
      opacity: 0,
      visibility: 'hidden'
    });
    tl.set(info, {
      opacity: 0,
      visibility: 'hidden'
    });
    tl.set(infoElements, {
      opacity: 0,
      y: 18
    });

    // Step 2: Draw empty blue rectangle diagonally over ~900ms
    tl.to(box, {
      width: '100%',
      height: '100%',
      duration: 0.9,
      ease: 'power2.out'
    });

    // Step 3: Once rectangle is complete, reveal project name and year above it + bottom badge
    tl.call(() => {
      row.setAttribute('data-state', 'revealing');
      updateProjectBadgeDimensions(row);
    });

    tl.to([metaTop, metaBottom], {
      opacity: 1,
      duration: 0.25,
      ease: 'power1.out',
      onStart: () => {
        gsap.set([metaTop, metaBottom], { visibility: 'visible' });
      }
    });

    // Fade out crosshair and reveal corner handles
    tl.to(
      box,
      {
        backgroundColor: 'transparent',
        duration: 0.2
      },
      '<'
    );

    tl.to(
      crosshair,
      {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          gsap.set(crosshair, { visibility: 'hidden' });
        }
      },
      '<'
    );

    tl.to(
      handles,
      {
        opacity: 1,
        visibility: 'visible',
        duration: 0.25,
        stagger: 0.04,
        ease: 'power1.out'
      },
      '<'
    );

    // Step 4: Fade image into the frame over 300ms
    tl.to(img, {
      opacity: 1,
      duration: 0.3,
      ease: 'power1.out',
      onStart: () => {
        gsap.set(img, { visibility: 'visible' });
        if (img && img.tagName === 'VIDEO' && img.paused) {
          img.play().catch(() => {});
        }
      }
    });

    // Step 5: Reveal information on right ONE BY ONE with silky smooth transition
    tl.to(
      infoElements,
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.12,
        ease: 'power3.out',
        onStart: () => {
          gsap.set(info, { visibility: 'visible', opacity: 1, pointerEvents: 'auto' });
        }
      },
      '-=0.15'
    );
  }

  // Viewport tracking controller for repeatability and clean offscreen resets
  let isTicking = false;

  function evaluateProjects() {
    const vh = window.innerHeight;

    projects.forEach((row) => {
      if (reduced) {
        setImmediateComplete(row);
        return;
      }

      const rect = row.getBoundingClientRect();
      const visibleTop = Math.max(0, rect.top);
      const visibleBottom = Math.min(vh, rect.bottom);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);

      // Trigger threshold: 20% of section height, capped at 20% of viewport height
      const triggerThresholdPx = Math.min(rect.height * 0.20, vh * 0.20);
      const isCompletelyOffscreen = rect.bottom <= 0 || rect.top >= vh;
      const currentState = row.getAttribute('data-state') || 'idle';

      if (isCompletelyOffscreen) {
        // Entire section has left the viewport: cancel any in-progress animation and reset to idle
        if (activeTimelines.has(row)) {
          activeTimelines.get(row).kill();
          activeTimelines.delete(row);
        }
        if (currentState !== 'idle') {
          resetToIdle(row);
        }
      } else if (currentState === 'idle') {
        // Entering viewport (scrolling either DOWN or UP, or on initial page entry)
        if (visibleHeight >= triggerThresholdPx) {
          triggerProject(row);
        }
      }
      // If currently 'drawing', 'revealing', or 'complete', and still on screen, do not restart
    });

    isTicking = false;
  }

  const projectsSection = document.getElementById('projects');

  function updateSoftwareGridVisibility() {
    if (!projectsSection) return;
    const rect = projectsSection.getBoundingClientRect();
    // Only active when the user comes and scrolls down till this point, not above
    const isInView = rect.top < window.innerHeight * 0.85 && rect.bottom > 40;
    projectsSection.classList.toggle('is-software-grid-active', isInView);
  }

  function handleScrollOrResize() {
    updateAllProjectDimensions();
    updateSoftwareGridVisibility();
    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(evaluateProjects);
    }
  }

  window.addEventListener('scroll', handleScrollOrResize, { passive: true });
  window.addEventListener('resize', handleScrollOrResize, { passive: true });

  if (projectsSection && typeof IntersectionObserver !== 'undefined') {
    const gridObserver = new IntersectionObserver(() => {
      updateSoftwareGridVisibility();
    }, {
      root: null,
      threshold: [0, 0.05, 0.15, 0.3],
      rootMargin: '0px 0px -40px 0px'
    });
    gridObserver.observe(projectsSection);
  }

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(() => {
      updateAllProjectDimensions();
      updateSoftwareGridVisibility();
    });
    projects.forEach((row) => {
      const container = row.querySelector('.project-frame-container');
      if (container) resizeObserver.observe(container);
    });
  }

  // Initial setup: measure real pixel dimensions and initialize to idle or complete
  updateAllProjectDimensions();
  updateSoftwareGridVisibility();
  projects.forEach((row) => {
    if (reduced) {
      setImmediateComplete(row);
    } else {
      resetToIdle(row);
    }
  });

  // Evaluate immediately on initial page entry
  evaluateProjects();
}

// Interactive Mouse Wind & Custom Cursor Tracking
window.addEventListener('mousemove', (e) => {
  notifyMouseActivity();

  if (!screenMouse.isVisible) {
    screenMouse.isVisible = true;
    if (cursorEl) cursorEl.classList.add('active');
  }

  screenMouse.targetX = e.clientX;
  screenMouse.targetY = e.clientY;

  if (pan.isDragging) {
    const dx = e.clientX - pan.lastMouseX;
    const dy = e.clientY - pan.lastMouseY;

    pan.targetX += dx;
    pan.targetY += dy;
    pan.velocityX = dx;
    pan.velocityY = dy;

    pan.lastMouseX = e.clientX;
    pan.lastMouseY = e.clientY;
  }

  mouse.targetX = (e.clientX / width - 0.5) * 2;
  mouse.targetY = (e.clientY / height - 0.5) * 2;
});

// Dragging & Mouse Button States
window.addEventListener('mousedown', (e) => {
  notifyMouseActivity();
  if (cursorEl) cursorEl.classList.add('is-dragging');
  if (e.target.closest('#replayBtn')) return;
  pan.isDragging = true;
  pan.lastMouseX = e.clientX;
  pan.lastMouseY = e.clientY;
  pan.velocityX = 0;
  pan.velocityY = 0;
});

window.addEventListener('mouseup', () => {
  if (cursorEl) cursorEl.classList.remove('is-dragging');
  pan.isDragging = false;
});

window.addEventListener('mouseleave', () => {
  screenMouse.isVisible = false;
  if (cursorEl) cursorEl.classList.remove('active');
  pan.isDragging = false;
  targetFlowSpeed = 0.0;
  mouse.targetX = 0;
  mouse.targetY = 0;

  if (portraitPupils) {
    gsap.to(portraitPupils, { x: 0, y: 0, duration: 0.45, ease: 'power2.out' });
  }
});

window.addEventListener('mouseenter', () => {
  screenMouse.isVisible = true;
  if (cursorEl) cursorEl.classList.add('active');
  notifyMouseActivity();
});

// Touch Support for Mobile & Tablets
window.addEventListener('touchstart', (e) => {
  notifyMouseActivity();
  if (e.target.closest('#replayBtn')) return;
  if (e.touches.length === 1) {
    pan.isDragging = true;
    screenMouse.targetX = e.touches[0].clientX;
    screenMouse.targetY = e.touches[0].clientY;
    pan.lastMouseX = e.touches[0].clientX;
    pan.lastMouseY = e.touches[0].clientY;
    pan.velocityX = 0;
    pan.velocityY = 0;
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  notifyMouseActivity();
  if (e.touches.length === 1) {
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;


    screenMouse.targetX = tx;
    screenMouse.targetY = ty;

    if (pan.isDragging) {
      const dx = e.touches[0].clientX - pan.lastMouseX;
      const dy = e.touches[0].clientY - pan.lastMouseY;

      pan.targetX += dx;
      pan.targetY += dy;
      pan.velocityX = dx;
      pan.velocityY = dy;

      pan.lastMouseX = e.touches[0].clientX;
      pan.lastMouseY = e.touches[0].clientY;
    }
  }
}, { passive: true });

window.addEventListener('touchend', () => {
  pan.isDragging = false;
});

// Interactive Eye Tracking: Portrait eyes follow the cursor with natural micro-damping
function updateEyeTracking(mouseX, mouseY) {
  if (!portraitPupils || !portraitWrapper || !eyeFollowActive) return;

  const rect = portraitWrapper.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;

  // Approximate center of the eyes in screen coordinates
  const eyeCenterX = rect.left + rect.width * 0.49;
  const eyeCenterY = rect.top + rect.height * 0.23;

  const dx = mouseX - eyeCenterX;
  const dy = mouseY - eyeCenterY;
  const dist = Math.hypot(dx, dy);

  if (dist < 1) return;

  // Maximum micro-offset in SVG space (delicate, natural gaze)
  const maxShiftX = 2.2;
  const maxShiftY = 1.6;

  // Non-linear gaze responsiveness
  const factor = Math.min(dist / 420, 1);
  const targetX = (dx / dist) * maxShiftX * factor;
  const targetY = (dy / dist) * maxShiftY * factor;

  gsap.to(portraitPupils, {
    x: targetX,
    y: targetY,
    duration: 0.22,
    ease: 'power2.out',
    overwrite: 'auto'
  });
}

// Transition Between Home and Works: Cloth Pulled from Middle Bottom Towards TOP
function goToWorksScreen() {
  if (isWorksMode || isTransitioning) return;
  isTransitioning = true;
  isWorksMode = true;

  const homeNavEl = document.getElementById('navHome');
  const worksNavEl = document.getElementById('navWorks');
  const playgroundNavEl = document.getElementById('navPlayground');
  const aboutNavEl = document.getElementById('navAbout');
  const archNavEl = document.getElementById('navArchitecture');

  if (homeNavEl) homeNavEl.classList.remove('active');
  if (playgroundNavEl) playgroundNavEl.classList.remove('active');
  if (aboutNavEl) aboutNavEl.classList.remove('active');
  if (archNavEl) archNavEl.classList.remove('active');
  if (worksNavEl) worksNavEl.classList.add('active');

  // Clear all random words so the works screen is purely the clean interactive mesh
  trailKeywordNodes = [];

  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
      if (worksScreenEl) worksScreenEl.classList.add('active');
    }
  });

  // Textile pull: Fabric gets pulled from middle-bottom towards TOP
  tl.to(animState, {
    transitionPull: 330,
    duration: 0.75,
    ease: 'power3.inOut'
  })
  .to(heroContainer, {
    y: -140, // pulled upward toward top with the rising textile wave
    scaleY: 1.08,
    scaleX: 0.94,
    opacity: 0,
    duration: 0.65,
    ease: 'power3.inOut'
  }, 0)
  .to(bottomScrollPromptEl, {
    opacity: 0,
    y: -20,
    duration: 0.35,
    ease: 'power2.inOut'
  }, 0)
  .to(animState, {
    transitionPull: 0,
    duration: 0.62,
    ease: 'elastic.out(1, 0.45)'
  }, 0.68)
  .to(worksScreenEl, {
    opacity: 1,
    y: 0,
    duration: 0.65,
    ease: 'power2.out'
  }, 0.35);
}

function goToHomeScreen() {
  showCompletedHomeScreen();
  if (!isWorksMode && !isTransitioning) {
    // Already on home: trigger a gentle tactile textile wave to acknowledge active home
    gsap.fromTo(animState, { transitionPull: 65 }, { transitionPull: 0, duration: 0.65, ease: 'elastic.out(1, 0.45)' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (isTransitioning) return;

  isTransitioning = true;
  isWorksMode = false;

  const homeNavEl = document.getElementById('navHome');
  const worksNavEl = document.getElementById('navWorks');
  const playgroundNavEl = document.getElementById('navPlayground');
  const aboutNavEl = document.getElementById('navAbout');
  const archNavEl = document.getElementById('navArchitecture');

  if (worksNavEl) worksNavEl.classList.remove('active');
  if (playgroundNavEl) playgroundNavEl.classList.remove('active');
  if (aboutNavEl) aboutNavEl.classList.remove('active');
  if (archNavEl) archNavEl.classList.remove('active');
  if (homeNavEl) homeNavEl.classList.add('active');

  if (worksScreenEl) worksScreenEl.classList.remove('active');

  const tl = gsap.timeline({
    onComplete: () => {
      isTransitioning = false;
    }
  });

  tl.to(worksScreenEl, {
    opacity: 0,
    y: 45,
    duration: 0.45,
    ease: 'power2.inOut'
  })
  .to(animState, {
    transitionPull: 160,
    duration: 0.45,
    ease: 'power2.inOut'
  }, 0)
  .to(heroContainer, {
    y: 0,
    scaleY: 1,
    scaleX: 1,
    opacity: 1,
    duration: 0.68,
    ease: 'power3.out'
  }, 0.15)
  .to(animState, {
    transitionPull: 0,
    duration: 0.55,
    ease: 'elastic.out(1, 0.5)'
  }, 0.45)
  .to(bottomScrollPromptEl, {
    opacity: 0.75,
    y: 0,
    duration: 0.45,
    ease: 'power2.out'
  }, 0.25);
}

// Nav Links and Interactive Buttons hover on custom cursor
document.querySelectorAll('.nav-link, .replay-btn, .back-home-btn, .bottom-scroll-prompt, .work-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (cursorEl) cursorEl.classList.add('is-hovering');
  });
  el.addEventListener('mouseleave', () => {
    if (cursorEl) cursorEl.classList.remove('is-hovering');
  });
});

// Scroll input guards: Intercept downward scroll attempts while opening sequence is running
window.addEventListener('wheel', (e) => {
  if (!isHeroSequenceComplete && e.deltaY > 0) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('touchmove', (e) => {
  if (!isHeroSequenceComplete) {
    e.preventDefault();
  }
}, { passive: false });

window.addEventListener('keydown', (e) => {
  if (!isHeroSequenceComplete && ['ArrowDown', 'PageDown', 'Space', ' ', 'End'].includes(e.key)) {
    e.preventDefault();
  }
}, { passive: false });

// Scroll detection: Fade out drag hint and scroll prompt when user scrolls down
window.addEventListener('scroll', () => {
  const isScrolled = window.scrollY > 80;
  document.body.classList.toggle('is-scrolled', isScrolled);
  if (bottomScrollPromptEl) {
    bottomScrollPromptEl.style.opacity = isScrolled ? '0' : '1';
    bottomScrollPromptEl.style.pointerEvents = isScrolled ? 'none' : 'auto';
  }
  const dragHintEl = document.getElementById('dragHint');
  if (dragHintEl) {
    dragHintEl.style.opacity = isScrolled ? '0' : '0.85';
  }
}, { passive: true });

if (bottomScrollPromptEl) {
  bottomScrollPromptEl.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById('works') || document.getElementById('pageContent');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

if (backHomeBtnEl) {
  backHomeBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    goToHomeScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

const homeNav = document.getElementById('navHome');
const navLogo = document.getElementById('navLogo');
const worksNav = document.getElementById('navWorks');
const playgroundNav = document.getElementById('navPlayground');
const archNav = document.getElementById('navArchitecture');

if (homeNav) {
  homeNav.addEventListener('click', (e) => {
    e.preventDefault();
    showCompletedHomeScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.pushState) {
      window.history.pushState(null, '', '#home');
    }
  });
}
if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    showCompletedHomeScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.history.pushState) {
      window.history.pushState(null, '', '#home');
    }
  });
}
if (worksNav) {
  worksNav.addEventListener('click', (e) => {
    const target = document.getElementById('works') || document.getElementById('pageContent');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
if (playgroundNav) {
  playgroundNav.addEventListener('click', (e) => {
    const target = document.getElementById('playground') || document.getElementById('pageContent');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}
if (archNav) {
  archNav.addEventListener('click', (e) => {
    const target = document.getElementById('architecture') || document.getElementById('pageContent');
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
}

// Top Header Navigation Controller: Logo & Nav link click handling
function initHeaderNavigation() {
  const navLogo = document.getElementById('navLogo');
  const navLinks = Array.from(document.querySelectorAll('.top-nav-header .nav-link'));
  const navHome = document.getElementById('navHome');
  const navWorks = document.getElementById('navWorks');

  function setActiveNavLink(activeEl) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link === activeEl);
    });
  }

  function goToLandingPage() {
    try {
      sessionStorage.removeItem('portfolio_return_scroll');
    } catch (e) {}

    showCompletedHomeScreen();
    setActiveNavLink(navHome);

    // Smoothly scroll to the very top (landing page)
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.location.hash && window.location.hash !== '#home') {
      try {
        history.pushState(null, '', window.location.pathname);
      } catch (e) {}
    }
  }

  // Clicking "rushabh." logo smoothly navigates to the landing page
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      goToLandingPage();
    });
  }

  // Clicking "Home" nav link smoothly navigates to the landing page
  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      goToLandingPage();
    });
  }

  // Clicking "Works" scrolls to works showcase section
  if (navWorks) {
    navWorks.addEventListener('click', (e) => {
      e.preventDefault();
      showCompletedHomeScreen();
      setActiveNavLink(navWorks);
      const worksSection = document.getElementById('works') || document.getElementById('projects');
      if (worksSection) {
        worksSection.scrollIntoView({ behavior: 'smooth' });
      }
      try {
        history.pushState(null, '', '#works');
      } catch (e) {}
    });
  }

  // Scroll spy: Update active navigation highlight as user scrolls
  let navScrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!navScrollTicking) {
      navScrollTicking = true;
      requestAnimationFrame(() => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const worksSection = document.getElementById('works');
        const worksTop = worksSection ? worksSection.offsetTop - 180 : 600;

        if (scrollY < worksTop) {
          setActiveNavLink(navHome);
        } else {
          setActiveNavLink(navWorks);
        }
        navScrollTicking = false;
      });
    }
  }, { passive: true });
}

initHeaderNavigation();

// React instantly to anchor / hash changes
window.addEventListener('hashchange', () => {
  const currentHash = (window.location.hash || '').toLowerCase();
  if (currentHash === '#home' || currentHash === '') {
    showCompletedHomeScreen();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (currentHash === '#projects' || currentHash === '#works') {
    showCompletedHomeScreen();
    const proj = document.getElementById('projects') || document.getElementById('works');
    if (proj) proj.scrollIntoView({ behavior: 'smooth' });
  }
});

if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    goToHomeScreen();
    playOpeningSequence();
  });
}

// Global mouse tracking hook for eye gaze
window.addEventListener('pointermove', (e) => {
  updateEyeTracking(e.clientX, e.clientY);
}, { passive: true });

// =========================================================
// EXPANDING THUMBNAIL TRANSITION CONTROLLER
// Opens project case studies via expanding thumbnail
// =========================================================
function initProjectExpandingTransitions() {
  const projectRows = document.querySelectorAll('.project-row');
  if (!projectRows.length) return;

  const prefetchCache = new Set();
  let isTransitioning = false;

  function prefetchProjectRoute(url) {
    if (!url || prefetchCache.has(url)) return;
    prefetchCache.add(url);

    // Warm browser HTTP cache
    try {
      fetch(url, { priority: 'low' }).catch(() => {});
    } catch (e) {}

    // Prefetch first visible asset and stylesheet of case study
    if (url.includes('sajag')) {
      const heroImg = new Image();
      heroImg.src = '/assets/projects/sajag/sections_2x/01_hero.png';

      const cssLink = document.createElement('link');
      cssLink.rel = 'prefetch';
      cssLink.as = 'style';
      cssLink.href = '/projects/sajag/case-study.css?v=14';
      document.head.appendChild(cssLink);
    }
  }

  function handleTriggerClick(e, card) {
    // Normal browser behavior for modifier keys / non-primary clicks
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    const link = e.currentTarget;
    if (link && link.target === '_blank') return;

    e.preventDefault();
    if (isTransitioning) return;
    isTransitioning = true;

    const thumbnailLink = card.querySelector('.project-thumbnail-link');
    const clickedLink = link || (e && e.currentTarget && typeof e.currentTarget.getAttribute === 'function' ? e.currentTarget : null);
    let targetUrl = (clickedLink && clickedLink.getAttribute('href')) ||
                      (thumbnailLink && thumbnailLink.getAttribute('href')) ||
                      '/projects/sajag/';
    if (targetUrl && !targetUrl.endsWith('/') && !targetUrl.includes('.') && !targetUrl.includes('#')) {
      targetUrl += '/';
    }
    const projectId = card.getAttribute('data-project-id') || 'sajag';

    // Store return scroll position & mark card as revealed
    try {
      sessionStorage.setItem('portfolio_return_scroll', window.scrollY.toString());
      sessionStorage.setItem('portfolio_has_seen_intro', 'true');
      sessionStorage.setItem('portfolio_case_study_enter', 'true');
    } catch (err) {}

    // Reduced motion preference: navigate immediately
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      window.location.href = targetUrl;
      return;
    }

    startZoomTransition(card, targetUrl);
  }

  function startZoomTransition(card, targetUrl) {
    const thumbnailImg = card.querySelector('.project-image');
    if (!thumbnailImg) {
      window.location.href = targetUrl;
      return;
    }

    // Measure exact thumbnail coordinates
    const rect = thumbnailImg.getBoundingClientRect();
    const compStyle = window.getComputedStyle(thumbnailImg);
    const initialRadius = parseFloat(compStyle.borderRadius) || 2;

    // Elements to dim/fade on the page (safely flattened without nested arrays)
    const projectInfo = card.querySelector('.project-info-column');
    const figmaMetaTop = card.querySelector('.figma-frame-meta-top');
    const figmaMetaBottom = card.querySelector('.figma-frame-meta-bottom');
    const otherProjects = Array.from(document.querySelectorAll('.project-row')).filter((r) => r !== card);
    const topNav = document.getElementById('topNavHeader');
    const scrollPrompt = document.getElementById('bottomScrollPrompt');
    const controlsWrapper = document.querySelector('.controls-wrapper');
    const dragHint = document.getElementById('dragHint');

    // Create fixed zoom overlay with the blue rectangle
    const overlay = document.createElement('div');
    overlay.className = 'figma-zoom-overlay';

    const cardEl = document.createElement('div');
    cardEl.className = 'figma-zoom-card';
    cardEl.style.top = `${rect.top}px`;
    cardEl.style.left = `${rect.left}px`;
    cardEl.style.width = `${rect.width}px`;
    cardEl.style.height = `${rect.height}px`;
    cardEl.style.borderRadius = `${initialRadius}px`;

    // Clone thumbnail image inside zooming frame so artwork smoothly zooms with the rectangle
    const imgClone = thumbnailImg.cloneNode(true);
    imgClone.className = 'figma-zoom-img';
    imgClone.style.width = '100%';
    imgClone.style.height = '100%';
    imgClone.style.objectFit = 'cover';
    imgClone.style.display = 'block';
    imgClone.style.borderRadius = `${initialRadius}px`;
    if (imgClone.tagName === 'VIDEO') {
      try {
        imgClone.currentTime = thumbnailImg.currentTime || 0;
        imgClone.play().catch(() => {});
      } catch (e) {}
    }
    cardEl.appendChild(imgClone);

    // Figma corner handles
    const handleTL = document.createElement('span');
    handleTL.className = 'figma-zoom-handle handle-tl';
    const handleTR = document.createElement('span');
    handleTR.className = 'figma-zoom-handle handle-tr';
    const handleBL = document.createElement('span');
    handleBL.className = 'figma-zoom-handle handle-bl';
    const handleBR = document.createElement('span');
    handleBR.className = 'figma-zoom-handle handle-br';
    cardEl.appendChild(handleTL);
    cardEl.appendChild(handleTR);
    cardEl.appendChild(handleBL);
    cardEl.appendChild(handleBR);

    overlay.appendChild(cardEl);
    document.body.appendChild(overlay);

    // Hide original static selection box to prevent double borders
    const staticSelectionBox = card.querySelector('.figma-selection-box');
    if (staticSelectionBox) staticSelectionBox.style.opacity = '0';

    // Lock scroll temporarily
    document.body.style.overflow = 'hidden';

    // Guaranteed navigation helper
    let navigated = false;
    const navigate = () => {
      if (navigated) return;
      navigated = true;
      window.location.href = targetUrl;
    };

    // Safety timeout in case GSAP is interrupted
    const safetyTimer = setTimeout(navigate, 650);

    // GSAP Zoom Timeline: Total duration ~580ms
    const tl = gsap.timeline({
      onComplete: () => {
        clearTimeout(safetyTimer);
        navigate();
      }
    });

    // 1. Expand the blue rectangle to cover the viewport
    tl.to(cardEl, {
      top: -10,
      left: -10,
      width: window.innerWidth + 20,
      height: window.innerHeight + 20,
      borderRadius: 0,
      duration: 0.58,
      ease: 'power3.inOut'
    }, 0);

    tl.to(imgClone, {
      borderRadius: 0,
      duration: 0.58,
      ease: 'power3.inOut'
    }, 0);

    // Fade the thumbnail image to white as it zooms in
    tl.to(imgClone, {
      opacity: 0,
      duration: 0.44,
      ease: 'power2.in'
    }, 0.14);

    // Fade the blue border to transparent so at max zoom the screen is pure solid white
    tl.to(cardEl, {
      borderColor: 'rgba(255, 255, 255, 0)',
      duration: 0.22,
      ease: 'power1.out'
    }, 0.36);

    // 2. Safely fade out surrounding elements (strictly filtered to valid DOM elements)
    const elementsToFade = [
      figmaMetaTop,
      figmaMetaBottom,
      projectInfo,
      topNav,
      scrollPrompt,
      controlsWrapper,
      dragHint,
      ...otherProjects
    ].filter((el) => el && el instanceof Element);

    if (elementsToFade.length) {
      tl.to(elementsToFade, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, 0);
    }

    // 3. Blue corner handles fade out smoothly midway as the blue rectangle expands
    const handles = Array.from(cardEl.querySelectorAll('.figma-zoom-handle'));
    if (handles.length) {
      tl.to(handles, {
        opacity: 0,
        duration: 0.20,
        ease: 'power1.out'
      }, 0.22);
    }
  }

  // Bind all project rows (supports thumbnail click & explore / demo link clicks)
  projectRows.forEach((card) => {
    const thumbnailLink = card.querySelector('.project-thumbnail-link');
    const ctaLinks = Array.from(card.querySelectorAll('.project-cta-link'));
    let defaultUrl = (thumbnailLink && thumbnailLink.getAttribute('href')) || '/projects/sajag/';
    if (defaultUrl && !defaultUrl.endsWith('/') && !defaultUrl.includes('.') && !defaultUrl.includes('#')) {
      defaultUrl += '/';
    }

    // Warm up cache on hover or touch
    [thumbnailLink, ...ctaLinks].forEach((el) => {
      if (!el) return;
      const url = el.getAttribute('href') || defaultUrl;
      el.addEventListener('pointerenter', () => prefetchProjectRoute(url));
      el.addEventListener('focus', () => prefetchProjectRoute(url));
      el.addEventListener('touchstart', () => prefetchProjectRoute(url), { passive: true });
    });

    // Thumbnail click triggers zoom transition
    if (thumbnailLink) {
      thumbnailLink.addEventListener('click', (e) => handleTriggerClick(e, card, thumbnailLink));
    }

    // Showcase column container click triggers zoom transition
    const showcaseCol = card.querySelector('.project-showcase-column');
    if (showcaseCol) {
      showcaseCol.style.cursor = 'pointer';
      showcaseCol.addEventListener('click', (e) => {
        if (!e.target.closest('a')) {
          handleTriggerClick(e, card);
        }
      });
    }

    // Text link clicks trigger zoom transition with their respective target URL
    ctaLinks.forEach((cta) => {
      cta.addEventListener('click', (e) => handleTriggerClick(e, card, cta));
    });
  });

  // Handle browser Back / Forward buttons seamlessly
  window.addEventListener('popstate', () => {
    if (window.location.pathname === '/' || !window.location.pathname.includes('/projects/')) {
      window.location.reload();
    }
  });
}

initProjectExpandingTransitions();

// Initial Boot & Scroll Position Restoration
resizeCanvas();

const savedReturnScroll = (() => {
  try {
    return sessionStorage.getItem('portfolio_return_scroll');
  } catch (e) {
    return null;
  }
})();

const hasSeenIntro = (() => {
  try {
    return sessionStorage.getItem('portfolio_has_seen_intro') === 'true';
  } catch (e) {
    return false;
  }
})();

const isReturningFromProject = (() => {
  try {
    return !!(document.referrer && (document.referrer.includes('/projects/') || document.referrer.includes('/sajag')));
  } catch (e) {
    return false;
  }
})();

const currentHash = (window.location.hash || '').toLowerCase();
const isAnchorNavigation = Boolean(currentHash && ['#home', '#projects', '#works', '#about', '#playground', '#architecture'].includes(currentHash));

// If user has already seen the intro, returned from project, or loaded home/anchor:
// IMMEDIATELY show completed home screen with ALL information populated - NEVER blank!
if (hasSeenIntro || isReturningFromProject || isAnchorNavigation || savedReturnScroll !== null) {
  try {
    sessionStorage.removeItem('portfolio_return_scroll');
  } catch (e) {}

  showCompletedHomeScreen();
  revealWorksShowcase();

  const scrollTarget = savedReturnScroll !== null ? parseInt(savedReturnScroll, 10) : null;
  const restorePos = () => {
    if (currentHash === '#home' || currentHash === '') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (scrollTarget !== null && !isNaN(scrollTarget)) {
      window.scrollTo({ top: scrollTarget, behavior: 'instant' });
    } else if (currentHash && currentHash !== '#home') {
      const targetSec = document.querySelector(currentHash) || (currentHash === '#projects' ? document.getElementById('works') : null);
      if (targetSec) {
        targetSec.scrollIntoView({ behavior: 'instant' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  requestAnimationFrame(restorePos);
  setTimeout(restorePos, 60);
} else {
  // First-time fresh visitor without session history: play choreographed opening once
  playOpeningSequence();
}

initSajagShowcase();
initProjectShowcase();
initLiquidKeywordPills();
initThemeToggle();
requestAnimationFrame(render);

// =========================================================
// DARK MODE / LIGHT MODE THEME CONTROLLER
// Supports smooth toggle, persistence, and system preference
// =========================================================
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('portfolio_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-theme');
    document.documentElement.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
    document.documentElement.classList.remove('dark-theme');
  }

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isDark = document.body.classList.toggle('dark-theme');
    document.documentElement.classList.toggle('dark-theme', isDark);
    try {
      localStorage.setItem('portfolio_theme', isDark ? 'dark' : 'light');
    } catch (err) {}

    // Subtle tactile button pop
    toggleBtn.style.transform = 'scale(0.88)';
    setTimeout(() => {
      toggleBtn.style.transform = '';
    }, 150);
  });
}

// =========================================================
// LIQUID KEYWORD PILLS ENTRANCE CONTROLLER
// One-time liquid entrance animation via IntersectionObserver
// =========================================================
function initLiquidKeywordPills() {
  const configs = [
    {
      svgId: 'keywordPillsSvg',
      containerId: 'projectTagsContainer',
      groupId: 'keywordPillsAnimatedGroup'
    },
    {
      svgId: 'keywordPillsSnakeSvg',
      containerId: 'snakeProjectTagsContainer',
      groupId: 'keywordPillsSnakeAnimatedGroup'
    },
    {
      svgId: 'keywordPillsMunshijiSvg',
      containerId: 'munshijiProjectTagsContainer',
      groupId: 'keywordPillsMunshijiAnimatedGroup'
    }
  ];

  configs.forEach(({ svgId, containerId, groupId }) => {
    const pillsSvg = document.getElementById(svgId);
    const pillsContainer = document.getElementById(containerId);
    if (!pillsSvg || !pillsContainer) return;

    const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      if (typeof pillsSvg.unpauseAnimations === 'function') {
        try {
          pillsSvg.setCurrentTime(2.85);
          pillsSvg.unpauseAnimations();
        } catch (e) {}
      }
      const animGroup = document.getElementById(groupId);
      if (animGroup) animGroup.removeAttribute('filter');
      return;
    }

    // Ensure paused at t=0 before intersection
    if (typeof pillsSvg.pauseAnimations === 'function') {
      try {
        pillsSvg.pauseAnimations();
        pillsSvg.setCurrentTime(0);
      } catch (e) {}
    }

    let hasStarted = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasStarted) {
          hasStarted = true;
          observer.disconnect();

          try {
            pillsSvg.setCurrentTime(0);
            pillsSvg.unpauseAnimations();
          } catch (e) {}

          // Remove temporary liquid joining filter once all pills settle (2.45s) for clean vector edges
          setTimeout(() => {
            const animGroup = document.getElementById(groupId);
            if (animGroup) {
              animGroup.removeAttribute('filter');
            }
          }, 2450);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -20px 0px'
    });

    observer.observe(pillsContainer);
  });
}



