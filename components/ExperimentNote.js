/**
 * ExperimentNote.js
 * "Keep calm. Experiment on." section component with integrated Toolkit Jar animation.
 */

import { createToolkitJar } from './ToolkitJar.js';

export function createExperimentNote() {
  const section = document.createElement('section');
  section.className = 'experiment-note-section';
  section.id = 'noteToSelf';
  section.setAttribute('aria-label', 'A Note to Self and Toolkit');

  // Background Grid Layer (separate layer, full width, pointer-events: none, behind content)
  const gridBackground = document.createElement('div');
  gridBackground.className = 'experiment-grid-background';
  gridBackground.setAttribute('aria-hidden', 'true');
  section.appendChild(gridBackground);

  const sceneWrapper = document.createElement('div');
  sceneWrapper.className = 'experiment-scene-wrapper';
  sceneWrapper.id = 'experimentSceneWrapper';

  // SVG Clip Path for Jar Interior (placed in sceneWrapper)
  const clipSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  clipSvg.setAttribute('width', '0');
  clipSvg.setAttribute('height', '0');
  clipSvg.style.position = 'absolute';
  clipSvg.style.pointerEvents = 'none';
  clipSvg.setAttribute('aria-hidden', 'true');
  clipSvg.innerHTML = `
    <defs>
      <clipPath id="jarInteriorClip" clipPathUnits="objectBoundingBox">
        <path d="M 0.25 0.05
                 L 0.75 0.05
                 L 0.75 0.21
                 C 0.83 0.23, 0.87 0.27, 0.875 0.32
                 L 0.875 0.88
                 C 0.875 0.92, 0.82 0.935, 0.72 0.935
                 L 0.28 0.935
                 C 0.18 0.935, 0.125 0.92, 0.125 0.88
                 L 0.125 0.32
                 C 0.13 0.27, 0.17 0.23, 0.25 0.21
                 Z" />
      </clipPath>
    </defs>
  `;
  sceneWrapper.appendChild(clipSvg);

  // Decorative Doodles Background Layer
  const doodlesSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  doodlesSvg.setAttribute('class', 'jar-doodles-svg');
  doodlesSvg.setAttribute('id', 'jarDoodlesSvg');
  doodlesSvg.setAttribute('aria-hidden', 'true');
  doodlesSvg.setAttribute('viewBox', '0 0 1280 800');
  doodlesSvg.setAttribute('fill', 'none');
  doodlesSvg.innerHTML = `
    <!-- Left doodles -->
    <path d="M 80 85 Q 70 75 65 90" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 125 160 L 138 172" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 70 240 C 65 252 75 260 82 255" stroke="#a855f7" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M 230 230 Q 240 220 248 235" stroke="#f97316" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M 160 390 L 172 400" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Right doodles -->
    <path d="M 1070 80 L 1082 92" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 1160 145 Q 1170 135 1175 150" stroke="#f97316" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 975 220 C 970 232 980 240 986 235" stroke="#a855f7" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M 1130 305 L 1142 318" stroke="#84cc16" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 1040 380 Q 1048 370 1056 382" stroke="#f97316" stroke-width="2.2" stroke-linecap="round"/>
  `;
  sceneWrapper.appendChild(doodlesSvg);

  // Flying & Settled Icons Layer (Scene Level, covers entire note + jar)
  const iconsLayer = document.createElement('div');
  iconsLayer.className = 'jar-icons-layer';
  iconsLayer.id = 'jarIconsLayer';
  sceneWrapper.appendChild(iconsLayer);

  // Centered note assembly
  const noteOuter = document.createElement('div');
  noteOuter.className = 'note-outer-container';
  noteOuter.innerHTML = `
    <div class="note-assembly" id="noteAssembly">
      <!-- Layer 1: Layered notebook paper base (cream sheet + orange & cobalt backings) -->
      <img class="note-layer note-paper"
           src="assets/note/note-paper.png"
           alt=""
           aria-hidden="true"
           draggable="false"
           loading="eager" />

      <!-- Layer 2: Yellow masking tape across top-left corner -->
      <img class="note-layer note-tape"
           src="assets/note/note-tape.png"
           alt=""
           aria-hidden="true"
           draggable="false" />

      <!-- Layer 3: Lavender circular asterisk sticker near upper-right edge -->
      <img class="note-layer note-badge"
           src="assets/note/note-badge.png"
           alt=""
           aria-hidden="true"
           draggable="false" />

      <!-- Layer 4: Lime asterisk sticker overlapping lower-left edge -->
      <img class="note-layer note-asterisk"
           src="assets/note/note-asterisk.png"
           alt=""
           aria-hidden="true"
           draggable="false" />

      <!-- Layer 5: Live HTML Text strictly within the cream sheet -->
      <div class="note-content">
        <p class="note-eyebrow">A NOTE TO SELF</p>
        <h2 class="note-heading">
          <span class="note-heading-line note-heading-dark">Keep calm.</span>
          <span class="note-heading-line note-heading-cobalt">Experiment on.</span>
        </h2>
        <p class="note-paragraph">
          A little curiosity, a lot of trying. I make sense of problems by sketching, building, testing, and trying again.
        </p>
        <div class="note-signature-area">
          <span class="note-signature">Rushabh</span>
          <svg class="note-signature-stroke" width="90" height="12" viewBox="0 0 90 12" fill="none" aria-hidden="true">
            <path d="M2 9C26 3 58 2 88 8" stroke="#18181b" stroke-width="2.2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  `;
  sceneWrapper.appendChild(noteOuter);

  // Toolkit Jar component (jar stage, label, lid, captions, controls)
  const toolkitJar = createToolkitJar(sceneWrapper);
  sceneWrapper.appendChild(toolkitJar.element);

  section.appendChild(sceneWrapper);

  // Initialize jar animation
  toolkitJar.init();

  return {
    element: section,
    jarController: toolkitJar.controller
  };
}
