/**
 * ToolkitJar.js (v2)
 * Interactive, accessible animated toolkit jar component for Rushabh's portfolio.
 * 
 * Features:
 * - Tall glass jar (jar-tall-glass.png) and fitted silver metal cap (lid-silver-metal.png).
 * - 18 stylized software icons from software-icons.png sprite atlas.
 * - Initial state: ALREADY FULL (packed 85-95% full up to shoulders/neck in 3 depth layers).
 * - New timeline sequence:
 *   0.0 - 0.6s: Hold full jar with closed lid
 *   0.6 - 1.3s: Pressure build-up (icons shift subtly, cap lifts 1-2px and settles)
 *   1.3 - 2.1s: Whole jar shakes around base (contents, glass, label, and cap move together)
 *   2.1 - 3.4s: Silver lid pops and lands beside jar; icons burst upward from packed positions
 *   3.4 - 4.3s: Icons settle into left/right scattered positions around the note (~62px desktop, ~44px mobile)
 *   4.3 - 5.0s: Lime question-mark sticker drops into empty jar; "What's next?" and captions appear
 * - Replay ("Mix again ↻") directly resets to FULL, CLOSED jar and repeats sequence.
 * - Single cancellable RAF timeline, tab-visibility pause/resume, and prefers-reduced-motion support.
 */

export const ICONS_SPEC = [
  // 9 Left icons
  { id: 'framer',       name: 'Framer',       rect: [325, 65, 280, 252],   side: 'left',  rot: -10 },
  { id: 'figma',        name: 'Figma',        rect: [40, 65, 280, 252],    side: 'left',  rot: 8 },
  { id: 'rhino-3d',     name: 'Rhino 3D',     rect: [891, 65, 280, 252],   side: 'left',  rot: 9 },
  { id: 'sketchup',     name: 'SketchUp',     rect: [608, 65, 280, 252],   side: 'left',  rot: -8 },
  { id: 'autocad',      name: 'AutoCAD',      rect: [1174, 65, 280, 252],  side: 'left',  rot: -6 },
  { id: 'photoshop',    name: 'Photoshop',    rect: [1457, 65, 280, 252],  side: 'left',  rot: 10 },
  { id: 'premiere-pro', name: 'Premiere Pro', rect: [1457, 320, 280, 252], side: 'left',  rot: -9 },
  { id: 'illustrator',  name: 'Illustrator',  rect: [1174, 320, 280, 252], side: 'left',  rot: 6 },
  { id: 'google-flow',  name: 'Google Flow',  rect: [608, 320, 280, 252],  side: 'left',  rot: -5 },

  // 9 Right icons
  { id: 'vs-code',      name: 'VS Code',      rect: [325, 320, 280, 252],  side: 'right', rot: 7 },
  { id: 'github',       name: 'GitHub',       rect: [1457, 574, 280, 252], side: 'right', rot: -9 },
  { id: 'procreate',    name: 'Procreate',    rect: [40, 574, 280, 252],   side: 'right', rot: -8 },
  { id: 'revit',        name: 'Revit',        rect: [325, 574, 280, 252],   side: 'right', rot: 8 },
  { id: 'lumion',       name: 'Lumion',       rect: [891, 320, 280, 252],  side: 'right', rot: -5 },
  { id: 'claude',       name: 'Claude',       rect: [608, 574, 280, 252],  side: 'right', rot: 7 },
  { id: 'chatgpt',      name: 'ChatGPT',      rect: [891, 574, 280, 252],  side: 'right', rot: 6 },
  { id: 'gemini',       name: 'Gemini',       rect: [1174, 574, 280, 252], side: 'right', rot: -8 },
  { id: 'antigravity',  name: 'Antigravity',  rect: [40, 320, 280, 252],   side: 'right', rot: 10 }
];

// Packed pile positions inside the tall jar (268px wide x 350px tall stage)
// 3 depth layers: z=1 (back, partly hidden), z=2 (middle, partially covered), z=3 (front, prominent)
// Rotations between -22deg and +22deg. Covers ~85-95% of interior up to shoulders/neck.
const PACKED_POSITIONS = [
  // Bottom tier (y ~ 280..305)
  { jx: 72,  jy: 295, jrot: -14, z: 1 },  // 0: Framer
  { jx: 136, jy: 300, jrot: 8,   z: 3 },  // 1: Figma
  { jx: 188, jy: 288, jrot: 18,  z: 2 },  // 2: Rhino 3D
  { jx: 90,  jy: 275, jrot: -22, z: 3 },  // 3: SketchUp

  // Lower-middle tier (y ~ 230..260)
  { jx: 155, jy: 255, jrot: -12, z: 2 },  // 4: AutoCAD
  { jx: 195, jy: 242, jrot: 16,  z: 3 },  // 5: Photoshop
  { jx: 76,  jy: 232, jrot: 19,  z: 1 },  // 6: Premiere Pro
  { jx: 132, jy: 226, jrot: -8,  z: 2 },  // 7: Illustrator

  // Middle tier (y ~ 180..215)
  { jx: 74,  jy: 192, jrot: -15, z: 3 },  // 8: Google Flow
  { jx: 172, jy: 198, jrot: 11,  z: 1 },  // 9: VS Code
  { jx: 130, jy: 185, jrot: -19, z: 2 },  // 10: GitHub
  { jx: 192, jy: 175, jrot: 7,   z: 3 },  // 11: Procreate

  // Upper-middle tier (y ~ 135..170)
  { jx: 82,  jy: 150, jrot: 15,  z: 1 },  // 12: Revit
  { jx: 142, jy: 145, jrot: -10, z: 2 },  // 13: Lumion
  { jx: 180, jy: 134, jrot: -17, z: 3 },  // 14: Claude
  { jx: 98,  jy: 120, jrot: 21,  z: 2 },  // 15: ChatGPT

  // Shoulder & Neck tier (y ~ 90..115)
  { jx: 158, jy: 105, jrot: -9,  z: 1 },  // 16: Gemini
  { jx: 118, jy: 92,  jrot: 13,  z: 3 }   // 17: Antigravity
];

export function createToolkitJar(sceneWrapper) {
  const container = document.createElement('div');
  container.className = 'toolkit-jar-container';
  container.id = 'toolkitJarContainer';

  container.innerHTML = `
    <!-- Centered Jar Assembly Stage -->
    <div class="jar-stage-wrapper">
      <div class="jar-stage" id="jarStage">
        <!-- Layer 1: Ground Shadows -->
        <div class="jar-ground-shadow" aria-hidden="true"></div>
        <div class="lid-ground-shadow" id="lidGroundShadow" aria-hidden="true"></div>

        <!-- Layer 2: Jar Interior (Clipped to tall jar silhouette) -->
        <div class="jar-interior" id="jarInterior">
          <div class="jar-back-tint" aria-hidden="true"></div>
          <!-- Question Mark Sticker (Inside the jar) -->
          <img class="jar-question-mark" id="jarQuestionMark"
               src="assets/jar/question-mark.png"
               alt=""
               aria-hidden="true"
               draggable="false" />
        </div>

        <!-- Layer 3: Jar Front Glass Overlay (Tall glass container with subtle center mask) -->
        <img class="jar-glass-img"
             src="assets/jar/jar-tall-glass.png"
             alt=""
             aria-hidden="true"
             draggable="false" />

        <!-- Layer 4: Jar Paper Label ("Tools I’m exploring") -->
        <div class="jar-paper-label">
          <span class="jar-label-text">Tools I’m exploring</span>
        </div>

        <!-- Layer 5: Fitted Silver Metal Lid -->
        <div class="jar-lid-carrier" id="jarLidCarrier">
          <img class="jar-lid-img"
               src="assets/jar/lid-silver-metal.png"
               alt=""
               aria-hidden="true"
               draggable="false" />
        </div>

        <!-- Beside the Jar: "What's next?" handwritten note & arrow -->
        <div class="jar-whats-next" id="jarWhatsNext">
          <span class="whats-next-text">What’s next?</span>
          <svg class="whats-next-arrow" viewBox="0 0 46 40" fill="none" aria-hidden="true">
            <path d="M40 4C35 22 18 28 8 28" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round"/>
            <path d="M14 20L6 28L15 34" stroke="#1e293b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Below the Jar: Captions & Replay Button Area (Reserved space) -->
    <div class="jar-caption-block" id="jarCaptionBlock">
      <h3 class="jar-caption-title">
        <span>A growing toolkit.</span>
        <span>An unfinished list.</span>
      </h3>
      <p class="jar-caption-subtitle">There’s always room for the next “what if?”</p>
      <button type="button" class="jar-replay-btn" id="jarReplayBtn" aria-label="Mix toolkit again">
        Mix again <span class="replay-icon" aria-hidden="true">↻</span>
      </button>
    </div>

    <!-- Accessible screen-reader list -->
    <div class="sr-only">
      <h4>Tools explored in this toolkit:</h4>
      <ul>
        ${ICONS_SPEC.map(icon => `<li>${icon.name}</li>`).join('')}
      </ul>
    </div>
  `;

  let controller = null;

  return {
    element: container,
    init: () => {
      controller = initJarAnimation(sceneWrapper || container);
    },
    get controller() {
      return controller;
    }
  };
}

/**
 * Main Animation Timeline & State Engine (v2)
 */
function initJarAnimation(scene) {
  const stage = scene.querySelector('#jarStage');
  const jarInterior = scene.querySelector('#jarInterior');
  const iconsLayer = scene.querySelector('#jarIconsLayer');
  const lid = scene.querySelector('#jarLidCarrier');
  const lidShadow = scene.querySelector('#lidGroundShadow');
  const questionMark = scene.querySelector('#jarQuestionMark');
  const whatsNext = scene.querySelector('#jarWhatsNext');
  const captionBlock = scene.querySelector('#jarCaptionBlock');
  const replayBtn = scene.querySelector('#jarReplayBtn');
  const doodlesSvg = scene.querySelector('#jarDoodlesSvg');
  const noteAssembly = scene.querySelector('#noteAssembly');

  const ATLAS_URL = 'assets/jar/software-icons.png';
  const ATLAS_W = 1774;
  const ATLAS_H = 887;

  // Scale factor: inside the jar icons are ~92px (packed), settled outside they are ~62px
  // PACKED_SCALE = 92 / 62 = 1.48
  const PACKED_SCALE = 1.48;

  // Build the 18 icon DOM nodes
  const iconNodes = ICONS_SPEC.map((spec, index) => {
    const el = document.createElement('div');
    el.className = 'jar-tool-icon';
    el.dataset.id = spec.id;
    el.setAttribute('aria-hidden', 'true');

    const [sx, sy, sw, sh] = spec.rect;
    const crop = document.createElement('span');
    crop.className = 'jar-icon-crop';

    const img = document.createElement('img');
    img.className = 'jar-icon-img';
    img.src = ATLAS_URL;
    img.alt = '';
    img.draggable = false;

    crop.appendChild(img);
    el.appendChild(crop);

    const packed = PACKED_POSITIONS[index] || { jx: 134, jy: 200, jrot: 0, z: 2 };

    return {
      spec,
      index,
      el,
      crop,
      img,
      tx: 0,
      ty: 0,
      rot: spec.rot,
      jx: packed.jx,
      jy: packed.jy,
      jrot: packed.jrot,
      z: packed.z,
      inFlightLayer: false
    };
  });

  // Put icons initially inside jar interior (packed 85-95% full)
  iconNodes.forEach(node => {
    jarInterior.appendChild(node.el);
    node.el.style.zIndex = String(node.z);
    node.inFlightLayer = false;
  });

  let animState = 'idle'; // idle | hold | pressure | shaking | bursting | settling | complete
  let rafId = null;
  let startTime = null;
  let pauseTime = null;
  let elapsedBeforePause = 0;
  let isPaused = false;
  let hasTriggered = false;

  // Target coordinates calculation helper
  function updateTargetCoordinates() {
    const sceneRect = scene.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const sceneW = sceneRect.width || window.innerWidth || 1200;
    const isMobile = window.innerWidth < 820;

    // Jar neck center in scene coordinates (neck opening of tall jar)
    const jarNeckSceneX = (stageRect.left - sceneRect.left) + 134;
    const jarNeckSceneY = (stageRect.top - sceneRect.top) + 65;

    // Sizing: settled icons ~25-30% larger than before (62px desktop, 44px mobile)
    const iconFinalSize = isMobile ? 44 : 62;

    // Update icon node crop & image sizing
    iconNodes.forEach(node => {
      const [sx, sy, sw, sh] = node.spec.rect;
      node.crop.style.width = `${iconFinalSize}px`;
      node.crop.style.height = `${(sh / sw) * iconFinalSize}px`;

      const scale = iconFinalSize / sw;
      node.img.style.width = `${ATLAS_W * scale}px`;
      node.img.style.height = `${ATLAS_H * scale}px`;
      node.img.style.left = `${-sx * scale}px`;
      node.img.style.top = `${-sy * scale}px`;
    });

    if (isMobile) {
      // Mobile / narrow screens: arrange in an airy, curated constellation in the reserved band and flanking the jar
      // Note heading, paragraph, and signature are strict EXCLUSION ZONES!
      const noteRect = noteAssembly ? noteAssembly.getBoundingClientRect() : null;
      let noteBottom = 0;
      let noteLeft = 0;
      let noteRight = 0;
      if (noteRect && noteRect.width > 0) {
        noteBottom = noteRect.bottom - sceneRect.top;
        noteLeft = noteRect.left - sceneRect.left;
        noteRight = noteRect.right - sceneRect.left;
      }
      const safeNoteBottom = noteBottom > 0 ? noteBottom + 16 : (jarNeckSceneY - 95);

      const mobileSlotsLeft = [
        { dx: -55,  dy: -65, rot: -8 },   // Slot 0: Reserved band inner left
        { dx: -110, dy: -60, rot: 12 },   // Slot 1: Reserved band outer left
        { dx: -25,  dy: -70, rot: -6 },   // Slot 2: Reserved band center left
        { dx: -140, dy: -20, rot: -10 },  // Slot 3: High left flank
        { dx: -90,  dy: 10,  rot: 8 },    // Slot 4: Left shoulder
        { dx: -140, dy: 35,  rot: -12 },  // Slot 5: Left flank mid
        { dx: -85,  dy: 65,  rot: 6 },    // Slot 6: Left body inner
        { dx: -135, dy: 90,  rot: -7 },   // Slot 7: Left flank lower
        { dx: -80,  dy: 125, rot: 10 }    // Slot 8: Left bottom
      ];

      const mobileSlotsRight = [
        { dx: 55,   dy: -65, rot: 9 },    // Slot 9: Reserved band inner right
        { dx: 110,  dy: -60, rot: -11 },  // Slot 10: Reserved band outer right
        { dx: 25,   dy: -70, rot: 6 },    // Slot 11: Reserved band center right
        { dx: 140,  dy: -30, rot: 8 },    // Slot 12: High right flank (well above annotation)
        { dx: 70,   dy: 5,   rot: -7 },   // Slot 13: Right shoulder
        { dx: 140,  dy: 55,  rot: 14 },   // Slot 14: Right flank mid (well below annotation)
        { dx: 65,   dy: 75,  rot: -6 },   // Slot 15: Right body inner
        { dx: 135,  dy: 110, rot: 10 },   // Slot 16: Right flank lower (outside jar)
        { dx: 55,   dy: 135, rot: -9 }    // Slot 17: Right bottom inside
      ];

      // Dynamically constrain dx to available screen width so no horizontal overflow occurs
      const maxDx = Math.min(145, (sceneW - iconFinalSize - 20) / 2);
      const xRatio = Math.max(0.65, Math.min(1.0, maxDx / 145));

      iconNodes.forEach(node => {
        const isLeft = node.spec.side === 'left';
        const slots = isLeft ? mobileSlotsLeft : mobileSlotsRight;
        const slotIdx = isLeft ? node.index : (node.index - 9);
        const slot = slots[slotIdx] || slots[0];

        let targetX = jarNeckSceneX + slot.dx * xRatio;
        let targetY = jarNeckSceneY + slot.dy;

        // Strict Exclusion Zone check: Never overlap the note paper, text, or signature!
        if (targetY < safeNoteBottom && targetX >= noteLeft - 8 && targetX <= noteRight + 8) {
          targetY = safeNoteBottom + ((node.index % 3) * 14);
        }

        // Viewport padding bounds
        const pad = iconFinalSize / 2 + 12;
        targetX = Math.max(pad, Math.min(sceneW - pad, targetX));

        node.tx = targetX;
        node.ty = targetY;
        node.rot = slot.rot;
      });
    } else {
      // Desktop: 9 Left and 9 Right flanking the note, away from note text, tape, and stickers
      const noteRect = noteAssembly ? noteAssembly.getBoundingClientRect() : null;
      let noteLeft = (sceneW - 680) / 2;
      let noteRight = noteLeft + 680;
      let noteTop = 0;
      let noteHeight = 400;

      if (noteRect && noteRect.width > 0) {
        noteLeft = noteRect.left - sceneRect.left;
        noteRight = noteRect.right - sceneRect.left;
        noteTop = noteRect.top - sceneRect.top;
        noteHeight = noteRect.height;
      }

      // Left gutter bounds: generous margin from noteLeft - 50px
      const leftGutterW = Math.max(180, noteLeft - 70);
      // Right gutter bounds: generous margin from noteRight + 50px
      const rightGutterStart = noteRight + 50;
      const rightGutterW = Math.max(180, (sceneW - 24) - rightGutterStart);

      // Deterministic layout offsets flanking note
      const leftSlots = [
        { xRel: 0.12, yRel: 0.05, rot: -10 }, // Framer
        { xRel: 0.65, yRel: 0.02, rot: 8 },   // Figma
        { xRel: 0.22, yRel: 0.26, rot: 9 },   // Rhino 3D
        { xRel: 0.72, yRel: 0.24, rot: -8 },  // SketchUp
        { xRel: 0.12, yRel: 0.48, rot: -6 },  // AutoCAD
        { xRel: 0.68, yRel: 0.48, rot: 10 },  // Photoshop
        { xRel: 0.18, yRel: 0.72, rot: -9 },  // Premiere Pro
        { xRel: 0.62, yRel: 0.70, rot: 6 },   // Illustrator
        { xRel: 0.22, yRel: 0.92, rot: -5 }   // Flow (clears bottom-left asterisk)
      ];

      const rightSlots = [
        { xRel: 0.18, yRel: 0.02, rot: 7 },   // VS Code
        { xRel: 0.70, yRel: 0.06, rot: -9 },  // GitHub
        { xRel: 0.24, yRel: 0.24, rot: -8 },  // Procreate
        { xRel: 0.78, yRel: 0.26, rot: 8 },   // Revit
        { xRel: 0.20, yRel: 0.48, rot: -5 },  // Lumion
        { xRel: 0.74, yRel: 0.50, rot: 7 },   // Claude
        { xRel: 0.28, yRel: 0.70, rot: 6 },   // ChatGPT
        { xRel: 0.80, yRel: 0.72, rot: -8 },  // Gemini
        { xRel: 0.42, yRel: 0.90, rot: 10 }   // Antigravity
      ];

      iconNodes.forEach((node, i) => {
        if (node.spec.side === 'left') {
          const slot = leftSlots[i] || { xRel: 0.5, yRel: 0.5, rot: 0 };
          node.tx = 24 + (slot.xRel * leftGutterW);
          node.ty = noteTop + (slot.yRel * noteHeight);
          node.rot = slot.rot;
        } else {
          const slotIdx = i - 9;
          const slot = rightSlots[slotIdx] || { xRel: 0.5, yRel: 0.5, rot: 0 };
          node.tx = rightGutterStart + (slot.xRel * rightGutterW);
          node.ty = noteTop + (slot.yRel * noteHeight);
          node.rot = slot.rot;
        }
      });
    }

    return { jarNeckSceneX, jarNeckSceneY, stageRect, sceneRect };
  }

  function setLidState(mode) {
    const isMob = window.innerWidth <= 640;
    const isNarrow = window.innerWidth <= 380;
    if (mode === 'closed') {
      lid.style.transform = 'translate(0px, 0px) rotate(0deg)';
      if (lidShadow) lidShadow.style.opacity = '0';
    } else if (mode === 'pressure') {
      lid.style.transform = 'translate(0px, -2px) rotate(0deg)';
      if (lidShadow) lidShadow.style.opacity = '0';
    } else if (mode === 'popping') {
      const popX = isMob ? (isNarrow ? 26 : 38) : 55;
      const popY = isMob ? -60 : -70;
      lid.style.transform = `translate(${popX}px, ${popY}px) rotate(-16deg)`;
      if (lidShadow) lidShadow.style.opacity = '0';
    } else if (mode === 'resting') {
      // Safe resting coordinates on mobile keeping the detached lid fully on screen with comfortable margin
      const restX = isNarrow ? 76 : (isMob ? 95 : 145);
      const restY = isMob ? 210 : 220;
      const restRot = isNarrow ? 20 : (isMob ? 28 : 42);
      lid.style.transform = `translate(${restX}px, ${restY}px) rotate(${restRot}deg)`;
      if (lidShadow) {
        lidShadow.style.opacity = '1';
        if (isMob) {
          lidShadow.style.transform = `translate(${restX}px, 250px) scale(0.85)`;
        } else {
          lidShadow.style.transform = 'translate(145px, 260px)';
        }
      }
    }
  }

  function setQuestionMarkState(mode) {
    if (mode === 'hidden') {
      questionMark.style.opacity = '0';
      questionMark.style.transform = 'translate(-50%, -60px) scale(0.6)';
    } else if (mode === 'inside') {
      questionMark.style.opacity = '1';
      questionMark.style.transform = 'translate(-50%, 0) rotate(-6deg) scale(1)';
    }
  }

  // Initial & Replay reset: DIRECTLY FULL AND PACKED, LID CLOSED
  function resetScene() {
    animState = 'idle';
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    startTime = null;
    pauseTime = null;
    elapsedBeforePause = 0;
    isPaused = false;

    stage.style.transform = 'none';
    setLidState('closed');
    setQuestionMarkState('hidden');

    // Place all 18 icons back inside jar interior at packed coordinates
    iconNodes.forEach(node => {
      if (node.el.parentNode !== jarInterior) {
        jarInterior.appendChild(node.el);
      }
      node.inFlightLayer = false;
      node.el.style.opacity = '1';
      node.el.style.zIndex = String(node.z);
      node.el.style.transform = `translate(${node.jx}px, ${node.jy}px) rotate(${node.jrot}deg) scale(${PACKED_SCALE})`;
      node.el.style.transition = 'none';
    });

    if (doodlesSvg) doodlesSvg.style.opacity = '0';
    whatsNext.style.opacity = '0';
    whatsNext.style.transform = 'translate(0, 10px)';
    captionBlock.style.opacity = '0.35';
    captionBlock.style.pointerEvents = 'none';
    replayBtn.style.opacity = '0';
    replayBtn.style.pointerEvents = 'none';
  }

  // Instant final state for reduced motion
  function renderFinalState() {
    animState = 'complete';
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    updateTargetCoordinates();

    stage.style.transform = 'none';
    setLidState('resting');
    setQuestionMarkState('inside');

    iconNodes.forEach(node => {
      if (node.el.parentNode !== iconsLayer) {
        iconsLayer.appendChild(node.el);
      }
      node.inFlightLayer = true;
      node.el.style.opacity = '1';
      node.el.style.zIndex = '12';
      node.el.style.transform = `translate(${node.tx}px, ${node.ty}px) rotate(${node.rot}deg) scale(1)`;
      node.el.style.transition = 'opacity 0.4s ease';
    });

    if (doodlesSvg) doodlesSvg.style.opacity = '1';
    whatsNext.style.opacity = '1';
    whatsNext.style.transform = 'translate(0, 0)';
    captionBlock.style.opacity = '1';
    captionBlock.style.pointerEvents = 'auto';
    replayBtn.style.opacity = '1';
    replayBtn.style.pointerEvents = 'auto';
  }

  // Animation Step Function
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    if (isPaused) {
      rafId = requestAnimationFrame(step);
      return;
    }

    const elapsed = (timestamp - startTime) + elapsedBeforePause;
    const { jarNeckSceneX, jarNeckSceneY, stageRect, sceneRect } = updateTargetCoordinates();
    const stageLeft = stageRect.left - sceneRect.left;
    const stageTop = stageRect.top - sceneRect.top;

    // --- PHASE 1: HOLD FULL JAR (0.0s to 0.6s) ---
    if (elapsed < 600) {
      animState = 'hold';
      stage.style.transform = 'none';
      setLidState('closed');
      setQuestionMarkState('hidden');

      iconNodes.forEach(node => {
        if (node.el.parentNode !== jarInterior) {
          jarInterior.appendChild(node.el);
          node.inFlightLayer = false;
        }
        node.el.style.opacity = '1';
        node.el.style.zIndex = String(node.z);
        node.el.style.transform = `translate(${node.jx}px, ${node.jy}px) rotate(${node.jrot}deg) scale(${PACKED_SCALE})`;
      });
    }

    // --- PHASE 2: PRESSURE BUILD-UP (0.6s to 1.3s) ---
    else if (elapsed < 1300) {
      animState = 'pressure';
      const pPressure = (elapsed - 600) / 700;
      const lift = Math.sin(pPressure * Math.PI) * 2.2; // 1-2px cap lift and settle
      lid.style.transform = `translate(0px, ${-lift}px) rotate(0deg)`;

      iconNodes.forEach((node, i) => {
        if (node.el.parentNode !== jarInterior) {
          jarInterior.appendChild(node.el);
          node.inFlightLayer = false;
        }
        // Micro-shift suggesting internal pressure
        const jitterX = Math.sin(pPressure * Math.PI * 3 + i * 0.8) * 1.6;
        const jitterY = -Math.sin(pPressure * Math.PI * 2 + i * 0.5) * 1.2;
        const jitterRot = node.jrot + Math.sin(pPressure * Math.PI * 2.5 + i) * 1.5;

        node.el.style.opacity = '1';
        node.el.style.transform = `translate(${node.jx + jitterX}px, ${node.jy + jitterY}px) rotate(${jitterRot}deg) scale(${PACKED_SCALE})`;
      });
    }

    // --- PHASE 3: SHAKING (1.3s to 2.1s) ---
    else if (elapsed < 2100) {
      animState = 'shaking';
      setLidState('closed');

      const pShake = (elapsed - 1300) / 800;
      const shakeCycles = Math.sin(pShake * Math.PI * 5); // 2.5 cycles
      const damp = Math.sin(pShake * Math.PI);
      const shakeAngle = shakeCycles * 2.6 * damp; // +-2.6 deg
      const shakeX = shakeCycles * 3.4 * damp;     // +-3.4 px

      // Whole stage (glass, label, contents, cap) shakes together
      stage.style.transform = `translateX(${shakeX}px) rotate(${shakeAngle}deg)`;

      iconNodes.forEach((node, i) => {
        if (node.el.parentNode !== jarInterior) {
          jarInterior.appendChild(node.el);
          node.inFlightLayer = false;
        }
        // Small secondary motion inside the shaking jar
        const secShift = Math.sin(pShake * Math.PI * 6 + i * 0.6) * 1.8 * damp;
        node.el.style.opacity = '1';
        node.el.style.transform = `translate(${node.jx + secShift}px, ${node.jy}px) rotate(${node.jrot + shakeAngle * 0.6}deg) scale(${PACKED_SCALE})`;
      });
    }

    // --- PHASE 4: LID POPS & ICONS BURST OUT (2.1s to 3.4s) ---
    else if (elapsed < 3400) {
      animState = 'bursting';
      stage.style.transform = 'none';

      const BURST_START = 2100;
      const lidElapsed = elapsed - BURST_START;
      const lidP = Math.min(1, lidElapsed / 1050);
      const lidEase = Math.sin((lidP * Math.PI) / 2);

      // Silver cap pops up, arcs through the air, and lands beside jar
      const isMobile = window.innerWidth < 820;
      const isNarrow = window.innerWidth <= 380;
      const targetLidX = isNarrow ? 76 : (isMobile ? 95 : 145);
      const targetLidY = isMobile ? 210 : 220;
      const targetLidRot = isNarrow ? 20 : (isMobile ? 28 : 42);

      const lidX = targetLidX * lidEase;
      const lidArcY = (targetLidY * lidEase) - Math.sin(lidP * Math.PI) * (isMobile ? 90 : 90);
      const lidRot = lidP * targetLidRot;

      lid.style.transform = `translate(${lidX}px, ${lidArcY}px) rotate(${lidRot}deg)`;
      if (lidShadow) {
        lidShadow.style.opacity = String(Math.max(0, (lidP - 0.5) * 2));
      }

      // Icons burst upward from their packed positions through the neck
      iconNodes.forEach((node, i) => {
        const stagger = i * 32; // 32ms stagger
        const iconBurstTime = BURST_START + stagger;
        const iconElapsed = elapsed - iconBurstTime;

        if (iconElapsed < 0) {
          // Still in packed state inside the jar
          if (node.el.parentNode !== jarInterior) {
            jarInterior.appendChild(node.el);
            node.inFlightLayer = false;
          }
          node.el.style.opacity = '1';
          node.el.style.zIndex = String(node.z);
          node.el.style.transform = `translate(${node.jx}px, ${node.jy}px) rotate(${node.jrot}deg) scale(${PACKED_SCALE})`;
        } else if (iconElapsed < 120) {
          // Launching upward towards neck opening inside jar
          const pUp = iconElapsed / 120;
          const curJx = node.jx + (134 - node.jx) * pUp;
          const curJy = node.jy + (65 - node.jy) * pUp;
          const curRot = node.jrot + (0 - node.jrot) * pUp;

          if (node.el.parentNode !== jarInterior) {
            jarInterior.appendChild(node.el);
            node.inFlightLayer = false;
          }
          node.el.style.opacity = '1';
          node.el.style.transform = `translate(${curJx}px, ${curJy}px) rotate(${curRot}deg) scale(${PACKED_SCALE})`;
        } else {
          // Cleared neck! Move to iconsLayer so it is unclipped across whole scene
          if (!node.inFlightLayer) {
            iconsLayer.appendChild(node.el);
            node.inFlightLayer = true;
          }

          const flightElapsed = iconElapsed - 120;
          const pFlight = Math.min(1, flightElapsed / 820);
          const easeOut = 1 - Math.pow(1 - pFlight, 3);

          const p0x = jarNeckSceneX;
          const p0y = jarNeckSceneY;
          const p2x = node.tx;
          const p2y = node.ty;

          const isLeft = node.spec.side === 'left';
          const p1x = isLeft ? Math.min(p0x - 65, p2x + 25) : Math.max(p0x + 65, p2x - 25);
          const p1y = Math.min(p0y, p2y) - (isMobile ? 120 : 95);

          const curX = (1 - easeOut) * (1 - easeOut) * p0x + 2 * (1 - easeOut) * easeOut * p1x + easeOut * easeOut * p2x;
          const curY = (1 - easeOut) * (1 - easeOut) * p0y + 2 * (1 - easeOut) * easeOut * p1y + easeOut * easeOut * p2y;

          // Continuous scale interpolation from packed (1.48) to settled (1.0)
          const curScale = PACKED_SCALE + (1.0 - PACKED_SCALE) * easeOut;
          const curRot = node.jrot + (node.rot - node.jrot) * easeOut;

          node.el.style.opacity = '1';
          node.el.style.transform = `translate(${curX}px, ${curY}px) rotate(${curRot}deg) scale(${curScale})`;
        }
      });
    }

    // --- PHASE 5: SETTLING (3.4s to 4.3s) ---
    else if (elapsed < 4300) {
      animState = 'settling';
      setLidState('resting');

      const pSettle = (elapsed - 3400) / 900;
      const easeP = 0.5 - 0.5 * Math.cos(pSettle * Math.PI);

      iconNodes.forEach(node => {
        if (!node.inFlightLayer) {
          iconsLayer.appendChild(node.el);
          node.inFlightLayer = true;
        }
        node.el.style.opacity = '1';
        node.el.style.transform = `translate(${node.tx}px, ${node.ty}px) rotate(${node.rot}deg) scale(1)`;
      });

      if (doodlesSvg) doodlesSvg.style.opacity = String(easeP);
    }

    // --- PHASE 6: QUESTION MARK & CAPTIONS (4.3s to 5.0s) ---
    else if (elapsed < 5100) {
      setLidState('resting');
      if (doodlesSvg) doodlesSvg.style.opacity = '1';

      iconNodes.forEach(node => {
        if (!node.inFlightLayer) {
          iconsLayer.appendChild(node.el);
          node.inFlightLayer = true;
        }
        node.el.style.opacity = '1';
        node.el.style.transform = `translate(${node.tx}px, ${node.ty}px) rotate(${node.rot}deg) scale(1)`;
      });

      const qmElapsed = elapsed - 4300;
      const qmP = Math.min(1, qmElapsed / 600);
      const qmEase = Math.sin((qmP * Math.PI) / 2);
      const qmBounce = Math.sin(qmP * Math.PI * 2.5) * Math.max(0, 1 - qmP) * 14;

      const qmY = -60 + (60 * qmEase) - qmBounce;
      const qmRot = -6 * qmEase;

      questionMark.style.opacity = String(Math.min(1, qmP * 2));
      questionMark.style.transform = `translate(-50%, ${qmY}px) rotate(${qmRot}deg) scale(1)`;

      const captionP = Math.min(1, Math.max(0, (elapsed - 4400) / 600));
      whatsNext.style.opacity = String(captionP);
      whatsNext.style.transform = `translate(0, ${(1 - captionP) * 8}px)`;

      captionBlock.style.opacity = String(0.35 + 0.65 * captionP);
      if (captionP >= 0.8) {
        captionBlock.style.pointerEvents = 'auto';
        replayBtn.style.opacity = '1';
        replayBtn.style.pointerEvents = 'auto';
      }
    }

    // --- PHASE 7: COMPLETE ---
    else {
      renderFinalState();
      return;
    }

    rafId = requestAnimationFrame(step);
  }

  function playAnimation() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      renderFinalState();
      return;
    }

    resetScene();
    updateTargetCoordinates();
    startTime = performance.now();
    rafId = requestAnimationFrame(step);
  }

  // Setup Replay Click Handler
  replayBtn.addEventListener('click', (e) => {
    e.preventDefault();
    playAnimation();
  });

  // Setup Viewport Intersection Observer (Trigger around jar)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!hasTriggered) {
          hasTriggered = true;
          playAnimation();
        } else if (isPaused) {
          isPaused = false;
          if (pauseTime) {
            elapsedBeforePause += (performance.now() - pauseTime);
            pauseTime = null;
          }
        }
      } else {
        if (animState !== 'idle' && animState !== 'complete' && !isPaused) {
          isPaused = true;
          pauseTime = performance.now();
        }
      }
    });
  }, {
    threshold: 0.15
  });

  observer.observe(stage);

  // Tab visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (!isPaused && animState !== 'idle' && animState !== 'complete') {
        isPaused = true;
        pauseTime = performance.now();
      }
    } else {
      if (isPaused) {
        isPaused = false;
        if (pauseTime) {
          elapsedBeforePause += (performance.now() - pauseTime);
          pauseTime = null;
        }
      }
    }
  });

  // Window resize & orientation change handler
  function handleViewportChange() {
    updateTargetCoordinates();
    if (animState === 'complete') {
      renderFinalState();
    } else if (animState === 'settling' || animState === 'idle') {
      setLidState(animState === 'idle' ? 'closed' : 'resting');
    }
  }

  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);

  const controller = {
    play: playAnimation,
    reset: resetScene,
    complete: renderFinalState
  };
  window.__toolkitJar = controller;

  return controller;
}
